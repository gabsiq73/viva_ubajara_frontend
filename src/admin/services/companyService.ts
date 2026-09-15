import axios from 'axios';
import api from './api';
import type {
  CompanyEstablishmentRequest,
  CompanyEstablishmentUpdate,
  CompanyEstablishmentResponse,
} from '../types';

export const companyService = {
  getMyEstablishment: async (): Promise<CompanyEstablishmentResponse | null> => {
    try {
      const response = await api.get<CompanyEstablishmentResponse>('/companies/me/establishment');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return null;
      throw error;
    }
  },

  createEstablishment: async (data: CompanyEstablishmentRequest): Promise<CompanyEstablishmentResponse> => {
    const response = await api.post<CompanyEstablishmentResponse>('/companies/me/establishment', data);
    return response.data;
  },

  updateEstablishment: async (data: CompanyEstablishmentUpdate): Promise<CompanyEstablishmentResponse> => {
    const response = await api.put<CompanyEstablishmentResponse>('/companies/me/establishment', data);
    return response.data;
  },
};
