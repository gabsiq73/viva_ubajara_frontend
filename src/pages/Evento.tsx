import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Icon from "../components/ui/Icon";
import Breadcrumb from "./Breadcrumb";
import { DetailStatePage } from "./PageState";
import { eventsService } from "../admin/services/eventsService";
import type { EventResponse } from "../admin/types";
import { formatDay, formatLongDate, formatMonthShort, formatTime, parseBackendDate, toIsoDate } from "../utils/dates";
import { isNotFoundError, requireUuid, useAsyncData } from "../utils/useAsyncData";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import heroFallback from "../assets/images/capa-pagina.webp";
import "../components/ui/ui.css";
import "./style/Evento.css";

function RelatedCard({ ev }: { ev: EventResponse }) {
    const start = parseBackendDate(ev.startDateTime);
    const heroImg = ev.photos?.[0]?.url ?? heroFallback;

    return (
        <Link to={`/eventos/${ev.id}`} className="evd-rel-card">
            <div className="evd-rel-card__img-wrap">
                <img src={heroImg} alt="" className="evd-rel-card__img" width={400} height={220} loading="lazy" decoding="async" />
                {start && (
                    <div className="evd-rel-card__date-badge">
                        <strong>{formatDay(start)}</strong>
                        <span>{formatMonthShort(start)}</span>
                    </div>
                )}
            </div>
            <div className="evd-rel-card__body">
                <h3 className="evd-rel-card__title">{ev.name}</h3>
                <p className="evd-rel-card__place">
                    <Icon name="location_on" />
                    {ev.location}
                </p>
                <p className="evd-rel-card__desc">{ev.description}</p>
                <span className="evd-rel-card__cta" aria-hidden="true">
                    Ver Evento
                    <Icon name="arrow_forward" />
                </span>
            </div>
        </Link>
    );
}

function EventoView({ ev, related }: { ev: EventResponse; related: EventResponse[] }) {
    useDocumentTitle(ev.name);

    const heroImg = ev.photos?.[0]?.url ?? heroFallback;
    const start = parseBackendDate(ev.startDateTime);
    const end = parseBackendDate(ev.endDateTime);
    const dateLabel = start ? formatLongDate(start) : "";
    const timeDisplay = start ? (end ? `${formatTime(start)} – ${formatTime(end)}` : formatTime(start)) : "";

    return (
        <div className="evd-page">
            <Header />
            <main className="evd-main" id="conteudo" tabIndex={-1}>

                {/* ── Hero ── */}
                <section className="evd-hero" aria-labelledby="evd-hero-title">
                    <img src={heroImg} alt="" className="evd-hero__bg" fetchPriority="high" decoding="async" />
                    <div className="evd-hero__overlay" aria-hidden="true" />

                    <Breadcrumb
                        prefix="evd"
                        items={[{ label: "Início", to: "/" }, { label: "Eventos", to: "/eventos" }, { label: ev.name }]}
                    />

                    <div className="evd-hero__content">
                        <div className="evd-hero__inner">
                            <span className="evd-hero__cat">Evento</span>
                            <h1 id="evd-hero-title" className="evd-hero__title">{ev.name}</h1>
                            {start && (
                                <div className="evd-hero__date-row">
                                    <Icon name="calendar_month" />
                                    <time dateTime={toIsoDate(start)}>{dateLabel}</time>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="evd-hero__infobar">
                        <div className="evd-hero__infobar-inner">
                            <span className="evd-info-item">
                                <Icon name="location_on" />
                                {ev.location}
                            </span>
                            {timeDisplay && (
                                <>
                                    <span className="evd-info-sep" aria-hidden="true">|</span>
                                    <span className="evd-info-item">
                                        <Icon name="schedule" />
                                        {timeDisplay}
                                    </span>
                                </>
                            )}
                            <span className="evd-info-sep" aria-hidden="true">|</span>
                            <span className="evd-info-item">
                                <Icon name="check_circle" />
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
                        </div>

                        <aside className="evd-info-card" aria-labelledby="evd-info-title">
                            <div className="evd-info-card__header">
                                <h3 id="evd-info-title" className="evd-info-card__title">Detalhes do Evento</h3>
                            </div>
                            <div className="evd-info-card__body">
                                <ul className="evd-info-list">
                                    {start && (
                                        <li className="evd-info-list__item">
                                            <Icon name="calendar_month" className="evd-info-list__icon" />
                                            <div>
                                                <span className="evd-info-list__label">Data</span>
                                                <span className="evd-info-list__value">{dateLabel}</span>
                                            </div>
                                        </li>
                                    )}
                                    {timeDisplay && (
                                        <li className="evd-info-list__item">
                                            <Icon name="schedule" className="evd-info-list__icon" />
                                            <div>
                                                <span className="evd-info-list__label">Horário</span>
                                                <span className="evd-info-list__value">{timeDisplay}</span>
                                            </div>
                                        </li>
                                    )}
                                    <li className="evd-info-list__item">
                                        <Icon name="location_on" className="evd-info-list__icon" />
                                        <div>
                                            <span className="evd-info-list__label">Local</span>
                                            <span className="evd-info-list__value">{ev.location}</span>
                                        </div>
                                    </li>
                                    {ev.registrationUrl && (
                                        <li className="evd-info-list__item">
                                            <Icon name="link" className="evd-info-list__icon" />
                                            <div>
                                                <span className="evd-info-list__label">Inscrições</span>
                                                <a href={ev.registrationUrl} target="_blank" rel="noopener noreferrer" className="evd-info-list__value evd-info-list__link">
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
                                    <Icon name="map" />
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
                                    <Icon name="arrow_forward" />
                                </Link>
                            </div>
                            <div className="evd-related__grid">
                                {related.map((e) => (
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

export default function Evento() {
    const { id = "" } = useParams<{ id: string }>();
    const data = useAsyncData(async () => {
        requireUuid(id);
        const related = eventsService
            .getAll(0, 10, true)
            .then((page) => page.content.filter((e) => e.id !== id).slice(0, 3))
            .catch((): EventResponse[] => []);
        return { ev: await eventsService.getById(id), related: await related };
    }, id);

    useDocumentTitle(data.status === "ready" ? null : "Evento");

    if (data.status === "loading") return <DetailStatePage kind="loading" />;
    if (data.status === "error") {
        return (
            <DetailStatePage
                kind={isNotFoundError(data.error) ? "not-found" : "error"}
                heroTitle="Evento"
                breadcrumb={[{ label: "Início", to: "/" }, { label: "Eventos", to: "/eventos" }]}
                noun="este evento"
                backTo="/eventos"
                backLabel="Ver todos os eventos"
                onRetry={data.retry}
            />
        );
    }
    return <EventoView key={data.data.ev.id} ev={data.data.ev} related={data.data.related} />;
}
