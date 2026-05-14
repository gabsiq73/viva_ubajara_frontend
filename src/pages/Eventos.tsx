import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { EVENTS } from "../data/events";
import type { AppEvent, EventCategory } from "../data/events";
import "./style/Eventos.css";

const ALL_CATEGORIES: EventCategory[] = ["Festival", "Cultura", "Esporte", "Gastronomia", "Natureza"];

function sortKey(e: AppEvent) {
    return parseInt(e.year) * 100 + e.monthNum;
}

function EventCard({ ev }: { ev: AppEvent }) {
    return (
        <article className="ev-card" data-category={ev.category}>
            <div className="ev-card__img-wrap">
                <img src={ev.img} alt={ev.alt} className="ev-card__img" loading="lazy" />
                <span className="ev-card__cat-badge" data-cat={ev.category}>{ev.category}</span>
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
                    <span className="ev-card__meta-item">
                        <span className="material-symbols-outlined" aria-hidden="true">payments</span>
                        {ev.price}
                    </span>
                </div>
                <div className="ev-card__footer">
                    <Link to={`/eventos/${ev.id}`} className="ev-card__cta">
                        Ver Evento
                        <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                    </Link>
                </div>
            </div>
        </article>
    );
}

export default function Eventos() {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("Todos");
    const [activeMonth, setActiveMonth] = useState("Todos");
    const [sort, setSort] = useState<"date" | "name">("date");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const monthOptions = useMemo(() => {
        const seen = new Set<string>();
        return [...EVENTS]
            .sort((a, b) => sortKey(a) - sortKey(b))
            .filter(e => {
                const key = `${e.monthNum}/${e.year}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .map(e => ({ label: `${e.month} ${e.year}`, value: `${e.monthNum}/${e.year}` }));
    }, []);

    const filtered = useMemo(() => {
        let list = EVENTS.filter(e => {
            const q = search.toLowerCase();
            if (q && !e.title.toLowerCase().includes(q) && !e.place.toLowerCase().includes(q)) return false;
            if (activeCategory !== "Todos" && e.category !== activeCategory) return false;
            if (activeMonth !== "Todos" && `${e.monthNum}/${e.year}` !== activeMonth) return false;
            return true;
        });
        return sort === "date"
            ? [...list].sort((a, b) => sortKey(a) - sortKey(b))
            : [...list].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
    }, [search, activeCategory, activeMonth, sort]);

    const activeCount = (search ? 1 : 0) + (activeCategory !== "Todos" ? 1 : 0) + (activeMonth !== "Todos" ? 1 : 0);

    function clearAll() {
        setSearch("");
        setActiveCategory("Todos");
        setActiveMonth("Todos");
    }

    return (
        <div className="ev-page">
            <Header />
            <main className="ev-main">

                {/* ── Hero ── */}
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

                {/* ── Body ── */}
                <div className="ev-body">

                    {/* Mobile toggle */}
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

                    {/* Sidebar */}
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
                            <p className="ev-sidebar__label">Categoria</p>
                            <div className="ev-filter-group">
                                {["Todos", ...ALL_CATEGORIES].map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        className={`ev-pill${activeCategory === cat ? " is-active" : ""}`}
                                        onClick={() => setActiveCategory(cat)}
                                        aria-pressed={activeCategory === cat}
                                    >
                                        {cat}
                                    </button>
                                ))}
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

                    {/* Main content */}
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

                        {filtered.length > 0 ? (
                            <div className="ev-grid">
                                {filtered.map(ev => (
                                    <EventCard key={ev.id} ev={ev} />
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
