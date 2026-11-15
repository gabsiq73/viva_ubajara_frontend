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
import { touristSpotsService } from "../admin/services/touristSpotsService";
import type { TouristSpotResponse } from "../admin/types";
import { hasMeaningfulText, mailHref, telHref } from "../utils/establishmentDetail";
import { buildSpotGallery } from "../utils/spotPhotos";
import { truncateAtWord } from "../utils/text";
import { isNotFoundError, requireUuid, useAsyncData } from "../utils/useAsyncData";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import heroFallback from "../assets/images/capa-pagina.webp";
import "../components/ui/ui.css";
import "../components/Sections/style/Content.components.css";
import "./style/PontoTuristico.css";

function LocalView({ spot }: { spot: TouristSpotResponse }) {
    useDocumentTitle(spot.name);

    const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
    const openerRef = useRef<HTMLElement | null>(null);

    const gallery = useMemo(() => buildSpotGallery(spot.name, spot.photos), [spot.name, spot.photos]);
    const hasGallery = gallery.length >= 2;

    const heroImg = gallery[0]?.url ?? spot.photos?.[0]?.url ?? heroFallback;
    const howToGetImg = spot.photos?.find((p) => p.description === "how_to_get")?.url;
    const paragraphs = (spot.description ?? "")
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
                <section className="pt-hero" aria-labelledby="local-hero-title">
                    <img src={heroImg} alt="" className="pt-hero__bg" fetchPriority="high" decoding="async" />
                    <div className="pt-hero__overlay" aria-hidden="true" />

                    <Breadcrumb
                        prefix="pt"
                        items={[{ label: "Início", to: "/" }, { label: "Pontos Turísticos", to: "/pontos-turisticos" }, { label: spot.name }]}
                    />

                    <div className="pt-hero__content">
                        <div className="pt-hero__inner">
                            <span className="pt-hero__tag">Ponto Turístico</span>
                            <h1 id="local-hero-title" className="pt-hero__title">{spot.name}</h1>
                            {spot.description && (
                                <p className="pt-hero__subtitle">{truncateAtWord(spot.description, 160)}</p>
                            )}
                            {hasGallery && (
                                <button type="button" className="pt-hero__gallery-btn" onClick={(event) => openGallery(0, event)}>
                                    <Icon name="photo_library" />
                                    Ver {gallery.length} fotos
                                </button>
                            )}
                        </div>
                    </div>

                    {spot.active != null && (
                        <div className="pt-hero__infobar">
                            <div className="pt-hero__infobar-inner">
                                <span className={`pt-hero__info-item${spot.active ? " pt-hero__info-item--status" : " pt-hero__info-item--closed"}`}>
                                    <Icon name={spot.active ? "check_circle" : "cancel"} />
                                    {spot.active ? "Aberto ao Público" : "Temporariamente Fechado"}
                                </span>
                            </div>
                        </div>
                    )}
                </section>

                {/* ── Conteúdo + Contato ── */}
                <section className="pt-content" aria-labelledby="local-content-title">
                    <div className="pt-content__inner">

                        <div className="pt-content__left">
                            <span className="pt-content__kicker">PONTO TURÍSTICO</span>
                            <h2 id="local-content-title" className="pt-content__title">Sobre o local</h2>
                            {paragraphs.map((paragraph, i) => (
                                <p key={i} className="pt-content__p">{paragraph}</p>
                            ))}
                        </div>

                        <aside className="pt-content__right" aria-label="Informações de Contato">
                            <div className="pt-visit-card">
                                <h3 className="pt-visit-card__title">Informações</h3>
                                <ul className="pt-visit-card__list">
                                    {spot.address && (
                                        <li className="pt-visit-item">
                                            <Icon name="location_on" className="pt-visit-item__icon" />
                                            <div>
                                                <strong>Endereço</strong>
                                                <p>{spot.address}</p>
                                            </div>
                                        </li>
                                    )}
                                    {spot.phone && (
                                        <li className="pt-visit-item">
                                            <Icon name="call" className="pt-visit-item__icon" />
                                            <div>
                                                <strong>Telefone</strong>
                                                <p><a className="pt-link" href={telHref(spot.phone)}>{spot.phone}</a></p>
                                            </div>
                                        </li>
                                    )}
                                    {spot.email && (
                                        <li className="pt-visit-item">
                                            <Icon name="mail" className="pt-visit-item__icon" />
                                            <div>
                                                <strong>E-mail</strong>
                                                <p>{mailHref(spot.email) ? <a className="pt-link" href={mailHref(spot.email)}>{spot.email}</a> : spot.email}</p>
                                            </div>
                                        </li>
                                    )}
                                </ul>
                                {spot.webUrl
                                    ? <a href={spot.webUrl} target="_blank" rel="noopener noreferrer" className="pt-visit-card__cta">Saiba Mais</a>
                                    : spot.instagramUrl
                                    ? <a href={spot.instagramUrl} target="_blank" rel="noopener noreferrer" className="pt-visit-card__cta">Instagram</a>
                                    : <Link to="/contato" className="pt-visit-card__cta">Fale Conosco</Link>
                                }
                            </div>
                        </aside>
                    </div>
                </section>

                {/* ── Fotos ── */}
                {hasGallery && (
                    <section id="fotos" className="pt-photos" aria-labelledby="local-photos-title">
                        <div className="pt-photos__inner">
                            <p className="estd-eyebrow">Galeria</p>
                            <h2 id="local-photos-title" className="estd-h2">Fotos</h2>
                            <PhotoGallery title={spot.name} photos={gallery} onOpen={openGallery} />
                        </div>
                    </section>
                )}

                {/* ── Como Chegar ── */}
                {spot.address?.trim() && (
                    <HowToGetSection
                        name={spot.name}
                        address={spot.address.trim()}
                        phone={spot.phone}
                        photoUrl={howToGetImg}
                    />
                )}

            </main>
            <Footer />

            {galleryIndex !== null && (
                <PhotoLightbox
                    title={spot.name}
                    photos={gallery}
                    index={galleryIndex}
                    onIndexChange={setGalleryIndex}
                    onClose={() => setGalleryIndex(null)}
                    returnFocusRef={openerRef}
                />
            )}
        </div>
    );
}

export default function Local() {
    const { id = "" } = useParams<{ id: string }>();
    const data = useAsyncData(async () => {
        requireUuid(id);
        return touristSpotsService.getById(id);
    }, id);

    useDocumentTitle(data.status === "ready" ? null : "Ponto turístico");

    if (data.status === "loading") return <DetailStatePage kind="loading" />;
    if (data.status === "error") {
        return (
            <DetailStatePage
                kind={isNotFoundError(data.error) ? "not-found" : "error"}
                heroTitle="Ponto turístico"
                breadcrumb={[{ label: "Início", to: "/" }, { label: "Pontos Turísticos", to: "/pontos-turisticos" }]}
                noun="este local"
                backTo="/pontos-turisticos"
                backLabel="Ver todos os pontos turísticos"
                onRetry={data.retry}
            />
        );
    }
    return <LocalView key={data.data.id} spot={data.data} />;
}
