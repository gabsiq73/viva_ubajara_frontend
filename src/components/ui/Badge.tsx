import type { ReactNode } from "react";

interface BadgeProps {
    variant?: "tag" | "success" | "warning" | "danger" | "neutral";
    className?: string;
    children: ReactNode;
}

/** `tag` é o selo de tipo sobre fotos de card; os demais são selos de status. */
export default function Badge({ variant = "neutral", className = "", children }: BadgeProps) {
    return <span className={`ui-badge ui-badge--${variant} ${className}`.trim()}>{children}</span>;
}
