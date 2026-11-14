import { useRef, useState, type MouseEvent, type RefObject } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../admin/hooks/useAuth';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useModalBehavior } from '../../hooks/useModalBehavior';
import Icon from '../../components/ui/Icon';
import logo from '../../assets/images/logo.webp';
import '../../admin/styles/admin.css';
import '../../components/ui/ui.css';
import { UnsavedGuardProvider } from '../components/UnsavedGuardProvider';
import { useUnsavedGuard } from '../components/unsavedGuardContext';
import './CompanyLayout.css';

const NAV_ITEMS = [
  { to: '/empresa/estabelecimento', icon: 'storefront', label: 'Meu estabelecimento' },
  { to: '/empresa/cardapio', icon: 'restaurant_menu', label: 'Cardápio' },
];

const SOON_ITEMS = [
  { icon: 'photo_library', label: 'Fotos e galeria' },
  { icon: 'star', label: 'Avaliações' },
  { icon: 'settings', label: 'Configurações' },
];

interface DrawerBehaviorProps {
  panelRef: RefObject<HTMLElement | null>;
  initialFocusRef: RefObject<HTMLElement | null>;
  returnFocusRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}

function DrawerBehavior({ panelRef, initialFocusRef, returnFocusRef, onClose }: DrawerBehaviorProps) {
  useModalBehavior({ panelRef, onClose, initialFocusRef, returnFocusRef });
  return null;
}

function CompanyShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { requestLeave } = useUnsavedGuard();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [open, setOpen] = useState(false);
  const [lastContext, setLastContext] = useState({ isMobile, path: location.pathname });
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  if (lastContext.isMobile !== isMobile || lastContext.path !== location.pathname) {
    setLastContext({ isMobile, path: location.pathname });
    setOpen(false);
  }

  const drawerOpen = isMobile && open;
  const closeDrawer = () => setOpen(false);
  const initials = (user?.name || user?.email || 'Empresa').slice(0, 2).toUpperCase();

  const guardedNavigate = (to: string, event?: MouseEvent) => {
    if (event && (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
    event?.preventDefault();
    if (to === location.pathname) { closeDrawer(); return; }
    requestLeave(() => { closeDrawer(); navigate(to); });
  };

  const handleLogout = () => requestLeave(() => { logout(); navigate('/admin/login'); });

  return (
    <div className="company-root">
      <header className="company-topbar">
        <button
          ref={menuButtonRef}
          type="button"
          className="company-topbar__menu"
          aria-label="Abrir menu do painel"
          aria-expanded={drawerOpen}
          aria-controls="company-drawer"
          onClick={() => setOpen(true)}
        >
          <Icon name="menu" />
        </button>
        <Link to="/empresa/estabelecimento" className="company-topbar__brand" onClick={(event) => guardedNavigate('/empresa/estabelecimento', event)}>
          <img src={logo} alt="Viva Ubajara" />
        </Link>
        <span className="company-topbar__title">Painel do parceiro</span>
      </header>

      {drawerOpen && (
        <>
          <div className="company-backdrop" onClick={closeDrawer} aria-hidden="true" />
          <DrawerBehavior panelRef={drawerRef} initialFocusRef={closeButtonRef} returnFocusRef={menuButtonRef} onClose={closeDrawer} />
        </>
      )}

      <aside
        id="company-drawer"
        ref={drawerRef}
        className={`company-sidebar${drawerOpen ? ' is-open' : ''}`}
        inert={isMobile && !open}
        {...(drawerOpen ? { role: 'dialog', 'aria-modal': true, 'aria-label': 'Menu do painel' } : {})}
      >
        <div className="company-brand">
          <Link to="/" className="company-brand__link" title="Ir para o site público" onClick={(event) => guardedNavigate('/', event)}>
            <img src={logo} alt="Viva Ubajara" className="company-brand__logo" />
            <span className="company-brand__tag">Portal oficial de turismo</span>
          </Link>
          <button ref={closeButtonRef} type="button" className="company-brand__close" aria-label="Fechar menu" onClick={closeDrawer}>
            <Icon name="close" />
          </button>
        </div>

        <div className="company-sidebar__caption"><span aria-hidden="true" /> Painel do parceiro</div>

        <nav className="company-nav" aria-label="Navegação da empresa">
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={({ isActive }) => `company-nav__item${isActive ? ' is-active' : ''}`} onClick={(event) => guardedNavigate(item.to, event)}>
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
            {SOON_ITEMS.map((item) => (
              <li key={item.label} className="company-nav__item company-nav__item--soon">
                <Icon name={item.icon} />
                <span>{item.label}</span>
                <span className="company-nav__badge">Em breve</span>
              </li>
            ))}
          </ul>
        </nav>

        <div className="company-sidebar__account">
          <div className="company-avatar" aria-hidden="true">{initials}</div>
          <div className="company-account-copy">
            <strong>{user?.name || 'Conta empresarial'}</strong>
            <small>{user?.email}</small>
          </div>
        </div>

        <div className="company-sidebar__footer">
          <Link to="/" className="company-sidebar__action" onClick={(event) => guardedNavigate('/', event)}>
            <Icon name="arrow_back" />
            Voltar ao site
          </Link>
          <button type="button" className="company-sidebar__action" onClick={handleLogout}>
            <Icon name="logout" />
            Sair do sistema
          </button>
        </div>
      </aside>

      <main className="company-main" id="company-main"><Outlet /></main>
    </div>
  );
}

export function CompanyLayout() {
  return (
    <UnsavedGuardProvider>
      <CompanyShell />
    </UnsavedGuardProvider>
  );
}
