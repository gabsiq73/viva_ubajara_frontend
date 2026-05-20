import api from './api';
import type { GastronomyItemRequest, GastronomyItemUpdateDTO, GastronomyItemResponse } from '../types';

export const gastronomyItemsService = {
  getAll: async (): Promise<GastronomyItemResponse[]> => {
    const response = await api.get<GastronomyItemResponse[]>('/gastronomy-items/all');
    return response.data;
  },

  getActive: async (): Promise<GastronomyItemResponse[]> => {
    const response = await api.get<GastronomyItemResponse[]>('/gastronomy-items');
    return response.data;
  },

  create: async (data: GastronomyItemRequest): Promise<GastronomyItemResponse> => {
    const response = await api.post<GastronomyItemResponse>('/gastronomy-items', data);
    return response.data;
  },

  update: async (id: string, data: GastronomyItemUpdateDTO): Promise<void> => {
    await api.put(`/gastronomy-items/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/gastronomy-items/${id}`);
  },

  uploadImage: async (id: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ imageUrl: string }>(`/gastronomy-items/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.imageUrl;
  },

  removeImage: async (id: string): Promise<void> => {
    await api.delete(`/gastronomy-items/${id}/image`);
  },
};
