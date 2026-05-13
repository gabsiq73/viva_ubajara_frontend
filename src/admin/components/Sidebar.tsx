import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊', section: 'Geral' },
  { to: '/admin/attractions', label: 'Atrações', icon: '🏞️', section: 'Conteúdo' },
  { to: '/admin/tourist-spots', label: 'Pontos Turísticos', icon: '📍', section: null },
  { to: '/admin/events', label: 'Eventos', icon: '🎉', section: null },
  { to: '/admin/restaurants', label: 'Restaurantes', icon: '🍽️', section: null },
  { to: '/admin/host-points', label: 'Hospedagem', icon: '🏨', section: null },
  { to: '/admin/tour-guides', label: 'Guias Turísticos', icon: '🧭', section: null },
  { to: '/admin/contacts', label: 'Contatos', icon: '📞', section: null },
  { to: '/admin/photos', label: 'Fotos', icon: '📸', section: 'Mídia' },
];

export function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="adm-sidebar">
      <div className="adm-sidebar__logo">
        <div className="adm-sidebar__logo-icon">🌿</div>
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

      {user && (
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--adm-border)', fontSize: '12px', color: 'var(--adm-text-muted)' }}>
          <div>{user.email}</div>
          <div style={{ color: 'var(--adm-green-light)', fontWeight: 600, marginTop: 2 }}>{user.role}</div>
        </div>
      )}
    </aside>
  );
}
