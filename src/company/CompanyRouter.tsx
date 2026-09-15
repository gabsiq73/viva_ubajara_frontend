import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '../admin/components/Toast';
import { CompanyRoute } from './components/CompanyRoute';
import { CompanyLayout } from './layouts/CompanyLayout';
import { EstablishmentPage } from './pages/EstablishmentPage';

/**
 * CompanyRouter — área self-service da empresa (role EMPRESA).
 * AuthProvider vive em App.tsx (nível raiz).
 */
export function CompanyRouter() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<CompanyRoute><CompanyLayout /></CompanyRoute>}>
          <Route index element={<Navigate to="estabelecimento" replace />} />
          <Route path="estabelecimento" element={<EstablishmentPage />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}
