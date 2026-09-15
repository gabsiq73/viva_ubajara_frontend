import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Store, LogOut } from 'lucide-react';
import { useAuth } from '../../admin/hooks/useAuth';
import logo from '../../assets/images/logo.webp';
import '../../admin/styles/admin.css';

export function CompanyLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="adm-root">
      <aside className="adm-sidebar">
        <Link to="/" className="adm-sidebar__logo" title="Ir para o site público">
          <img src={logo} alt="Viva Ubajara" className="adm-sidebar__logo-img" />
          <div className="adm-sidebar__logo-sub">Painel da Empresa</div>
        </Link>

        <nav className="adm-sidebar__nav">
          <Link to="/empresa/estabelecimento" className="adm-sidebar__link active">
            <span className="icon"><Store size={18} /></span>
            Meu Estabelecimento
          </Link>
        </nav>

        <div className="adm-sidebar__footer">
          <button
            onClick={handleLogout}
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

      <header className="adm-topbar">
        <h1 className="adm-topbar__title">Meu Estabelecimento</h1>
      </header>

      <main className="adm-main">
        <Outlet />
      </main>
    </div>
  );
}
