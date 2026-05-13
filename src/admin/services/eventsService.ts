import api from './api';
import type {
  EventRequest,
  EventUpdateDTO,
  EventResponse,
  PageResponse,
  PhotoResponse,
} from '../types';

export const eventsService = {
  getAll: async (page = 0, size = 10): Promise<PageResponse<EventResponse>> => {
    const response = await api.get<PageResponse<EventResponse>>('/events', {
      params: { page, size },
    });
    return response.data;
  },

  getById: async (id: string): Promise<EventResponse> => {
    const response = await api.get<EventResponse>(`/events/${id}`);
    return response.data;
  },

  create: async (data: EventRequest): Promise<EventResponse> => {
    const response = await api.post<EventResponse>('/events', data);
    return response.data;
  },

  update: async (id: string, data: EventUpdateDTO): Promise<void> => {
    await api.put(`/events/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },

  uploadPhoto: async (id: string, file: File, description?: string, displayOrder?: string): Promise<PhotoResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    if (displayOrder) formData.append('displayOrder', displayOrder);
    const response = await api.post<PhotoResponse>(`/events/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
