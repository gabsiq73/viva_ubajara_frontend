import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../admin/hooks/useAuth";
import { FOCUSABLE_SELECTOR } from "../../hooks/focusable";
import { getRoleLabel } from "../../utils/roles";
import Navbar from "../Navbar";
import Icon from "../ui/Icon";
import SiteLogo from "./SiteLogo";
import SiteSearchForm from "./SiteSearchForm";
import UserAvatar from "./UserAvatar";
import { getDisplayName } from "./userDisplay";

interface MobileMenuProps {
    id: string;
    open: boolean;
    focusSearch: boolean;
    onClose: () => void;
}

export default function MobileMenu({ id, open, focusSearch, onClose }: MobileMenuProps) {
    const { isAuthenticated, user, isAdmin, isCompany, logout } = useAuth();
    const panelRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!open) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        (focusSearch ? searchRef.current : closeRef.current)?.focus();

        const onKeyDown = (event: globalThis.KeyboardEvent) => {
            if (event.key === "Escape") {
                onCloseRef.current();
                return;
            }
            if (event.key !== "Tab") return;
            const panel = panelRef.current;
            const nodes = panel?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
            if (!panel || !nodes || nodes.length === 0) return;
            const first = nodes[0];
            const last = nodes[nodes.length - 1];
            const active = document.activeElement;
            const inside = active !== panel && panel.contains(active);
            if (!inside) {
                event.preventDefault();
                (event.shiftKey ? last : first).focus();
            } else if (event.shiftKey && active === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open, focusSearch]);

    const displayName = getDisplayName(user);

    return (
        <div
            id={id}
            ref={panelRef}
            className="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            hidden={!open}
            tabIndex={-1}
        >
            <div className="site-menu__bar">
                <Link to="/" className="site-header__logo">
                    <SiteLogo />
                </Link>
                <button
                    ref={closeRef}
                    type="button"
                    className="site-header__icon-btn"
                    aria-label="Fechar menu"
                    onClick={onClose}
                >
                    <Icon name="close" />
                </button>
            </div>

            <div className="site-menu__search">
                <SiteSearchForm variant="menu" inputRef={searchRef} />
            </div>

            <Navbar variant="menu" />

            <ul className="site-menu__extras">
                <li>
                    <Link to="/dashboard?tab=favorites" className="site-menu__extra">
                        <Icon name="favorite" />
                        Meus favoritos
                    </Link>
                </li>
                <li>
                    <Link to="/contato" className="site-menu__extra">
                        <Icon name="mail" />
                        Contato
                    </Link>
                </li>
            </ul>

            <div className="site-menu__footer">
                {isAuthenticated && user ? (
                    <div className="site-menu__user">
                        <div className="site-menu__profile">
                            <UserAvatar photo={user.photo} name={displayName} className="site-avatar--lg" />
                            <div className="site-menu__profile-info">
                                <strong>{displayName}</strong>
                                <span>{getRoleLabel(user.role)}</span>
                            </div>
                        </div>
                        <Link to="/dashboard" className="site-menu__extra">
                            <Icon name="person" />
                            Meu perfil
                        </Link>
                        {isAdmin && (
                            <Link to="/admin" className="site-menu__extra">
                                <Icon name="admin_panel_settings" />
                                Painel admin
                            </Link>
                        )}
                        {isCompany && (
                            <Link to="/empresa/estabelecimento" className="site-menu__extra">
                                <Icon name="storefront" />
                                Meu estabelecimento
                            </Link>
                        )}
                        <button
                            type="button"
                            className="site-menu__extra site-menu__extra--danger"
                            onClick={() => { logout(); onClose(); }}
                        >
                            <Icon name="logout" />
                            Sair
                        </button>
                    </div>
                ) : (
                    <Link to="/admin/login" className="site-menu__cta site-menu__cta--primary">
                        <Icon name="person" />
                        Entrar
                    </Link>
                )}
                <Link to="/cadastro-empresa" className="site-menu__cta site-menu__cta--outline">
                    Cadastre seu negócio
                </Link>
            </div>
        </div>
    );
}
