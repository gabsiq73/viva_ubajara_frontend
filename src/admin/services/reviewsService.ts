import api from './api';
import type {
  ApprovalStatus,
  PageResponse,
  ReviewAdminResponse,
  ReviewRequest,
  ReviewResponse,
  ReviewSummary,
} from '../types';

export const reviewsService = {
  listBySpot: async (spotId: string, page = 0, size = 5): Promise<PageResponse<ReviewResponse>> => {
    const response = await api.get<PageResponse<ReviewResponse>>(`/tourist-spots/${spotId}/reviews`, {
      params: { page, size },
    });
    return response.data;
  },

  summary: async (spotId: string): Promise<ReviewSummary> => {
    const response = await api.get<ReviewSummary>(`/tourist-spots/${spotId}/reviews/summary`);
    return response.data;
  },

  mine: async (spotId: string): Promise<ReviewResponse | null> => {
    const response = await api.get<ReviewResponse | ''>('/reviews/mine', { params: { spotId } });
    return response.status === 204 || !response.data ? null : response.data;
  },

  save: async (spotId: string, data: ReviewRequest): Promise<ReviewResponse> => {
    const response = await api.put<ReviewResponse>(`/reviews/spots/${spotId}`, data);
    return response.data;
  },

  listForModeration: async (page = 0, size = 10, status?: ApprovalStatus): Promise<PageResponse<ReviewAdminResponse>> => {
    const response = await api.get<PageResponse<ReviewAdminResponse>>('/reviews/moderation', {
      params: { page, size, ...(status ? { status } : {}) },
    });
    return response.data;
  },

  updateApproval: async (id: string, status: ApprovalStatus): Promise<void> => {
    await api.patch(`/reviews/${id}/approval`, { status });
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/reviews/${id}`);
  },
};
