import api from './api';
import type {
  TourGuideRequest,
  TourGuideUpdateDTO,
  TourGuideResponse,
  PageResponse,
  PhotoResponse,
} from '../types';

export const tourGuidesService = {
  getAll: async (page = 0, size = 10, active?: boolean): Promise<PageResponse<TourGuideResponse>> => {
    const response = await api.get<PageResponse<TourGuideResponse>>('/tour-guides', {
      params: { page, size, ...(active !== undefined && { active }) },
    });
    return response.data;
  },

  getById: async (id: string): Promise<TourGuideResponse> => {
    const response = await api.get<TourGuideResponse>(`/tour-guides/${id}`);
    return response.data;
  },

  create: async (data: TourGuideRequest): Promise<TourGuideResponse> => {
    const response = await api.post<TourGuideResponse>('/tour-guides', data);
    return response.data;
  },

  update: async (id: string, data: TourGuideUpdateDTO): Promise<void> => {
    await api.put(`/tour-guides/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tour-guides/${id}`);
  },

  uploadPhoto: async (id: string, file: File, description?: string, displayOrder?: string): Promise<PhotoResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    if (displayOrder) formData.append('displayOrder', displayOrder);
    const response = await api.post<PhotoResponse>(`/tour-guides/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
