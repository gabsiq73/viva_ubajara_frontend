import { useParams, Link } from "react-router-dom";
import { useMemo, useRef, useState, type MouseEvent } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Icon from "../components/ui/Icon";
import PhotoGallery from "../components/ui/PhotoGallery";
import HowToGetSection from "../components/ui/HowToGetSection";
import PhotoLightbox from "../components/establishment-detail/PhotoLightbox";
import Breadcrumb from "./Breadcrumb";
import { DetailStatePage } from "./PageState";
import { attractionsService } from "../admin/services/attractionsService";
import type { AttractionResponse } from "../admin/types";
import ReviewsSection from "../components/reviews/ReviewsSection";
import PointCard from "../components/ui/PointCard";
import { ATTRACTION_CATEGORY_LABELS as CATEGORY_LABELS } from "../utils/attractionCategories";
import { formatRating, reviewsLabel } from "../utils/rating";
import { hasMeaningfulText } from "../utils/establishmentDetail";
import { loadFavorites, toggleFavorite } from "../utils/favorites";
import { useActivationPop } from "../hooks/useActivationPop";
import { buildSpotGallery } from "../utils/spotPhotos";
import { isNotFoundError, requireUuid, useAsyncData } from "../utils/useAsyncData";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import heroFallback from "../assets/images/capa-pagina.webp";
import "../components/ui/ui.css";
import "../components/Sections/style/Content.components.css";
import "./style/PontoTuristico.css";

function reduceMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function PontoTuristicoView({ attraction, related }: { attraction: AttractionResponse; related: AttractionResponse[] }) {
    useDocumentTitle(attraction.name);
    const [isFavorite, setIsFavorite] = useState(() => loadFavorites().some((f) => f.id === attraction.id));
    const favPop = useActivationPop(isFavorite);

    const handleToggleFavorite = () => {
        setIsFavorite(toggleFavorite({
            id: attraction.id,
            name: attraction.name,
            type: "attraction",
            photo: attraction.photos?.[0]?.url,
            shortDescription: attraction.shortDescription || attraction.description?.slice(0, 100),
            path: `/pontos/${attraction.id}`,
        }));
    };

    const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
    const openerRef = useRef<HTMLElement | null>(null);

    const gallery = useMemo(() => buildSpotGallery(attraction.name, attraction.photos), [attraction.name, attraction.photos]);
    const hasGallery = gallery.length >= 2;

    const heroImg = gallery[0]?.url ?? attraction.photos?.[0]?.url ?? heroFallback;
    const howToGetImg = attraction.photos?.find((p) => p.description === "how_to_get")?.url;
    const catLabel = CATEGORY_LABELS[attraction.category] ?? attraction.category;
    const reviewCount = attraction.reviewCount ?? 0;
    const hasRating = reviewCount > 0 && attraction.averageRating != null;
    const paragraphs = (attraction.description ?? "")
        .split(/\r?\n+/)
        .map((p) => p.trim())
        .filter(hasMeaningfulText);

    function openGallery(index: number, event: MouseEvent<HTMLElement>) {
        openerRef.current = event.currentTarget;
        setGalleryIndex(index);
    }

    return (
        <div className="pt-page">
            <Header />
            <main className="pt-main" id="conteudo" tabIndex={-1}>

                {/* ── Hero ── */}
                <section className="pt-hero" aria-labelledby="pt-hero-title">
                    <img src={heroImg} alt="" className="pt-hero__bg" fetchPriority="high" decoding="async" />
                    <div className="pt-hero__overlay" aria-hidden="true" />

                    <Breadcrumb
                        prefix="pt"
                        items={[{ label: "Início", to: "/" }, { label: "Pontos Turísticos", to: "/pontos-turisticos" }, { label: attraction.name }]}
                    />

                    <div className="pt-hero__content">
                        <div className="pt-hero__inner">
                            <span className="pt-hero__tag">{catLabel}</span>
                            <div className="pt-hero__title-row">
                                <h1 id="pt-hero-title" className="pt-hero__title">{attraction.name}</h1>
                                <button
                                    className={`pt-hero__fav-btn${isFavorite ? " pt-hero__fav-btn--active" : ""}${favPop.popping ? " pt-hero__fav-btn--pop is-popping" : ""}`}
                                    onAnimationEnd={favPop.onAnimationEnd}
                                    onClick={handleToggleFavorite}
                                    aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                                    title={isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
                                >
                                    <Icon name={isFavorite ? "favorite" : "favorite_border"} />
                                </button>
                            </div>
                            {(attraction.shortDescription || attraction.description) && (
                                <p className="pt-hero__subtitle">
                                    {attraction.shortDescription || attraction.description}
                                </p>
                            )}
                            {hasGallery && (
                                <button type="button" className="pt-hero__gallery-btn" onClick={(event) => openGallery(0, event)}>
                                    <Icon name="photo_library" />
                                    Ver {gallery.length} fotos
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="pt-hero__infobar">
                        <div className="pt-hero__infobar-inner">
                            {attraction.openToPublic != null && (
                                <span className={`pt-hero__info-item${attraction.openToPublic ? " pt-hero__info-item--status" : " pt-hero__info-item--closed"}`}>
                                    <Icon name={attraction.openToPublic ? "check_circle" : "cancel"} />
                                    {attraction.openToPublic ? "Aberto ao Público" : "Temporariamente Fechado"}
                                </span>
                            )}
                            {hasRating && (
                                <>
                                    {attraction.openToPublic != null && <span className="pt-hero__info-sep" aria-hidden="true">|</span>}
                                    <a
                                        href="#avaliacoes"
                                        className="pt-hero__info-item pt-hero__info-item--link"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            document.getElementById("avaliacoes")?.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
                                        }}
                                    >
                                        <Icon name="star" filled className="pt-hero__info-star" />
                                        <span aria-hidden="true">{formatRating(attraction.averageRating!)} ({reviewCount})</span>
                                        <span className="ui-sr-only">Nota {formatRating(attraction.averageRating!)} de 5, {reviewsLabel(reviewCount)}. Ir para as avaliações</span>
                                    </a>
                                </>
                            )}
                            {attraction.openingHours && (
                                <>
                                    {(attraction.openToPublic != null || hasRating) && <span className="pt-hero__info-sep" aria-hidden="true">|</span>}
                                    <span className="pt-hero__info-item">
                                        <Icon name="schedule" />
                                        {attraction.openingHours}
                                    </span>
                                </>
                            )}
                            {attraction.entryPrice != null && (
                                <>
                                    <span className="pt-hero__info-sep" aria-hidden="true">|</span>
                                    <span className="pt-hero__info-item">
                                        <Icon name="payments" />
                                        {attraction.entryPrice}
                                    </span>
                                </>
                            )}
                            {attraction.freeAccess && (
                                <>
                                    <span className="pt-hero__info-sep" aria-hidden="true">|</span>
                                    <span className="pt-hero__info-item pt-hero__info-item--status">
                                        <Icon name="lock_open" />
                                        Acesso Livre
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── Conteúdo + Planeje sua Visita ── */}
                <section className="pt-content" aria-labelledby="pt-content-title">
                    <div className="pt-content__inner">

                        <div className="pt-content__left">
                            <span className="pt-content__kicker">{catLabel.toUpperCase()}</span>
                            <h2 id="pt-content-title" className="pt-content__title">Sobre o local</h2>
                            {paragraphs.map((paragraph, i) => (
                                <p key={i} className="pt-content__p">{paragraph}</p>
                            ))}
                            <div className="pt-content__stats">
                                {attraction.entryPrice != null && (
                                    <div className="pt-stat-pill">
                                        <Icon name="payments" className="pt-stat-pill__icon" />
                                        <div>
                                            <span className="pt-stat-pill__lbl">Entrada</span>
                                            <span className="pt-stat-pill__val">
                                                {attraction.entryPrice}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {attraction.averageVisitDuration != null && (
                                    <div className="pt-stat-pill">
                                        <Icon name="schedule" className="pt-stat-pill__icon" />
                                        <div>
                                            <span className="pt-stat-pill__lbl">Duração média</span>
                                            <span className="pt-stat-pill__val">{attraction.averageVisitDuration}&nbsp;min</span>
                                        </div>
                                    </div>
                                )}
                                <div className="pt-stat-pill">
                                    <Icon name="category" className="pt-stat-pill__icon" />
                                    <div>
                                        <span className="pt-stat-pill__lbl">Categoria</span>
                                        <span className="pt-stat-pill__val">{catLabel}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <aside className="pt-content__right" aria-label="Planeje sua Visita">
                            <div className="pt-visit-card">
                                <h3 className="pt-visit-card__title">Planeje sua Visita</h3>
                                <ul className="pt-visit-card__list">
                                    {attraction.hasGuide != null && (
                                        <li className="pt-visit-item">
                                            <Icon name="hiking" className="pt-visit-item__icon" />
                                            <div>
                                                <strong>{attraction.hasGuide ? "Guia Disponível" : "Acesso Livre"}</strong>
                                                <p>{attraction.hasGuide ? "Visite com um condutor credenciado pelo ICMBio" : "Trilha de acesso livre ao público"}</p>
                                            </div>
                                        </li>
                                    )}
                                    {attraction.openingHours && (
                                        <li className="pt-visit-item">
                                            <Icon name="schedule" className="pt-visit-item__icon" />
                                            <div>
                                                <strong>{attraction.openingHours}</strong>
                                                <p>Horário de Funcionamento</p>
                                            </div>
                                        </li>
                                    )}
                                    <li className="pt-visit-item">
                                        <Icon name="backpack" className="pt-visit-item__icon" />
                                        <div>
                                            <strong>Itens Recomendados</strong>
                                            <p>Água, protetor solar e calçado adequado para trilhas</p>
                                        </div>
                                    </li>
                                    {attraction.address && (
                                        <li className="pt-visit-item">
                                            <Icon name="location_on" className="pt-visit-item__icon" />
                                            <div>
                                                <strong>Endereço</strong>
                                                <p>{attraction.address}</p>
                                            </div>
                                        </li>
                                    )}
                                </ul>
                                {attraction.webUrl
                                    ? <a href={attraction.webUrl} target="_blank" rel="noopener noreferrer" className="pt-visit-card__cta">Saiba Mais</a>
                                    : <Link to="/contato" className="pt-visit-card__cta">Agendar com Guia</Link>
                                }
                            </div>
                        </aside>
                    </div>
                </section>

                {/* ── Fotos ── */}
                {hasGallery && (
                    <section id="fotos" className="pt-photos" aria-labelledby="pt-photos-title">
                        <div className="pt-photos__inner">
                            <p className="estd-eyebrow">Galeria</p>
                            <h2 id="pt-photos-title" className="estd-h2">Fotos</h2>
                            <PhotoGallery title={attraction.name} photos={gallery} onOpen={openGallery} />
                        </div>
                    </section>
                )}

                {/* ── Como Chegar ── */}
                {attraction.address?.trim() && (
                    <HowToGetSection
                        name={attraction.name}
                        address={attraction.address.trim()}
                        mapsUrl={attraction.mapsUrl}
                        phone={attraction.phone}
                        photoUrl={howToGetImg}
                    />
                )}

                {/* ── Avaliações ── */}
                <ReviewsSection spotId={attraction.id} spotName={attraction.name} className="rv--page" />

                {/* ── Pontos Turísticos Vinculados ── */}
                {attraction.linkedSpots && attraction.linkedSpots.length > 0 && (
                    <section className="pt-related" aria-labelledby="pt-linked-title">
                        <div className="pt-related__inner">
                            <h2 id="pt-linked-title" className="pt-related__title">Pontos Turísticos Vinculados</h2>
                            <p className="pt-related__subtitle">Locais que fazem parte desta atração</p>
                            <ul className="pt-linked">
                                {attraction.linkedSpots.map((spot) => (
                                    <li key={spot.id}>
                                        <Link to={`/local/${spot.id}`} className="pt-linked__link">
                                            <Icon name="location_on" className="pt-linked__pin" />
                                            {spot.name}
                                            <Icon name="arrow_forward" className="pt-linked__arrow" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                )}

                {/* ── Pontos Recomendados ── */}
                {related.length > 0 && (
                    <section className="pt-related" aria-labelledby="pt-related-title">
                        <div className="pt-related__inner">
                            <h2 id="pt-related-title" className="pt-related__title">Pontos Recomendados</h2>
                            <p className="pt-related__subtitle">Continue explorando o Parque Nacional de Ubajara</p>
                            <ul className="ui-point-grid ui-point-grid--3">
                                {related.map((pt) => (
                                    <li key={pt.id}><PointCard item={pt} /></li>
                                ))}
                            </ul>
                            <div className="pt-related__footer">
                                <Link to="/pontos-turisticos" className="pt-related__all">
                                    Ver todos os pontos turísticos
                                    <Icon name="arrow_forward" />
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

            </main>
            <Footer />

            <PhotoLightbox
                title={attraction.name}
                photos={gallery}
                index={galleryIndex}
                onIndexChange={setGalleryIndex}
                onClose={() => setGalleryIndex(null)}
                returnFocusRef={openerRef}
            />
        </div>
    );
}

export default function PontoTuristico() {
    const { id = "" } = useParams<{ id: string }>();
    const data = useAsyncData(async () => {
        requireUuid(id);
        const related = attractionsService
            .getAll(0, 10, true)
            .then((page) => page.content.filter((a) => a.id !== id).slice(0, 3))
            .catch((): AttractionResponse[] => []);
        return { attraction: await attractionsService.getById(id), related: await related };
    }, id);

    useDocumentTitle(data.status === "ready" ? null : "Ponto turístico");

    if (data.status === "loading") return <DetailStatePage kind="loading" />;
    if (data.status === "error") {
        return (
            <DetailStatePage
                kind={isNotFoundError(data.error) ? "not-found" : "error"}
                heroTitle="Ponto turístico"
                breadcrumb={[{ label: "Início", to: "/" }, { label: "Pontos Turísticos", to: "/pontos-turisticos" }]}
                noun="este ponto turístico"
                backTo="/pontos-turisticos"
                backLabel="Ver todos os pontos turísticos"
                onRetry={data.retry}
            />
        );
    }
    return <PontoTuristicoView key={data.data.attraction.id} attraction={data.data.attraction} related={data.data.related} />;
}
