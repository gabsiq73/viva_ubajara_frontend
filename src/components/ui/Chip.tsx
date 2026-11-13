import type { ReactNode } from "react";
import Icon from "./Icon";

interface FilterChipProps {
    label: ReactNode;
    selected: boolean;
    onClick: () => void;
    count?: number;
    icon?: string;
    size?: "sm" | "md" | "lg";
}

/** Chip de opção: verde-claro quando selecionado no painel de filtros. */
export function FilterChip({ label, selected, onClick, count, icon, size = "md" }: FilterChipProps) {
    const classes = ["ui-chip", `ui-chip--${size}`, selected ? "ui-chip--on" : ""].filter(Boolean).join(" ");
    return (
        <button type="button" className={classes} aria-pressed={selected} onClick={onClick}>
            {icon && <Icon name={icon} />}
            {label}
            {count !== undefined && <span className="ui-chip__count">{count}</span>}
        </button>
    );
}

interface AppliedChipProps {
    label: string;
    onRemove: () => void;
    variant?: "solid" | "outline";
    quoted?: boolean;
}

/** Chip de filtro aplicado: verde-escuro com ×; a variante outline é usada no estado vazio. */
export function AppliedChip({ label, onRemove, variant = "solid", quoted = false }: AppliedChipProps) {
    const outline = variant === "outline";
    const text = quoted ? `“${label}”` : label;
    return (
        <button
            type="button"
            className={`ui-applied${outline ? " ui-applied--outline" : ""}`}
            onClick={onRemove}
            aria-label={outline ? undefined : `Remover filtro ${text}`}
        >
            {outline ? `Remover ${text}` : text}
            <Icon name="close" className="ui-applied__x" />
        </button>
    );
}
