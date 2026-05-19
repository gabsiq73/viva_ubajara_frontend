import api from './api';
import type {
  RecommendedItemRequest,
  RecommendedItemUpdateDTO,
  RecommendedItemResponse,
  PageResponse,
  PhotoResponse,
} from '../types';

export const recommendedItemsService = {
  getAll: async (page = 0, size = 10, active?: boolean, featured?: boolean): Promise<PageResponse<RecommendedItemResponse>> => {
    const response = await api.get<PageResponse<RecommendedItemResponse>>('/recommended-items', {
      params: { page, size, ...(active !== undefined && { active }), ...(featured !== undefined && { featured }) },
    });
    return response.data;
  },

  getById: async (id: string): Promise<RecommendedItemResponse> => {
    const response = await api.get<RecommendedItemResponse>(`/recommended-items/${id}`);
    return response.data;
  },

  create: async (data: RecommendedItemRequest): Promise<RecommendedItemResponse> => {
    const response = await api.post<RecommendedItemResponse>('/recommended-items', data);
    return response.data;
  },

  update: async (id: string, data: RecommendedItemUpdateDTO): Promise<void> => {
    await api.put(`/recommended-items/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/recommended-items/${id}`);
  },

  uploadPhoto: async (id: string, file: File, description?: string, displayOrder?: string): Promise<PhotoResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    if (displayOrder) formData.append('displayOrder', displayOrder);
    const response = await api.post<PhotoResponse>(`/recommended-items/${id}/photos`, formData);
    return response.data;
  },
};
