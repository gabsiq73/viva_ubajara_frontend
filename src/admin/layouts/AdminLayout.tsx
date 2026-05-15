import { useState } from 'react';
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

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`adm-root${sidebarOpen ? ' sidebar-open' : ''}`}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar title={title} onMenuToggle={() => setSidebarOpen((v) => !v)} />
      <main className="adm-main" onClick={() => sidebarOpen && setSidebarOpen(false)}>
        <Outlet />
      </main>
    </div>
  );
}
