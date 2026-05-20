import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { touristSpotsService } from "../admin/services/touristSpotsService";
import type { TouristSpotResponse } from "../admin/types";
import heroFallback from "../assets/images/foto-capa-parque-ubajara.png";
import "../components/Sections/style/Content.components.css";
import "./style/PontoTuristico.css";

export default function Local() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [spot, setSpot] = useState<TouristSpotResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) { navigate("/pontos-turisticos"); return; }
        touristSpotsService.getById(id)
            .then(setSpot)
            .catch(() => navigate("/pontos-turisticos"))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="pt-page">
                <Header />
                <main className="pt-main" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                    <span className="adm-spinner adm-spinner--lg" />
                </main>
                <Footer />
            </div>
        );
    }

    if (!spot) return null;

    const heroImg = spot.photos?.[0]?.url ?? heroFallback;

    return (
        <div className="pt-page">
            <Header />
            <main className="pt-main">

                {/* ── Hero ── */}
                <section className="pt-hero" aria-labelledby="local-hero-title">
                    <img src={heroImg} alt={spot.name} className="pt-hero__bg" fetchPriority="high" decoding="async" />
                    <div className="pt-hero__overlay" aria-hidden="true" />

                    <nav className="pt-breadcrumb" aria-label="Navegação">
                        <div className="pt-breadcrumb__inner">
                            <Link to="/" className="pt-breadcrumb__link">Início</Link>
                            <span className="pt-breadcrumb__sep" aria-hidden="true">›</span>
                            <Link to="/pontos-turisticos" className="pt-breadcrumb__link">Pontos Turísticos</Link>
                            <span className="pt-breadcrumb__sep" aria-hidden="true">›</span>
                            <span className="pt-breadcrumb__current">{spot.name}</span>
                        </div>
                    </nav>

                    <div className="pt-hero__content">
                        <div className="pt-hero__inner">
                            <span className="pt-hero__tag">Ponto Turístico</span>
                            <h1 id="local-hero-title" className="pt-hero__title">{spot.name}</h1>
                            {spot.description && (
                                <p className="pt-hero__subtitle">{spot.description.slice(0, 160)}</p>
                            )}
                        </div>
                    </div>

                    {spot.active != null && (
                        <div className="pt-hero__infobar">
                            <div className="pt-hero__infobar-inner">
                                <span className={`pt-hero__info-item${spot.active ? " pt-hero__info-item--status" : " pt-hero__info-item--closed"}`}>
                                    <span className="material-symbols-outlined" aria-hidden="true">
                                        {spot.active ? "check_circle" : "cancel"}
                                    </span>
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
                                <img src={spot.photos[0].url} alt={spot.name} />
                            </div>
                            {spot.photos.length > 1 && (
                                <div className="pt-gallery__secondary">
                                    {spot.photos.slice(1, 3).map((ph, i) => (
                                        <div key={ph.id} className="pt-gallery__thumb">
                                            <img src={ph.url} alt={`${spot.name} — foto ${i + 2}`} aria-hidden="true" />
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
                                            <span className="material-symbols-outlined pt-visit-item__icon" aria-hidden="true">location_on</span>
                                            <div>
                                                <strong>Endereço</strong>
                                                <p>{spot.address}</p>
                                            </div>
                                        </li>
                                    )}
                                    {spot.phone && (
                                        <li className="pt-visit-item">
                                            <span className="material-symbols-outlined pt-visit-item__icon" aria-hidden="true">call</span>
                                            <div>
                                                <strong>Telefone</strong>
                                                <p>{spot.phone}</p>
                                            </div>
                                        </li>
                                    )}
                                    {spot.email && (
                                        <li className="pt-visit-item">
                                            <span className="material-symbols-outlined pt-visit-item__icon" aria-hidden="true">mail</span>
                                            <div>
                                                <strong>E-mail</strong>
                                                <p>{spot.email}</p>
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
                                            <span className="material-symbols-outlined" aria-hidden="true">call</span>
                                            Informações: {spot.phone}
                                        </li>
                                    </ul>
                                )}
                                <a
                                    href={`https://maps.google.com/maps?q=${encodeURIComponent(spot.address)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="pt-how__maps-btn"
                                >
                                    <span className="material-symbols-outlined" aria-hidden="true">map</span>
                                    Abrir no Google Maps
                                </a>
                            </div>
                            <div className="pt-how__right">
                                <img src={heroImg} alt={spot.name} className="pt-how__img" />
                            </div>
                        </div>
                    </section>
                )}

            </main>
            <Footer />
        </div>
    );
}
