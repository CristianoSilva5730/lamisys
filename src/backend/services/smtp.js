
const nodemailer = require('nodemailer');
const db = require('../database');

class SMTPService {
  constructor() {
    this.transporter = null;
    // Initialize the transporter only if it's possible
    try {
      this.initializeTransporter();
    } catch (error) {
      console.error('Error initializing SMTP service:', error);
    }
  }

  initializeTransporter() {
    try {
      const config = db.getSMTPConfig();
      if (!config) {
        console.log('No SMTP configuration found, skipping transporter initialization');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: config.server,
        port: config.port,
        secure: config.port === 465,
        tls: {
          rejectUnauthorized: false
        }
      });
      
      console.log(`SMTP transporter initialized: ${config.server}:${config.port}`);
    } catch (error) {
      console.error('Error initializing SMTP transporter:', error);
    }
  }

  async sendEmail(options) {
    if (!this.transporter) {
      try {
        this.initializeTransporter();
      } catch (error) {
        console.error('Failed to initialize transporter:', error);
      }
    }

    if (!this.transporter) {
      throw new Error('SMTP not configured');
    }

    try {
      const config = db.getSMTPConfig();
      if (!config) {
        throw new Error('SMTP configuration not found');
      }
      
      const mailOptions = {
        from: config.fromEmail,
        ...options
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(to, tempPassword) {
    return this.sendEmail({
      to,
      subject: 'Recuperação de Senha - LamiSys',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Recuperação de Senha - LamiSys</h2>
          <p>Sua senha temporária é: <strong>${tempPassword}</strong></p>
          <p>Por favor, altere esta senha no seu próximo acesso.</p>
        </div>
      `
    });
  }

  async sendAlarmNotification(to, alarmData) {
    return this.sendEmail({
      to,
      subject: `Alarme: ${alarmData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Notificação de Alarme - LamiSys</h2>
          <p>O alarme "${alarmData.name}" foi acionado.</p>
          <p>Detalhes: ${alarmData.details || 'Não especificado'}</p>
        </div>
      `
    });
  }
  async sendPasswordNewuser(to, tempsenha) {
    return this.sendEmail({
      to,
      subject: 'Recuperação de Senha - LamiSys',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Recuperação de Senha - LamiSys</h2>
          <p>Sua senha temporária é: <strong>${tempsenha}</strong></p>
          <p>Por favor, altere esta senha no seu próximo acesso.</p>
        </div>
      `
    });
  }
}

// Export a singleton instance
const smtpService = new SMTPService();
module.exports = smtpService;
