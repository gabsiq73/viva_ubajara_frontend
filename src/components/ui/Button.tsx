import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";

type Variant = "primary" | "outline" | "gold" | "glass";

interface ButtonBaseProps {
    variant?: Variant;
    large?: boolean;
    icon?: string;
    iconAfter?: string;
    className?: string;
    children: ReactNode;
}

function buttonClass(variant: Variant = "primary", large = false, className = "") {
    return ["ui-btn", `ui-btn--${variant}`, large ? "ui-btn--lg" : "", className].filter(Boolean).join(" ");
}

export function Button({
    variant,
    large,
    icon,
    iconAfter,
    children,
    className,
    type = "button",
    ...rest
}: ButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button type={type} className={buttonClass(variant, large, className)} {...rest}>
            {icon && <Icon name={icon} />}
            {children}
            {iconAfter && <Icon name={iconAfter} />}
        </button>
    );
}

export function ButtonLink({
    to,
    variant,
    large,
    icon,
    iconAfter,
    children,
    className,
}: ButtonBaseProps & { to: string }) {
    return (
        <Link to={to} className={buttonClass(variant, large, className)}>
            {icon && <Icon name={icon} />}
            {children}
            {iconAfter && <Icon name={iconAfter} />}
        </Link>
    );
}
