import axios from 'axios';
import { Material, User, AlarmRule, SMTPConfig } from '@/lib/types';

const API_BASE_URL = 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const materialAPI = {
  getAll: async (includeDeleted: boolean = false) => {
    const response = await axiosInstance.get('/materials', { params: { includeDeleted } });
    return response.data;
  },
  getDeleted: async () => {
    const response = await axiosInstance.get('/materials/deleted');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axiosInstance.get(`/materials/${id}`);
    return response.data;
  },
  create: async (data: Omit<Material, 'id' | 'createdAt' | 'createdBy' | 'history'>) => {
    const response = await axiosInstance.post('/materials', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Material>) => {
    const response = await axiosInstance.put(`/materials/${id}`, data);
    return response.data;
  },
  delete: async (id: string, reason: string, deletedBy: string) => {
    const response = await axiosInstance.delete(`/materials/${id}`, { data: { reason, deletedBy } });
    return response.data;
  },
};

export const userAPI = {
  getAll: async () => {
    const response = await axiosInstance.get('/users');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },
  create: async (data: Omit<User, 'id'>) => {
    const response = await axiosInstance.post('/users', data);
    return response.data;
  },
  update: async (id: string, data: Partial<User>) => {
    const response = await axiosInstance.put(`/users/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  },
  login: async (credentials: any) => {
    const response = await axiosInstance.post('/login', credentials);
    return response.data;
  },
  resetPassword: async (email: string) => {
    const response = await axiosInstance.post('/reset-password', { email });
    return response.data;
  },
  changePassword: async (data: any) => {
    const response = await axiosInstance.post('/change-password', data);
    return response.data;
  },
};

export const alarmAPI = {
  getAll: async () => {
    const response = await axiosInstance.get('/alarms');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await axiosInstance.get(`/alarms/${id}`);
    return response.data;
  },
  
  create: async (data: Omit<AlarmRule, 'id' | 'createdAt'>) => {
    const response = await axiosInstance.post('/alarms', data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<AlarmRule>) => {
    const response = await axiosInstance.put(`/alarms/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/alarms/${id}`);
    return response.data;
  },
  
  processAlarms: async () => {
    const response = await axiosInstance.post('/process-alarms');
    return response.data;
  }
};

export const smtpAPI = {
  getConfig: async () => {
    const response = await axiosInstance.get('/smtp-config');
    return response.data;
  },
  updateConfig: async (data: SMTPConfig) => {
    const response = await axiosInstance.put('/smtp-config', data);
    return response.data;
  },
};

export const backupAPI = {
  backup: async () => {
    const response = await axiosInstance.post('/backup');
    return response.data;
  },
  restore: async (data: any) => {
    const response = await axiosInstance.post('/backup/restore', { data });
    return response.data;
  },
};
