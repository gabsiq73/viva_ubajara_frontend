import api from './api';
import type {
  TouristSpotRequest,
  TouristSpotUpdateDTO,
  TouristSpotResponse,
  PageResponse,
  PhotoResponse,
} from '../types';

export const touristSpotsService = {
  getAll: async (page = 0, size = 10): Promise<PageResponse<TouristSpotResponse>> => {
    const response = await api.get<PageResponse<TouristSpotResponse>>('/tourist-spots', {
      params: { page, size },
    });
    return response.data;
  },

  getById: async (id: string): Promise<TouristSpotResponse> => {
    const response = await api.get<TouristSpotResponse>(`/tourist-spots/${id}`);
    return response.data;
  },

  create: async (data: TouristSpotRequest): Promise<TouristSpotResponse> => {
    const response = await api.post<TouristSpotResponse>('/tourist-spots', data);
    return response.data;
  },

  update: async (id: string, data: TouristSpotUpdateDTO): Promise<void> => {
    await api.put(`/tourist-spots/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tourist-spots/${id}`);
  },

  uploadPhoto: async (id: string, file: File, description?: string, displayOrder?: string): Promise<PhotoResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    if (displayOrder) formData.append('displayOrder', displayOrder);
    const response = await api.post<PhotoResponse>(`/tourist-spots/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
