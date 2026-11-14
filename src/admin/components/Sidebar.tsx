import type { RefObject } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Mountain,
  Calendar,
  Utensils,
  Hotel,
  Compass,
  Phone,
  LogOut,
  MessageSquare,
  Star,
  Bookmark,
  Users,
  ChefHat,
  Settings,
  UserCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGuardedNavigate } from '../hooks/useGuardedNavigate';
import { useUnsavedGuard } from '../../company/components/unsavedGuardContext';
import logo from '../../assets/images/logo.webp';

const NAV_ITEMS = [
  { to: '/admin/dashboard',    label: 'Dashboard',          icon: <LayoutDashboard size={18} />, section: 'Geral' },
  { to: '/admin/attractions',  label: 'Atrações',           icon: <Mountain size={18} />,        section: 'Conteúdo' },
  { to: '/admin/events',       label: 'Eventos',            icon: <Calendar size={18} />,        section: null },
  { to: '/admin/restaurants',  label: 'Restaurantes',       icon: <Utensils size={18} />,        section: null },
  { to: '/admin/host-points',  label: 'Hospedagem',         icon: <Hotel size={18} />,           section: null },
  { to: '/admin/claims',       label: 'Reivindicações',     icon: <UserCheck size={18} />,       section: null },
  { to: '/admin/tour-guides',       label: 'Guias Turísticos',   icon: <Compass size={18} />,         section: null },
  { to: '/admin/recommended-items', label: 'Itens Recomendados', icon: <Bookmark size={18} />,        section: null },
  { to: '/admin/contacts',          label: 'Contatos',           icon: <Phone size={18} />,         section: null },
  { to: '/admin/contact-messages', label: 'Mensagens',          icon: <MessageSquare size={18} />, section: 'Visitantes' },
  { to: '/admin/testimonials',     label: 'Depoimentos',        icon: <Star size={18} />,          section: null },
  { to: '/admin/gastronomy-items', label: 'Gastronomia',        icon: <ChefHat size={18} />,       section: 'Configurações' },
  { to: '/admin/pages-config',     label: 'Configurar Páginas', icon: <Settings size={18} />,      section: null },
  { to: '/admin/users',            label: 'Usuários',           icon: <Users size={18} />,         section: 'Sistema' },
];

interface SidebarProps {
  id: string;
  drawerRef: RefObject<HTMLElement | null>;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ id, drawerRef, closeButtonRef, isMobile, isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const { requestLeave } = useUnsavedGuard();
  const guardedNavigate = useGuardedNavigate();

  return (
    <aside
      id={id}
      ref={drawerRef}
      className={`adm-sidebar${isOpen ? ' open' : ''}`}
      inert={isMobile && !isOpen}
      {...(isOpen ? { role: 'dialog', 'aria-modal': true, 'aria-label': 'Menu do painel' } : {})}
    >
      <button ref={closeButtonRef} type="button" className="adm-sidebar__close" aria-label="Fechar menu" onClick={onClose}>
        <X size={20} aria-hidden="true" />
      </button>
      <Link to="/" className="adm-sidebar__logo" onClick={guardedNavigate('/', onClose)} title="Ir para o site público">
        <img src={logo} alt="Parque Nacional de Ubajara" className="adm-sidebar__logo-img" />
        <div className="adm-sidebar__logo-sub">Painel Administrativo</div>
      </Link>

      <nav className="adm-sidebar__nav" aria-label="Navegação do painel">
        {NAV_ITEMS.map((item) => (
          <div key={item.to}>
            {item.section && (
              <div className="adm-sidebar__section">{item.section}</div>
            )}
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `adm-sidebar__link${isActive ? ' active' : ''}`
              }
              onClick={guardedNavigate(item.to, onClose)}
            >
              <span className="icon" aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          </div>
        ))}
      </nav>

      <div className="adm-sidebar__footer">
        <button
          type="button"
          onClick={() => requestLeave(logout)}
          className="adm-sidebar__link"
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <span className="icon" aria-hidden="true"><LogOut size={18} /></span>
          Sair do Sistema
        </button>
        {user && (
          <div style={{ padding: '8px 24px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
            {user.email}
          </div>
        )}
      </div>
    </aside>
  );
}
