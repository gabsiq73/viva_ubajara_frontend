import api from './api';
import type { PhotoResponse } from '../types';

export const photosService = {
  /**
   * Upload direto de foto para o S3 via endpoint /photos.
   * Aceita JPEG, PNG e WEBP, máximo 5MB.
   */
  upload: async (file: File, description?: string, displayOrder?: string): Promise<PhotoResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    if (displayOrder) formData.append('displayOrder', displayOrder);
    const response = await api.post<PhotoResponse>('/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  uploadForEntity: async (entityPath: string, entityId: string, file: File): Promise<PhotoResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<PhotoResponse>(`/${entityPath}/${entityId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/photos/${id}`);
  },
};
