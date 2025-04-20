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
  return 'http://localhost:3000/api';
};

const baseURL = getBaseUrl();
console.log('API Base URL:', baseURL);

const api = axios.create({
  baseURL,
  timeout: 10000,
});

// Interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle real errors
    let errorMessage = 'Ocorreu um erro na requisição';
    
    if (error.response) {
      // Error returned by the server
      errorMessage = error.response.data?.error || `Erro ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      // No response from server
      errorMessage = 'Erro de conexão com o servidor. Verifique se o servidor está rodando.';
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

// Export specific APIs
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },
  resetPassword: async (email: string) => {
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
    const response = await api.get('/users');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  create: async (userData: any) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  update: async (id: string, userData: any) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export const materialAPI = {
  getAll: async (includeDeleted = false) => {
    const response = await api.get('/materials', { params: { includeDeleted } });
    return response.data;
  },
  getDeleted: async () => {
    const response = await api.get('/materials/deleted');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/materials/${id}`);
    return response.data;
  },
  create: async (materialData: any) => {
    const response = await api.post('/materials', materialData);
    return response.data;
  },
  update: async (id: string, materialData: any, updatedBy: string) => {
    const response = await api.put(`/materials/${id}`, { ...materialData, updatedBy });
    return response.data;
  },
  delete: async (id: string, reason: string, deletedBy: string) => {
    const response = await api.delete(`/materials/${id}`, { data: { reason, deletedBy } });
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
};

export default api;
