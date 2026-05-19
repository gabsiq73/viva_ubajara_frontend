import { useState, useEffect, useRef } from "react";
import Navbar from "./Navbar";
import "./styles/Header.components.css";
import logo from './../assets/images/logo.webp';
import { Link } from "react-router-dom";
import { Heart, LogOut, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../admin/hooks/useAuth';

const ROLE_LABELS: Record<string, string> = {
    ADMIN: 'Administrador',
    USER: 'Usuário',
    GUIDE: 'Guia Turístico',
};

export default function Header(): JSX.Element {
    const [scrolled, setScrolled] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const displayName = user?.name || user?.email?.split('@')[0] || '';
    const initials = displayName.slice(0, 2).toUpperCase();
    const roleLabel = user?.role ? (ROLE_LABELS[user.role] ?? user.role) : '';

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return(
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
            <input type="checkbox" name="menu-mobile" id="menu-mobile" />
            <label
                htmlFor="menu-mobile"
                className="menu-backdrop"
                aria-label="Fechar menu"
            />

            <div className="header-container">
                <label htmlFor="menu-mobile" id="check">
                    <div className="menu-hamburguer">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </label>

                <div className="logo grid-l">
                    <div className="img">
                        <Link to="/">
                            <img src={logo} alt="Logo" />
                        </Link>
                    </div>
                </div>

                <div className="nav">
                    <Navbar/>
                </div>

                <div className="icon-position">
                    {isAuthenticated && user ? (
                        <div className="header-auth" ref={dropdownRef}>
                            <Link to="/dashboard?tab=favorites" className="header-favorites" title="Meus Favoritos" aria-label="Meus Favoritos">
                                <Heart size={20} />
                            </Link>

                            <button
                                className="header-user-btn"
                                onClick={() => setDropdownOpen(v => !v)}
                                aria-label="Menu do usuário"
                                aria-expanded={dropdownOpen}
                            >
                                <div className="header-user-btn__avatar">
                                    {user.photo
                                        ? <img src={user.photo} alt={displayName} />
                                        : <span>{initials}</span>
                                    }
                                </div>
                                <span className="header-user-btn__dot" aria-hidden="true" />
                            </button>

                            {dropdownOpen && (
                                <div className="header-user__dropdown" role="menu">
                                    <div className="header-user__dropdown-profile">
                                        <div className="header-user__dropdown-avatar">
                                            {user.photo
                                                ? <img src={user.photo} alt={displayName} />
                                                : <span>{initials}</span>
                                            }
                                        </div>
                                        <div className="header-user__dropdown-info">
                                            <strong>{displayName}</strong>
                                            <span>{roleLabel}</span>
                                        </div>
                                    </div>
                                    <div className="header-user__dropdown-divider" />
                                    <Link
                                        to="/dashboard"
                                        className="header-user__dropdown-action"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <User size={14} />
                                        Meu Perfil
                                    </Link>
                                    {user.role === 'ADMIN' && (
                                        <Link
                                            to="/admin"
                                            className="header-user__dropdown-action"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <LayoutDashboard size={14} />
                                            Painel Admin
                                        </Link>
                                    )}
                                    <button
                                        className="header-user__dropdown-logout"
                                        onClick={() => { logout(); setDropdownOpen(false); }}
                                    >
                                        <LogOut size={14} />
                                        Sair
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/admin/login" className="header-login-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span>LOGIN</span>
                        </Link>
                    )}
                </div>

                <div className="mobile-contact-btn">
                    <Link to="/contato">CONTATO</Link>
                </div>
            </div>
        </header>
    )
}