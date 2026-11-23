import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../admin/hooks/useAuth";
import { getRoleLabel } from "../../utils/roles";
import Icon from "../ui/Icon";
import UserAvatar from "./UserAvatar";
import { getDisplayName } from "./userDisplay";

export default function UserMenu() {
    const { user, isAdmin, isCompany, logout } = useAuth();
    const location = useLocation();
    const popoverId = useId();
    const buttonId = useId();
    const [openKey, setOpenKey] = useState<string | null>(null);
    const open = openKey === location.key;
    const wrapRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
        const onPointerDown = (event: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
                setOpenKey(null);
            }
        };
        document.addEventListener("mousedown", onPointerDown);
        return () => document.removeEventListener("mousedown", onPointerDown);
    }, [open]);

    if (!user) return null;

    const displayName = getDisplayName(user);

    const close = (restoreFocus: boolean) => {
        setOpenKey(null);
        if (restoreFocus) buttonRef.current?.focus();
    };

    const handleButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            setOpenKey(location.key);
        }
    };

    const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
        const index = items.indexOf(document.activeElement as HTMLElement);
        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                items[(index + 1) % items.length]?.focus();
                break;
            case "ArrowUp":
                event.preventDefault();
                items[(index - 1 + items.length) % items.length]?.focus();
                break;
            case "Home":
                event.preventDefault();
                items[0]?.focus();
                break;
            case "End":
                event.preventDefault();
                items[items.length - 1]?.focus();
                break;
            case "Escape":
                event.preventDefault();
                close(true);
                break;
            case "Tab":
                close(true);
                break;
        }
    };

    return (
        <div className="site-user" ref={wrapRef}>
            <button
                ref={buttonRef}
                id={buttonId}
                type="button"
                className="site-user__button"
                aria-label={`Menu de ${displayName}`}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={open ? popoverId : undefined}
                onClick={() => setOpenKey(open ? null : location.key)}
                onKeyDown={handleButtonKeyDown}
            >
                <UserAvatar photo={user.photo} name={displayName} />
            </button>

            {open && (
                <div className="site-user__popover" id={popoverId}>
                    <div className="site-user__profile">
                        <UserAvatar photo={user.photo} name={displayName} className="site-avatar--lg" />
                        <div className="site-user__info">
                            <strong title={displayName}>{displayName}</strong>
                            <span>{getRoleLabel(user.role)}</span>
                        </div>
                    </div>
                    <div className="site-user__menu" role="menu" aria-labelledby={buttonId} ref={menuRef} onKeyDown={handleMenuKeyDown}>
                        <Link to="/dashboard" role="menuitem" className="site-user__item">
                            <Icon name="person" />
                            Meu perfil
                        </Link>
                        {isAdmin && (
                            <Link to="/admin" role="menuitem" className="site-user__item">
                                <Icon name="admin_panel_settings" />
                                Painel admin
                            </Link>
                        )}
                        {isCompany && (
                            <Link to="/empresa/estabelecimento" role="menuitem" className="site-user__item">
                                <Icon name="storefront" />
                                Meu estabelecimento
                            </Link>
                        )}
                        <button
                            type="button"
                            role="menuitem"
                            className="site-user__item site-user__item--danger"
                            onClick={() => {
                                // O botão some com o logout; sem isso o foco cairia no body.
                                document.querySelector<HTMLElement>(".site-header__logo")?.focus();
                                logout();
                                close(false);
                            }}
                        >
                            <Icon name="logout" />
                            Sair
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
