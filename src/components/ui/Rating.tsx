import Icon from "./Icon";
import { formatRating, reviewsLabel } from "../../utils/rating";

export default function Rating({ value, count }: { value: number; count?: number }) {
    const label = formatRating(value);
    const spoken = `${label.replace(",0", "")} de 5 estrelas${count ? `, ${reviewsLabel(count)}` : ""}`;
    return (
        <span className="ui-card__rating" role="img" aria-label={spoken}>
            <Icon name="star" filled />
            {label}
            {count ? <span className="ui-card__rating-count">({count})</span> : null}
        </span>
    );
}
