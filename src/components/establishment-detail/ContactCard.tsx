import Icon from "../ui/Icon";
import { shortPrice } from "../../utils/establishments";
import { correctionHref, mailHref, splitPrice, telHref, type EstablishmentDetail } from "../../utils/establishmentDetail";
import "./establishment-detail.css";

interface ContactCardProps {
    detail: EstablishmentDetail;
    onGoToDirections: () => void;
}

export default function ContactCard({ detail, onGoToDirections }: ContactCardProps) {
    const price = splitPrice(shortPrice(detail.avgPrice));
    const hours = detail.type === "Restaurante" ? detail.openingHours : "";
    const hasAddress = detail.address !== "";
    const tel = telHref(detail.phone);
    const mail = mailHref(detail.email);
    const secondary = [
        tel && { key: "call", href: tel, icon: "call", label: "Ligar", external: false },
        detail.webUrl && { key: "site", href: detail.webUrl, icon: "language", label: "Site", external: true },
    ].filter((item) => !!item);
    const hasHeader = price.value !== "" || hours !== "";
    const hasActions = hasAddress || !!detail.bookingUrl || secondary.length > 0;
    const hasRows = detail.phone || detail.email || detail.instagram || hasAddress;

    return (
        <aside className="estd-aside" aria-label="Informações e contato">
            {(hasHeader || hasActions || hasRows) && (
                <div className="estd-aside__card">
                    {hasHeader && (
                        <div className="estd-aside__head">
                            {price.value && (
                                <span className="estd-aside__price">
                                    {price.value}
                                    {price.unit && <span className="estd-aside__unit">{price.unit}</span>}
                                </span>
                            )}
                            {hours && (
                                <span className="estd-aside__hours">
                                    <Icon name="schedule" />
                                    {hours}
                                </span>
                            )}
                        </div>
                    )}

                    {hasActions && (
                        <div className="estd-aside__actions">
                            {hasAddress && (
                                <a
                                    href="#como-chegar"
                                    className="ui-btn ui-btn--primary ui-btn--lg estd-aside__cta"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        onGoToDirections();
                                    }}
                                >
                                    <Icon name="directions" />
                                    Como chegar
                                </a>
                            )}
                            {detail.bookingUrl && (
                                <a
                                    href={detail.bookingUrl}
                                    className="ui-btn ui-btn--outline ui-btn--lg estd-aside__wide"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Icon name="event_available" />
                                    Reservar
                                    <span className="ui-sr-only"> (abre em nova aba)</span>
                                </a>
                            )}
                            {secondary.length > 0 && (
                                <div className="estd-aside__pair">
                                    {secondary.map((item) => (
                                        <a
                                            key={item.key}
                                            href={item.href}
                                            className="ui-btn ui-btn--outline ui-btn--lg"
                                            {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                        >
                                            <Icon name={item.icon} />
                                            {item.label}
                                            {item.external && <span className="ui-sr-only"> (abre em nova aba)</span>}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {hasRows && (
                        <ul className="estd-aside__rows">
                            {detail.phone && (
                                <li>
                                    <Icon name="call" />
                                    {tel ? <a href={tel}>{detail.phone}</a> : <span>{detail.phone}</span>}
                                </li>
                            )}
                            {detail.email && (
                                <li>
                                    <Icon name="mail" />
                                    {mail ? <a href={mail}>{detail.email}</a> : <span>{detail.email}</span>}
                                </li>
                            )}
                            {detail.instagram && (
                                <li>
                                    <Icon name="alternate_email" />
                                    <a href={detail.instagram.url} target="_blank" rel="noopener noreferrer">
                                        {detail.instagram.handle}
                                        <span className="ui-sr-only"> no Instagram (abre em nova aba)</span>
                                    </a>
                                </li>
                            )}
                            {hasAddress && (
                                <li>
                                    <Icon name="location_on" />
                                    <span>{detail.address}</span>
                                </li>
                            )}
                        </ul>
                    )}
                </div>
            )}
            <p className="estd-aside__note">
                Informações enviadas pelo estabelecimento. <a href={correctionHref(detail.name)}>Sugerir correção</a>
            </p>
        </aside>
    );
}
