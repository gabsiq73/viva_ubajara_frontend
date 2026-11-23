import type { JSX } from 'react';
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./styles/Header.components.css";
import "./ui/ui.css";
import Navbar from "./Navbar";
import Icon from "./ui/Icon";
import { useAuth } from '../admin/hooks/useAuth';
import MobileMenu from "./layout/MobileMenu";
import SiteLogo from "./layout/SiteLogo";
import SiteSearchForm from "./layout/SiteSearchForm";
import UserMenu from "./layout/UserMenu";
import { useFavoritesCount } from "./layout/useFavoritesCount";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useActivationPop } from "../hooks/useActivationPop";

const SCROLL_THRESHOLD = 80;

interface HeaderProps {
    /** Páginas sem hero: o header já nasce no estado "rolado" (branco). */
    solid?: boolean;
}

export default function Header({ solid = false }: HeaderProps): JSX.Element {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const favoritesCount = useFavoritesCount();
    const dotPop = useActivationPop(favoritesCount > 0);
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const menuId = useId();
    const searchPanelId = useId();

    const [scrolled, setScrolled] = useState(false);
    const [menuKey, setMenuKey] = useState<string | null>(null);
    const [menuFocusSearch, setMenuFocusSearch] = useState(false);
    const [searchKey, setSearchKey] = useState<string | null>(null);

    // Menu e busca ficam atrelados à navegação atual: mudar de rota os fecha sem efeito colateral.
    const menuOpen = !isDesktop && menuKey === location.key;
    const searchOpen = isDesktop && searchKey === location.key;

    // Ao cruzar o breakpoint, menu/busca abertos não podem reaparecer ao voltar.
    const [prevDesktop, setPrevDesktop] = useState(isDesktop);
    if (prevDesktop !== isDesktop) {
        setPrevDesktop(isDesktop);
        setMenuKey(null);
        setSearchKey(null);
    }

    const menuToggleRef = useRef<HTMLButtonElement>(null);
    const searchButtonRef = useRef<HTMLButtonElement>(null);
    const searchPanelRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
        // Lido só na montagem: durante o render o scrollY ainda é o da página anterior.
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (!searchOpen) return;
        searchInputRef.current?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setSearchKey(null);
                searchButtonRef.current?.focus();
            }
        };
        const onPointerDown = (event: MouseEvent) => {
            const target = event.target as Node;
            if (!searchPanelRef.current?.contains(target) && !searchButtonRef.current?.contains(target)) {
                setSearchKey(null);
            }
        };
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("mousedown", onPointerDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("mousedown", onPointerDown);
        };
    }, [searchOpen]);

    const openMenu = (focusSearch: boolean) => {
        setMenuFocusSearch(focusSearch);
        setMenuKey(location.key);
    };

    const closeMenu = useCallback(() => {
        setMenuKey(null);
        menuToggleRef.current?.focus();
    }, []);

    const isSolid = solid || scrolled || searchOpen;
    const favoritesLabel = favoritesCount > 0 ? `Favoritos (${favoritesCount})` : "Favoritos";

    return (
        <header className={`site-header${isSolid ? " is-solid" : ""}${menuOpen ? " is-menu-open" : ""}`}>
            <div className="site-header__inner">
                <Link to="/" className="site-header__logo">
                    <SiteLogo />
                </Link>

                {isDesktop && (
                    <div className="site-header__nav">
                        <Navbar />
                    </div>
                )}

                <div className="site-header__actions">
                    {isDesktop ? (
                        <>
                            <button
                                ref={searchButtonRef}
                                type="button"
                                className="site-header__icon-btn"
                                aria-label="Buscar"
                                aria-expanded={searchOpen}
                                aria-controls={searchOpen ? searchPanelId : undefined}
                                onClick={() => setSearchKey(searchOpen ? null : location.key)}
                            >
                                <Icon name="search" />
                            </button>
                            <Link to="/dashboard?tab=favorites" className="site-header__icon-btn" aria-label={favoritesLabel}>
                                <Icon name="favorite" />
                                {favoritesCount > 0 && (
                                    <span
                                        className={`site-header__dot${dotPop.popping ? " site-header__dot--in" : ""}`}
                                        onAnimationEnd={dotPop.onAnimationEnd}
                                        aria-hidden="true"
                                    />
                                )}
                            </Link>
                            {isAuthenticated ? (
                                <UserMenu />
                            ) : (
                                <Link to="/admin/login" className="site-header__login">
                                    <Icon name="person" />
                                    Entrar
                                </Link>
                            )}
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="site-header__icon-btn"
                                aria-label="Buscar"
                                onClick={() => openMenu(true)}
                            >
                                <Icon name="search" />
                            </button>
                            <button
                                ref={menuToggleRef}
                                type="button"
                                className="site-header__icon-btn site-header__menu-btn"
                                aria-label="Abrir menu"
                                aria-expanded={menuOpen}
                                aria-controls={menuId}
                                onClick={() => openMenu(false)}
                            >
                                <Icon name="menu" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {searchOpen && (
                <div className="site-header__search-panel" id={searchPanelId} ref={searchPanelRef}>
                    <div className="site-header__search-inner">
                        <SiteSearchForm variant="panel" inputRef={searchInputRef} />
                    </div>
                </div>
            )}

            {!isDesktop && (
                <MobileMenu id={menuId} open={menuOpen} focusSearch={menuFocusSearch} onClose={closeMenu} />
            )}
        </header>
    );
}
