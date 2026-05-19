import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { attractionsService } from "../admin/services/attractionsService";
import type { AttractionResponse, AttractionCategory } from "../admin/types";
import heroFallback from "../assets/images/foto-capa-parque-ubajara.png";
import "../components/Sections/style/Content.components.css";
import "./style/PontoTuristico.css";

const CATEGORY_LABELS: Record<AttractionCategory, string> = {
    PARK: "Parque", WATERFALL: "Cachoeira", MUSEUM: "Museu",
    FARM: "Fazenda", ROUTE: "Rota", MARKET: "Mercado",
};

export default function PontoTuristico() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [attraction, setAttraction] = useState<AttractionResponse | null>(null);
    const [related, setRelated] = useState<AttractionResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) { navigate("/pontos-turisticos"); return; }
        Promise.allSettled([
            attractionsService.getById(id),
            attractionsService.getAll(0, 10, true),
        ]).then(([attrResult, allResult]) => {
            if (attrResult.status === "fulfilled") {
                setAttraction(attrResult.value);
                if (allResult.status === "fulfilled") {
                    setRelated(allResult.value.content.filter(a => a.id !== id).slice(0, 3));
                }
            } else {
                navigate("/pontos-turisticos");
            }
        }).finally(() => setLoading(false));
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

    if (!attraction) return null;

    const heroImg = attraction.photos?.[0]?.url ?? heroFallback;
    const catLabel = CATEGORY_LABELS[attraction.category] ?? attraction.category;

    return (
        <div className="pt-page">
            <Header />
            <main className="pt-main">

                {/* ── Hero ── */}
                <section className="pt-hero" aria-labelledby="pt-hero-title">
                    <img src={heroImg} alt={attraction.name} className="pt-hero__bg" fetchPriority="high" decoding="async" />
                    <div className="pt-hero__overlay" aria-hidden="true" />

                    <nav className="pt-breadcrumb" aria-label="Navegação">
                        <div className="pt-breadcrumb__inner">
                            <Link to="/" className="pt-breadcrumb__link">Início</Link>
                            <span className="pt-breadcrumb__sep" aria-hidden="true">›</span>
                            <Link to="/pontos-turisticos" className="pt-breadcrumb__link">Pontos Turísticos</Link>
                            <span className="pt-breadcrumb__sep" aria-hidden="true">›</span>
                            <span className="pt-breadcrumb__current">{attraction.name}</span>
                        </div>
                    </nav>

                    <div className="pt-hero__content">
                        <div className="pt-hero__inner">
                            <span className="pt-hero__tag">{catLabel}</span>
                            <h1 id="pt-hero-title" className="pt-hero__title">{attraction.name}</h1>
                            {(attraction.shortDescription || attraction.description) && (
                                <p className="pt-hero__subtitle">
                                    {attraction.shortDescription || attraction.description}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="pt-hero__infobar">
                        <div className="pt-hero__infobar-inner">
                            {attraction.openToPublic != null && (
                                <span className={`pt-hero__info-item${attraction.openToPublic ? " pt-hero__info-item--status" : " pt-hero__info-item--closed"}`}>
                                    <span className="material-symbols-outlined" aria-hidden="true">
                                        {attraction.openToPublic ? "check_circle" : "cancel"}
                                    </span>
                                    {attraction.openToPublic ? "Aberto ao Público" : "Temporariamente Fechado"}
                                </span>
                            )}
                            {attraction.openingHours && (
                                <>
                                    {attraction.openToPublic != null && <span className="pt-hero__info-sep" aria-hidden="true">|</span>}
                                    <span className="pt-hero__info-item">
                                        <span className="material-symbols-outlined" aria-hidden="true">schedule</span>
                                        {attraction.openingHours}
                                    </span>
                                </>
                            )}
                            {attraction.entryPrice != null && (
                                <>
                                    <span className="pt-hero__info-sep" aria-hidden="true">|</span>
                                    <span className="pt-hero__info-item">
                                        <span className="material-symbols-outlined" aria-hidden="true">payments</span>
                                        {attraction.entryPrice === 0 ? "Entrada Gratuita" : `R$ ${attraction.entryPrice.toFixed(2)}`}
                                    </span>
                                </>
                            )}
                            {attraction.freeAccess && (
                                <>
                                    <span className="pt-hero__info-sep" aria-hidden="true">|</span>
                                    <span className="pt-hero__info-item pt-hero__info-item--status">
                                        <span className="material-symbols-outlined" aria-hidden="true">lock_open</span>
                                        Acesso Livre
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── Galeria ── */}
                {attraction.photos && attraction.photos.length > 0 && (
                    <section className="pt-gallery" aria-label="Galeria de fotos">
                        <div className="pt-gallery__inner">
                            <div className="pt-gallery__main">
                                <img src={attraction.photos[0].url} alt={attraction.name} />
                            </div>
                            {attraction.photos.length > 1 && (
                                <div className="pt-gallery__secondary">
                                    {attraction.photos.slice(1, 3).map((ph, i) => (
                                        <div key={ph.id} className="pt-gallery__thumb">
                                            <img src={ph.url} alt={`${attraction.name} — foto ${i + 2}`} aria-hidden="true" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* ── Conteúdo + Planeje sua Visita ── */}
                <section className="pt-content" aria-labelledby="pt-content-title">
                    <div className="pt-content__inner">

                        <div className="pt-content__left">
                            <span className="pt-content__kicker">{catLabel.toUpperCase()}</span>
                            <h2 id="pt-content-title" className="pt-content__title">{attraction.name}</h2>
                            <p className="pt-content__p">{attraction.description}</p>
                            <div className="pt-content__stats">
                                {attraction.entryPrice != null && (
                                    <div className="pt-stat-pill">
                                        <span className="material-symbols-outlined pt-stat-pill__icon" aria-hidden="true">payments</span>
                                        <div>
                                            <span className="pt-stat-pill__lbl">Entrada</span>
                                            <span className="pt-stat-pill__val">
                                                {attraction.entryPrice === 0 ? "Gratuita" : `R$ ${attraction.entryPrice.toFixed(2)}`}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {attraction.averageVisitDuration != null && (
                                    <div className="pt-stat-pill">
                                        <span className="material-symbols-outlined pt-stat-pill__icon" aria-hidden="true">schedule</span>
                                        <div>
                                            <span className="pt-stat-pill__lbl">Duração média</span>
                                            <span className="pt-stat-pill__val">{attraction.averageVisitDuration} min</span>
                                        </div>
                                    </div>
                                )}
                                <div className="pt-stat-pill">
                                    <span className="material-symbols-outlined pt-stat-pill__icon" aria-hidden="true">category</span>
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
                                            <span className="material-symbols-outlined pt-visit-item__icon" aria-hidden="true">hiking</span>
                                            <div>
                                                <strong>{attraction.hasGuide ? "Guia Disponível" : "Acesso Livre"}</strong>
                                                <p>{attraction.hasGuide ? "Visite com um condutor credenciado pelo ICMBio" : "Trilha de acesso livre ao público"}</p>
                                            </div>
                                        </li>
                                    )}
                                    {attraction.openingHours && (
                                        <li className="pt-visit-item">
                                            <span className="material-symbols-outlined pt-visit-item__icon" aria-hidden="true">schedule</span>
                                            <div>
                                                <strong>{attraction.openingHours}</strong>
                                                <p>Horário de Funcionamento</p>
                                            </div>
                                        </li>
                                    )}
                                    <li className="pt-visit-item">
                                        <span className="material-symbols-outlined pt-visit-item__icon" aria-hidden="true">backpack</span>
                                        <div>
                                            <strong>Itens Recomendados</strong>
                                            <p>Água, protetor solar e calçado adequado para trilhas</p>
                                        </div>
                                    </li>
                                    {attraction.address && (
                                        <li className="pt-visit-item">
                                            <span className="material-symbols-outlined pt-visit-item__icon" aria-hidden="true">location_on</span>
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

                {/* ── Como Chegar ── */}
                {attraction.address && (
                    <section className="pt-how" aria-labelledby="pt-how-title">
                        <div className="pt-how__inner">
                            <div className="pt-how__left">
                                <h2 id="pt-how-title" className="pt-how__title">Como Chegar</h2>
                                <p className="pt-how__desc">
                                    Localizado em {attraction.address}. O acesso pode ser feito de carro ou ônibus a partir do centro de Ubajara.
                                </p>
                                <ul className="pt-how__routes">
                                    <li className="pt-how__route-item">
                                        <span className="material-symbols-outlined" aria-hidden="true">directions_car</span>
                                        De carro — siga as indicações para {attraction.name}
                                    </li>
                                    {attraction.phone && (
                                        <li className="pt-how__route-item">
                                            <span className="material-symbols-outlined" aria-hidden="true">call</span>
                                            Informações: {attraction.phone}
                                        </li>
                                    )}
                                </ul>
                                <a
                                    href={attraction.mapsUrl || `https://maps.google.com/maps?q=${encodeURIComponent(attraction.address)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="pt-how__maps-btn"
                                >
                                    <span className="material-symbols-outlined" aria-hidden="true">map</span>
                                    Abrir no Google Maps
                                </a>
                            </div>
                            <div className="pt-how__right">
                                <img src={heroImg} alt={attraction.name} className="pt-how__img" />
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Pontos Recomendados ── */}
                {related.length > 0 && (
                    <section className="pt-related" aria-labelledby="pt-related-title">
                        <div className="pt-related__inner">
                            <h2 id="pt-related-title" className="pt-related__title">Pontos Recomendados</h2>
                            <p className="pt-related__subtitle">Continue explorando o Parque Nacional de Ubajara</p>
                            <div className="cards-points pt-related__grid">
                                <ul>
                                    {related.map((pt) => (
                                        <li key={pt.id}>
                                            <Link to={`/pontos/${pt.id}`} className="point-card__link" aria-label={`Ver detalhes de ${pt.name}`}>
                                                {pt.photos?.[0]?.url
                                                    ? <img src={pt.photos[0].url} alt={pt.name} className="point-card__img" loading="lazy" />
                                                    : <div className="point-card__img point-card__img--placeholder" aria-hidden="true" />
                                                }
                                                <div className="point-card__gradient" />
                                                <span className="point-card__tag" aria-hidden="true">{CATEGORY_LABELS[pt.category] ?? pt.category}</span>
                                                <div className="point-card__body">
                                                    <h3 className="point-card__title">{pt.name}</h3>
                                                    <p className="point-card__desc">{pt.shortDescription ?? pt.description}</p>
                                                    {pt.averageVisitDuration != null && (
                                                        <div className="point-card__meta">
                                                            <span className="point-card__meta-item">
                                                                <span className="material-symbols-outlined" aria-hidden="true">schedule</span>
                                                                {pt.averageVisitDuration} min
                                                            </span>
                                                        </div>
                                                    )}
                                                    <span className="point-card__cta" aria-hidden="true">
                                                        <span className="material-symbols-outlined" aria-hidden="true">visibility</span>
                                                        Saiba mais
                                                    </span>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="pt-related__footer">
                                <Link to="/pontos-turisticos" className="pt-related__all">
                                    Ver todos os pontos turísticos
                                    <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

            </main>
            <Footer />
        </div>
    );
}
