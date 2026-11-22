import { useActivationPop } from "../../hooks/useActivationPop";
import Icon from "./Icon";

interface FavoriteButtonProps {
    active: boolean;
    onToggle: () => void;
    variant?: "overlay" | "outlined";
    className?: string;
}

export default function FavoriteButton({ active, onToggle, variant = "overlay", className = "" }: FavoriteButtonProps) {
    const { popping, onAnimationEnd } = useActivationPop(active);
    return (
        <button
            type="button"
            className={`ui-fav ui-fav--${variant}${active ? " ui-fav--on" : ""} ${className}`.trim()}
            aria-label={active ? "Remover dos favoritos" : "Favoritar"}
            aria-pressed={active}
            onClick={onToggle}
        >
            <span className={`ui-fav__disc${popping ? " ui-fav__disc--pop is-popping" : ""}`} onAnimationEnd={onAnimationEnd}>
                <Icon name="favorite" filled={active} />
            </span>
        </button>
    );
}
