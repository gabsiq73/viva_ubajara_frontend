import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ReactNode } from 'react';

interface PrivateRouteProps {
  children: ReactNode;
}

/**
 * Protege rotas do painel admin.
 * - Não autenticado → /admin/login
 * - Autenticado mas sem role ADMIN → /dashboard
 * - ADMIN → renderiza normalmente
 */
export function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, isAdmin, roleSynced } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!roleSynced) {
    return null;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
