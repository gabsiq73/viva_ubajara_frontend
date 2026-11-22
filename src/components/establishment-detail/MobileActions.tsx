import type { MouseEvent } from "react";
import { useActivationPop } from "../../hooks/useActivationPop";
import Icon from "../ui/Icon";
import { shortPrice } from "../../utils/establishments";
import { splitPrice, telHref, type EstablishmentDetail } from "../../utils/establishmentDetail";
import "./establishment-detail.css";

interface MobileActionsProps {
    detail: EstablishmentDetail;
    onOpenSheet: (event: MouseEvent<HTMLElement>) => void;
}

interface QuickActionsProps extends MobileActionsProps {
    favorite: boolean;
    onToggleFavorite: () => void;
}

export function QuickActions({ detail, favorite, onToggleFavorite, onOpenSheet }: QuickActionsProps) {
    const tel = telHref(detail.phone);
    const { popping, onAnimationEnd } = useActivationPop(favorite);
    return (
        <div className="estd-qa">
            {tel && (
                <a href={tel} className="estd-qa__item">
                    <span className="estd-qa__disc">
                        <Icon name="call" />
                    </span>
                    Ligar
                </a>
            )}
            {detail.address && (
                <button type="button" className="estd-qa__item" onClick={onOpenSheet}>
                    <span className="estd-qa__disc">
                        <Icon name="directions" />
                    </span>
                    Rotas
                </button>
            )}
            {detail.webUrl && (
                <a href={detail.webUrl} className="estd-qa__item" target="_blank" rel="noopener noreferrer">
                    <span className="estd-qa__disc">
                        <Icon name="language" />
                    </span>
                    Site
                    <span className="ui-sr-only"> (abre em nova aba)</span>
                </a>
            )}
            {detail.bookingUrl && (
                <a href={detail.bookingUrl} className="estd-qa__item" target="_blank" rel="noopener noreferrer">
                    <span className="estd-qa__disc">
                        <Icon name="event_available" />
                    </span>
                    Reservar
                    <span className="ui-sr-only"> (abre em nova aba)</span>
                </a>
            )}
            <button
                type="button"
                className={`estd-qa__item${favorite ? " estd-qa__item--saved" : ""}`}
                aria-pressed={favorite}
                onClick={onToggleFavorite}
            >
                <span className={`estd-qa__disc${popping ? " estd-qa__disc--pop is-popping" : ""}`} onAnimationEnd={onAnimationEnd}>
                    <Icon name="favorite" filled={favorite} />
                </span>
                {favorite ? "Salvo" : "Salvar"}
            </button>
        </div>
    );
}

export function BottomBar({ detail, onOpenSheet }: MobileActionsProps) {
    const price = splitPrice(shortPrice(detail.avgPrice));
    const unit = price.unit.replace(/^\s*\/\s*/, "por ");
    const tel = telHref(detail.phone);
    if (!price.value && !tel && !detail.address) return null;

    return (
        <div className="estd-bottombar">
            <div className="estd-bottombar__price">
                {price.value && <span className="estd-bottombar__value">{price.value}</span>}
                {unit && <span className="estd-bottombar__unit">{unit}</span>}
            </div>
            {tel && (
                <a href={tel} className="estd-bottombar__call" aria-label="Ligar">
                    <Icon name="call" />
                </a>
            )}
            {detail.address && (
                <button type="button" className="ui-btn ui-btn--primary ui-btn--lg estd-bottombar__cta" onClick={onOpenSheet}>
                    <Icon name="directions" />
                    Como chegar
                </button>
            )}
        </div>
    );
}
