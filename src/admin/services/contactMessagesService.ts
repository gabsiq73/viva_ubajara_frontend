import api from './api';
import type { ContactMessageRequest, ContactMessageResponse, PageResponse } from '../types';

export const contactMessagesService = {
  create: async (data: ContactMessageRequest): Promise<ContactMessageResponse> => {
    const response = await api.post<ContactMessageResponse>('/contact-messages', data);
    return response.data;
  },

  getAll: async (page = 0, size = 10, read?: boolean): Promise<PageResponse<ContactMessageResponse>> => {
    const response = await api.get<PageResponse<ContactMessageResponse>>('/contact-messages', {
      params: { page, size, ...(read !== undefined ? { read } : {}) },
    });
    return response.data;
  },

  getById: async (id: string): Promise<ContactMessageResponse> => {
    const response = await api.get<ContactMessageResponse>(`/contact-messages/${id}`);
    return response.data;
  },

  countUnread: async (): Promise<number> => {
    const response = await api.get<{ count: number }>('/contact-messages/unread-count');
    return response.data.count;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/contact-messages/${id}/read`);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/contact-messages/${id}`);
  },
};
