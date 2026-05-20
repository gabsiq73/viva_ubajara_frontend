import api from './api';
import type { UserResponse, UserProfileUpdateRequest, UserAdminUpdateRequest, PageResponse } from '../types';

export const usersService = {
  getAll: async (page = 0, size = 10, username?: string, role?: string): Promise<PageResponse<UserResponse>> => {
    const response = await api.get<PageResponse<UserResponse>>('/users', {
      params: { page, size, username: username || undefined, role: role || undefined },
    });
    return response.data;
  },

  getMe: async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>('/users/me');
    return response.data;
  },

  updateMe: async (data: UserProfileUpdateRequest): Promise<void> => {
    await api.patch('/users/me', data);
  },

  update: async (id: string, data: UserAdminUpdateRequest): Promise<void> => {
    await api.patch(`/users/${id}`, data);
  },

  changeRole: async (id: string, role: string): Promise<void> => {
    await api.patch(`/users/${id}/role`, { role });
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  uploadPhoto: async (file: File): Promise<{ photoUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ photoUrl: string }>('/users/me/photo', formData);
    return response.data;
  },
};
