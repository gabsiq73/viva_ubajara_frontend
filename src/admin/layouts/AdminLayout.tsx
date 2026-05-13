import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/attractions': 'Atrações',
  '/admin/tourist-spots': 'Pontos Turísticos',
  '/admin/events': 'Eventos',
  '/admin/restaurants': 'Restaurantes',
  '/admin/host-points': 'Hospedagem',
  '/admin/tour-guides': 'Guias Turísticos',
  '/admin/contacts': 'Contatos',
  '/admin/photos': 'Fotos',
};

export function AdminLayout() {
  const { pathname } = useLocation();
  const base = '/' + pathname.split('/').slice(1, 3).join('/');
  const title = PAGE_TITLES[base] ?? 'Admin';

  return (
    <div className="adm-root">
      <Sidebar />
      <TopBar title={title} />
      <main className="adm-main">
        <Outlet />
      </main>
    </div>
  );
}
