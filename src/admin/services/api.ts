import axios from 'axios';
import { isTokenExpired } from './jwtUtils';

export const BASE_URL = 'https://parque-ubajara-api.onrender.com/api/v1';

/** Chaves do localStorage — centralizadas para evitar typos */
export const TOKEN_KEY = 'ubajara_admin_token';
export const USER_KEY = 'ubajara_admin_user';

export const FORBIDDEN_EVENT = 'adm:forbidden';
export const UNAUTHORIZED_EVENT = 'adm:unauthorized';

// Instância Axios configurada para a API do parque
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de request: injeta o token JWT se válido
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de response: trata 401 e 403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    if (status === 401 && !isLoginRequest) {
      // Token expirado ou inválido — emite evento em vez de forçar refresh
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }

    if (status === 403) {
      // Permissão insuficiente — notifica via evento customizado
      window.dispatchEvent(new CustomEvent(FORBIDDEN_EVENT, {
        detail: 'Acesso negado. Você não tem permissão para realizar esta operação.',
      }));
    }

    return Promise.reject(error);
  }
);

export default api;

