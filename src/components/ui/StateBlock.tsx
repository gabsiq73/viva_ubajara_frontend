import type { ReactNode } from "react";
import Icon from "./Icon";

interface StateBlockProps {
    variant: "empty" | "error" | "notice";
    icon: string;
    title: string;
    children?: ReactNode;
    actions?: ReactNode;
}

export default function StateBlock({ variant, icon, title, children, actions }: StateBlockProps) {
    const role = variant === "error" ? "alert" : variant === "notice" ? "status" : undefined;
    return (
        <div className={`ui-state ui-state--${variant}`} role={role}>
            <span className="ui-state__icon">
                <Icon name={icon} />
            </span>
            <div className="ui-state__text">
                <p className="ui-state__title">{title}</p>
                {children && <p className="ui-state__desc">{children}</p>}
            </div>
            {actions && <div className="ui-state__actions">{actions}</div>}
        </div>
    );
}
