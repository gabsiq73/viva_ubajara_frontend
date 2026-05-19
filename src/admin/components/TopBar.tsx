import { useNavigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface TopBarProps {
  title: string;
  onMenuToggle?: () => void;
}

export function TopBar({ title, onMenuToggle }: TopBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : (user?.email ? user.email.split('@')[0].slice(0, 2).toUpperCase() : '?');

  return (
    <header className="adm-topbar">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button
          className="adm-topbar__menu-btn"
          onClick={onMenuToggle}
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="adm-topbar__title">{title}</h1>
      </div>

      <div className="adm-topbar__right">
        {user && (
          <button
            className="adm-topbar__user"
            onClick={() => navigate('/admin/profile')}
            title="Ver meu perfil"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div className="adm-topbar__user-info">
              <strong>{user.name || user.email}</strong>
              <span>{user.role === 'ADMIN' ? 'Administrador' : user.role === 'GUIDE' ? 'Guia' : 'Usuário'}</span>
            </div>
            <div
              className="adm-topbar__avatar"
              title="Meu perfil"
              style={{ overflow: 'hidden' }}
            >
              {user.photo
                ? <img src={user.photo} alt="Foto de perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials
              }
            </div>
          </button>
        )}
        <button
          className="adm-btn adm-btn--ghost adm-btn--sm"
          onClick={handleLogout}
          title="Sair do sistema"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </header>
  );
}
