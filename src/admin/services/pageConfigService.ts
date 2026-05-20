import api from './api';

export const pageConfigService = {
  getImageUrl: async (pageKey: string): Promise<string | null> => {
    try {
      const response = await api.get<{ imageUrl: string }>(`/page-configs/${pageKey}`);
      return response.data.imageUrl;
    } catch {
      return null;
    }
  },

  uploadImage: async (pageKey: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ imageUrl: string }>(`/page-configs/${pageKey}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.imageUrl;
  },

  removeImage: async (pageKey: string): Promise<void> => {
    await api.delete(`/page-configs/${pageKey}/image`);
  },
};
