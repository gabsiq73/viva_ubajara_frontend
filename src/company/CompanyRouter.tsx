import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PageLoading } from '../pages/PageState';
import { ToastProvider } from '../admin/components/Toast';
import { CompanyRoute } from './components/CompanyRoute';
import { CompanyLayout } from './layouts/CompanyLayout';

const EstablishmentPage = lazy(() => import('./pages/EstablishmentPage').then((m) => ({ default: m.EstablishmentPage })));
const MenuItemsPage = lazy(() => import('./pages/MenuItemsPage').then((m) => ({ default: m.MenuItemsPage })));

/**
 * CompanyRouter — área self-service da empresa (role EMPRESA).
 * AuthProvider vive em App.tsx (nível raiz).
 */
export function CompanyRouter() {
  return (
    <ToastProvider>
      <Suspense fallback={<PageLoading fullPage />}>
        <Routes>
          <Route element={<CompanyRoute><CompanyLayout /></CompanyRoute>}>
            <Route index element={<Navigate to="estabelecimento" replace />} />
            <Route path="estabelecimento" element={<EstablishmentPage />} />
            <Route path="cardapio" element={<MenuItemsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </ToastProvider>
  );
}
