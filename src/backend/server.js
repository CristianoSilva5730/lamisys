const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const bcrypt = require('bcryptjs');
const smtpService = require('./services/smtp');
const schedulerService = require('./services/scheduler');

// Create the Express server
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database reference
let database;

function generateRandomPassword(length = 10) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

// Define server startup function
function startServer() {
  try {
    // Initialize the database
    try {
      database = db.initDatabase();
      // Create initial data if necessary
      db.seedDatabase();
      console.log('Database initialized successfully!');
    } catch (err) {
      console.error('Database initialization error:', err);
      // Continue even if database fails - we'll handle errors at the API level
    }
    
    // API Routes
    // Prefix all API routes with /api
    
    // Status endpoint to check if server is running and database is connected
    app.get('/api/status', (req, res) => {
      try {
        // Check database connection
        const dbStatus = db.checkDatabaseConnection();
        
        res.json({
          status: 'online',
          database: dbStatus,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error checking status:', err);
        res.status(500).json({ 
          status: 'error', 
          error: err.message,
          database: { connected: false, message: 'Error checking database connection' }
        });
      }
    });
    
    // User management routes
    app.get('/api/users', (req, res) => {
      try {
        const users = db.getAllUsers();
        res.json(users);
      } catch (err) {
        console.error('Error ao buscar usuários:', err);
        res.status(500).json({ error: 'Error ao buscar usuários' });
      }
    });
    
    app.get('/api/users/:id', (req, res) => {
      try {
        const user = db.getUserById(req.params.id);
        if (!user) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json(user);
      } catch (err) {
        console.error('Error ao buscar usuário:', err);
        res.status(500).json({ error: 'Error ao buscar usuário' });
      }
    });
    
    app.post('/api/users', (req, res) => {
      try {
        const user = req.body;
        
        // Validar dados
        if (!user.email || !user.name || !user.matricula || !user.role) {
          return res.status(400).json({ error: 'Dados incompletos' });
        }
        
        // Verificar se já existe usuário com o mesmo email
        const existingUser = db.getUserByEmail(user.email);
        if (existingUser) {
          return res.status(409).json({ error: 'Email já cadastrado' });
        }
        
        // Adicionar ID se não fornecido
        if (!user.id) {
          user.id = Date.now().toString();
        }
        
        const newUser = db.createUser(user);
        res.status(201).json(newUser);
        //${user.name}${user.matricula}
        tempsenha === `${user.name}${user.matricula}`;
        console.log(`Senha temporaria ${user.name}${user.matricula}`);
        
        // Try sending email if SMTP is configured
        try {
          const smtpConfig = db.getSMTPConfig();
          if (smtpConfig && smtpConfig.server) {
            smtpService.sendPasswordNewuser(email, tempsenha);
          }
        } catch (emailErr) {
          console.error('Error sending password reset email:', emailErr);
          // Continue even if email fails
        }

      } catch (err) {
        console.error('Error ao criar usuário:', err);
        res.status(500).json({ error: 'Error ao criar usuário' });
      }
    });
    
    app.put('/api/users/:id', (req, res) => {
      try {
        const id = req.params.id;
        const updates = req.body;
    
        // Verificar se os dados de atualização são válidos
        if (!updates.email || !updates.name || !updates.matricula || !updates.role) {
          return res.status(400).json({ error: 'Dados incompletos para atualização' });
        }
    
        // Verificar se o usuário existe
        const existingUser = db.getUserById(id);
        if (!existingUser) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }
    
        // Verificar email duplicado
        if (updates.email && updates.email !== existingUser.email) {
          const emailExists = db.getUserByEmail(updates.email);
          if (emailExists) {
            return res.status(409).json({ error: 'Email já cadastrado' });
          }
        }
    
        // Atualizar os dados do usuário
        const updatedUser = db.updateUser(id, updates);
        
        // Retornar os dados atualizados
        res.json(updatedUser);
      } catch (err) {
        console.error('Error ao atualizar usuário:', err);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
      }
    });
    
    app.delete('/api/users/:id', (req, res) => {
      try {
        const id = req.params.id;
        
        // Verificar se o usuário existe
        const existingUser = db.getUserById(id);
        if (!existingUser) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        const result = db.deleteUser(id);
        res.json({ success: result });
      } catch (err) {
        console.error('Error ao excluir usuário:', err);
        res.status(500).json({ error: 'Error ao excluir usuário' });
      }
    });
    
    // Authentication route
    app.post('/api/login', (req, res) => {
      try {
        const { email, password } = req.body;
    
        console.log(`Attempt to login: ${email}`);
    
        if (!email || !password) {
          return res.status(400).json({ error: 'Email and password are required' });
        }
    
        const user = db.getUserByEmail(email);
    
        if (!user) {
          console.log(`User not found: ${email}`);
          return res.status(401).json({ error: 'User or password incorrect' });
        }
    
        console.log(`User found: ${user.name}, verifying password`);
    
        // Verifica senha principal, senha de primeiro acesso e senha de recuperação
        const isFirstTimePassword = !user.password && password === `${user.name}${user.matricula}`;
        const recoveryPasswordMatch = user.recoveryPassword && password === user.recoveryPassword;
        const mainPasswordMatch = user.password && password === user.password;
    
        const correctPassword = isFirstTimePassword || recoveryPasswordMatch || mainPasswordMatch;
    
        if (!correctPassword) {
          console.log('Password incorrect');
          return res.status(401).json({ error: 'User or password incorrect' });
        }
    
        console.log(`Login successful for: ${user.name}`);
    
        // Atualiza o status de primeiro acesso, se necessário
        if ((isFirstTimePassword || recoveryPasswordMatch) && user.isFirstAccess !== 1) {
          console.log(`Updating first access status for: ${user.id}`);
          db.updateUser(user.id, { ...user, isFirstAccess: 1 });
        }
    
        res.json({
          ...user,
          isFirstAccess: isFirstTimePassword || recoveryPasswordMatch ? 1 : 0
        });
      } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Error during login' });
      }
    });
    
    // Password reset route
    app.post('/api/reset-password', (req, res) => {
      try {
        const { email } = req.body;
        
        if (!email) {
          return res.status(400).json({ error: 'Email is required' });
        }
        
        const user = db.getUserByEmail(email);
        
        if (!user) {
          return res.status(404).json({ error: 'Email not found' });
        }
        
        // Generate random password
        const tempPassword = generateRandomPassword();
        
        // Update user with temporary password
        db.updateUser(user.id, { 
          ...user, 
          recoveryPassword: tempPassword,
          isFirstAccess: 1 
        });
        
        // In a real app, would send email with temporary password
        console.log(`Temporary password for ${email}: ${tempPassword}`);
        
        // Try sending email if SMTP is configured
        try {
          const smtpConfig = db.getSMTPConfig();
          if (smtpConfig && smtpConfig.server) {
            smtpService.sendPasswordResetEmail(email, tempPassword);
          }
        } catch (emailErr) {
          console.error('Error sending password reset email:', emailErr);
          // Continue even if email fails
        }
        
        res.json({ success: true, message: 'Password reset successfully' });
      } catch (err) {
        console.error('Error resetting password:', err);
        res.status(500).json({ error: 'Error resetting password' });
      }
    });
    
    // Change password route
    app.post('/api/change-password', (req, res) => {
      try {
        const { userId, oldPassword, newPassword } = req.body;
    
        if (!userId || !oldPassword || !newPassword) {
          return res.status(400).json({ error: 'Incomplete data' });
        }
    
        const user = db.getUserById(userId);
    
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
    
        // Verifica se a senha antiga está correta
        const isFirstTimePassword = !user.password && oldPassword === `${user.name}${user.matricula}`;
        const recoveryPasswordMatch = user.recoveryPassword && oldPassword === user.recoveryPassword;
        const mainPasswordMatch = user.password && oldPassword === user.password;
    
        const correctPassword = isFirstTimePassword || recoveryPasswordMatch || mainPasswordMatch;
    
        if (!correctPassword) {
          return res.status(401).json({ error: 'Old password incorrect' });
        }
    
        // Atualiza a senha principal e reseta a de recuperação
        db.updateUser(user.id, {
          ...user,
          password: newPassword,
          isFirstAccess: 0,
          recoveryPassword: null
        });
    
        res.json({ success: true, message: 'Password changed successfully' });
      } catch (err) {
        console.error('Error changing password:', err);
        res.status(500).json({ error: 'Error changing password' });
      }
    });
    
    // Material management routes
    app.get('/api/materials', (req, res) => {
      try {
        const includeDeleted = req.query.includeDeleted === 'true';
        const materials = db.getAllMaterials(includeDeleted);
        res.json(materials);
      } catch (err) {
        console.error('Error fetching materials:', err);
        res.status(500).json({ error: 'Error fetching materials' });
      }
    });
    
    app.get('/api/materials/deleted', (req, res) => {
      try {
        const materials = db.getDeletedMaterials();
        res.json(materials);
      } catch (err) {
        console.error('Error fetching deleted materials:', err);
        res.status(500).json({ error: 'Error fetching deleted materials' });
      }
    });
    
    app.get('/api/materials/:id', (req, res) => {
      try {
        const material = db.getMaterialById(req.params.id);
        if (!material) {
          return res.status(404).json({ error: 'Material not found' });
        }
        res.json(material);
      } catch (err) {
        console.error('Error fetching material:', err);
        res.status(500).json({ error: 'Error fetching material' });
      }
    });
    
    app.post('/api/materials', (req, res) => {
      try {
        const material = req.body;
        
        // Validate data
        if (!material.notaFiscal || !material.numeroOrdem || !material.tipoMaterial || !material.status) {
          return res.status(400).json({ error: 'Incomplete data' });
        }
        
        // Add creation data
        if (!material.id) {
          material.id = Date.now().toString();
        }
        if (!material.createdAt) {
          material.createdAt = new Date().toISOString();
        }
        
        const newMaterial = db.createMaterial(material);
        res.status(201).json(newMaterial);
      } catch (err) {
        console.error('Error creating material:', err);
        res.status(500).json({ error: 'Error creating material' });
      }
    });
    
    app.put('/api/materials/:id', (req, res) => {
      try {
        const id = req.params.id;
        const { updatedBy, ...updates } = req.body;
        
        if (!updatedBy) {
          return res.status(400).json({ error: 'User ID is required' });
        }
        
        const updatedMaterial = db.updateMaterial(id, updates, updatedBy);
        
        if (!updatedMaterial) {
          return res.status(404).json({ error: 'Material not found' });
        }
        
        res.json(updatedMaterial);
      } catch (err) {
        console.error('Error updating material:', err);
        res.status(500).json({ error: 'Error updating material' });
      }
    });
    
    app.delete('/api/materials/:id', (req, res) => {
      try {
        const { reason, deletedBy } = req.body;
        
        if (!reason || !deletedBy) {
          return res.status(400).json({ error: 'Reason and user ID are required' });
        }
        
        const result = db.deleteMaterial(req.params.id, reason, deletedBy);
        
        if (!result) {
          return res.status(404).json({ error: 'Material not found or already deleted' });
        }
        
        res.json({ success: true });
      } catch (err) {
        console.error('Error deleting material:', err);
        res.status(500).json({ error: 'Error deleting material' });
      }
    });
    
    // Alarm management routes
    app.get('/api/alarms', (req, res) => {
      try {
        const alarms = db.getAllAlarms();
        res.json(alarms);
      } catch (err) {
        console.error('Error fetching alarms:', err);
        res.status(500).json({ error: 'Error fetching alarms' });
      }
    });
    
    app.get('/api/alarms/:id', (req, res) => {
      try {
        const alarm = db.getAlarmById(req.params.id);
        if (!alarm) {
          return res.status(404).json({ error: 'Alarm not found' });
        }
        res.json(alarm);
      } catch (err) {
        console.error('Error fetching alarm:', err);
        res.status(500).json({ error: 'Error fetching alarm' });
      }
    });
    
    app.post('/api/alarms', (req, res) => {
      try {
        const alarm = req.body;
        
        // Validate data
        if (!alarm.name || !alarm.type || !alarm.createdBy) {
          return res.status(400).json({ error: 'Incomplete data' });
        }
        
        // Add creation data
        if (!alarm.id) {
          alarm.id = Date.now().toString();
        }
        if (!alarm.createdAt) {
          alarm.createdAt = new Date().toISOString();
        }
        
        const newAlarm = db.createAlarm(alarm);
        res.status(201).json(newAlarm);
      } catch (err) {
        console.error('Error creating alarm:', err);
        res.status(500).json({ error: 'Error creating alarm' });
      }
    });
    
    app.put('/api/alarms/:id', (req, res) => {
      try {
        const id = req.params.id;
        const updates = req.body;
        
        const updatedAlarm = db.updateAlarm(id, updates);
        
        if (!updatedAlarm) {
          return res.status(404).json({ error: 'Alarm not found' });
        }
        
        res.json(updatedAlarm);
      } catch (err) {
        console.error('Error updating alarm:', err);
        res.status(500).json({ error: 'Error updating alarm' });
      }
    });
    
    app.delete('/api/alarms/:id', (req, res) => {
      try {
        const result = db.deleteAlarm(req.params.id);
        
        if (!result) {
          return res.status(404).json({ error: 'Alarm not found' });
        }
        
        res.json({ success: true });
      } catch (err) {
        console.error('Error deleting alarm:', err);
        res.status(500).json({ error: 'Error deleting alarm' });
      }
    });
    
    // SMTP Routes
    app.get('/api/smtp-config', (req, res) => {
      try {
        const config = db.getSMTPConfig();
        res.json(config || { server: '', port: 25, fromEmail: '' });
      } catch (err) {
        console.error('Error fetching SMTP configuration:', err);
        res.status(500).json({ error: 'Error fetching SMTP configuration' });
      }
    });
    
    app.put('/api/smtp-config', (req, res) => {
      try {
        const config = req.body;
        
        if (!config.server || !config.port || !config.fromEmail) {
          return res.status(400).json({ error: 'Incomplete data' });
        }
        
        const updatedConfig = db.updateSMTPConfig(config);
        res.json(updatedConfig);
      } catch (err) {
        console.error('Error updating SMTP configuration:', err);
        res.status(500).json({ error: 'Error updating SMTP configuration' });
      }
    });
    
    // Backup Routes
    app.post('/api/backup', async (req, res) => {
      try {
        const backupData = await db.exportDatabase();
        res.json({ success: true, data: backupData });
      } catch (err) {
        console.error('Error making backup:', err);
        res.status(500).json({ error: 'Error making backup' });
      }
    });
    
    app.post('/api/backup/restore', async (req, res) => {
      try {
        const { data } = req.body;
        await db.importDatabase(data);
        res.json({ success: true });
      } catch (err) {
        console.error('Error restoring backup:', err);
        res.status(500).json({ error: 'Error restoring backup' });
      }
    });
    
    // Setting up static file serving...
    console.log('Setting up static file serving...');
    console.log('Current directory:', __dirname);
    console.log('Dist path:', path.join(__dirname, '../../dist'));
    
    // Check if dist directory exists
    const fs = require('fs');
    if (!fs.existsSync(path.join(__dirname, '../../dist'))) {
      console.error('Warning: Dist directory does not exist!');
    }
    
    // Serve static files
    app.use(express.static(path.join(__dirname, '../../dist')));
    
    // Important: This is our catch-all route for the SPA
    // No complex patterns - just use a simple string
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../../dist/index.html'));
    });
    
    // Handle all other routes for the SPA
    app.use((req, res) => {
      res.sendFile(path.join(__dirname, '../../dist/index.html'));
    });
    
    // Define port
    const PORT = 8080;
    const HOST = "0.0.0.0";
    
    // Initialize the scheduler for automatic alarm processing
    try {
      // Start checking alarms every 30 minutes
      schedulerService.startAlarmScheduler(30);
      console.log('Alarm scheduler initialized');
    } catch (schedulerError) {
      console.error('Error initializing alarm scheduler:', schedulerError);
    }
    
    // Return app without starting it, so we can test or extend it
    return app.listen(PORT, HOST, () => {
      console.log(`Server running on port ${PORT} (accessible on LAN)`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    throw err;
  }
}

module.exports = { startServer, app };
