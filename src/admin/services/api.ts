import axios from 'axios';

const BASE_URL = 'https://parque-ubajara-api.onrender.com/api/v1';
const TOKEN_KEY = 'ubajara_admin_token';

// Instância Axios configurada para a API do parque
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de request: injeta o token JWT automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de response: trata 401 (token expirado/inválido)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      // Redireciona para login sem recarregar a página
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export { TOKEN_KEY };
export default api;
