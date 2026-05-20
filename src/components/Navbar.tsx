import type { JSX } from 'react';
import { Link, NavLink } from "react-router-dom";
import "./styles/Navbar.components.css";
import { LogOut } from 'lucide-react';
import { useAuth } from '../admin/hooks/useAuth';

const ROLE_LABELS: Record<string, string> = {
    ADMIN: 'Administrador',
    USER: 'Usuário',
    GUIDE: 'Guia Turístico',
};

export default function Navbar(): JSX.Element {
    const { isAuthenticated, user, logout } = useAuth();
    const displayName = user?.name || user?.email?.split('@')[0] || '';
    const initials = displayName.slice(0, 2).toUpperCase();
    const roleLabel = user?.role ? (ROLE_LABELS[user.role] ?? user.role) : '';

    return(
        <nav className="navbar">
            <div className="menu">
                <ul>
                    <li>
                        <NavLink to="/pontos-turisticos" className={({ isActive }) => isActive ? "nav-active" : ""}>Atrativos</NavLink>
                    </li>
                    <li>
                        <NavLink to="/estabelecimentos" className={({ isActive }) => isActive ? "nav-active" : ""}>Alimentação</NavLink>
                    </li>
                    <li>
                        <NavLink to="/eventos" className={({ isActive }) => isActive ? "nav-active" : ""}>Eventos</NavLink>
                    </li>
                    <li>
                        <NavLink to="/como-chegar" className={({ isActive }) => isActive ? "nav-active" : ""}>Como Chegar</NavLink>
                    </li>
                    <li id="contact">
                        <NavLink to="/contato" className={({ isActive }) => isActive ? "nav-active" : ""}>Contato</NavLink>
                    </li>
                </ul>
            </div>

            <div className="navbar-user-mobile">
                {isAuthenticated && user ? (
                    <div className="navbar-user-mobile__info">
                        <div className="navbar-user-mobile__avatar">
                            {user.photo
                                ? <img src={user.photo} alt={displayName} />
                                : <span>{initials}</span>
                            }
                            <span className="navbar-user-mobile__dot" aria-hidden="true" />
                        </div>
                        <div className="navbar-user-mobile__details">
                            <span className="navbar-user-mobile__name">{displayName}</span>
                            <span className="navbar-user-mobile__role">{roleLabel}</span>
                        </div>
                        <button className="navbar-user-mobile__logout" onClick={logout} aria-label="Sair">
                            <LogOut size={16} />
                        </button>
                    </div>
                ) : (
                    <Link to="/admin/login" className="navbar-login-btn-mobile">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        Entrar na conta
                    </Link>
                )}
            </div>
        </nav>
    )
}