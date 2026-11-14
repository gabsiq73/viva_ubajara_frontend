import api from './api';
import type {
  LoginRequest,
  UserRequest,
  CompanyRegisterRequest,
  CompanyActivationRequest,
  AuthResponse,
} from '../types';

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: UserRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  registerCompany: async (data: CompanyRegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register-company', data);
    return response.data;
  },

  activateCompany: async (data: CompanyActivationRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/activate-company', data);
    return response.data;
  },
};
