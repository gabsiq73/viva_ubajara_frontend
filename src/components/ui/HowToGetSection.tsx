import { useId, useMemo, useRef } from "react";
import Icon from "./Icon";
import CopyAddressButton from "../establishment-detail/CopyAddressButton";
import RouteLinks from "../establishment-detail/RouteLinks";
import { buildDirectionLinks, mapEmbedUrl, mapExpandUrl, splitAddress } from "../../utils/directions";
import { telHref } from "../../utils/establishmentDetail";
import "../establishment-detail/establishment-detail.css";

interface HowToGetSectionProps {
    name: string;
    address: string;
    mapsUrl?: string;
    phone?: string;
    photoUrl?: string;
}

export default function HowToGetSection({ name, address, mapsUrl, phone, photoUrl }: HowToGetSectionProps) {
    const titleId = useId();
    const addressRef = useRef<HTMLParagraphElement>(null);
    const place = useMemo(() => ({ address, mapsUrl, name }), [address, mapsUrl, name]);
    const links = useMemo(() => buildDirectionLinks(place), [place]);
    const lines = splitAddress(address);

    return (
        <section className="pt-how" aria-labelledby={titleId}>
            <div className="pt-how__inner">
                <h2 id={titleId} className="pt-how__title">Como Chegar</h2>
                <div className="pt-how__card">
                    <div className="estd-map pt-how__map">
                        <iframe
                            className="estd-map__frame"
                            src={mapEmbedUrl(place)}
                            title={`Mapa: ${name}`}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                        <a className="estd-map__expand" href={mapExpandUrl(place)} target="_blank" rel="noopener noreferrer">
                            <Icon name="open_in_full" />
                            Ampliar mapa
                            <span className="ui-sr-only"> (abre em nova aba)</span>
                        </a>
                    </div>
                    <div className="estd-map-card__info">
                        <div className="estd-map-card__address">
                            <span className="estd-label">Endereço</span>
                            <p ref={addressRef} className="estd-map-card__lines">
                                {lines.map((line, i) => (
                                    <span key={i}>
                                        {line}
                                        {i < lines.length - 1 && <br />}
                                    </span>
                                ))}
                            </p>
                            <CopyAddressButton address={address} selectRef={addressRef} className="estd-copy--start" />
                        </div>
                        <div className="estd-map-card__routes">
                            <span className="estd-label">Abrir rota no</span>
                            <RouteLinks links={links} />
                        </div>
                        {phone && (
                            <p className="pt-how__phone">
                                <Icon name="call" />
                                <span>
                                    Informações: <a className="pt-link" href={telHref(phone)}>{phone}</a>
                                </span>
                            </p>
                        )}
                    </div>
                </div>
                {photoUrl && (
                    <div className="pt-how__right">
                        <img src={photoUrl} alt="" className="pt-how__img" width={800} height={600} loading="lazy" decoding="async" />
                    </div>
                )}
            </div>
        </section>
    );
}
