import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { useAuth } from '../hooks/useAuth';
import { usersService } from '../services/usersService';

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/attractions': 'Atrações',
  '/admin/tourist-spots': 'Pontos Turísticos',
  '/admin/events': 'Eventos',
  '/admin/restaurants': 'Restaurantes',
  '/admin/host-points': 'Hospedagem',
  '/admin/tour-guides': 'Guias Turísticos',
  '/admin/contacts': 'Contatos',
  '/admin/contact-messages': 'Mensagens',
  '/admin/testimonials': 'Depoimentos',
  '/admin/photos': 'Fotos',
  '/admin/recommended-items': 'Itens Recomendados',
  '/admin/users': 'Usuários',
};

export function AdminLayout() {
  const { pathname } = useLocation();
  const base = '/' + pathname.split('/').slice(1, 3).join('/');
  const title = PAGE_TITLES[base] ?? 'Admin';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, updateUserPhoto } = useAuth();

  useEffect(() => {
    if (!user?.photo) {
      usersService.getMe().then((data) => {
        if (data.photoUrl) updateUserPhoto(data.photoUrl);
      }).catch(() => {});
    }
  }, []);

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
