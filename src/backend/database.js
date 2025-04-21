const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Determine database directory without using electron app
const getAppDataPath = () => {
  let userDataPath;
  
  // Try to get the app data path based on the platform
  if (process.env.APPDATA) {
    // Windows
    userDataPath = path.join(process.env.APPDATA, 'lamisys');
  } else if (process.platform === 'darwin') {
    // macOS
    userDataPath = path.join(process.env.HOME, 'Library', 'Application Support', 'lamisys');
  } else {
    // Linux and others
    userDataPath = path.join(process.env.HOME, '.lamisys');
  }
  
  const dbFolder = path.join(userDataPath, 'database');
  
  // Create the directory if it doesn't exist
  if (!fs.existsSync(dbFolder)) {
    fs.mkdirSync(dbFolder, { recursive: true });
  }
  
  return path.join(dbFolder, 'lamisys.db');
};

// Initialize the database
let db;

function initDatabase() {
  try {
    const dbPath = getAppDataPath();
    console.log(`Initializing database at: ${dbPath}`);
    
    db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Create tables if they don't exist
    createTables();
    
    return db;
  } catch (err) {
    console.error('Error initializing database:', err.message);
    throw err;
  }
}

function createTables() {
  // Usuários
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      matricula TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      avatar TEXT,
      isFirstAccess INTEGER DEFAULT 1,
      recoveryPassword TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Materiais
  db.exec(`
    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      notaFiscal TEXT NOT NULL,
      numeroOrdem TEXT NOT NULL,
      detalhesEquipamento TEXT NOT NULL,
      tipoOrdem TEXT NOT NULL,
      tipoMaterial TEXT NOT NULL,
      remessa TEXT NOT NULL,
      codigoSAP TEXT NOT NULL,
      empresa TEXT NOT NULL,
      transportadora TEXT NOT NULL,
      dataEnvio TEXT NOT NULL,
      dataRemessa TEXT NOT NULL,
      status TEXT NOT NULL,
      observacoes TEXT,
      comentarios TEXT,
      createdBy TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedBy TEXT,
      updatedAt TEXT,
      deleted INTEGER DEFAULT 0,
      deletedBy TEXT,
      deletedAt TEXT,
      deletionReason TEXT,
      FOREIGN KEY (createdBy) REFERENCES users(id)
    )
  `);
  
  // Histórico de alterações
  db.exec(`
    CREATE TABLE IF NOT EXISTS history (
      id TEXT PRIMARY KEY,
      material_id TEXT NOT NULL,
      field TEXT NOT NULL,
      oldValue TEXT,
      newValue TEXT,
      updatedBy TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (material_id) REFERENCES materials(id),
      FOREIGN KEY (updatedBy) REFERENCES users(id)
    )
  `);
  
  // Regras de alarme
  db.exec(`
    CREATE TABLE IF NOT EXISTS alarms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      condition TEXT,
      value INTEGER,
      active INTEGER DEFAULT 1,
      createdBy TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (createdBy) REFERENCES users(id)
    )
  `);
  
  // Destinatários dos alarmes
  db.exec(`
    CREATE TABLE IF NOT EXISTS alarm_recipients (
      alarm_id TEXT NOT NULL,
      email TEXT NOT NULL,
      PRIMARY KEY (alarm_id, email),
      FOREIGN KEY (alarm_id) REFERENCES alarms(id)
    )
  `);
  
  // Configurações SMTP
  db.exec(`
    CREATE TABLE IF NOT EXISTS smtp_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      server TEXT NOT NULL,
      port INTEGER NOT NULL,
      fromEmail TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log("Tabelas criadas com sucesso");
}

function seedDatabase() {
  try {
    // Verificar se já existem usuários
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    
    if (userCount === 0) {
      console.log("Populando banco de dados com dados iniciais...");
      
      // Inserir usuários padrão
      const insertUser = db.prepare(`
        INSERT INTO users (id, name, email, matricula, role)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      const users = [
        { 
          id: Date.now().toString() + '1', 
          name: 'Cristiano Silva', 
          email: 'cristiano.silva@sinobras.com.br', 
          matricula: '5730', 
          role: 'DEVELOP' 
        },
        { 
          id: Date.now().toString() + '2', 
          name: 'Admin', 
          email: 'admin@sinobras.com.br', 
          matricula: '000001', 
          role: 'ADMIN' 
        },
        { 
          id: Date.now().toString() + '3', 
          name: 'Planejador', 
          email: 'planejador@sinobras.com.br', 
          matricula: '000003', 
          role: 'PLANEJADOR' 
        }
      ];
      
      users.forEach(user => {
        try {
          insertUser.run(user.id, user.name, user.email, user.matricula, user.role);
          console.log(`Usuário ${user.email} criado com sucesso`);
        } catch (err) {
          console.error(`Erro ao inserir usuário ${user.email}:`, err.message);
        }
      });
      
      // Configuração SMTP padrão
      db.prepare(`
        INSERT INTO smtp_config (id, server, port, fromEmail)
        VALUES (1, ?, ?, ?)
      `).run('10.6.250.1', 25, 'LamiSys@sinobras.com.br');
      
      console.log("Dados iniciais inseridos com sucesso");
    }
  } catch (err) {
    console.error('Erro ao popular banco de dados:', err);
  }
}

// Função para fazer backup do banco de dados
function backupDatabase(backupPath) {
  try {
    // Se o backupPath não for especificado, cria um na pasta de dados com timestamp
    if (!backupPath) {
      const userDataPath = app.getPath('userData');
      const backupFolder = path.join(userDataPath, 'backups');
      
      if (!fs.existsSync(backupFolder)) {
        fs.mkdirSync(backupFolder, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      backupPath = path.join(backupFolder, `lamisys-backup-${timestamp}.db`);
    }
    
    // Backup usando VACUUM INTO
    db.pragma(`vacuum into '${backupPath}'`);
    
    console.log(`Backup criado com sucesso em: ${backupPath}`);
    return backupPath;
  } catch (err) {
    console.error('Erro ao fazer backup:', err.message);
    throw err;
  }
}

// Funções para CRUD de usuários
function getAllUsers() {
  return db.prepare('SELECT * FROM users').all();
}

function getUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function getUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

function createUser(user) {
  const { id, name, email, matricula, role, avatar = '', isFirstAccess = 1 } = user;
  
  try {
    const result = db.prepare(`
      INSERT INTO users (id, name, email, matricula, role, avatar, isFirstAccess)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, email, matricula, role, avatar, isFirstAccess);
    
    if (result.changes > 0) {
      return getUserById(id);
    }
    return null;
  } catch (err) {
    console.error('Erro ao criar usuário:', err.message);
    throw err;
  }
}

function updateUser(id, updates) {
  // Construir a query dinamicamente com os campos a serem atualizados
  const fields = Object.keys(updates).filter(key => key !== 'id');
  
  if (fields.length === 0) {
    return getUserById(id);
  }
  
  const setClauses = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => updates[field]);
  
  const query = `
    UPDATE users 
    SET ${setClauses}
    WHERE id = ?
  `;
  
  try {
    const result = db.prepare(query).run(...values, id);
    if (result.changes > 0) {
      return getUserById(id);
    }
    return null;
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err.message);
    throw err;
  }
}

function deleteUser(id) {
  try {
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return result.changes > 0;
  } catch (err) {
    console.error('Erro ao excluir usuário:', err.message);
    throw err;
  }
}

// Funções para CRUD de materiais
function getAllMaterials(includeDeleted = false) {
  let query = 'SELECT * FROM materials';
  if (!includeDeleted) {
    query += ' WHERE deleted = 0';
  }
  return db.prepare(query).all();
}

function getDeletedMaterials() {
  return db.prepare('SELECT * FROM materials WHERE deleted = 1').all();
}

function getMaterialById(id) {
  const material = db.prepare('SELECT * FROM materials WHERE id = ?').get(id);
  
  if (material) {
    // Carregar histórico
    material.history = db.prepare('SELECT * FROM history WHERE material_id = ?').all(id);
  }
  
  return material;
}

function createMaterial(material) {
  const {
    id,
    notaFiscal,
    numeroOrdem,
    detalhesEquipamento,
    tipoOrdem,
    tipoMaterial,
    remessa,
    codigoSAP,
    empresa,
    transportadora,
    dataEnvio,
    dataRemessa,
    status,
    observacoes = '',
    comentarios = '',
    createdBy,
    createdAt
  } = material;
  
  try {
    const result = db.prepare(`
      INSERT INTO materials (
        id, notaFiscal, numeroOrdem, detalhesEquipamento, tipoOrdem, tipoMaterial,
        remessa, codigoSAP, empresa, transportadora, dataEnvio, dataRemessa,
        status, observacoes, comentarios, createdBy, createdAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, notaFiscal, numeroOrdem, detalhesEquipamento, tipoOrdem, tipoMaterial,
      remessa, codigoSAP, empresa, transportadora, dataEnvio, dataRemessa,
      status, observacoes, comentarios, createdBy, createdAt
    );
    
    if (result.changes > 0) {
      return getMaterialById(id);
    }
    return null;
  } catch (err) {
    console.error('Erro ao criar material:', err.message);
    throw err;
  }
}

function updateMaterial(id, updates, updatedBy) {
  // Verificar se o material existe
  const material = getMaterialById(id);
  if (!material) {
    return null;
  }
  
  // Filtrar os campos que podem ser atualizados
  const allowedFields = [
    'notaFiscal', 'numeroOrdem', 'detalhesEquipamento', 'tipoOrdem', 'tipoMaterial',
    'remessa', 'codigoSAP', 'empresa', 'transportadora', 'dataEnvio', 'dataRemessa',
    'status', 'observacoes', 'comentarios'
  ];
  
  const updateData = {};
  const historyEntries = [];
  
  // Preparar dados para atualização e histórico
  allowedFields.forEach(field => {
    if (field in updates && updates[field] !== material[field]) {
      updateData[field] = updates[field];
      
      // Registrar alteração no histórico
      historyEntries.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        material_id: id,
        field,
        oldValue: String(material[field] || ''),
        newValue: String(updates[field] || ''),
        updatedBy,
        updatedAt: new Date().toISOString()
      });
    }
  });
  
  // Se não houver campos a atualizar, retornar o material atual
  if (Object.keys(updateData).length === 0) {
    return material;
  }
  
  // Adicionar campos updatedBy e updatedAt
  updateData.updatedBy = updatedBy;
  updateData.updatedAt = new Date().toISOString();
  
  // Construir a query de atualização
  const fields = Object.keys(updateData);
  const setClauses = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => updateData[field]);
  
  // Iniciar transação
  const transaction = db.transaction(() => {
    // Atualizar material
    db.prepare(`
      UPDATE materials 
      SET ${setClauses}
      WHERE id = ?
    `).run(...values, id);
    
    // Inserir entradas no histórico
    const insertHistory = db.prepare(`
      INSERT INTO history (id, material_id, field, oldValue, newValue, updatedBy, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    historyEntries.forEach(entry => {
      insertHistory.run(
        entry.id,
        entry.material_id,
        entry.field,
        entry.oldValue,
        entry.newValue,
        entry.updatedBy,
        entry.updatedAt
      );
    });
    
    // Retornar o material atualizado
    return getMaterialById(id);
  });
  
  try {
    return transaction();
  } catch (err) {
    console.error('Erro ao atualizar material:', err.message);
    throw err;
  }
}

function deleteMaterial(id, reason, deletedBy) {
  try {
    const deletedAt = new Date().toISOString();
    const result = db.prepare(`
      UPDATE materials
      SET deleted = 1, deletedBy = ?, deletedAt = ?, deletionReason = ?
      WHERE id = ? AND deleted = 0
    `).run(deletedBy, deletedAt, reason, id);
    
    return result.changes > 0;
  } catch (err) {
    console.error('Erro ao excluir material:', err.message);
    throw err;
  }
}

// Funções para gerenciar alarmes
function getAllAlarms() {
  const alarms = db.prepare('SELECT * FROM alarms').all();
  
  // Para cada alarme, buscar os destinatários
  return alarms.map(alarm => {
    const recipients = db.prepare('SELECT email FROM alarm_recipients WHERE alarm_id = ?')
      .all(alarm.id)
      .map(row => row.email);
    
    return { ...alarm, recipients };
  });
}

function getAlarmById(id) {
  const alarm = db.prepare('SELECT * FROM alarms WHERE id = ?').get(id);
  
  if (alarm) {
    // Buscar destinatários
    alarm.recipients = db.prepare('SELECT email FROM alarm_recipients WHERE alarm_id = ?')
      .all(id)
      .map(row => row.email);
  }
  
  return alarm;
}

function createAlarm(alarm) {
  const { id, name, type, condition = null, value = null, active = 1, createdBy, createdAt, recipients } = alarm;
  
  // Iniciar transação
  const transaction = db.transaction(() => {
    // Inserir alarme
    db.prepare(`
      INSERT INTO alarms (id, name, type, condition, value, active, createdBy, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, type, condition, value, active, createdBy, createdAt);
    
    // Inserir destinatários
    const insertRecipient = db.prepare(`
      INSERT INTO alarm_recipients (alarm_id, email)
      VALUES (?, ?)
    `);
    
    if (recipients && recipients.length > 0) {
      recipients.forEach(email => {
        insertRecipient.run(id, email);
      });
    }
    
    return getAlarmById(id);
  });
  
  try {
    return transaction();
  } catch (err) {
    console.error('Erro ao criar alarme:', err.message);
    throw err;
  }
}

function updateAlarm(id, updates) {
  const alarm = getAlarmById(id);
  if (!alarm) {
    return null;
  }
  
  // Separar atualizações do alarme e destinatários
  const { recipients, ...alarmUpdates } = updates;
  
  // Iniciar transação
  const transaction = db.transaction(() => {
    // Atualizar alarme se houver campos a atualizar
    if (Object.keys(alarmUpdates).length > 0) {
      const fields = Object.keys(alarmUpdates);
      const setClauses = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => alarmUpdates[field]);
      
      db.prepare(`
        UPDATE alarms 
        SET ${setClauses}
        WHERE id = ?
      `).run(...values, id);
    }
    
    // Atualizar destinatários se fornecidos
    if (recipients) {
      // Remover destinatários existentes
      db.prepare('DELETE FROM alarm_recipients WHERE alarm_id = ?').run(id);
      
      // Inserir novos destinatários
      if (recipients.length > 0) {
        const insertRecipient = db.prepare(`
          INSERT INTO alarm_recipients (alarm_id, email)
          VALUES (?, ?)
        `);
        
        recipients.forEach(email => {
          insertRecipient.run(id, email);
        });
      }
    }
    
    return getAlarmById(id);
  });
  
  try {
    return transaction();
  } catch (err) {
    console.error('Erro ao atualizar alarme:', err.message);
    throw err;
  }
}

function deleteAlarm(id) {
  // Iniciar transação
  const transaction = db.transaction(() => {
    // Remover destinatários
    db.prepare('DELETE FROM alarm_recipients WHERE alarm_id = ?').run(id);
    
    // Remover alarme
    const result = db.prepare('DELETE FROM alarms WHERE id = ?').run(id);
    
    return result.changes > 0;
  });
  
  try {
    return transaction();
  } catch (err) {
    console.error('Erro ao excluir alarme:', err.message);
    throw err;
  }
}

// Funções para configuração SMTP
function getSMTPConfig() {
  // Check if db is initialized before trying to use it
  if (!db) {
    console.warn('Database not initialized when getting SMTP config.');
    return null;
  }
  
  return db.prepare('SELECT * FROM smtp_config WHERE id = 1').get();
}

function updateSMTPConfig(config) {
  // Check if db is initialized
  if (!db) {
    console.warn('Database not initialized when updating SMTP config.');
    throw new Error('Database not initialized');
  }
  
  const { server, port, fromEmail } = config;
  
  try {
    // Check if a configuration already exists
    const exists = getSMTPConfig();
    
    if (exists) {
      // Update existing configuration
      db.prepare(`
        UPDATE smtp_config
        SET server = ?, port = ?, fromEmail = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `).run(server, port, fromEmail);
    } else {
      // Insert new configuration
      db.prepare(`
        INSERT INTO smtp_config (id, server, port, fromEmail)
        VALUES (1, ?, ?, ?)
      `).run(server, port, fromEmail);
    }
    
    return getSMTPConfig();
  } catch (err) {
    console.error('Error updating SMTP configuration:', err.message);
    throw err;
  }
}

module.exports = {
  initDatabase,
  seedDatabase,
  backupDatabase,
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  getAllMaterials,
  getDeletedMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getAllAlarms,
  getAlarmById,
  createAlarm,
  updateAlarm,
  deleteAlarm,
  getSMTPConfig,
  updateSMTPConfig
};
