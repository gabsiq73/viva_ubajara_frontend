import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { EVENTS } from "../data/events";
import type { AppEvent } from "../data/events";
import "./style/Evento.css";

function RelatedCard({ ev }: { ev: AppEvent }) {
    return (
        <Link to={`/eventos/${ev.id}`} className="evd-rel-card">
            <div className="evd-rel-card__img-wrap">
                <img src={ev.img} alt={ev.alt} className="evd-rel-card__img" loading="lazy" />
                <span className="evd-rel-card__cat" data-cat={ev.category}>{ev.category}</span>
                <div className="evd-rel-card__date-badge">
                    <strong>{ev.day}</strong>
                    <span>{ev.month}</span>
                </div>
            </div>
            <div className="evd-rel-card__body">
                <h3 className="evd-rel-card__title">{ev.title}</h3>
                <p className="evd-rel-card__place">
                    <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
                    {ev.place}
                </p>
                <p className="evd-rel-card__desc">{ev.desc}</p>
                <span className="evd-rel-card__cta" aria-hidden="true">
                    Ver Evento
                    <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                </span>
            </div>
        </Link>
    );
}

export default function Evento() {
    const { id } = useParams<{ id: string }>();
    const ev = EVENTS.find(e => e.id === Number(id)) ?? EVENTS[0];

    const sameCategory = EVENTS.filter(e => e.id !== ev.id && e.category === ev.category);
    const related =
        sameCategory.length >= 3
            ? sameCategory.slice(0, 3)
            : [
                  ...sameCategory,
                  ...EVENTS.filter(e => e.id !== ev.id && e.category !== ev.category),
              ].slice(0, 3);

    return (
        <div className="evd-page">
            <Header />
            <main className="evd-main">

                {/* ── Hero ── */}
                <section className="evd-hero" aria-labelledby="evd-hero-title">
                    <img src={ev.img} alt={ev.alt} className="evd-hero__bg" />
                    <div className="evd-hero__overlay" aria-hidden="true" />

                    <nav className="evd-breadcrumb" aria-label="Navegação">
                        <div className="evd-breadcrumb__inner">
                            <Link to="/" className="evd-breadcrumb__link">Início</Link>
                            <span className="evd-breadcrumb__sep" aria-hidden="true">›</span>
                            <Link to="/eventos" className="evd-breadcrumb__link">Eventos</Link>
                            <span className="evd-breadcrumb__sep" aria-hidden="true">›</span>
                            <span className="evd-breadcrumb__current">{ev.title}</span>
                        </div>
                    </nav>

                    <div className="evd-hero__content">
                        <div className="evd-hero__inner">
                            <span className={`evd-hero__cat evd-hero__cat--${ev.category}`}>
                                {ev.category}
                            </span>
                            <h1 id="evd-hero-title" className="evd-hero__title">{ev.title}</h1>
                            <div className="evd-hero__date-row">
                                <span className="material-symbols-outlined" aria-hidden="true">calendar_month</span>
                                {ev.day} de {ev.month} de {ev.year}
                            </div>
                        </div>
                    </div>

                    <div className="evd-hero__infobar">
                        <div className="evd-hero__infobar-inner">
                            <span className="evd-info-item">
                                <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
                                {ev.place}
                            </span>
                            <span className="evd-info-sep" aria-hidden="true">|</span>
                            <span className="evd-info-item">
                                <span className="material-symbols-outlined" aria-hidden="true">schedule</span>
                                {ev.time}
                            </span>
                            <span className="evd-info-sep" aria-hidden="true">|</span>
                            <span className="evd-info-item">
                                <span className="material-symbols-outlined" aria-hidden="true">payments</span>
                                {ev.price}
                            </span>
                        </div>
                    </div>
                </section>

                {/* ── Content + Info card ── */}
                <section className="evd-content">
                    <div className="evd-content__inner">

                        <div className="evd-content__left">
                            <span className="evd-content__kicker">SOBRE O EVENTO</span>
                            <h2 className="evd-content__title">{ev.title}</h2>
                            <p className="evd-content__desc">{ev.fullDesc}</p>
                            <p className="evd-content__desc">
                                Um evento imperdível para moradores e visitantes que desejam vivenciar
                                a cultura, a natureza e a hospitalidade única da Serra da Ibiapaba.
                            </p>

                            <h3 className="evd-tags-title">Tags</h3>
                            <div className="evd-tags">
                                {ev.tags.map(tag => (
                                    <span key={tag} className="evd-tag">
                                        <span
                                            className="material-symbols-outlined"
                                            aria-hidden="true"
                                            style={{ fontVariationSettings: '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 20' }}
                                        >
                                            label
                                        </span>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <aside className="evd-info-card" aria-label="Detalhes do Evento">
                            <div className="evd-info-card__header">
                                <h3 className="evd-info-card__title">Detalhes do Evento</h3>
                            </div>
                            <div className="evd-info-card__body">
                                <ul className="evd-info-list">
                                    <li className="evd-info-list__item">
                                        <span className="material-symbols-outlined evd-info-list__icon" aria-hidden="true">
                                            calendar_month
                                        </span>
                                        <div>
                                            <span className="evd-info-list__label">Data</span>
                                            <span className="evd-info-list__value">{ev.day} de {ev.month} de {ev.year}</span>
                                        </div>
                                    </li>
                                    <li className="evd-info-list__item">
                                        <span className="material-symbols-outlined evd-info-list__icon" aria-hidden="true">
                                            schedule
                                        </span>
                                        <div>
                                            <span className="evd-info-list__label">Horário</span>
                                            <span className="evd-info-list__value">{ev.time}</span>
                                        </div>
                                    </li>
                                    <li className="evd-info-list__item">
                                        <span className="material-symbols-outlined evd-info-list__icon" aria-hidden="true">
                                            location_on
                                        </span>
                                        <div>
                                            <span className="evd-info-list__label">Local</span>
                                            <span className="evd-info-list__value">{ev.address}</span>
                                        </div>
                                    </li>
                                    <li className="evd-info-list__item">
                                        <span className="material-symbols-outlined evd-info-list__icon" aria-hidden="true">
                                            payments
                                        </span>
                                        <div>
                                            <span className="evd-info-list__label">Entrada</span>
                                            <span className="evd-info-list__value">{ev.price}</span>
                                        </div>
                                    </li>
                                </ul>
                                <a
                                    href="https://maps.google.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="evd-info-card__maps-btn"
                                >
                                    <span className="material-symbols-outlined" aria-hidden="true">map</span>
                                    Ver no Google Maps
                                </a>
                            </div>
                        </aside>

                    </div>
                </section>

                {/* ── Outros Eventos ── */}
                {related.length > 0 && (
                    <section className="evd-related" aria-labelledby="evd-related-title">
                        <div className="evd-related__inner">
                            <div className="evd-related__header">
                                <div>
                                    <h2 id="evd-related-title" className="evd-related__title">
                                        Outros Eventos
                                    </h2>
                                    <p className="evd-related__subtitle">
                                        Mais experiências para viver em Ubajara
                                    </p>
                                </div>
                                <Link to="/eventos" className="evd-related__all">
                                    Ver todos
                                    <span className="material-symbols-outlined" aria-hidden="true">
                                        arrow_forward
                                    </span>
                                </Link>
                            </div>
                            <div className="evd-related__grid">
                                {related.map(e => (
                                    <RelatedCard key={e.id} ev={e} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

            </main>
            <Footer />
        </div>
    );
}
