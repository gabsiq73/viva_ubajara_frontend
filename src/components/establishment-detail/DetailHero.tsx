import { useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import Icon from "../ui/Icon";
import { roomsLabel, shortPrice } from "../../utils/establishments";
import { formatRating, reviewsLabel } from "../../utils/rating";
import type { EstablishmentDetail } from "../../utils/establishmentDetail";
import "./establishment-detail.css";

interface DetailHeroProps {
    detail: EstablishmentDetail;
    onOpenGallery: (event: MouseEvent<HTMLElement>) => void;
    onShare: () => void;
    onGoToReviews: () => void;
}

export default function DetailHero({ detail, onOpenGallery, onShare, onGoToReviews }: DetailHeroProps) {
    const photo = detail.photos[0]?.url;
    const [imageLoaded, setImageLoaded] = useState(false);
    const photoCount = detail.photos.length;
    const eyebrow = [detail.type, detail.type === "Restaurante" ? detail.cuisine : roomsLabel(detail.numOfRooms)]
        .filter(Boolean)
        .join(" · ");
    const price = shortPrice(detail.avgPrice);
    const rating = detail.rating !== null ? formatRating(detail.rating) : "";
    const spoken = `${rating.replace(",0", "")} de 5 estrelas${detail.reviewCount > 0 ? `, ${reviewsLabel(detail.reviewCount)}` : ""}`;

    return (
        <section className={`estd-hero${photo ? "" : " estd-hero--plain"}`}>
            {photo ? (
                <>
                    <img
                        src={photo}
                        alt=""
                        className={`ui-hero__img ui-hero__img--fade${imageLoaded ? " is-loaded" : ""}`}
                        fetchPriority="high"
                        ref={(el) => {
                            if (el?.complete) setImageLoaded(true);
                        }}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageLoaded(true)}
                    />
                    <div className="ui-hero__shade" />
                </>
            ) : (
                <>
                    <span className="ui-hero__ring ui-hero__ring--outer" aria-hidden="true" />
                    <span className="ui-hero__ring ui-hero__ring--inner" aria-hidden="true" />
                </>
            )}

            <div className="ui-container estd-hero__container">
                <div className="estd-hero__content">
                    <nav className="ui-hero__crumbs" aria-label="Você está em">
                        <span className="ui-hero__crumb">
                            <Link to="/">Início</Link>
                        </span>
                        <span className="ui-hero__crumb">
                            <Icon name="chevron_right" />
                            <Link to="/estabelecimentos">Estabelecimentos</Link>
                        </span>
                        <span className="ui-hero__crumb">
                            <Icon name="chevron_right" />
                            <span aria-current="page">{detail.name}</span>
                        </span>
                    </nav>
                    {eyebrow && <span className="ui-hero__eyebrow">{eyebrow}</span>}
                    <h1 className="estd-hero__title">{detail.name}</h1>
                    {(price || detail.neighborhood || rating) && (
                        <ul className="estd-hero__pills">
                            {rating && (
                                <li className="estd-pill estd-pill--link">
                                    <a
                                        href="#avaliacoes"
                                        className="estd-pill__link"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            onGoToReviews();
                                        }}
                                    >
                                        <Icon name="star" filled className="estd-pill__star" />
                                        <span aria-hidden="true">
                                            {rating}
                                            {detail.reviewCount > 0 && ` (${detail.reviewCount})`}
                                        </span>
                                        <span className="ui-sr-only">{spoken}. Ir para as avaliações</span>
                                    </a>
                                </li>
                            )}
                            {price && <li className="estd-pill">{price}</li>}
                            {detail.neighborhood && (
                                <li className="estd-pill">
                                    <Icon name="location_on" />
                                    {detail.neighborhood}
                                </li>
                            )}
                        </ul>
                    )}
                </div>

                {photoCount > 1 && (
                    <button type="button" className="estd-hero__gallery" onClick={onOpenGallery}>
                        <Icon name="photo_library" />
                        Ver {photoCount} fotos
                    </button>
                )}
            </div>

            <div className="estd-hero__tools">
                {photoCount > 1 && (
                    <button type="button" className="estd-hero__counter" onClick={onOpenGallery} aria-label={`Ver as ${photoCount} fotos`}>
                        <Icon name="photo_library" />1/{photoCount}
                    </button>
                )}
                <button type="button" className="estd-hero__share" onClick={onShare} aria-label="Compartilhar">
                    <Icon name="ios_share" />
                </button>
            </div>
        </section>
    );
}
