import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { TOURIST_POINTS } from "../data/touristPoints";
import "./style/PontoTuristico.css";

export default function PontoTuristico() {
    const { id } = useParams<{ id: string }>();
    const point = TOURIST_POINTS.find((p) => p.id === Number(id)) ?? TOURIST_POINTS[0];

    return (
        <div className="pt-page">
            <Header />

            <main className="pt-main">

                {/* ── Hero ── */}
                <section className="pt-hero" aria-labelledby="pt-hero-title">
                    <img src={point.img} alt={point.alt} className="pt-hero__bg" />
                    <div className="pt-hero__overlay" aria-hidden="true" />

                    <div className="pt-hero__content">
                        <div className="pt-hero__inner">
                            <span className="pt-hero__tag">{point.heroTag}</span>
                            <h1 id="pt-hero-title" className="pt-hero__title">{point.heroTitle}</h1>
                            <p className="pt-hero__subtitle">{point.heroSubtitle}</p>
                        </div>
                    </div>

                    <div className="pt-hero__infobar">
                        <div className="pt-hero__infobar-inner">
                            <span className="pt-hero__info-item">
                                <span className="material-symbols-outlined" aria-hidden="true">thermostat</span>
                                {point.infoBar.temp}
                            </span>
                            <span className="pt-hero__info-sep" aria-hidden="true">|</span>
                            <span className="pt-hero__info-item pt-hero__info-item--status">
                                <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
                                {point.infoBar.status}
                            </span>
                            <span className="pt-hero__info-sep" aria-hidden="true">|</span>
                            <span className="pt-hero__info-item">
                                <span className="material-symbols-outlined" aria-hidden="true">schedule</span>
                                {point.infoBar.nextTour}
                            </span>
                            <span className="pt-hero__info-sep" aria-hidden="true">|</span>
                            <span className="pt-hero__info-item">
                                <span className="material-symbols-outlined" aria-hidden="true">person</span>
                                Guias Disponíveis: {point.infoBar.guidesCount}
                            </span>
                        </div>
                    </div>
                </section>

                {/* ── Gallery ── */}
                <section className="pt-gallery" aria-label="Galeria de fotos">
                    <div className="pt-gallery__inner">
                        <div className="pt-gallery__main">
                            <img src={point.img} alt={point.alt} />
                        </div>
                        <div className="pt-gallery__secondary">
                            <div className="pt-gallery__thumb">
                                <img src={point.galleryImgs[0]} alt="" aria-hidden="true" />
                            </div>
                            <div className="pt-gallery__thumb">
                                <img src={point.galleryImgs[1]} alt="" aria-hidden="true" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Conteúdo + Planeje sua Visita ── */}
                <section className="pt-content" aria-labelledby="pt-content-title">
                    <div className="pt-content__inner">

                        <div className="pt-content__left">
                            <span className="pt-content__kicker">{point.content.kicker}</span>
                            <h2 id="pt-content-title" className="pt-content__title">{point.content.title}</h2>
                            {point.content.paragraphs.map((p, i) => (
                                <p key={i} className="pt-content__p">{p}</p>
                            ))}
                            <div className="pt-content__stats">
                                {point.content.stats.map((s, i) => (
                                    <div key={i} className="pt-stat">
                                        <span className="material-symbols-outlined pt-stat__icon" aria-hidden="true">{s.icon}</span>
                                        <strong className="pt-stat__value">{s.value}</strong>
                                        <span className="pt-stat__label">{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <aside className="pt-content__right" aria-label="Planeje sua Visita">
                            <div className="pt-visit-card">
                                <h3 className="pt-visit-card__title">Planeje sua Visita</h3>
                                <ul className="pt-visit-card__list">
                                    <li className="pt-visit-item">
                                        <span className="material-symbols-outlined pt-visit-item__icon" aria-hidden="true">hiking</span>
                                        <div>
                                            <strong>{point.visit.difficulty}</strong>
                                            <p>{point.visit.difficultyDetail}</p>
                                        </div>
                                    </li>
                                    <li className="pt-visit-item">
                                        <span className="material-symbols-outlined pt-visit-item__icon" aria-hidden="true">schedule</span>
                                        <div>
                                            <strong>{point.visit.hours}</strong>
                                            <p>{point.visit.hoursDetail}</p>
                                        </div>
                                    </li>
                                    <li className="pt-visit-item">
                                        <span className="material-symbols-outlined pt-visit-item__icon" aria-hidden="true">backpack</span>
                                        <div>
                                            <strong>{point.visit.bring}</strong>
                                            <p>{point.visit.bringDetail}</p>
                                        </div>
                                    </li>
                                </ul>
                                <Link to="/" className="pt-visit-card__cta">Agendar com Guia</Link>
                            </div>
                        </aside>

                    </div>
                </section>

                {/* ── Como Chegar ── */}
                <section className="pt-how" aria-labelledby="pt-how-title">
                    <div className="pt-how__inner">
                        <div className="pt-how__left">
                            <h2 id="pt-how-title" className="pt-how__title">Como Chegar</h2>
                            <p className="pt-how__desc">{point.howToGet.description}</p>
                            <ul className="pt-how__routes">
                                {point.howToGet.routes.map((r, i) => (
                                    <li key={i} className="pt-how__route-item">
                                        <span className="material-symbols-outlined" aria-hidden="true">{r.icon}</span>
                                        {r.text}
                                    </li>
                                ))}
                            </ul>
                            <a
                                href="https://maps.google.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="pt-how__maps-btn"
                            >
                                <span className="material-symbols-outlined" aria-hidden="true">map</span>
                                Abrir no Google Maps
                            </a>
                        </div>
                        <div className="pt-how__right">
                            <img src={point.howToGet.img} alt="Vista do ponto turístico" className="pt-how__img" />
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
