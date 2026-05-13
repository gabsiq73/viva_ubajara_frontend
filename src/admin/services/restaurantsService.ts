import api from './api';
import type {
  RestaurantRequest,
  RestaurantUpdateDTO,
  RestaurantResponse,
  PageResponse,
  PhotoResponse,
} from '../types';

export const restaurantsService = {
  getAll: async (page = 0, size = 10): Promise<PageResponse<RestaurantResponse>> => {
    const response = await api.get<PageResponse<RestaurantResponse>>('/restaurants', {
      params: { page, size },
    });
    return response.data;
  },

  getById: async (id: string): Promise<RestaurantResponse> => {
    const response = await api.get<RestaurantResponse>(`/restaurants/${id}`);
    return response.data;
  },

  create: async (data: RestaurantRequest): Promise<RestaurantResponse> => {
    const response = await api.post<RestaurantResponse>('/restaurants', data);
    return response.data;
  },

  update: async (id: string, data: RestaurantUpdateDTO): Promise<void> => {
    await api.put(`/restaurants/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/restaurants/${id}`);
  },

  uploadPhoto: async (id: string, file: File, description?: string, displayOrder?: string): Promise<PhotoResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    if (displayOrder) formData.append('displayOrder', displayOrder);
    const response = await api.post<PhotoResponse>(`/restaurants/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
