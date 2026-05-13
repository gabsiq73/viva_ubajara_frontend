import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ReactNode } from 'react';

interface PrivateRouteProps {
  children: ReactNode;
}

/**
 * Protege rotas admin.
 * Exige simultaneamente:
 *  1. usuário autenticado (token válido)
 *  2. role ADMIN
 *
 * Qualquer falha redireciona para /admin/login.
 */
export function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, isAdmin, user, token } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !isAdmin) {
    console.warn('[PrivateRoute] Acesso negado! Bloqueando entrada e enviando para o Login.', {
      isAuthenticated,
      isAdmin,
      roleLocal: user?.role,
      hasToken: !!token,
      path: location.pathname
    });
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
