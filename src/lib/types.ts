export interface User {
  id: string;
  name: string;
  email: string;
  matricula: string;
  role: UserRole;
  avatar?: string;
  isFirstAccess?: boolean;
  supportComments?: SupportComment[];
}

export interface SupportComment {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export enum UserRole {
  USUARIO = "USUARIO",
  PLANEJADOR = "PLANEJADOR",
  ADMIN = "ADMIN",
  DEVELOP = "DEVELOP"
}

export enum MaterialStatus {
  PENDENTE = "PENDENTE",
  ENVIADO = "ENVIADO",
  ENTREGUE = "ENTREGUE",
  DEVOLVIDO = "DEVOLVIDO",
  CONCLUIDO = "CONCLUÍDO",
  CANCELADO = "CANCELADO"
}

export enum MaterialType {
  MOTOR_AC = "Motores AC",
  MOTOR_DC = "Motores DC",
  ENCODER = "Encoder",
  DRIVER = "Driver",
  INVERSOR = "Inversores",
  MONITOR = "Monitores",
  COMPUTADOR = "Computadores",
  OUTRO = "Outros"
}

export interface Material {
  id: string;
  notaFiscal: string;
  numeroOrdem: string;
  detalhesEquipamento: string;
  tipoOrdem: string;
  tipoMaterial: MaterialType;
  remessa: string;
  codigoSAP: string;
  empresa: string;
  transportadora: string;
  dataEnvio: string;
  dataRemessa: string;
  status: MaterialStatus;
  observacoes?: string;
  comentarios?: string;
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
  history?: HistoryEntry[];
  deleted?: boolean;
  deletedBy?: string;
  deletedAt?: string;
  deletionReason?: string;
}

export interface HistoryEntry {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  updatedBy: string;
  updatedAt: string;
}

export interface SMTPConfig {
  server: string;
  port: number;
  fromEmail: string;
}

export interface AlarmRule {
  id: string;
  name: string;
  type: "TEMPO_ETAPA" | "TEMPO_TOTAL" | "NOVO_ITEM";
  condition?: string;
  value?: number;
  recipients: string[];
  active: boolean;
  createdBy: string;
  createdAt: string;
}
