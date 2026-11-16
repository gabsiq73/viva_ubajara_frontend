import { useRef, type MouseEvent } from "react";
import Icon from "../ui/Icon";
import { Button } from "../ui/Button";
import CopyAddressButton from "./CopyAddressButton";
import RouteLinks from "./RouteLinks";
import { mapEmbedUrl, mapExpandUrl, splitAddress, type RouteLink } from "../../utils/directions";
import type { EstablishmentDetail } from "../../utils/establishmentDetail";
import "./establishment-detail.css";

interface DirectionsSectionProps {
    detail: EstablishmentDetail;
    links: RouteLink[];
    isMobile: boolean;
    onOpenSheet: (event: MouseEvent<HTMLElement>) => void;
}

export default function DirectionsSection({ detail, links, isMobile, onOpenSheet }: DirectionsSectionProps) {
    const addressRef = useRef<HTMLParagraphElement>(null);
    const place = { address: detail.address, mapsUrl: detail.mapsUrl, name: detail.name };
    const lines = splitAddress(detail.address);

    const map = (
        <iframe
            className="estd-map__frame"
            src={mapEmbedUrl(place)}
            title={`Mapa: ${detail.name}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
        />
    );

    if (isMobile) {
        return (
            <section id="como-chegar" className="estd-section estd-directions" aria-labelledby="estd-directions-title">
                <h2 id="estd-directions-title" className="estd-h2 estd-h2--sm">
                    Como chegar
                </h2>
                <div className="estd-map estd-map--mini">{map}</div>
                <p ref={addressRef} className="estd-directions__address">
                    {detail.address}
                </p>
                <div className="estd-directions__actions">
                    <CopyAddressButton address={detail.address} selectRef={addressRef} shortLabel />
                    <Button variant="outline" icon="directions" onClick={onOpenSheet}>
                        Abrir rota
                    </Button>
                </div>
            </section>
        );
    }

    return (
        <section id="como-chegar" className="estd-section estd-directions" aria-labelledby="estd-directions-title">
            <div className="estd-directions__head">
                <h2 id="estd-directions-title" className="estd-h2">
                    Como chegar
                </h2>
                <p className="estd-directions__lead">Escolha seu app de rotas. O sinal na serra oscila: copie o endereço antes de sair.</p>
            </div>
            <div className="estd-map-card">
                <div className="estd-map">
                    {map}
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
                        <CopyAddressButton address={detail.address} selectRef={addressRef} className="estd-copy--start" />
                    </div>
                    <div className="estd-map-card__routes">
                        <span className="estd-label">
                            Abrir rota no
                        </span>
                        <RouteLinks links={links} />
                    </div>
                </div>
            </div>
        </section>
    );
}
