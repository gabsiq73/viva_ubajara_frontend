import React, { createContext, useState, useCallback, useEffect } from 'react';
import { authService } from '../services/authService';
import { TOKEN_KEY } from '../services/api';
import type { AuthResponse, LoginRequest, UserRequest } from '../types';

interface AuthContextData {
  token: string | null;
  user: Pick<AuthResponse, 'email' | 'role'> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: UserRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<Pick<AuthResponse, 'email' | 'role'> | null>(() => {
    const saved = localStorage.getItem('ubajara_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      localStorage.setItem(TOKEN_KEY, response.token);
      const userInfo = { email: response.email, role: response.role };
      localStorage.setItem('ubajara_admin_user', JSON.stringify(userInfo));
      setToken(response.token);
      setUser(userInfo);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: UserRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      localStorage.setItem(TOKEN_KEY, response.token);
      const userInfo = { email: response.email, role: response.role };
      localStorage.setItem('ubajara_admin_user', JSON.stringify(userInfo));
      setToken(response.token);
      setUser(userInfo);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('ubajara_admin_user');
    setToken(null);
    setUser(null);
  }, []);

  // Sincroniza o estado se o localStorage mudar externamente (outra aba)
  useEffect(() => {
    const handler = () => {
      const t = localStorage.getItem(TOKEN_KEY);
      setToken(t);
      if (!t) setUser(null);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
