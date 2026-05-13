import React, { createContext, useState, useCallback, useEffect } from 'react';
import { authService } from '../services/authService';
import { TOKEN_KEY, USER_KEY, FORBIDDEN_EVENT } from '../services/api';
import type { AuthResponse, LoginRequest, UserRequest } from '../types';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type AdminRole = 'ADMIN';
type UserRole = 'USER';
type Role = AdminRole | UserRole;

interface StoredUser {
  email: string;
  role: Role;
}

/** Erro lançado quando usuário autenticado não é ADMIN */
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
  logout: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Verifica se a role retornada pela API é de administrador.
 * Lida com String, Array de roles ou Objeto de autoridade do Spring.
 */
function isAdminRole(role: any): boolean {
  if (!role) return false;

  // Caso 1: Array de roles (comum no Spring)
  if (Array.isArray(role)) {
    return role.some((r) => isAdminRole(r));
  }

  // Caso 2: Objeto de autoridade { authority: 'ROLE_...' }
  if (typeof role === 'object' && role.authority) {
    return isAdminRole(role.authority);
  }

  // Caso 3: String simples
  const r = String(role).toUpperCase();
  return r === 'ADMIN' || r === 'ROLE_ADMIN';
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
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<StoredUser | null>(() => {
    const stored = loadUserFromStorage();
    if (stored && !isAdminRole(stored.role)) {
      console.warn('[Auth] Usuário no storage não é ADMIN, limpando...');
      clearStorage();
      return null;
    }
    return stored;
  });
  const [isLoading, setIsLoading] = useState(false);

  // ─── Ação privada: aplica o resultado de autenticação com validação de role ──
  const applyAuthResponse = useCallback((response: AuthResponse) => {
    console.log('[Auth] Validando resposta da API:', {
      email: response.email,
      role: response.role,
      tokenPresent: !!response.token
    });

    if (!isAdminRole(response.role)) {
      console.error('[Auth] Acesso negado: Role insuficiente.', response.role);
      clearStorage();
      throw new UnauthorizedRoleError();
    }

    // Padroniza a role para 'ADMIN' no estado interno
    const userInfo: StoredUser = { 
      email: response.email, 
      role: 'ADMIN' 
    };

    saveToStorage(response.token, userInfo);
    setToken(response.token);
    setUser(userInfo);
    console.log('[Auth] Login realizado com sucesso como ADMIN.');
  }, []);

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    console.log('[Auth] Tentando login para:', data.email);
    try {
      const response = await authService.login(data);
      applyAuthResponse(response);
    } catch (err) {
      console.error('[Auth] Erro na requisição de login:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [applyAuthResponse]);


  // ─── Register (cria conta e loga) ────────────────────────────────────────
  const register = useCallback(async (data: UserRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
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

  // ─── Escuta eventos 403 e 401 do interceptor Axios ───────────────────────
  useEffect(() => {
    const handle403 = (e: Event) => {
      const msg = (e as CustomEvent<string>).detail;
      // Re-emite como evento de toast para o ToastProvider capturar
      window.dispatchEvent(new CustomEvent('adm:toast', {
        detail: { message: msg, type: 'error' },
      }));
    };

    const handle401 = () => {
      console.warn('[Auth] Recebido 401 Unauthorized. Fazendo logout suave...');
      clearStorage();
      setToken(null);
      setUser(null);
    };

    window.addEventListener(FORBIDDEN_EVENT, handle403);
    window.addEventListener('adm:unauthorized', handle401);
    
    return () => {
      window.removeEventListener(FORBIDDEN_EVENT, handle403);
      window.removeEventListener('adm:unauthorized', handle401);
    };
  }, []);

  // ─── Sincronização entre abas ─────────────────────────────────────────────
  useEffect(() => {
    const handler = () => {
      const t = localStorage.getItem(TOKEN_KEY);
      const u = loadUserFromStorage();

      // Se o token sumiu ou o user não é mais ADMIN em outra aba → desloga aqui também
      if (!t || !u || !isAdminRole(u.role)) {
        clearStorage();
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

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && isAdmin, // token sozinho não basta
        isAdmin,
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
