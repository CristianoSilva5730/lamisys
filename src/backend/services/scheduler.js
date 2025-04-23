
/**
 * Scheduler service to handle periodic tasks
 */

const smtpService = require('./smtp');
const db = require('../database');

class SchedulerService {
  constructor() {
    this.alarmInterval = null;
    this.intervalMinutes = 60; // Default to check alarms every hour
  }

  /**
   * Start the alarm processing scheduler
   */
  startAlarmScheduler(intervalMinutes = 60) {
    // Stop any existing interval
    this.stopAlarmScheduler();
    
    this.intervalMinutes = intervalMinutes;
    const intervalMs = this.intervalMinutes * 60 * 1000;
    
    console.log(`Starting alarm scheduler to run every ${this.intervalMinutes} minutes`);
    
    // Process alarms immediately once
    this.processAlarms();
    
    // Then set up the interval
    this.alarmInterval = setInterval(() => {
      this.processAlarms();
    }, intervalMs);
    
    return true;
  }
  
  /**
   * Stop the alarm processing scheduler
   */
  stopAlarmScheduler() {
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
      console.log('Alarm scheduler stopped');
      return true;
    }
    return false;
  }
  
  /**
   * Process all active alarms
   */
  async processAlarms() {
    console.log('Processing active alarms...');
    
    try {
      const alarms = db.getAllAlarms().filter(alarm => alarm.active);
      console.log(`Found ${alarms.length} active alarms to process`);
      
      const results = {
        processed: 0,
        triggered: 0,
        errors: 0
      };
      
      for (const alarm of alarms) {
        try {
          results.processed++;
          const triggered = await this.processAlarm(alarm);
          if (triggered) results.triggered++;
        } catch (err) {
          results.errors++;
          console.error(`Error processing alarm ${alarm.id}:`, err);
        }
      }
      
      console.log(`Alarm processing complete. Results: `, results);
      return results;
    } catch (err) {
      console.error('Error in alarm processing:', err);
      throw err;
    }
  }
  
  /**
   * Process a single alarm
   */
  async processAlarm(alarm) {
    console.log(`Processing alarm: ${alarm.name} (${alarm.id})`);
    let triggered = false;
    
    try {
      // Get all materials
      const materials = db.getAllMaterials();
      
      // Get recipients array
      const recipients = Array.isArray(alarm.recipients) 
        ? alarm.recipients 
        : (alarm.recipients ? alarm.recipients.split(',') : []);
      
      // Different logic based on alarm type
      switch (alarm.type) {
        case 'TEMPO_ETAPA':
          // Check for materials that have been in a specific status for too long
          const thresholdDays = parseInt(alarm.value) || 7;
          const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;
          
          const triggeredMaterials = materials.filter(material => {
            try {
              // Try to evaluate the condition string as code
              // eslint-disable-next-line no-new-func
              const conditionFn = new Function('material', `return ${alarm.condition}`);
              if (!conditionFn(material)) return false;
              
              // Calculate time in current status
              const updatedAt = material.updatedAt ? new Date(material.updatedAt).getTime() : 0;
              const now = Date.now();
              const timeInStatus = now - updatedAt;
              
              return timeInStatus >= thresholdMs;
            } catch (e) {
              console.error(`Error evaluating condition for material ${material.id}:`, e);
              return false;
            }
          });
          
          if (triggeredMaterials.length > 0) {
            triggered = true;
            
            // Send email notifications for each triggered material
            for (const recipient of recipients) {
              try {
                await smtpService.sendAlarmNotification(recipient, {
                  name: alarm.name,
                  details: `${triggeredMaterials.length} materiais precisam de atenção. Materiais: ${triggeredMaterials.map(m => m.detalhesEquipamento).join(', ')}`
                });
                console.log(`Alarm notification sent to ${recipient}`);
              } catch (emailError) {
                console.error(`Error sending alarm notification to ${recipient}:`, emailError);
              }
            }
          }
          break;
          
        case 'QUANTIDADE_MATERIAIS':
          // Check for specific quantity of materials matching a condition
          const threshold = parseInt(alarm.value) || 1;
          
          // Filter materials based on the condition
          const matchedMaterials = materials.filter(material => {
            try {
              // eslint-disable-next-line no-new-func
              const conditionFn = new Function('material', `return ${alarm.condition}`);
              return conditionFn(material);
            } catch (e) {
              console.error(`Error evaluating condition for material ${material.id}:`, e);
              return false;
            }
          });
          
          if (matchedMaterials.length >= threshold) {
            triggered = true;
            
            // Send email notifications
            for (const recipient of recipients) {
              try {
                await smtpService.sendAlarmNotification(recipient, {
                  name: alarm.name,
                  details: `${matchedMaterials.length} materiais atendem à condição do alarme.`
                });
                console.log(`Alarm notification sent to ${recipient}`);
              } catch (emailError) {
                console.error(`Error sending alarm notification to ${recipient}:`, emailError);
              }
            }
          }
          break;
          
        default:
          console.log(`Unsupported alarm type: ${alarm.type}`);
          break;
      }
      
      return triggered;
    } catch (error) {
      console.error(`Error processing alarm ${alarm.id}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
const schedulerService = new SchedulerService();
module.exports = schedulerService;
