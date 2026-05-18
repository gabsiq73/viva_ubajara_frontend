import api from './api';
import type { TestimonialRequest, TestimonialResponse, TestimonialUpdateDTO, PageResponse } from '../types';

export const testimonialsService = {
  listApproved: async (): Promise<TestimonialResponse[]> => {
    const response = await api.get<PageResponse<TestimonialResponse>>('/testimonials', {
      params: { approved: true, size: 50 },
    });
    return response.data.content;
  },

  create: async (data: TestimonialRequest): Promise<TestimonialResponse> => {
    const response = await api.post<TestimonialResponse>('/testimonials', data);
    return response.data;
  },

  getAll: async (page = 0, size = 10, approved?: boolean): Promise<PageResponse<TestimonialResponse>> => {
    const response = await api.get<PageResponse<TestimonialResponse>>('/testimonials', {
      params: { page, size, ...(approved !== undefined ? { approved } : {}) },
    });
    return response.data;
  },

  update: async (id: string, data: TestimonialUpdateDTO): Promise<void> => {
    await api.patch(`/testimonials/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/testimonials/${id}`);
  },
};
