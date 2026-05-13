import api from './api';
import type {
  ContactRequest,
  ContactUpdateDTO,
  ContactResponse,
  PageResponse,
} from '../types';

export const contactsService = {
  getAll: async (page = 0, size = 10): Promise<PageResponse<ContactResponse>> => {
    const response = await api.get<PageResponse<ContactResponse>>('/contacts', {
      params: { page, size },
    });
    return response.data;
  },

  getById: async (id: string): Promise<ContactResponse> => {
    const response = await api.get<ContactResponse>(`/contacts/${id}`);
    return response.data;
  },

  create: async (data: ContactRequest): Promise<ContactResponse> => {
    const response = await api.post<ContactResponse>('/contacts', data);
    return response.data;
  },

  update: async (id: string, data: ContactUpdateDTO): Promise<void> => {
    await api.put(`/contacts/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/contacts/${id}`);
  },
};
