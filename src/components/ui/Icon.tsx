interface IconProps {
    name: string;
    filled?: boolean;
    className?: string;
}

export default function Icon({ name, filled = false, className = "" }: IconProps) {
    const classes = ["material-symbols-outlined", "ui-icon", filled ? "ui-icon--filled" : "", className]
        .filter(Boolean)
        .join(" ");
    return (
        <span className={classes} aria-hidden="true">
            {name}
        </span>
    );
}
