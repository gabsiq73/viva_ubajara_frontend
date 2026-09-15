import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../admin/hooks/useAuth';
import type { ReactNode } from 'react';

interface CompanyRouteProps {
  children: ReactNode;
}

/**
 * Protege rotas da área da empresa.
 * - Não autenticado → /admin/login (empresa loga pela tela de login existente por enquanto)
 * - Autenticado mas sem role EMPRESA → /dashboard
 * - EMPRESA → renderiza normalmente
 */
export function CompanyRoute({ children }: CompanyRouteProps) {
  const { isAuthenticated, isCompany, roleSynced } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!roleSynced) {
    return null;
  }

  if (!isCompany) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
