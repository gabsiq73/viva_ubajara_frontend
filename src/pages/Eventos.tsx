import { useState, useMemo, useEffect, useId } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Icon from "../components/ui/Icon";
import StateBlock from "../components/ui/StateBlock";
import { Button } from "../components/ui/Button";
import { eventsService } from "../admin/services/eventsService";
import { pageConfigService } from "../admin/services/pageConfigService";
import type { EventResponse } from "../admin/types";
import {
    formatDay,
    formatMonthLong,
    formatMonthShort,
    formatTime,
    formatYear,
    parseBackendDate,
    toMonthKey,
} from "../utils/dates";
import { useAsyncData } from "../utils/useAsyncData";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import "../components/ui/ui.css";
import "./style/Eventos.css";

interface EventCard {
    id: string;
    img: string;
    title: string;
    desc: string;
    place: string;
    start: Date | null;
    end: Date | null;
    monthKey: string | null;
    raw: EventResponse;
}

type SortKey = "date" | "name";

function mapEvent(ev: EventResponse): EventCard {
    const start = parseBackendDate(ev.startDateTime);
    return {
        id: ev.id,
        img: ev.photos?.[0]?.url ?? "",
        title: ev.name,
        desc: ev.description,
        place: ev.location,
        start,
        end: parseBackendDate(ev.endDateTime),
        monthKey: start ? toMonthKey(start) : null,
        raw: ev,
    };
}

/** Em andamento ou futuros primeiro (o mais próximo antes), depois os já realizados (o mais recente antes), por fim os sem data. */
function compareByProximity(now: number) {
    const group = (e: EventCard) => (!e.start ? 2 : (e.end ?? e.start).getTime() >= now ? 0 : 1);
    return (a: EventCard, b: EventCard) => {
        const ga = group(a);
        const gb = group(b);
        if (ga !== gb) return ga - gb;
        if (ga === 0) return a.start!.getTime() - b.start!.getTime();
        if (ga === 1) return b.start!.getTime() - a.start!.getTime();
        return a.title.localeCompare(b.title, "pt-BR");
    };
}

function EventCardItem({ ev }: { ev: EventCard }) {
    return (
        <article className="ev-card">
            <div className="ev-card__img-wrap">
                {ev.img ? (
                    <img src={ev.img} alt="" className="ev-card__img" width={400} height={200} loading="lazy" decoding="async" />
                ) : (
                    <div className="ev-card__img ev-card__img--placeholder" aria-hidden="true" />
                )}
                {ev.start && (
                    <div className="ev-card__date-badge">
                        <strong className="ev-card__date-day">{formatDay(ev.start)}</strong>
                        <span className="ev-card__date-month">{formatMonthShort(ev.start)}</span>
                        <span className="ev-card__date-year">{formatYear(ev.start)}</span>
                    </div>
                )}
            </div>
            <div className="ev-card__body">
                <h3 className="ev-card__title">
                    <Link to={`/eventos/${ev.id}`} className="ev-card__link">
                        {ev.title}
                    </Link>
                </h3>
                <p className="ev-card__desc">{ev.desc}</p>
                <div className="ev-card__meta">
                    <span className="ev-card__meta-item">
                        <Icon name="location_on" />
                        <span className="ev-card__meta-text">{ev.place}</span>
                    </span>
                    {ev.start && (
                        <span className="ev-card__meta-item">
                            <Icon name="schedule" />
                            {formatTime(ev.start)}
                        </span>
                    )}
                </div>
                <div className="ev-card__footer">
                    <span className="ev-card__cta" aria-hidden="true">
                        Ver evento
                        <Icon name="arrow_forward" />
                    </span>
                    {ev.raw.registrationUrl && (
                        <a
                            href={ev.raw.registrationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ev-card__register"
                        >
                            Inscrever-se
                            <Icon name="open_in_new" />
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
}

export default function Eventos() {
    useDocumentTitle("Eventos");
    const [searchParams, setSearchParams] = useSearchParams();
    const sidebarId = useId();
    const periodLabelId = useId();

    const data = useAsyncData(async () => {
        const page = await eventsService.getAll(0, 100, true);
        return { events: page.content.map(mapEvent), now: Date.now() };
    }, "events");
    const [coverImg, setCoverImg] = useState<string | null>(null);
    const [heroDesc, setHeroDesc] = useState("Festivais, feiras, trilhas guiadas e muito mais aguardam você em Ubajara.");
    const [search, setSearch] = useState(searchParams.get("q") ?? "");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const monthParam = searchParams.get("mes") ?? "";
    const sort: SortKey = searchParams.get("ordem") === "nome" ? "name" : "date";

    useEffect(() => {
        pageConfigService.getConfig('EVENTOS').then((cfg) => {
            if (cfg.imageUrl) setCoverImg(cfg.imageUrl);
            if (cfg.description) setHeroDesc(cfg.description);
        });
    }, []);

    const events = useMemo(() => (data.status === "ready" ? data.data.events : []), [data]);
    const now = data.status === "ready" ? data.data.now : 0;

    function updateParams(changes: Record<string, string | null>) {
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            for (const [key, value] of Object.entries(changes)) {
                if (value) params.set(key, value);
                else params.delete(key);
            }
            return params;
        }, { replace: true });
    }

    const monthOptions = useMemo(() => {
        const seen = new Map<string, string>();
        for (const e of [...events].sort((a, b) => (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0))) {
            if (e.start && e.monthKey && !seen.has(e.monthKey)) {
                seen.set(e.monthKey, `${formatMonthLong(e.start)} ${formatYear(e.start)}`);
            }
        }
        return [...seen].map(([value, label]) => ({ value, label }));
    }, [events]);

    const activeMonth = monthOptions.some((o) => o.value === monthParam) ? monthParam : "";

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        const list = events.filter((e) => {
            if (q && !e.title.toLowerCase().includes(q) && !e.place.toLowerCase().includes(q)) return false;
            if (activeMonth && e.monthKey !== activeMonth) return false;
            return true;
        });
        return sort === "date"
            ? [...list].sort(compareByProximity(now))
            : [...list].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
    }, [events, search, activeMonth, sort, now]);

    const activeCount = (search.trim() ? 1 : 0) + (activeMonth ? 1 : 0);

    function handleSearch(value: string) {
        setSearch(value);
        updateParams({ q: value.trim() ? value : null });
    }

    function clearAll() {
        setSearch("");
        updateParams({ q: null, mes: null });
    }

    const hasEvents = data.status === "ready" && events.length > 0;

    return (
        <div className="ev-page">
            <Header />
            <main className="ev-main" id="conteudo" tabIndex={-1}>

                <section className="ev-hero" aria-labelledby="ev-hero-title">
                    {coverImg && <img src={coverImg} alt="" className="ev-hero__bg" fetchPriority="high" decoding="async" />}
                    <div className="ev-hero__overlay" aria-hidden="true" />
                    <div className="ev-hero__content">
                        <div className="ev-hero__inner">
                            <span className="ev-hero__kicker">Agenda Cultural</span>
                            <h1 id="ev-hero-title" className="ev-hero__title">Eventos &amp; Programação</h1>
                            <p className="ev-hero__subtitle">{heroDesc}</p>
                        </div>
                    </div>
                </section>

                <div className={`ev-body${hasEvents ? "" : " ev-body--single"}`}>

                    {hasEvents && (
                        <>
                            <button
                                type="button"
                                className="ev-filter-toggle"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                aria-expanded={sidebarOpen}
                                aria-controls={sidebarId}
                            >
                                <Icon name="tune" />
                                Filtros
                                {activeCount > 0 && (
                                    <span className="ev-filter-badge">{activeCount}</span>
                                )}
                                <Icon name="expand_more" className="ev-toggle-arrow" />
                            </button>

                            <aside id={sidebarId} className={`ev-sidebar${sidebarOpen ? " is-open" : ""}`} aria-label="Filtros">
                                <div className="ev-sidebar__clip">
                                    <div className="ev-sidebar__box">

                                        <div className="ev-sidebar__section">
                                            <p className="ev-sidebar__label">Buscar</p>
                                            <div className="ev-search__wrap">
                                                <Icon name="search" className="ev-search__icon" />
                                                <input
                                                    type="search"
                                                    name="q"
                                                    className="ev-search__input"
                                                    placeholder="Nome ou local…"
                                                    value={search}
                                                    onChange={(e) => handleSearch(e.target.value)}
                                                    autoComplete="off"
                                                    spellCheck={false}
                                                    aria-label="Buscar eventos"
                                                />
                                            </div>
                                        </div>

                                        {monthOptions.length > 0 && (
                                            <div className="ev-sidebar__section">
                                                <p id={periodLabelId} className="ev-sidebar__label">Período</p>
                                                <div className="ev-filter-group" role="group" aria-labelledby={periodLabelId}>
                                                    <button
                                                        type="button"
                                                        className={`ev-pill${activeMonth === "" ? " is-active" : ""}`}
                                                        aria-pressed={activeMonth === ""}
                                                        onClick={() => updateParams({ mes: null })}
                                                    >
                                                        Todos
                                                    </button>
                                                    {monthOptions.map((opt) => (
                                                        <button
                                                            key={opt.value}
                                                            type="button"
                                                            className={`ev-pill${activeMonth === opt.value ? " is-active" : ""}`}
                                                            aria-pressed={activeMonth === opt.value}
                                                            onClick={() => updateParams({ mes: opt.value })}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {activeCount > 0 && (
                                            <button type="button" className="ev-sidebar__clear" onClick={clearAll}>
                                                <Icon name="close" />
                                                Limpar filtros
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </aside>
                        </>
                    )}

                    <div className="ev-content">
                        {hasEvents && (
                            <div className="ev-topbar">
                                <p className="ev-count" aria-live="polite">
                                    <strong>{filtered.length}</strong>{" "}
                                    {filtered.length === 1 ? "evento encontrado" : "eventos encontrados"}
                                </p>
                                <div className="ev-sort">
                                    <label className="ev-sort__label" htmlFor="ev-sort">Ordenar:</label>
                                    <select
                                        id="ev-sort"
                                        name="ordem"
                                        className="ev-sort__select"
                                        value={sort}
                                        onChange={(e) => updateParams({ ordem: e.target.value === "name" ? "nome" : null })}
                                    >
                                        <option value="date">Data mais próxima</option>
                                        <option value="name">Nome A–Z</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        <h2 className="ui-sr-only">Lista de eventos</h2>

                        {data.status === "loading" ? (
                            <div className="ev-empty" role="status">
                                <Icon name="hourglass_top" className="ev-empty__icon" />
                                <p className="ev-empty__msg">Carregando eventos…</p>
                            </div>
                        ) : data.status === "error" ? (
                            <StateBlock
                                variant="error"
                                icon="wifi_off"
                                title="Não conseguimos carregar os eventos"
                                actions={<Button icon="refresh" onClick={data.retry}>Tentar de novo</Button>}
                            >
                                A conexão na serra pode oscilar. Verifique o sinal e tente de novo.
                            </StateBlock>
                        ) : events.length === 0 ? (
                            <StateBlock variant="empty" icon="event_busy" title="Ainda não há eventos programados">
                                Volte em breve para conferir a agenda de Ubajara.
                            </StateBlock>
                        ) : filtered.length > 0 ? (
                            <div className="ev-grid">
                                {filtered.map((ev) => (
                                    <EventCardItem key={ev.id} ev={ev} />
                                ))}
                            </div>
                        ) : (
                            <StateBlock
                                variant="empty"
                                icon="event_busy"
                                title="Nenhum evento encontrado com os filtros selecionados"
                                actions={<Button variant="outline" onClick={clearAll}>Limpar filtros</Button>}
                            />
                        )}
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
}
