import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Icon from "../components/ui/Icon";
import Breadcrumb from "./Breadcrumb";
import { DetailStatePage } from "./PageState";
import { touristSpotsService } from "../admin/services/touristSpotsService";
import type { TouristSpotResponse } from "../admin/types";
import { mailHref, telHref } from "../utils/establishmentDetail";
import { truncateAtWord } from "../utils/text";
import { isNotFoundError, requireUuid, useAsyncData } from "../utils/useAsyncData";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import heroFallback from "../assets/images/foto-capa-parque-ubajara.png";
import "../components/ui/ui.css";
import "../components/Sections/style/Content.components.css";
import "./style/PontoTuristico.css";

function LocalView({ spot }: { spot: TouristSpotResponse }) {
    useDocumentTitle(spot.name);

    const heroImg = spot.photos?.[0]?.url ?? heroFallback;

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

                {/* ── Galeria ── */}
                {spot.photos && spot.photos.length > 0 && (
                    <section className="pt-gallery" aria-label="Galeria de fotos">
                        <div className="pt-gallery__inner">
                            <div className="pt-gallery__main">
                                <img src={spot.photos[0].url} alt={spot.name} width={1280} height={720} loading="lazy" decoding="async" />
                            </div>
                            {spot.photos.length > 1 && (
                                <div className="pt-gallery__secondary">
                                    {spot.photos.slice(1, 3).map((ph) => (
                                        <div key={ph.id} className="pt-gallery__thumb">
                                            <img src={ph.url} alt="" width={800} height={600} loading="lazy" decoding="async" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* ── Conteúdo + Contato ── */}
                <section className="pt-content" aria-labelledby="local-content-title">
                    <div className="pt-content__inner">

                        <div className="pt-content__left">
                            <span className="pt-content__kicker">PONTO TURÍSTICO</span>
                            <h2 id="local-content-title" className="pt-content__title">{spot.name}</h2>
                            <p className="pt-content__p">{spot.description}</p>
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

                {/* ── Como Chegar ── */}
                {spot.address && (
                    <section className="pt-how" aria-labelledby="local-how-title">
                        <div className="pt-how__inner">
                            <div className="pt-how__left">
                                <h2 id="local-how-title" className="pt-how__title">Como Chegar</h2>
                                <p className="pt-how__desc">
                                    Localizado em {spot.address}.
                                </p>
                                {spot.phone && (
                                    <ul className="pt-how__routes">
                                        <li className="pt-how__route-item">
                                            <Icon name="call" />
                                            Informações: <a className="pt-link" href={telHref(spot.phone)}>{spot.phone}</a>
                                        </li>
                                    </ul>
                                )}
                                <a
                                    href={`https://maps.google.com/maps?q=${encodeURIComponent(spot.address)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="pt-how__maps-btn"
                                >
                                    <Icon name="map" />
                                    Abrir no Google Maps
                                </a>
                            </div>
                            <div className="pt-how__right">
                                <img src={heroImg} alt="" className="pt-how__img" width={800} height={600} loading="lazy" decoding="async" />
                            </div>
                        </div>
                    </section>
                )}

            </main>
            <Footer />
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
