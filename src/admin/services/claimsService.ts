import api from './api';
import type {
  ClaimStatus,
  EstablishmentClaimAdminResponse,
  EstablishmentClaimRequest,
  EstablishmentClaimResponse,
  PageResponse,
} from '../types';

export const claimsService = {
  create: async (data: EstablishmentClaimRequest): Promise<EstablishmentClaimResponse> => {
    const response = await api.post<EstablishmentClaimResponse>('/companies/me/claims', data);
    return response.data;
  },

  getMine: async (): Promise<EstablishmentClaimResponse[]> => {
    const response = await api.get<EstablishmentClaimResponse[]>('/companies/me/claims');
    return response.data;
  },

  cancel: async (id: string): Promise<void> => {
    await api.post(`/companies/me/claims/${id}/cancel`);
  },

  getAll: async (page = 0, size = 10, status?: ClaimStatus): Promise<PageResponse<EstablishmentClaimAdminResponse>> => {
    const response = await api.get<PageResponse<EstablishmentClaimAdminResponse>>('/establishment-claims', {
      params: { page, size, ...(status ? { status } : {}) },
    });
    return response.data;
  },

  getById: async (id: string): Promise<EstablishmentClaimAdminResponse> => {
    const response = await api.get<EstablishmentClaimAdminResponse>(`/establishment-claims/${id}`);
    return response.data;
  },

  approve: async (id: string): Promise<EstablishmentClaimAdminResponse> => {
    const response = await api.patch<EstablishmentClaimAdminResponse>(`/establishment-claims/${id}/approve`);
    return response.data;
  },

  reject: async (id: string, reason?: string): Promise<EstablishmentClaimAdminResponse> => {
    const response = await api.patch<EstablishmentClaimAdminResponse>(
      `/establishment-claims/${id}/reject`,
      reason ? { reason } : undefined,
    );
    return response.data;
  },
};
