import type { JSX } from 'react';
import { Link, useLocation } from "react-router-dom";
import "./styles/Navbar.components.css";
import Icon from "./ui/Icon";
import { NAV_ITEMS, isNavActive } from "./layout/navItems";

interface NavbarProps {
    variant?: "bar" | "menu";
}

export default function Navbar({ variant = "bar" }: NavbarProps): JSX.Element {
    const { pathname } = useLocation();

    return (
        <nav className={`site-nav site-nav--${variant}`} aria-label="Principal">
            <ul className="site-nav__list">
                {NAV_ITEMS.map((item) => {
                    const active = isNavActive(pathname, item);
                    return (
                        <li key={item.to}>
                            <Link
                                to={item.to}
                                className={`site-nav__link${active ? " is-active" : ""}`}
                                aria-current={active ? "page" : undefined}
                            >
                                {item.label}
                                {variant === "menu" && <Icon name="arrow_forward" className="site-nav__arrow" />}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
