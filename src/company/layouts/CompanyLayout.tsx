import { Outlet, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Store, Utensils, LogOut } from 'lucide-react';
import { useAuth } from '../../admin/hooks/useAuth';
import logo from '../../assets/images/logo.webp';
import '../../admin/styles/admin.css';

const PAGE_TITLES: Record<string, string> = {
  '/empresa/estabelecimento': 'Meu Estabelecimento',
  '/empresa/cardapio': 'Cardápio',
};

export function CompanyLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? 'Meu Estabelecimento';

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
          <NavLink
            to="/empresa/estabelecimento"
            className={({ isActive }) => `adm-sidebar__link${isActive ? ' active' : ''}`}
          >
            <span className="icon"><Store size={18} /></span>
            Meu Estabelecimento
          </NavLink>
          <NavLink
            to="/empresa/cardapio"
            className={({ isActive }) => `adm-sidebar__link${isActive ? ' active' : ''}`}
          >
            <span className="icon"><Utensils size={18} /></span>
            Cardápio
          </NavLink>
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
        <h1 className="adm-topbar__title">{title}</h1>
      </header>

      <main className="adm-main">
        <Outlet />
      </main>
    </div>
  );
}
