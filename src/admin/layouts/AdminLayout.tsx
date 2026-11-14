import { useRef, useState, type RefObject } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { UnsavedGuardProvider } from '../../company/components/UnsavedGuardProvider';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useModalBehavior } from '../../hooks/useModalBehavior';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/attractions': 'Atrações',
  '/admin/tourist-spots': 'Pontos Turísticos',
  '/admin/events': 'Eventos',
  '/admin/restaurants': 'Restaurantes',
  '/admin/host-points': 'Hospedagem',
  '/admin/claims': 'Reivindicações',
  '/admin/tour-guides': 'Guias Turísticos',
  '/admin/contacts': 'Contatos',
  '/admin/contact-messages': 'Mensagens',
  '/admin/testimonials': 'Depoimentos',
  '/admin/photos': 'Fotos',
  '/admin/recommended-items': 'Itens Recomendados',
  '/admin/users': 'Usuários',
  '/admin/gastronomy-items': 'Gastronomia',
  '/admin/pages-config': 'Configurar Páginas',
};

interface DrawerBehaviorProps {
  panelRef: RefObject<HTMLElement | null>;
  initialFocusRef: RefObject<HTMLElement | null>;
  returnFocusRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}

function DrawerBehavior({ panelRef, initialFocusRef, returnFocusRef, onClose }: DrawerBehaviorProps) {
  useModalBehavior({ panelRef, onClose, initialFocusRef, returnFocusRef });
  return null;
}

function AdminShell() {
  const { pathname } = useLocation();
  const base = '/' + pathname.split('/').slice(1, 3).join('/');
  const title = PAGE_TITLES[base] ?? 'Admin';

  const isMobile = useMediaQuery('(max-width: 768px)');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastContext, setLastContext] = useState({ isMobile, path: pathname });
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  if (lastContext.isMobile !== isMobile || lastContext.path !== pathname) {
    setLastContext({ isMobile, path: pathname });
    setSidebarOpen(false);
  }

  const drawerOpen = isMobile && sidebarOpen;
  const closeDrawer = () => setSidebarOpen(false);

  return (
    <div className="adm-root">
      {drawerOpen && (
        <>
          <div className="adm-sidebar-overlay" onClick={closeDrawer} aria-hidden="true" />
          <DrawerBehavior panelRef={drawerRef} initialFocusRef={closeButtonRef} returnFocusRef={menuButtonRef} onClose={closeDrawer} />
        </>
      )}
      <Sidebar
        id="adm-sidebar"
        drawerRef={drawerRef}
        closeButtonRef={closeButtonRef}
        isMobile={isMobile}
        isOpen={drawerOpen}
        onClose={closeDrawer}
      />
      <TopBar
        title={title}
        menuButtonRef={menuButtonRef}
        menuOpen={drawerOpen}
        menuControlsId="adm-sidebar"
        onMenuToggle={() => setSidebarOpen((v) => !v)}
      />
      <main className="adm-main">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminLayout() {
  return (
    <UnsavedGuardProvider>
      <AdminShell />
    </UnsavedGuardProvider>
  );
}
