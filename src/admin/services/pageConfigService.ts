import api from './api';

export interface PageConfigData {
  imageUrl?: string;
  description?: string;
}

export const pageConfigService = {
  getConfig: async (pageKey: string): Promise<PageConfigData> => {
    try {
      const response = await api.get<PageConfigData>(`/page-configs/${pageKey}`);
      return response.data ?? {};
    } catch {
      return {};
    }
  },

  getImageUrl: async (pageKey: string): Promise<string | null> => {
    try {
      const response = await api.get<PageConfigData>(`/page-configs/${pageKey}`);
      return response.data.imageUrl ?? null;
    } catch {
      return null;
    }
  },

  updateDescription: async (pageKey: string, description: string): Promise<void> => {
    await api.put(`/page-configs/${pageKey}/description`, { description });
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
