import React, { createContext, useState, useCallback, useEffect } from 'react';
import { authService } from '../services/authService';
import { socialAuthService } from '../services/socialAuthService';
import { TOKEN_KEY, USER_KEY, FORBIDDEN_EVENT, UNAUTHORIZED_EVENT } from '../services/api';
import { isTokenExpired, secondsUntilExpiry } from '../services/jwtUtils';
import type { AuthResponse, LoginRequest, UserRequest } from '../types';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Role = 'ADMIN' | 'USER' | 'GUIDE';

interface StoredUser {
  email: string;
  role: Role;
  name?: string;
  photo?: string;
}

/** Mantido para compatibilidade — não é mais lançado internamente */
export class UnauthorizedRoleError extends Error {
  constructor() {
    super('Acesso restrito a administradores.');
    this.name = 'UnauthorizedRoleError';
  }
}

interface AuthContextData {
  token: string | null;
  user: StoredUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: UserRequest) => Promise<void>;
  loginWithGoogle: (accessToken: string) => Promise<void>;
  loginWithGitHub: (code: string) => Promise<void>;
  logout: () => void;
  applyAuthResponse: (response: AuthResponse) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isAdminRole(role: unknown): boolean {
  if (!role) return false;
  if (Array.isArray(role)) return role.some((r) => isAdminRole(r));
  if (typeof role === 'object' && role.authority) return isAdminRole(role.authority);
  const r = String(role).toUpperCase();
  return r === 'ADMIN' || r === 'ROLE_ADMIN' || r === 'ROOT' || r === 'ROLE_ROOT' || r.includes('ADMIN');
}

function clearStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function saveToStorage(token: string, user: StoredUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function loadUserFromStorage(): StoredUser | null {
  try {
    const saved = localStorage.getItem(USER_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as StoredUser;
    if (!parsed.email || !parsed.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (isTokenExpired(t)) { clearStorage(); return null; }
    return t;
  });
  const [user, setUser] = useState<StoredUser | null>(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (isTokenExpired(t)) return null;
    return loadUserFromStorage();
  });
  const [isLoading, setIsLoading] = useState(false);

  // ─── Aplica a resposta da API (aceita qualquer role) ──────────────────────
  const applyAuthResponse = useCallback((response: AuthResponse) => {
    const r = String(response.role ?? '').toUpperCase();
    const resolvedRole: Role = isAdminRole(response.role) ? 'ADMIN' : r === 'GUIDE' ? 'GUIDE' : 'USER';
    const userInfo: StoredUser = {
      email: response.email,
      role: resolvedRole,
      name: response.name,
      photo: response.photo,
    };
    saveToStorage(response.token, userInfo);
    setToken(response.token);
    setUser(userInfo);
  }, []);

  // ─── Login com email/senha ────────────────────────────────────────────────
  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      applyAuthResponse(response);
    } finally {
      setIsLoading(false);
    }
  }, [applyAuthResponse]);

  // ─── Registro ────────────────────────────────────────────────────────────
  const register = useCallback(async (data: UserRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      applyAuthResponse(response);
    } finally {
      setIsLoading(false);
    }
  }, [applyAuthResponse]);

  // ─── Login com Google ─────────────────────────────────────────────────────
  const loginWithGoogle = useCallback(async (accessToken: string) => {
    setIsLoading(true);
    try {
      const response = await socialAuthService.loginWithGoogle(accessToken);
      applyAuthResponse(response);
    } finally {
      setIsLoading(false);
    }
  }, [applyAuthResponse]);

  // ─── Login com GitHub ─────────────────────────────────────────────────────
  const loginWithGitHub = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const response = await socialAuthService.loginWithGitHub(code);
      applyAuthResponse(response);
    } finally {
      setIsLoading(false);
    }
  }, [applyAuthResponse]);

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearStorage();
    setToken(null);
    setUser(null);
  }, []);

  // ─── Intercepta 401 e 403 do Axios ───────────────────────────────────────
  useEffect(() => {
    const handle403 = (e: Event) => {
      const msg = (e as CustomEvent<string>).detail;
      window.dispatchEvent(new CustomEvent('adm:toast', {
        detail: { message: msg, type: 'error' },
      }));
    };

    const handle401 = () => {
      clearStorage();
      setToken(null);
      setUser(null);
    };

    window.addEventListener(FORBIDDEN_EVENT, handle403);
    window.addEventListener(UNAUTHORIZED_EVENT, handle401);

    return () => {
      window.removeEventListener(FORBIDDEN_EVENT, handle403);
      window.removeEventListener(UNAUTHORIZED_EVENT, handle401);
    };
  }, []);

  // ─── Auto-logout quando o JWT expirar ────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    const secs = secondsUntilExpiry(token);
    if (secs <= 0) { logout(); return; }
    const timer = setTimeout(() => {
      clearStorage();
      setToken(null);
      setUser(null);
    }, secs * 1000);
    return () => clearTimeout(timer);
  }, [token, logout]);

  // ─── Sincronização entre abas ─────────────────────────────────────────────
  useEffect(() => {
    const handler = () => {
      const t = localStorage.getItem(TOKEN_KEY);
      const u = loadUserFromStorage();
      if (!t || !u) {
        setToken(null);
        setUser(null);
      } else {
        setToken(t);
        setUser(u);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const isAdmin = !!user && isAdminRole(user.role);
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        loginWithGoogle,
        loginWithGitHub,
        logout,
        applyAuthResponse,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
