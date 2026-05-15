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

  const initials = user?.email
    ? user.email.split('@')[0].slice(0, 2).toUpperCase()
    : '?';

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
          <div className="adm-topbar__user">
            <div className="adm-topbar__user-info">
              <strong>{user.email}</strong>
              <span>{user.role === 'ADMIN' ? 'Administrador' : 'Usuário'}</span>
            </div>
            <div className="adm-topbar__avatar" title={user.email}>
              {initials}
            </div>
          </div>
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
