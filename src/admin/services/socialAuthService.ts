import api from './api';
import type { AuthResponse } from '../types';

export const socialAuthService = {
  loginWithGoogle: async (accessToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/google', { accessToken });
    return response.data;
  },

  loginWithGitHub: async (code: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/github', { code });
    return response.data;
  },
};
