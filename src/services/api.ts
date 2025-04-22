import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

// Determine the base URL for the API
const getBaseUrl = () => {
  // For browser environments or when we're deployed
  if (typeof window !== 'undefined') {
    // For local development in the browser preview
    if (window.location.hostname.includes('lovableproject.com')) {
      // Use mock implementation for the preview environment
      return '/api'; 
    }
  }
  
  // Default for Electron app
  return 'http://localhost:8080/api';
};

const baseURL = getBaseUrl();
console.log('API Base URL:', baseURL);

const api = axios.create({
  baseURL,
  timeout: 10000,
});

// Variável global para armazenar o status da conexão com o servidor
let serverStatusChecked = false;
let isServerOnline = false;

// Função para verificar se o servidor está online
export const checkServerStatus = async () => {
  try {
    console.log('Verificando status do servidor...');
    const response = await axios.get(`${baseURL}/status`, { timeout: 5000 });
    console.log('Resposta do status do servidor:', response.data);
    
    serverStatusChecked = true;
    isServerOnline = true;
    
    // Verificar também o status do banco de dados
    const dbStatus = response.data?.database;
    
    return {
      online: true,
      databaseConnected: dbStatus?.connected || false,
      message: dbStatus?.message || 'Server is online',
      data: response.data
    };
  } catch (error) {
    console.error('Erro ao verificar status do servidor:', error);
    serverStatusChecked = true;
    isServerOnline = false;
    
    return {
      online: false,
      databaseConnected: false,
      message: 'O servidor parece estar offline. Para iniciar o servidor, execute "npm run dev:server" no terminal.'
    };
  }
};

// Verificar status do servidor automaticamente
checkServerStatus().then(status => {
  console.log('Resultado da verificação de status:', status);
  
  if (!status.online) {
    toast({
      title: 'Servidor Offline',
      description: status.message,
      variant: 'destructive',
    });
  } else if (!status.databaseConnected) {
    toast({
      title: 'Banco de Dados Desconectado',
      description: 'O servidor está online, mas há um problema com a conexão ao banco de dados.',
      variant: 'destructive',
    });
  } else {
    toast({
      title: 'Servidor Online',
      description: 'Conexão com o servidor e banco de dados estabelecida com sucesso.',
      variant: 'default',
    });
  }
}).catch(err => {
  console.error('Erro ao verificar o status do servidor:', err);
});

// Interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log('Resposta da API recebida:', response.config.url, response.status);
    return response;
  },
  (error) => {
    // Handle real errors
    let errorMessage = 'Ocorreu um erro na requisição';
    
    if (error.response) {
      // Error returned by the server
      console.error('Erro da API:', error.response.status, error.response.data);
      errorMessage = error.response.data?.error || `Erro ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      // No response from server
      console.error('Sem resposta do servidor:', error.request);
      if (!serverStatusChecked || !isServerOnline) {
        errorMessage = 'Erro de conexão com o servidor. Verifique se o servidor está rodando usando o comando "npm run dev:server" no terminal.';
      } else {
        errorMessage = 'Erro de conexão com o servidor. Verifique se o servidor está rodando.';
      }
    } else {
      console.error('Erro na configuração da requisição:', error.message);
    }
    
    // Show error toast (except for authentication errors which are handled separately)
    const url = error.config?.url;
    if (!url?.includes('/login') || error.response?.status !== 401) {
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    }
    
    return Promise.reject(error);
  }
);

// Request interceptor to log requests
api.interceptors.request.use(
  (config) => {
    console.log('Enviando requisição para:', config.method?.toUpperCase(), config.url);
    if (config.data) {
      console.log('Dados da requisição:', config.data);
    }
    return config;
  },
  (error) => {
    console.error('Erro ao configurar requisição:', error);
    return Promise.reject(error);
  }
);

// Export status check API
export const statusAPI = {
  check: checkServerStatus
};

// Export specific APIs
export const authAPI = {
  login: async (email: string, password: string) => {
    // Verificar se o servidor está online antes de tentar login
    const status = await checkServerStatus();
    if (!status.online) {
      throw new Error(status.message);
    }
    
    console.log(`Attempting login with email: ${email}`);
    const response = await api.post('/login', { email, password });
    console.log('Login response:', response.data);
    return response.data;
  },
  resetPassword: async (email: string) => {
    // Verificar se o servidor está online antes de tentar reset
    const status = await checkServerStatus();
    if (!status.online) {
      throw new Error(status.message);
    }
    
    const response = await api.post('/reset-password', { email });
    return response.data;
  },
  changePassword: async (userId: string, oldPassword: string, newPassword: string) => {
    const response = await api.post('/change-password', { userId, oldPassword, newPassword });
    return response.data;
  },
};

export const userAPI = {
  getAll: async () => {
    console.log('Solicitando lista de usuários');
    const response = await api.get('/users');
    console.log('Usuários recebidos:', response.data);
    return response.data;
  },
  getById: async (id: string) => {
    console.log(`Solicitando usuário com ID: ${id}`);
    const response = await api.get(`/users/${id}`);
    console.log('Usuário recebido:', response.data);
    return response.data;
  },
  create: async (userData: any) => {
    console.log('Criando novo usuário:', userData);
    const response = await api.post('/users', userData);
    console.log('Usuário criado:', response.data);
    return response.data;
  },
  update: async (id: string, userData: any) => {
    console.log(`Atualizando usuário ${id}:`, userData);
    const response = await api.put(`/users/${id}`, userData);
    console.log('Usuário atualizado:', response.data);
    return response.data;
  },
  delete: async (id: string) => {
    console.log(`Excluindo usuário: ${id}`);
    const response = await api.delete(`/users/${id}`);
    console.log('Resposta da exclusão:', response.data);
    return response.data;
  },
};

export const materialAPI = {
  getAll: async (includeDeleted = false) => {
    console.log('Solicitando lista de materiais, incluir excluídos:', includeDeleted);
    const response = await api.get('/materials', { params: { includeDeleted } });
    console.log('Materiais recebidos:', response.data);
    return response.data;
  },
  getDeleted: async () => {
    console.log('Solicitando lista de materiais excluídos');
    const response = await api.get('/materials/deleted');
    console.log('Materiais excluídos recebidos:', response.data);
    return response.data;
  },
  getById: async (id: string) => {
    console.log(`Solicitando material com ID: ${id}`);
    const response = await api.get(`/materials/${id}`);
    console.log('Material recebido:', response.data);
    return response.data;
  },
  create: async (materialData: any) => {
    console.log('Criando novo material:', materialData);
    const response = await api.post('/materials', materialData);
    console.log('Material criado:', response.data);
    return response.data;
  },
  update: async (id: string, materialData: any, updatedBy: string) => {
    console.log(`Atualizando material ${id}:`, materialData);
    const response = await api.put(`/materials/${id}`, { ...materialData, updatedBy });
    console.log('Material atualizado:', response.data);
    return response.data;
  },
  delete: async (id: string, reason: string, deletedBy: string) => {
    console.log(`Excluindo material ${id}, motivo: ${reason}, por: ${deletedBy}`);
    const response = await api.delete(`/materials/${id}`, { data: { reason, deletedBy } });
    console.log('Resposta da exclusão:', response.data);
    return response.data;
  },
};

export const alarmAPI = {
  getAll: async () => {
    const response = await api.get('/alarms');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/alarms/${id}`);
    return response.data;
  },
  create: async (alarmData: any) => {
    const response = await api.post('/alarms', alarmData);
    return response.data;
  },
  update: async (id: string, alarmData: any) => {
    const response = await api.put(`/alarms/${id}`, alarmData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/alarms/${id}`);
    return response.data;
  },
};

export const smtpAPI = {
  getConfig: async () => {
    const response = await api.get('/smtp-config');
    return response.data;
  },
  updateConfig: async (config: any) => {
    const response = await api.put('/smtp-config', config);
    return response.data;
  },
};

export const backupAPI = {
  createBackup: async () => {
    const response = await api.post('/backup');
    return response.data;
  },
  restoreBackup: async (data: any) => {
    const response = await api.post('/backup/restore', { data });
    return response.data;
  }
};

export default api;