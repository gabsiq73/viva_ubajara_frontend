import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { Building2, Images, LogOut, Settings, Star, Utensils } from 'lucide-react';
import { useAuth } from '../../admin/hooks/useAuth';
import logo from '../../assets/images/logo.webp';
import '../../admin/styles/admin.css';
import './CompanyLayout.css';

export function CompanyLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/admin/login'); };
  const initials = (user?.name || user?.email || 'Empresa').slice(0, 2).toUpperCase();

  return (
    <div className="adm-root company-root">
      <aside className="adm-sidebar company-sidebar">
        <Link to="/" className="company-brand" title="Ir para o site público">
          <img src={logo} alt="Viva Ubajara" className="adm-sidebar__logo-img" />
          <span className="company-brand__tag">Portal oficial de turismo</span>
        </Link>
        <div className="company-sidebar__caption"><span /> Painel do parceiro</div>
        <nav className="adm-sidebar__nav company-nav" aria-label="Navegação da empresa">
          <NavLink to="/empresa/estabelecimento" className={({ isActive }) => `adm-sidebar__link${isActive ? ' active' : ''}`}><span className="icon"><Building2 size={18} /></span>Meu estabelecimento</NavLink>
          <NavLink to="/empresa/cardapio" className={({ isActive }) => `adm-sidebar__link${isActive ? ' active' : ''}`}><span className="icon"><Utensils size={18} /></span>Cardápio</NavLink>
          <button type="button" className="adm-sidebar__link company-nav__future" aria-disabled="true"><span className="icon"><Images size={18} /></span>Fotos e galeria</button>
          <button type="button" className="adm-sidebar__link company-nav__future" aria-disabled="true"><span className="icon"><Star size={18} /></span>Avaliações</button>
          <button type="button" className="adm-sidebar__link company-nav__future" aria-disabled="true"><span className="icon"><Settings size={18} /></span>Configurações</button>
        </nav>
        <div className="company-sidebar__account"><div className="company-avatar">{initials}<span /></div><div className="company-account-copy"><strong>{user?.name || 'Conta empresarial'}</strong><small>{user?.email}</small></div></div>
        <div className="adm-sidebar__footer company-sidebar__footer">
          <button onClick={handleLogout} className="adm-sidebar__link"><span className="icon"><LogOut size={18} /></span>Sair do sistema</button>
        </div>
      </aside>
      <main className="adm-main company-main"><Outlet /></main>
    </div>
  );
}
