/**
 * Mock de um banco de dados SQLite.
 * Em um aplicativo real, este código estaria no backend.
 */

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
export function getAllAlarms(): AlarmRule[] {
  return getItem<AlarmRule[]>(DB_KEYS.ALARMS, []);
}

export function getAlarmById(id: string): AlarmRule | undefined {
  const alarms = getAllAlarms();
  return alarms.find(a => a.id === id);
}

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

export function updateAlarm(id: string, updates: Partial<AlarmRule>): AlarmRule | null {
  const alarms = getAllAlarms();
  const index = alarms.findIndex(a => a.id === id);
  
  if (index === -1) return null;
  
  alarms[index] = { ...alarms[index], ...updates };
  setItem(DB_KEYS.ALARMS, alarms);
  
  return alarms[index];
}

export function deleteAlarm(id: string): boolean {
  const alarms = getAllAlarms();
  const index = alarms.findIndex(a => a.id === id);
  
  if (index === -1) return false;
  
  alarms.splice(index, 1);
  setItem(DB_KEYS.ALARMS, alarms);
  
  return true;
}

// Função para alimentar dados de exemplo se o banco estiver vazio
export function seedDatabaseIfEmpty(): void {
  // Usuários
  const users = getAllUsers();
  if (users.length === 0) {
    const demoUsers: Omit<User, "id">[] = [
      {
        name: "Admin",
        email: "admin@sinobras.com.br",
        matricula: "000001",
        role: UserRole.ADMIN,
        avatar: "",
      },
      {
        name: "Desenvolvedor",
        email: "dev@sinobras.com.br",
        matricula: "000002",
        role: UserRole.DEVELOP,
        avatar: "",
      },
      {
        name: "Planejador",
        email: "planejador@sinobras.com.br",
        matricula: "000003",
        role: UserRole.PLANEJADOR,
        avatar: "",
      },
      {
        name: "Usuário",
        email: "usuario@sinobras.com.br",
        matricula: "000004",
        role: UserRole.USUARIO,
        avatar: "",
      },
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
      },
      {
        notaFiscal: "NF-002/2024",
        numeroOrdem: "ORD-654321",
        detalhesEquipamento: "Inversor de Frequência 50kW",
        tipoOrdem: "Reparo",
        tipoMaterial: MaterialType.INVERSOR,
        remessa: "REM-45678",
        codigoSAP: "SAP-654321",
        empresa: "WEG",
        transportadora: "LogTech",
        dataEnvio: "2024-02-20",
        dataRemessa: "2024-02-15",
        status: MaterialStatus.PENDENTE,
        observacoes: "Inversor com problemas de comunicação",
        comentarios: "Necessário laudo técnico",
      },
      {
        notaFiscal: "NF-003/2024",
        numeroOrdem: "ORD-789012",
        detalhesEquipamento: "Encoder Incremental 1024ppr",
        tipoOrdem: "Troca",
        tipoMaterial: MaterialType.ENCODER,
        remessa: "REM-23456",
        codigoSAP: "SAP-789012",
        empresa: "Danfoss",
        transportadora: "Express Delivery",
        dataEnvio: "2024-03-05",
        dataRemessa: "2024-03-01",
        status: MaterialStatus.ENTREGUE,
        observacoes: "Encoder danificado durante manutenção",
        comentarios: "Verificar compatibilidade com o motor",
      },
      {
        notaFiscal: "NF-004/2024",
        numeroOrdem: "ORD-345678",
        detalhesEquipamento: "Monitor Industrial 24\"",
        tipoOrdem: "Reparo",
        tipoMaterial: MaterialType.MONITOR,
        remessa: "REM-76543",
        codigoSAP: "SAP-345678",
        empresa: "Dell",
        transportadora: "Rápido Brasil",
        dataEnvio: "2024-03-10",
        dataRemessa: "2024-03-08",
        status: MaterialStatus.DEVOLVIDO,
        observacoes: "Tela com manchas",
        comentarios: "Fora de garantia, verificar custo de reparo",
      },
      {
        notaFiscal: "NF-005/2024",
        numeroOrdem: "ORD-901234",
        detalhesEquipamento: "Computador Industrial",
        tipoOrdem: "Upgrade",
        tipoMaterial: MaterialType.COMPUTADOR,
        remessa: "REM-12345",
        codigoSAP: "SAP-901234",
        empresa: "Advantech",
        transportadora: "Transporte Seguro",
        dataEnvio: "2024-03-15",
        dataRemessa: "2024-03-12",
        status: MaterialStatus.CONCLUIDO,
        observacoes: "Upgrade de memória e SSD",
        comentarios: "Melhorar desempenho para novo SCADA",
      },
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
      },
      {
        name: "Notificação de novo material",
        type: "NOVO_ITEM",
        recipients: ["planejador@sinobras.com.br"],
        active: true,
        createdBy: "dev@sinobras.com.br",
      },
      {
        name: "Alerta de material sem conclusão após 30 dias",
        type: "TEMPO_TOTAL",
        value: 30,
        recipients: ["admin@sinobras.com.br"],
        active: true,
        createdBy: "dev@sinobras.com.br",
      },
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
