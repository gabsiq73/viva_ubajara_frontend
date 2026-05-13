import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="adm-topbar">
      <h1 className="adm-topbar__title">{title}</h1>
      <div className="adm-topbar__right">
        {user && (
          <span className="adm-topbar__user">
            Olá, <strong>{user.email}</strong>
          </span>
        )}
        <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </header>
  );
}
