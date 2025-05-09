import { Material, HistoryEntry, User, AlarmRule, SMTPConfig, MaterialStatus, MaterialType, UserRole } from "@/lib/types";

// Prefixos para evitar colisões com outros apps no localStorage
const DB_KEYS = {
  MATERIALS: "lamisys-materials",
  DELETED_MATERIALS: "lamisys-deleted-materials",
  USERS: "lamisys-users",
  ALARMS: "lamisys-alarms",
  SMTP: "lamisys-smtp",
};

// Funções auxiliares para simular o banco de dados
function getItem<T>(key: string, defaultValue: T): T {
  const item = localStorage.getItem(key);
  if (!item) return defaultValue;
  try {
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Erro ao carregar ${key}:`, error);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Funções de banco de dados para materiais
export function getAllMaterials(): Material[] {
  return getItem<Material[]>(DB_KEYS.MATERIALS, []);
}

export function getDeletedMaterials(): Material[] {
  return getItem<Material[]>(DB_KEYS.DELETED_MATERIALS, []);
}

export function getMaterialById(id: string): Material | undefined {
  const materials = getAllMaterials();
  return materials.find(m => m.id === id);
}

export function createMaterial(material: Omit<Material, "id" | "createdAt" | "createdBy" | "history">): Material {
  const materials = getAllMaterials();
  
  const newMaterial: Material = {
    ...material,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    createdBy: "sistema", // Idealmente, seria o ID do usuário atual
    history: []
  };
  
  materials.push(newMaterial);
  setItem(DB_KEYS.MATERIALS, materials);
  
  return newMaterial;
}

export function updateMaterial(
  id: string, 
  updates: Partial<Material>, 
  updatedBy: string
): Material | null {
  const materials = getAllMaterials();
  const index = materials.findIndex(m => m.id === id);
  
  if (index === -1) return null;
  
  const original = materials[index];
  const updatedMaterial = { ...original, ...updates, updatedAt: new Date().toISOString(), updatedBy };
  
  // Registrar alterações no histórico
  const history: HistoryEntry[] = original.history || [];
  
  Object.keys(updates).forEach(key => {
    if (key !== 'updatedAt' && key !== 'updatedBy' && key !== 'history') {
      const oldValue = original[key as keyof Material];
      const newValue = updates[key as keyof Material];
      
      if (oldValue !== newValue) {
        history.push({
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          field: key,
          oldValue: String(oldValue || ''),
          newValue: String(newValue || ''),
          updatedBy,
          updatedAt: new Date().toISOString()
        });
      }
    }
  });
  
  updatedMaterial.history = history;
  materials[index] = updatedMaterial;
  
  setItem(DB_KEYS.MATERIALS, materials);
  return updatedMaterial;
}

export function deleteMaterial(
  id: string, 
  reason: string, 
  deletedBy: string
): boolean {
  const materials = getAllMaterials();
  const materialIndex = materials.findIndex(m => m.id === id);
  
  if (materialIndex === -1) return false;
  
  const material = materials[materialIndex];
  const deletedMaterial: Material = {
    ...material,
    deleted: true,
    deletedAt: new Date().toISOString(),
    deletedBy,
    deletionReason: reason
  };
  
  // Remover do array principal
  materials.splice(materialIndex, 1);
  setItem(DB_KEYS.MATERIALS, materials);
  
  // Adicionar ao histórico de excluídos
  const deletedMaterials = getDeletedMaterials();
  deletedMaterials.push(deletedMaterial);
  setItem(DB_KEYS.DELETED_MATERIALS, deletedMaterials);
  
  return true;
}

// Create an alarm
export function createAlarm(alarm: Omit<AlarmRule, "id" | "createdAt">): AlarmRule {
  const alarms = getAllAlarms();
  
  const newAlarm: AlarmRule = {
    ...alarm,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  
  alarms.push(newAlarm);
  setItem(DB_KEYS.ALARMS, alarms);
  
  return newAlarm;
}

// Get all alarms
export function getAllAlarms(): AlarmRule[] {
  return getItem<AlarmRule[]>(DB_KEYS.ALARMS, []);
}

// Get alarm by ID
export function getAlarmById(id: string): AlarmRule | undefined {
  const alarms = getAllAlarms();
  return alarms.find(a => a.id === id);
}

// Update an alarm
export function updateAlarm(id: string, updates: Partial<AlarmRule>): AlarmRule | null {
  const alarms = getAllAlarms();
  const index = alarms.findIndex(a => a.id === id);
  
  if (index === -1) return null;
  
  alarms[index] = { ...alarms[index], ...updates };
  setItem(DB_KEYS.ALARMS, alarms);
  
  return alarms[index];
}

// Delete an alarm
export function deleteAlarm(id: string): boolean {
  const alarms = getAllAlarms();
  const index = alarms.findIndex(a => a.id === id);
  
  if (index === -1) return false;
  
  alarms.splice(index, 1);
  setItem(DB_KEYS.ALARMS, alarms);
  
  return true;
}

// Funções para usuários
export function getAllUsers(): User[] {
  return getItem<User[]>(DB_KEYS.USERS, []);
}

export function getUserById(id: string): User | undefined {
  const users = getAllUsers();
  return users.find(u => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  const users = getAllUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function createUser(user: Omit<User, "id">): User {
  const users = getAllUsers();
  
  // Verificar se já existe um usuário com o mesmo email
  const existingUser = getUserByEmail(user.email);
  if (existingUser) {
    throw new Error(`Usuário com email ${user.email} já existe`);
  }
  
  const newUser: User = {
    ...user,
    id: Date.now().toString()
  };
  
  users.push(newUser);
  setItem(DB_KEYS.USERS, users);
  
  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) return null;
  
  // Se estiver atualizando o email, verificar duplicidade
  if (updates.email && updates.email !== users[index].email) {
    const existingUser = getUserByEmail(updates.email);
    if (existingUser && existingUser.id !== id) {
      throw new Error(`Usuário com email ${updates.email} já existe`);
    }
  }
  
  users[index] = { ...users[index], ...updates };
  setItem(DB_KEYS.USERS, users);
  
  return users[index];
}

export function deleteUser(id: string): boolean {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) return false;
  
  users.splice(index, 1);
  setItem(DB_KEYS.USERS, users);
  
  return true;
}

// Funções para regras de alarme
// Função para alimentar dados de exemplo se o banco estiver vazio
export function seedDatabaseIfEmpty(): void {
  // Usuários
  const users = getAllUsers();
  if (users.length === 0) {
    const demoUsers: Omit<User, "id">[] = [
      {
        name: "Desenvolvedor",
        email: "dev@sinobras.com.br",
        matricula: "000002",
        role: UserRole.DEVELOP,
        avatar: "",
      }
    ];
    
    demoUsers.forEach(user => {
      try {
        createUser(user);
      } catch (error) {
        console.error(`Erro ao criar usuário ${user.email}:`, error);
      }
    });
  }
  
  // Materiais
  const materials = getAllMaterials();
  if (materials.length === 0) {
    const demoMaterials: Omit<Material, "id" | "createdAt" | "createdBy" | "history">[] = [
      {
        notaFiscal: "NF-001/2024",
        numeroOrdem: "ORD-123456",
        detalhesEquipamento: "Motor AC 75kW 380V 60Hz",
        tipoOrdem: "Manutenção",
        tipoMaterial: MaterialType.MOTOR_AC,
        remessa: "REM-98765",
        codigoSAP: "SAP-123456",
        empresa: "Sinobras",
        transportadora: "Transportes Rápidos",
        dataEnvio: "2024-01-15",
        dataRemessa: "2024-01-10",
        status: MaterialStatus.ENVIADO,
        observacoes: "Motor enviado para reparo do rolamento",
        comentarios: "Cliente solicitou urgência",
      }
    ];
    
    demoMaterials.forEach(material => {
      const newMaterial = createMaterial(material);
      
      // Adicionar histórico fictício para alguns materiais
      if (material.notaFiscal === "NF-001/2024") {
        updateMaterial(
          newMaterial.id, 
          { status: MaterialStatus.ENTREGUE }, 
          "admin@sinobras.com.br"
        );
        updateMaterial(
          newMaterial.id, 
          { status: MaterialStatus.ENVIADO }, 
          "planejador@sinobras.com.br"
        );
      }
    });
  }
  
  // Regras de Alarme
  const alarms = getAllAlarms();
  if (alarms.length === 0) {
    const demoAlarms: Omit<AlarmRule, "id" | "createdAt">[] = [
      {
        name: "Alerta de material pendente por mais de 7 dias",
        type: "TEMPO_ETAPA",
        condition: "status === 'PENDENTE'",
        value: 7,
        recipients: ["planejador@sinobras.com.br", "admin@sinobras.com.br"],
        active: true,
        createdBy: "dev@sinobras.com.br",
      }
    ];
    
    demoAlarms.forEach(alarm => createAlarm(alarm));
  }
  
  // Configuração SMTP
  const smtpConfig = localStorage.getItem(DB_KEYS.SMTP);
  if (!smtpConfig) {
    const defaultConfig: SMTPConfig = {
      server: "10.6.250.1",
      port: 25,
      fromEmail: "LamiSys@sinobras.com.br"
    };
    
    setItem(DB_KEYS.SMTP, defaultConfig);
  }
}

// Funções para configuração SMTP
export function getSMTPConfig(): SMTPConfig | null {
  return getItem<SMTPConfig>(DB_KEYS.SMTP, null);
}

export function updateSMTPConfig(config: SMTPConfig): SMTPConfig {
  setItem(DB_KEYS.SMTP, config);
  return config;
}

// Funções para backup e restore
export async function exportDatabase(): Promise<string> {
  const data = {
    materials: getAllMaterials(),
    deletedMaterials: getDeletedMaterials(),
    users: getAllUsers(),
    alarms: getAllAlarms(),
    smtp: getSMTPConfig()
  };
  
  return JSON.stringify(data);
}

export async function importDatabase(data: string): Promise<void> {
  const parsedData = JSON.parse(data);
  
  setItem(DB_KEYS.MATERIALS, parsedData.materials || []);
  setItem(DB_KEYS.DELETED_MATERIALS, parsedData.deletedMaterials || []);
  setItem(DB_KEYS.USERS, parsedData.users || []);
  setItem(DB_KEYS.ALARMS, parsedData.alarms || []);
  setItem(DB_KEYS.SMTP, parsedData.smtp || null);
}

// Inicializar o banco de dados (se necessário)
export function initDatabase(): void {
  seedDatabaseIfEmpty();
}

// Verificar conexão com o banco de dados (simulado)
export function checkDatabaseConnection(): { connected: boolean, message: string } {
  try {
    // Tentar ler um item do localStorage para verificar se está acessível
    localStorage.getItem(DB_KEYS.MATERIALS);
    return { connected: true, message: 'Conectado ao localStorage' };
  } catch (error) {
    console.error('Erro ao conectar ao localStorage:', error);
    return { connected: false, message: 'Não foi possível conectar ao localStorage' };
  }
}
