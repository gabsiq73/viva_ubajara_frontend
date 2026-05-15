import api from './api';

export interface Testimonial {
  id: string;
  userName: string;
  userPhoto?: string;
  userRole?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface TestimonialRequest {
  rating: number;
  comment: string;
}

export const testimonialsService = {
  list: async (): Promise<Testimonial[]> => {
    const response = await api.get<Testimonial[]>('/testimonials');
    return response.data;
  },

  create: async (data: TestimonialRequest): Promise<Testimonial> => {
    const response = await api.post<Testimonial>('/testimonials', data);
    return response.data;
  },
};
