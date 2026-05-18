import api from './api';
import type {
  AttractionRequest,
  AttractionUpdateDTO,
  AttractionResponse,
  PageResponse,
  PhotoResponse,
} from '../types';

export const attractionsService = {
  getAll: async (page = 0, size = 10, active?: boolean): Promise<PageResponse<AttractionResponse>> => {
    const response = await api.get<PageResponse<AttractionResponse>>('/attractions', {
      params: { page, size, ...(active !== undefined && { active }) },
    });
    return response.data;
  },

  getById: async (id: string): Promise<AttractionResponse> => {
    const response = await api.get<AttractionResponse>(`/attractions/${id}`);
    return response.data;
  },

  create: async (data: AttractionRequest): Promise<AttractionResponse> => {
    const response = await api.post<AttractionResponse>('/attractions', data);
    return response.data;
  },

  update: async (id: string, data: AttractionUpdateDTO): Promise<void> => {
    await api.put(`/attractions/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/attractions/${id}`);
  },

  uploadPhoto: async (id: string, file: File, description?: string, displayOrder?: string): Promise<PhotoResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    if (displayOrder) formData.append('displayOrder', displayOrder);
    const response = await api.post<PhotoResponse>(`/attractions/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
