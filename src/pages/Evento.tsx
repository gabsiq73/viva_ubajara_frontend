import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { eventsService } from "../admin/services/eventsService";
import type { EventResponse } from "../admin/types";
import heroFallback from "../assets/images/foto-capa-parque-ubajara.png";
import "./style/Evento.css";

const PT_MONTHS_LONG = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function parseDate(raw: string): Date {
    if (!raw) return new Date(NaN);
    if (raw.includes("/")) {
        const [d, t = "00:00:00"] = raw.split(" ");
        const [day, mon, yr] = d.split("/");
        return new Date(`${yr}-${mon}-${day}T${t}`);
    }
    return new Date(raw);
}

function formatTime(raw: string): string {
    const d = parseDate(raw);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function RelatedCard({ ev }: { ev: EventResponse }) {
    const start = parseDate(ev.startDateTime);
    const day = isNaN(start.getTime()) ? "" : String(start.getDate()).padStart(2, "0");
    const month = isNaN(start.getTime()) ? "" : PT_MONTHS_LONG[start.getMonth()].slice(0, 3);
    const heroImg = ev.photos?.[0]?.url ?? heroFallback;

    return (
        <Link to={`/eventos/${ev.id}`} className="evd-rel-card">
            <div className="evd-rel-card__img-wrap">
                <img src={heroImg} alt={ev.name} className="evd-rel-card__img" loading="lazy" />
                <div className="evd-rel-card__date-badge">
                    <strong>{day}</strong>
                    <span>{month}</span>
                </div>
            </div>
            <div className="evd-rel-card__body">
                <h3 className="evd-rel-card__title">{ev.name}</h3>
                <p className="evd-rel-card__place">
                    <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
                    {ev.location}
                </p>
                <p className="evd-rel-card__desc">{ev.description}</p>
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
    const navigate = useNavigate();
    const [ev, setEv] = useState<EventResponse | null>(null);
    const [related, setRelated] = useState<EventResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) { navigate("/eventos"); return; }
        Promise.allSettled([
            eventsService.getById(id),
            eventsService.getAll(0, 10, true),
        ]).then(([evResult, allResult]) => {
            if (evResult.status === "fulfilled") {
                setEv(evResult.value);
                if (allResult.status === "fulfilled") {
                    setRelated(allResult.value.content.filter(e => e.id !== id).slice(0, 3));
                }
            } else {
                navigate("/eventos");
            }
        }).finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="evd-page">
                <Header />
                <main className="evd-main" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                    <span className="adm-spinner adm-spinner--lg" />
                </main>
                <Footer />
            </div>
        );
    }

    if (!ev) return null;

    const heroImg = ev.photos?.[0]?.url ?? heroFallback;
    const start = parseDate(ev.startDateTime);
    const day = isNaN(start.getTime()) ? "" : String(start.getDate()).padStart(2, "0");
    const monthLong = isNaN(start.getTime()) ? "" : PT_MONTHS_LONG[start.getMonth()];
    const year = isNaN(start.getTime()) ? "" : start.getFullYear();
    const timeStr = formatTime(ev.startDateTime);
    const endTimeStr = formatTime(ev.endDateTime);
    const timeDisplay = timeStr ? (endTimeStr ? `${timeStr} – ${endTimeStr}` : timeStr) : "";

    return (
        <div className="evd-page">
            <Header />
            <main className="evd-main">

                {/* ── Hero ── */}
                <section className="evd-hero" aria-labelledby="evd-hero-title">
                    <img src={heroImg} alt={ev.name} className="evd-hero__bg" />
                    <div className="evd-hero__overlay" aria-hidden="true" />

                    <nav className="evd-breadcrumb" aria-label="Navegação">
                        <div className="evd-breadcrumb__inner">
                            <Link to="/" className="evd-breadcrumb__link">Início</Link>
                            <span className="evd-breadcrumb__sep" aria-hidden="true">›</span>
                            <Link to="/eventos" className="evd-breadcrumb__link">Eventos</Link>
                            <span className="evd-breadcrumb__sep" aria-hidden="true">›</span>
                            <span className="evd-breadcrumb__current">{ev.name}</span>
                        </div>
                    </nav>

                    <div className="evd-hero__content">
                        <div className="evd-hero__inner">
                            <span className="evd-hero__cat">Evento</span>
                            <h1 id="evd-hero-title" className="evd-hero__title">{ev.name}</h1>
                            {day && (
                                <div className="evd-hero__date-row">
                                    <span className="material-symbols-outlined" aria-hidden="true">calendar_month</span>
                                    {day} de {monthLong} de {year}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="evd-hero__infobar">
                        <div className="evd-hero__infobar-inner">
                            <span className="evd-info-item">
                                <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
                                {ev.location}
                            </span>
                            {timeDisplay && (
                                <>
                                    <span className="evd-info-sep" aria-hidden="true">|</span>
                                    <span className="evd-info-item">
                                        <span className="material-symbols-outlined" aria-hidden="true">schedule</span>
                                        {timeDisplay}
                                    </span>
                                </>
                            )}
                            <span className="evd-info-sep" aria-hidden="true">|</span>
                            <span className="evd-info-item">
                                <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
                                {ev.active ? "Confirmado" : "A Confirmar"}
                            </span>
                        </div>
                    </div>
                </section>

                {/* ── Content + Info card ── */}
                <section className="evd-content">
                    <div className="evd-content__inner">

                        <div className="evd-content__left">
                            <span className="evd-content__kicker">SOBRE O EVENTO</span>
                            <h2 className="evd-content__title">{ev.name}</h2>
                            <p className="evd-content__desc">{ev.description}</p>
                            <p className="evd-content__desc">
                                Um evento imperdível para moradores e visitantes que desejam vivenciar
                                a cultura, a natureza e a hospitalidade única da Serra da Ibiapaba.
                            </p>
                        </div>

                        <aside className="evd-info-card" aria-label="Detalhes do Evento">
                            <div className="evd-info-card__header">
                                <h3 className="evd-info-card__title">Detalhes do Evento</h3>
                            </div>
                            <div className="evd-info-card__body">
                                <ul className="evd-info-list">
                                    {day && (
                                        <li className="evd-info-list__item">
                                            <span className="material-symbols-outlined evd-info-list__icon" aria-hidden="true">calendar_month</span>
                                            <div>
                                                <span className="evd-info-list__label">Data</span>
                                                <span className="evd-info-list__value">{day} de {monthLong} de {year}</span>
                                            </div>
                                        </li>
                                    )}
                                    {timeDisplay && (
                                        <li className="evd-info-list__item">
                                            <span className="material-symbols-outlined evd-info-list__icon" aria-hidden="true">schedule</span>
                                            <div>
                                                <span className="evd-info-list__label">Horário</span>
                                                <span className="evd-info-list__value">{timeDisplay}</span>
                                            </div>
                                        </li>
                                    )}
                                    <li className="evd-info-list__item">
                                        <span className="material-symbols-outlined evd-info-list__icon" aria-hidden="true">location_on</span>
                                        <div>
                                            <span className="evd-info-list__label">Local</span>
                                            <span className="evd-info-list__value">{ev.location}</span>
                                        </div>
                                    </li>
                                    {ev.registrationUrl && (
                                        <li className="evd-info-list__item">
                                            <span className="material-symbols-outlined evd-info-list__icon" aria-hidden="true">link</span>
                                            <div>
                                                <span className="evd-info-list__label">Inscrições</span>
                                                <a href={ev.registrationUrl} target="_blank" rel="noopener noreferrer" className="evd-info-list__value" style={{ color: "var(--adm-green)" }}>
                                                    Acessar link
                                                </a>
                                            </div>
                                        </li>
                                    )}
                                </ul>
                                <a
                                    href={`https://maps.google.com/maps?q=${encodeURIComponent(ev.location)}`}
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
                                    <h2 id="evd-related-title" className="evd-related__title">Outros Eventos</h2>
                                    <p className="evd-related__subtitle">Mais experiências para viver em Ubajara</p>
                                </div>
                                <Link to="/eventos" className="evd-related__all">
                                    Ver todos
                                    <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
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
