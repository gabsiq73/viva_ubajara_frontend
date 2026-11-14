import { Link } from "react-router-dom";
import Badge from "./Badge";
import FavoriteButton from "./FavoriteButton";
import Icon from "./Icon";
import { TYPE_ICONS, establishmentPath, roomsLabel, shortPrice, type Establishment } from "../../utils/establishments";

interface EstablishmentCardProps {
    item: Establishment;
    view?: "grid" | "list";
    favorite: boolean;
    onToggleFavorite: (item: Establishment) => void;
}

function Rating({ value }: { value: number }) {
    const label = value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    return (
        <span className="ui-card__rating" role="img" aria-label={`${label.replace(",0", "")} de 5 estrelas`}>
            <Icon name="star" filled />
            {label}
        </span>
    );
}

function Media({ item }: { item: Establishment }) {
    return item.photo ? (
        <img src={item.photo} alt="" className="ui-card__img" width={640} height={400} loading="lazy" decoding="async" />
    ) : (
        <div className="ui-card__placeholder" aria-hidden="true">
            <Icon name={TYPE_ICONS[item.type]} />
        </div>
    );
}

export default function EstablishmentCard({ item, view = "grid", favorite, onToggleFavorite }: EstablishmentCardProps) {
    const detail = item.type === "Restaurante" ? item.cuisine : roomsLabel(item.numOfRooms);
    const path = establishmentPath(item);
    const fav = (
        <FavoriteButton
            active={favorite}
            onToggle={() => onToggleFavorite(item)}
            variant={view === "list" ? "outlined" : "overlay"}
            className="ui-card__fav"
        />
    );

    if (view === "list") {
        const tag = item.type === "Restaurante" ? item.acceptsReservation && "Aceita reservas" : item.hasOnlineBooking && "Reserva online";
        return (
            <article className="ui-card ui-card--list">
                <div className="ui-card__media">
                    <Media item={item} />
                </div>
                <div className="ui-card__main">
                    <p className="ui-card__eyebrow">{[item.type, detail].filter(Boolean).join(" · ")}</p>
                    <h3 className="ui-card__title">
                        <Link to={path} className="ui-card__link">
                            {item.name}
                        </Link>
                    </h3>
                    {item.description && <p className="ui-card__desc">{item.description}</p>}
                    <div className="ui-card__meta">
                        {item.starRating !== null && <Rating value={item.starRating} />}
                        {tag && (
                            <span className="ui-card__meta-item ui-card__meta-item--check">
                                <Icon name="check_circle" />
                                {tag}
                            </span>
                        )}
                        {item.address && (
                            <span className="ui-card__meta-item">
                                <Icon name="location_on" />
                                {item.address}
                            </span>
                        )}
                        {item.openingHours && (
                            <span className="ui-card__meta-item">
                                <Icon name="schedule" />
                                {item.openingHours}
                            </span>
                        )}
                    </div>
                </div>
                <div className="ui-card__aside">
                    {fav}
                    {item.avgPrice && <span className="ui-card__price-full">{item.avgPrice}</span>}
                    <span className="ui-card__cta" aria-hidden="true">
                        Ver detalhes
                    </span>
                </div>
            </article>
        );
    }

    const subtitle = [detail, item.neighborhood].filter(Boolean).join(" · ");
    const price = shortPrice(item.avgPrice);
    return (
        <article className="ui-card">
            <div className="ui-card__media">
                <Media item={item} />
                <Badge variant="tag" className="ui-card__tag">
                    {item.type}
                </Badge>
                {fav}
            </div>
            <div className="ui-card__body">
                <div className="ui-card__head">
                    <h3 className="ui-card__name">
                        <Link to={path} className="ui-card__link">
                            {item.name}
                        </Link>
                    </h3>
                    {item.starRating !== null && <Rating value={item.starRating} />}
                </div>
                {subtitle && <p className="ui-card__sub">{subtitle}</p>}
                {price && <p className="ui-card__price">{price}</p>}
            </div>
        </article>
    );
}
