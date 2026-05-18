import { useState, useMemo, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { eventsService } from "../admin/services/eventsService";
import type { EventResponse } from "../admin/types";
import "./style/Eventos.css";

const PT_MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const PT_MONTHS_LONG = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function parseEventDate(raw: string): Date {
    if (!raw) return new Date(NaN);
    if (raw.includes("/")) {
        const [datePart, timePart = "00:00:00"] = raw.split(" ");
        const [d, m, y] = datePart.split("/");
        return new Date(`${y}-${m}-${d}T${timePart}`);
    }
    return new Date(raw);
}

interface EventCard {
    id: string;
    img: string;
    title: string;
    desc: string;
    place: string;
    day: string;
    month: string;
    monthNum: number;
    year: string;
    time: string;
    raw: EventResponse;
}

function mapEvent(ev: EventResponse): EventCard {
    const date = parseEventDate(ev.startDateTime);
    const day = isNaN(date.getTime()) ? "—" : String(date.getDate()).padStart(2, "0");
    const monthNum = isNaN(date.getTime()) ? 0 : date.getMonth();
    const month = isNaN(date.getTime()) ? "—" : PT_MONTHS[monthNum];
    const year = isNaN(date.getTime()) ? "—" : String(date.getFullYear());
    const time = isNaN(date.getTime())
        ? "—"
        : date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return {
        id: ev.id,
        img: ev.photos?.[0]?.url ?? "",
        title: ev.name,
        desc: ev.description,
        place: ev.location,
        day,
        month,
        monthNum,
        year,
        time,
        raw: ev,
    };
}

function sortKey(e: EventCard) {
    return parseInt(e.year) * 100 + e.monthNum;
}

function EventCardItem({ ev }: { ev: EventCard }) {
    return (
        <article className="ev-card">
            <div className="ev-card__img-wrap">
                {ev.img ? (
                    <img src={ev.img} alt={ev.title} className="ev-card__img" loading="lazy" />
                ) : (
                    <div className="ev-card__img ev-card__img--placeholder" aria-hidden="true" />
                )}
                <div className="ev-card__date-badge">
                    <strong className="ev-card__date-day">{ev.day}</strong>
                    <span className="ev-card__date-month">{ev.month}</span>
                    <span className="ev-card__date-year">{ev.year}</span>
                </div>
            </div>
            <div className="ev-card__body">
                <h3 className="ev-card__title">{ev.title}</h3>
                <p className="ev-card__desc">{ev.desc}</p>
                <div className="ev-card__meta">
                    <span className="ev-card__meta-item">
                        <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
                        {ev.place}
                    </span>
                    <span className="ev-card__meta-item">
                        <span className="material-symbols-outlined" aria-hidden="true">schedule</span>
                        {ev.time}
                    </span>
                </div>
                {ev.raw.registrationUrl && (
                    <div className="ev-card__footer">
                        <a
                            href={ev.raw.registrationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ev-card__cta"
                        >
                            Inscrever-se
                            <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                        </a>
                    </div>
                )}
            </div>
        </article>
    );
}

export default function Eventos() {
    const [events, setEvents] = useState<EventCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeMonth, setActiveMonth] = useState<string>("Todos");
    const [sort, setSort] = useState<"date" | "name">("date");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        eventsService.getAll(0, 100, true)
            .then(page => setEvents(page.content.map(mapEvent)))
            .catch(() => setEvents([]))
            .finally(() => setLoading(false));
    }, []);

    const monthOptions = useMemo(() => {
        const seen = new Set<string>();
        return [...events]
            .sort((a, b) => sortKey(a) - sortKey(b))
            .filter(e => {
                const key = `${e.monthNum}/${e.year}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .map(e => ({ label: `${PT_MONTHS_LONG[e.monthNum]} ${e.year}`, value: `${e.monthNum}/${e.year}` }));
    }, [events]);

    const filtered = useMemo(() => {
        let list = events.filter(e => {
            const q = search.toLowerCase();
            if (q && !e.title.toLowerCase().includes(q) && !e.place.toLowerCase().includes(q)) return false;
            if (activeMonth !== "Todos" && `${e.monthNum}/${e.year}` !== activeMonth) return false;
            return true;
        });
        return sort === "date"
            ? [...list].sort((a, b) => sortKey(a) - sortKey(b))
            : [...list].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
    }, [events, search, activeMonth, sort]);

    const activeCount = (search ? 1 : 0) + (activeMonth !== "Todos" ? 1 : 0);

    function clearAll() {
        setSearch("");
        setActiveMonth("Todos");
    }

    return (
        <div className="ev-page">
            <Header />
            <main className="ev-main">

                <section className="ev-hero" aria-labelledby="ev-hero-title">
                    <div className="ev-hero__overlay" aria-hidden="true" />
                    <div className="ev-hero__content">
                        <div className="ev-hero__inner">
                            <span className="ev-hero__kicker">Agenda Cultural</span>
                            <h1 id="ev-hero-title" className="ev-hero__title">Eventos &amp; Programação</h1>
                            <p className="ev-hero__subtitle">
                                Festivais, feiras, trilhas guiadas e muito mais aguardam você em Ubajara.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="ev-body">

                    <button
                        type="button"
                        className="ev-filter-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-expanded={sidebarOpen}
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">tune</span>
                        Filtros
                        {activeCount > 0 && (
                            <span className="ev-filter-badge">{activeCount}</span>
                        )}
                        <span className="material-symbols-outlined ev-toggle-arrow" aria-hidden="true">
                            {sidebarOpen ? "expand_less" : "expand_more"}
                        </span>
                    </button>

                    <aside className={`ev-sidebar${sidebarOpen ? " is-open" : ""}`} aria-label="Filtros">

                        <div className="ev-sidebar__section">
                            <p className="ev-sidebar__label">Buscar</p>
                            <div className="ev-search__wrap">
                                <span className="material-symbols-outlined ev-search__icon" aria-hidden="true">search</span>
                                <input
                                    type="search"
                                    className="ev-search__input"
                                    placeholder="Nome ou local..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    aria-label="Buscar eventos"
                                />
                            </div>
                        </div>

                        <div className="ev-sidebar__section">
                            <p className="ev-sidebar__label">Período</p>
                            <div className="ev-filter-group">
                                <button
                                    type="button"
                                    className={`ev-pill${activeMonth === "Todos" ? " is-active" : ""}`}
                                    onClick={() => setActiveMonth("Todos")}
                                >
                                    Todos
                                </button>
                                {monthOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        className={`ev-pill${activeMonth === opt.value ? " is-active" : ""}`}
                                        onClick={() => setActiveMonth(opt.value)}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {activeCount > 0 && (
                            <button type="button" className="ev-sidebar__clear" onClick={clearAll}>
                                <span className="material-symbols-outlined" aria-hidden="true">close</span>
                                Limpar filtros
                            </button>
                        )}
                    </aside>

                    <div className="ev-content">
                        <div className="ev-topbar">
                            <p className="ev-count">
                                <strong>{filtered.length}</strong>{" "}
                                {filtered.length === 1 ? "evento encontrado" : "eventos encontrados"}
                            </p>
                            <div className="ev-sort">
                                <span className="ev-sort__label">Ordenar:</span>
                                <select
                                    className="ev-sort__select"
                                    value={sort}
                                    onChange={e => setSort(e.target.value as "date" | "name")}
                                    aria-label="Ordenar eventos"
                                >
                                    <option value="date">Data mais próxima</option>
                                    <option value="name">Nome A–Z</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="ev-empty">
                                <span className="material-symbols-outlined ev-empty__icon" aria-hidden="true">hourglass_top</span>
                                <p className="ev-empty__msg">Carregando eventos...</p>
                            </div>
                        ) : filtered.length > 0 ? (
                            <div className="ev-grid">
                                {filtered.map(ev => (
                                    <EventCardItem key={ev.id} ev={ev} />
                                ))}
                            </div>
                        ) : (
                            <div className="ev-empty">
                                <span className="material-symbols-outlined ev-empty__icon" aria-hidden="true">event_busy</span>
                                <p className="ev-empty__msg">Nenhum evento encontrado com os filtros selecionados.</p>
                                <button type="button" className="ev-empty__reset" onClick={clearAll}>
                                    Limpar filtros
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
}
