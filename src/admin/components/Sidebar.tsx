import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Mountain,
  MapPin,
  Calendar,
  Utensils,
  Hotel,
  Compass,
  Phone,
  Image,
  LogOut,
  Leaf
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, section: 'Geral' },
  { to: '/admin/attractions', label: 'Atrações', icon: <Mountain size={18} />, section: 'Conteúdo' },
  { to: '/admin/tourist-spots', label: 'Pontos Turísticos', icon: <MapPin size={18} />, section: null },
  { to: '/admin/events', label: 'Eventos', icon: <Calendar size={18} />, section: null },
  { to: '/admin/restaurants', label: 'Restaurantes', icon: <Utensils size={18} />, section: null },
  { to: '/admin/host-points', label: 'Hospedagem', icon: <Hotel size={18} />, section: null },
  { to: '/admin/tour-guides', label: 'Guias Turísticos', icon: <Compass size={18} />, section: null },
  { to: '/admin/contacts', label: 'Contatos', icon: <Phone size={18} />, section: null },
  { to: '/admin/photos', label: 'Fotos', icon: <Image size={18} />, section: 'Mídia' },
];

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="adm-sidebar">
      <div className="adm-sidebar__logo">
        <div className="adm-sidebar__logo-icon">
          <Leaf size={20} fill="currentColor" />
        </div>
        <div>
          <div className="adm-sidebar__logo-text">Parque Ubajara</div>
          <div className="adm-sidebar__logo-sub">Painel Administrativo</div>
        </div>
      </div>

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
          <div style={{ padding: '8px 24px', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
            {user.email}
          </div>
        )}
      </div>
    </aside>
  );
}
