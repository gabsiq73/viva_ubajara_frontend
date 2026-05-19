import api from './api';
import type { PhotoResponse } from '../types';

export const photosService = {
  upload: async (file: File, description?: string, displayOrder?: string): Promise<PhotoResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    if (displayOrder) formData.append('displayOrder', displayOrder);
    const response = await api.post<PhotoResponse>('/photos', formData);
    return response.data;
  },

  uploadForEntity: async (entityPath: string, entityId: string, file: File, description?: string, displayOrder?: number): Promise<PhotoResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    if (displayOrder !== undefined) formData.append('displayOrder', String(displayOrder));
    const response = await api.post<PhotoResponse>(`/${entityPath}/${entityId}/photos`, formData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/photos/${id}`);
  },
};
