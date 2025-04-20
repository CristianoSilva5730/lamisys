const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const bcrypt = require('bcryptjs');

// Criar o servidor Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializar o banco de dados
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

function startServer() {
  try {
    // Inicializar o banco de dados
    database = db.initDatabase();
    
    // Criar dados iniciais se necessário
    db.seedDatabase();
    
    console.log('Banco de dados inicializado com sucesso!');
    
    // Rotas para gerenciamento de usuários
    app.get('/api/users', (req, res) => {
      try {
        const users = db.getAllUsers();
        res.json(users);
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
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
        console.error('Erro ao buscar usuário:', err);
        res.status(500).json({ error: 'Erro ao buscar usuário' });
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
      } catch (err) {
        console.error('Erro ao criar usuário:', err);
        res.status(500).json({ error: 'Erro ao criar usuário' });
      }
    });
    
    app.put('/api/users/:id', (req, res) => {
      try {
        const id = req.params.id;
        const updates = req.body;
        
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
        
        const updatedUser = db.updateUser(id, updates);
        res.json(updatedUser);
      } catch (err) {
        console.error('Erro ao atualizar usuário:', err);
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
        console.error('Erro ao excluir usuário:', err);
        res.status(500).json({ error: 'Erro ao excluir usuário' });
      }
    });
    
    // Rota para autenticação
    app.post('/api/login', (req, res) => {
      try {
        const { email, password } = req.body;
        
        console.log(`Tentativa de login: ${email}`);
        
        if (!email || !password) {
          return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }
        
        const user = db.getUserByEmail(email);
        
        if (!user) {
          console.log(`Usuário não encontrado: ${email}`);
          return res.status(401).json({ error: 'Usuário ou senha incorretos' });
        }
        
        console.log(`Usuário encontrado: ${user.name}, verificando senha`);
        
        // Verificar senha do usuário
        const isFirstTimePassword = password === `${user.name}${user.matricula}`;
        const recoveryPasswordMatch = user.recoveryPassword && password === user.recoveryPassword;
        const correctPassword = isFirstTimePassword || recoveryPasswordMatch;
        
        if (!correctPassword) {
          console.log('Senha incorreta');
          return res.status(401).json({ error: 'Usuário ou senha incorretos' });
        }
        
        console.log(`Login bem-sucedido para: ${user.name}`);
        
        // Atualizar status de primeiro acesso se necessário
        if (user.isFirstAccess && recoveryPasswordMatch) {
          console.log(`Atualizando status de primeiro acesso para: ${user.id}`);
          db.updateUser(user.id, { ...user, isFirstAccess: 1 });
        }
        
        res.json({
          ...user,
          isFirstAccess: isFirstTimePassword || recoveryPasswordMatch ? 1 : 0
        });
      } catch (err) {
        console.error('Erro ao fazer login:', err);
        res.status(500).json({ error: 'Erro ao fazer login' });
      }
    });
    
    // Rota para redefinir senha
    app.post('/api/reset-password', (req, res) => {
      try {
        const { email } = req.body;
        
        if (!email) {
          return res.status(400).json({ error: 'Email é obrigatório' });
        }
        
        const user = db.getUserByEmail(email);
        
        if (!user) {
          return res.status(404).json({ error: 'Email não encontrado' });
        }
        
        // Gerar senha aleatória
        const tempPassword = generateRandomPassword();
        
        // Atualizar usuário com a nova senha temporária
        db.updateUser(user.id, { 
          ...user, 
          recoveryPassword: tempPassword,
          isFirstAccess: 1 
        });
        
        // Em um app real, enviaria email com senha temporária
        console.log(`Senha temporária para ${email}: ${tempPassword}`);
        
        res.json({ success: true, message: 'Senha redefinida com sucesso' });
      } catch (err) {
        console.error('Erro ao redefinir senha:', err);
        res.status(500).json({ error: 'Erro ao redefinir senha' });
      }
    });
    
    // Rota para alterar senha
    app.post('/api/change-password', (req, res) => {
      try {
        const { userId, oldPassword, newPassword } = req.body;
        
        if (!userId || !oldPassword || !newPassword) {
          return res.status(400).json({ error: 'Dados incompletos' });
        }
        
        const user = db.getUserById(userId);
        
        if (!user) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        // Verificar senha antiga
        const isFirstTimePassword = oldPassword === `${user.name}${user.matricula}`;
        const recoveryPasswordMatch = user.recoveryPassword && oldPassword === user.recoveryPassword;
        const correctPassword = isFirstTimePassword || recoveryPasswordMatch;
        
        if (!correctPassword) {
          return res.status(401).json({ error: 'Senha atual incorreta' });
        }
        
        // Em um app real, armazenaria a senha (hash) no banco
        // Aqui apenas atualizamos o status de primeiro acesso
        db.updateUser(user.id, { ...user, isFirstAccess: 0, recoveryPassword: null });
        
        res.json({ success: true, message: 'Senha alterada com sucesso' });
      } catch (err) {
        console.error('Erro ao alterar senha:', err);
        res.status(500).json({ error: 'Erro ao alterar senha' });
      }
    });
    
    // Rotas para gerenciamento de materiais
    app.get('/api/materials', (req, res) => {
      try {
        const includeDeleted = req.query.includeDeleted === 'true';
        const materials = db.getAllMaterials(includeDeleted);
        res.json(materials);
      } catch (err) {
        console.error('Erro ao buscar materiais:', err);
        res.status(500).json({ error: 'Erro ao buscar materiais' });
      }
    });
    
    app.get('/api/materials/deleted', (req, res) => {
      try {
        const materials = db.getDeletedMaterials();
        res.json(materials);
      } catch (err) {
        console.error('Erro ao buscar materiais excluídos:', err);
        res.status(500).json({ error: 'Erro ao buscar materiais excluídos' });
      }
    });
    
    app.get('/api/materials/:id', (req, res) => {
      try {
        const material = db.getMaterialById(req.params.id);
        if (!material) {
          return res.status(404).json({ error: 'Material não encontrado' });
        }
        res.json(material);
      } catch (err) {
        console.error('Erro ao buscar material:', err);
        res.status(500).json({ error: 'Erro ao buscar material' });
      }
    });
    
    app.post('/api/materials', (req, res) => {
      try {
        const material = req.body;
        
        // Validar dados
        if (!material.notaFiscal || !material.numeroOrdem || !material.tipoMaterial || !material.status) {
          return res.status(400).json({ error: 'Dados incompletos' });
        }
        
        // Adicionar dados de criação
        if (!material.id) {
          material.id = Date.now().toString();
        }
        if (!material.createdAt) {
          material.createdAt = new Date().toISOString();
        }
        
        const newMaterial = db.createMaterial(material);
        res.status(201).json(newMaterial);
      } catch (err) {
        console.error('Erro ao criar material:', err);
        res.status(500).json({ error: 'Erro ao criar material' });
      }
    });
    
    app.put('/api/materials/:id', (req, res) => {
      try {
        const id = req.params.id;
        const { updatedBy, ...updates } = req.body;
        
        if (!updatedBy) {
          return res.status(400).json({ error: 'ID do usuário que está atualizando é obrigatório' });
        }
        
        const updatedMaterial = db.updateMaterial(id, updates, updatedBy);
        
        if (!updatedMaterial) {
          return res.status(404).json({ error: 'Material não encontrado' });
        }
        
        res.json(updatedMaterial);
      } catch (err) {
        console.error('Erro ao atualizar material:', err);
        res.status(500).json({ error: 'Erro ao atualizar material' });
      }
    });
    
    app.delete('/api/materials/:id', (req, res) => {
      try {
        const { reason, deletedBy } = req.body;
        
        if (!reason || !deletedBy) {
          return res.status(400).json({ error: 'Motivo da exclusão e ID do usuário são obrigatórios' });
        }
        
        const result = db.deleteMaterial(req.params.id, reason, deletedBy);
        
        if (!result) {
          return res.status(404).json({ error: 'Material não encontrado ou já excluído' });
        }
        
        res.json({ success: true });
      } catch (err) {
        console.error('Erro ao excluir material:', err);
        res.status(500).json({ error: 'Erro ao excluir material' });
      }
    });
    
    // Rotas para gerenciamento de alarmes
    app.get('/api/alarms', (req, res) => {
      try {
        const alarms = db.getAllAlarms();
        res.json(alarms);
      } catch (err) {
        console.error('Erro ao buscar alarmes:', err);
        res.status(500).json({ error: 'Erro ao buscar alarmes' });
      }
    });
    
    app.get('/api/alarms/:id', (req, res) => {
      try {
        const alarm = db.getAlarmById(req.params.id);
        if (!alarm) {
          return res.status(404).json({ error: 'Alarme não encontrado' });
        }
        res.json(alarm);
      } catch (err) {
        console.error('Erro ao buscar alarme:', err);
        res.status(500).json({ error: 'Erro ao buscar alarme' });
      }
    });
    
    app.post('/api/alarms', (req, res) => {
      try {
        const alarm = req.body;
        
        // Validar dados
        if (!alarm.name || !alarm.type || !alarm.createdBy) {
          return res.status(400).json({ error: 'Dados incompletos' });
        }
        
        // Adicionar dados de criação
        if (!alarm.id) {
          alarm.id = Date.now().toString();
        }
        if (!alarm.createdAt) {
          alarm.createdAt = new Date().toISOString();
        }
        
        const newAlarm = db.createAlarm(alarm);
        res.status(201).json(newAlarm);
      } catch (err) {
        console.error('Erro ao criar alarme:', err);
        res.status(500).json({ error: 'Erro ao criar alarme' });
      }
    });
    
    app.put('/api/alarms/:id', (req, res) => {
      try {
        const id = req.params.id;
        const updates = req.body;
        
        const updatedAlarm = db.updateAlarm(id, updates);
        
        if (!updatedAlarm) {
          return res.status(404).json({ error: 'Alarme não encontrado' });
        }
        
        res.json(updatedAlarm);
      } catch (err) {
        console.error('Erro ao atualizar alarme:', err);
        res.status(500).json({ error: 'Erro ao atualizar alarme' });
      }
    });
    
    app.delete('/api/alarms/:id', (req, res) => {
      try {
        const result = db.deleteAlarm(req.params.id);
        
        if (!result) {
          return res.status(404).json({ error: 'Alarme não encontrado' });
        }
        
        res.json({ success: true });
      } catch (err) {
        console.error('Erro ao excluir alarme:', err);
        res.status(500).json({ error: 'Erro ao excluir alarme' });
      }
    });
    
    // SMTP Routes
    app.get('/api/smtp-config', (req, res) => {
      try {
        const config = db.getSMTPConfig();
        res.json(config || { server: '', port: 25, fromEmail: '' });
      } catch (err) {
        console.error('Erro ao buscar configuração SMTP:', err);
        res.status(500).json({ error: 'Erro ao buscar configuração SMTP' });
      }
    });
    
    app.put('/api/smtp-config', (req, res) => {
      try {
        const config = req.body;
        
        if (!config.server || !config.port || !config.fromEmail) {
          return res.status(400).json({ error: 'Dados incompletos' });
        }
        
        const updatedConfig = db.updateSMTPConfig(config);
        res.json(updatedConfig);
      } catch (err) {
        console.error('Erro ao atualizar configuração SMTP:', err);
        res.status(500).json({ error: 'Erro ao atualizar configuração SMTP' });
      }
    });
    
    // Backup Routes
    app.post('/api/backup', async (req, res) => {
      try {
        const backupData = await db.exportDatabase();
        res.json({ success: true, data: backupData });
      } catch (err) {
        console.error('Erro ao fazer backup:', err);
        res.status(500).json({ error: 'Erro ao fazer backup' });
      }
    });
    
    app.post('/api/backup/restore', async (req, res) => {
      try {
        const { data } = req.body;
        await db.importDatabase(data);
        res.json({ success: true });
      } catch (err) {
        console.error('Erro ao restaurar backup:', err);
        res.status(500).json({ error: 'Erro ao restaurar backup' });
      }
    });
    
    // Rota para verificar se o servidor está online
    app.get('/api/status', (req, res) => {
      res.json({ status: 'online' });
    });
    
    // Definir porta
    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
    
    return app;
  } catch (err) {
    console.error('Erro ao iniciar servidor:', err);
    process.exit(1);
  }
}

module.exports = { startServer };
