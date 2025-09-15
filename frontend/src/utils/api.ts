import axios from 'axios';
import { LoginRequest, LoginResponse, ApiResponse, User, Agent, Task, CreateTaskRequest } from '../types';

const API_BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },
};

export const agentApi = {
  getAll: async (): Promise<ApiResponse<Agent[]>> => {
    const response = await api.get<ApiResponse<Agent[]>>('/agents');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Agent>> => {
    const response = await api.get<ApiResponse<Agent>>(`/agents/${id}`);
    return response.data;
  },

  create: async (agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Agent>> => {
    const response = await api.post<ApiResponse<Agent>>('/agents', agent);
    return response.data;
  },

  update: async (id: string, agent: Partial<Agent>): Promise<ApiResponse<Agent>> => {
    const response = await api.put<ApiResponse<Agent>>(`/agents/${id}`, agent);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/agents/${id}`);
    return response.data;
  },
};

export const taskApi = {
  getAll: async (): Promise<ApiResponse<Task[]>> => {
    const response = await api.get<ApiResponse<Task[]>>('/tasks');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Task>> => {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data;
  },

  create: async (task: CreateTaskRequest): Promise<ApiResponse<Task>> => {
    const response = await api.post<ApiResponse<Task>>('/tasks', task);
    return response.data;
  },

  update: async (id: string, task: Partial<Task>): Promise<ApiResponse<Task>> => {
    const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, task);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/tasks/${id}`);
    return response.data;
  },

  assign: async (id: string, agentId: string): Promise<ApiResponse<Task>> => {
    const response = await api.post<ApiResponse<Task>>(`/tasks/${id}/assign`, { agentId });
    return response.data;
  },
};

export default api;