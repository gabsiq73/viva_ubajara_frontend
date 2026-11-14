import axios from 'axios';
import api from './api';
import type { PhotoResponse } from '../types';
import type {
  CompanyEstablishmentRequest,
  CompanyEstablishmentUpdate,
  CompanyEstablishmentResponse,
  GastronomyItemRequest,
  GastronomyItemUpdateDTO,
  GastronomyItemResponse,
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

  uploadMyEstablishmentPhoto: async (file: File, displayOrder: number): Promise<PhotoResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('displayOrder', String(displayOrder));
    const response = await api.post<PhotoResponse>('/companies/me/establishment/photos', formData);
    return response.data;
  },

  getMenuItems: async (): Promise<GastronomyItemResponse[]> => {
    const response = await api.get<GastronomyItemResponse[]>('/companies/me/menu-items');
    return response.data;
  },

  createMenuItem: async (data: GastronomyItemRequest): Promise<GastronomyItemResponse> => {
    const response = await api.post<GastronomyItemResponse>('/companies/me/menu-items', data);
    return response.data;
  },

  updateMenuItem: async (id: string, data: GastronomyItemUpdateDTO): Promise<void> => {
    await api.put(`/companies/me/menu-items/${id}`, data);
  },

  deleteMenuItem: async (id: string): Promise<void> => {
    await api.delete(`/companies/me/menu-items/${id}`);
  },
};
