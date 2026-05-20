import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Mountain,
  MapPin,
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
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import logo from '../../assets/images/logo.webp';

const NAV_ITEMS = [
  { to: '/admin/dashboard',    label: 'Dashboard',          icon: <LayoutDashboard size={18} />, section: 'Geral' },
  { to: '/admin/attractions',  label: 'Atrações',           icon: <Mountain size={18} />,        section: 'Conteúdo' },
  { to: '/admin/tourist-spots',label: 'Pontos Turísticos',  icon: <MapPin size={18} />,          section: null },
  { to: '/admin/events',       label: 'Eventos',            icon: <Calendar size={18} />,        section: null },
  { to: '/admin/restaurants',  label: 'Restaurantes',       icon: <Utensils size={18} />,        section: null },
  { to: '/admin/host-points',  label: 'Hospedagem',         icon: <Hotel size={18} />,           section: null },
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
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <aside className={`adm-sidebar${isOpen ? ' open' : ''}`}>
      <Link to="/" className="adm-sidebar__logo" onClick={onClose} title="Ir para o site público">
        <img src={logo} alt="Parque Nacional de Ubajara" className="adm-sidebar__logo-img" />
        <div className="adm-sidebar__logo-sub">Painel Administrativo</div>
      </Link>

      <nav className="adm-sidebar__nav">
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
              onClick={onClose}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </NavLink>
          </div>
        ))}
      </nav>

      <div className="adm-sidebar__footer">
        <button
          onClick={logout}
          className="adm-sidebar__link"
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <span className="icon"><LogOut size={18} /></span>
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
