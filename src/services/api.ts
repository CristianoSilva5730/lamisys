
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

// Determine the base URL for the API
// In development, we'll use a mock implementation that doesn't require a real API
const isDevelopment = process.env.NODE_ENV === 'development';

// Get the current hostname to handle deployed environments
const getBaseUrl = () => {
  // For browser environments or when we're deployed
  if (typeof window !== 'undefined') {
    // For local development in the browser preview
    if (window.location.hostname.includes('lovableproject.com')) {
      // Use mock implementation for the preview environment
      return '/api'; // This won't actually connect to a real API
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

// Create a mock implementation for browser preview environments
const createMockResponse = (data) => {
  return Promise.resolve({ data });
};

// Interceptor for simulating responses in browser preview
api.interceptors.request.use(async (config) => {
  // Only apply mocking in browser preview environments
  if (typeof window !== 'undefined' && window.location.hostname.includes('lovableproject.com')) {
    console.log('Using mock implementation for', config.url);
    
    // Cancel the actual request
    const source = axios.CancelToken.source();
    config.cancelToken = source.token;
    
    // Store URL and data for later use in mock response
    const mockData = {
      url: config.url,
      method: config.method,
      data: config.data ? config.data : null
    };
    
    // Cancel with a string to avoid circular references
    setTimeout(() => source.cancel('Mock implementation:' + JSON.stringify(mockData)), 0);
  }
  return config;
}, error => Promise.reject(error));

// Interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If this is our mock cancel, create a simulated response
    if (axios.isCancel(error) && error.message.startsWith('Mock implementation:')) {
      try {
        // Extract the mock data from the message
        const mockDataStr = error.message.replace('Mock implementation:', '');
        const mockData = JSON.parse(mockDataStr);
        const { url, method } = mockData;
        
        let requestData = null;
        if (mockData.data && typeof mockData.data === 'string') {
          try {
            requestData = JSON.parse(mockData.data);
          } catch (e) {
            requestData = mockData.data;
          }
        } else {
          requestData = mockData.data;
        }
        
        // Create a mock response based on the request
        if (url?.includes('/login')) {
          const email = requestData?.email || 'unknown@example.com';
          
          // Simulação de verificação de senha para o mock
          // Só aceitar Login para cristiano.silva@sinobras.com com a senha "Cristiano5730"
          if (email === 'cristiano.silva@sinobras.com') {
            const validPassword = requestData?.password === 'Cristiano5730';
            
            if (!validPassword) {
              return Promise.reject({
                response: { 
                  status: 401, 
                  data: { error: 'Usuário ou senha incorretos' } 
                }
              });
            }
            
            // Login bem-sucedido
            return createMockResponse({ 
              id: '1745111000880', 
              name: 'Cristiano Silva', 
              email: email,
              matricula: '5730',
              role: 'ADMIN',
              isFirstAccess: 0
            });
          } else {
            // Qualquer outro email faz login normalmente para teste
            return createMockResponse({ 
              id: Date.now().toString(), 
              name: 'Test User', 
              email: email,
              matricula: '123456',
              role: 'USUARIO',
              isFirstAccess: 0 
            });
          }
        } else if (url?.includes('/change-password')) {
          console.log('Mocking password change:', requestData);
          // Simulate successful password change
          return createMockResponse({ 
            success: true, 
            message: 'Senha alterada com sucesso' 
          });
        } else if (url?.includes('/reset-password')) {
          console.log('Mocking password reset:', requestData);
          return createMockResponse({ 
            success: true, 
            message: 'Senha redefinida com sucesso' 
          });
        }
        
        // Default mock response
        return createMockResponse({ success: true });
      } catch (e) {
        console.error('Error parsing mock data:', e);
        // Fallback mock response
        return createMockResponse({ success: true });
      }
    }
    
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
