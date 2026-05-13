import api from './api';
import type {
  HostPointRequest,
  HostPointUpdateDTO,
  HostPointResponse,
  HostType,
  PageResponse,
  PhotoResponse,
} from '../types';

export const hostPointsService = {
  getAll: async (page = 0, size = 10, type?: HostType): Promise<PageResponse<HostPointResponse>> => {
    const response = await api.get<PageResponse<HostPointResponse>>('/host-points', {
      params: { page, size, ...(type ? { type } : {}) },
    });
    return response.data;
  },

  getById: async (id: string): Promise<HostPointResponse> => {
    const response = await api.get<HostPointResponse>(`/host-points/${id}`);
    return response.data;
  },

  create: async (data: HostPointRequest): Promise<HostPointResponse> => {
    const response = await api.post<HostPointResponse>('/host-points', data);
    return response.data;
  },

  update: async (id: string, data: HostPointUpdateDTO): Promise<void> => {
    await api.put(`/host-points/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/host-points/${id}`);
  },

  uploadPhoto: async (id: string, file: File, description?: string, displayOrder?: string): Promise<PhotoResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    if (displayOrder) formData.append('displayOrder', displayOrder);
    const response = await api.post<PhotoResponse>(`/host-points/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
