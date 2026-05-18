import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ESTABLISHMENTS } from "../data/establishments";
import type { EstabType } from "../data/establishments";
import heroImg from "../assets/images/mercado.png";
import "./style/Estabelecimentos.css";

const ALL_TYPES = "Todos";
const ALL_CITIES = "Todas";

const STAR_OPTIONS = [
    { label: "Todas", value: 0 },
    { label: "5 ★", value: 5 },
    { label: "4+ ★", value: 4 },
    { label: "3+ ★", value: 3 },
];

function StarRow({ count }: { count: number }) {
    return (
        <span className="est-stars" aria-label={`${count} de 5 estrelas`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <span
                    key={i}
                    className="material-symbols-outlined est-star"
                    aria-hidden="true"
                    style={{
                        fontVariationSettings: `"FILL" ${i <= count ? 1 : 0}, "wght" 400, "GRAD" 0, "opsz" 20`,
                    }}
                >
                    star
                </span>
            ))}
        </span>
    );
}

export default function Estabelecimentos() {
    const [searchParams] = useSearchParams();
    const initialType = searchParams.get("tipo") ?? ALL_TYPES;

    const [search, setSearch] = useState("");
    const [activeType, setActiveType] = useState<EstabType | "Todos">(initialType as EstabType | "Todos");
    const [minStars, setMinStars] = useState(0);
    const [activeCity, setActiveCity] = useState<string>(ALL_CITIES);
    const [sort, setSort] = useState<"relevance" | "stars" | "name">("relevance");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const types = useMemo(() => {
        const t = Array.from(new Set(ESTABLISHMENTS.map((e) => e.type)));
        return [ALL_TYPES, ...t];
    }, []);

    const cities = useMemo(() => {
        const c = Array.from(new Set(ESTABLISHMENTS.map((e) => e.city))).sort((a, b) =>
            a.localeCompare(b, "pt-BR")
        );
        return [ALL_CITIES, ...c];
    }, []);

    const filtered = useMemo(() => {
        let result = ESTABLISHMENTS.filter((e) => {
            const matchType = activeType === ALL_TYPES || e.type === activeType;
            const matchStars = e.stars >= minStars;
            const matchCity = activeCity === ALL_CITIES || e.city === activeCity;
            const q = search.trim().toLowerCase();
            const matchSearch =
                !q ||
                e.name.toLowerCase().includes(q) ||
                e.desc.toLowerCase().includes(q) ||
                e.city.toLowerCase().includes(q);
            return matchType && matchStars && matchCity && matchSearch;
        });

        if (sort === "stars") result = [...result].sort((a, b) => b.stars - a.stars);
        else if (sort === "name")
            result = [...result].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

        return result;
    }, [search, activeType, minStars, activeCity, sort]);

    const activeCount =
        (activeType !== ALL_TYPES ? 1 : 0) +
        (minStars > 0 ? 1 : 0) +
        (activeCity !== ALL_CITIES ? 1 : 0) +
        (search.trim() ? 1 : 0);

    function clearAll() {
        setSearch("");
        setActiveType(ALL_TYPES);
        setMinStars(0);
        setActiveCity(ALL_CITIES);
        setSort("relevance");
    }

    return (
        <div className="est-page">
            <Header />
            <main className="est-main">

                {/* ── Hero ── */}
                <section className="est-hero">
                    <img src={heroImg} alt="" className="est-hero__bg" aria-hidden />
                    <div className="est-hero__overlay" />
                    <div className="est-hero__content">
                        <div className="est-hero__inner">
                            <span className="est-hero__kicker">PARQUE NACIONAL DE UBAJARA</span>
                            <h1 className="est-hero__title">Estabelecimentos</h1>
                            <p className="est-hero__subtitle">
                                Restaurantes, pousadas, hotéis, cafeterias e lojas de artesanato
                                para completar sua experiência na Serra da Ibiapaba.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── Body: toggle + sidebar + cards ── */}
                <div className="est-body">

                    {/* Mobile filter toggle */}
                    <button
                        type="button"
                        className="est-filter-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-expanded={sidebarOpen}
                        aria-controls="est-sidebar"
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">tune</span>
                        Filtros
                        {activeCount > 0 && (
                            <span className="est-filter-badge">{activeCount}</span>
                        )}
                        <span className="material-symbols-outlined est-toggle-arrow" aria-hidden="true">
                            {sidebarOpen ? "expand_less" : "expand_more"}
                        </span>
                    </button>

                    {/* ── Sidebar ── */}
                    <aside
                        id="est-sidebar"
                        className={`est-sidebar${sidebarOpen ? " is-open" : ""}`}
                        aria-label="Filtros"
                    >
                        {/* Search */}
                        <div className="est-sidebar__section">
                            <p className="est-sidebar__label">Buscar</p>
                            <div className="est-search__wrap">
                                <span
                                    className="material-symbols-outlined est-search__icon"
                                    aria-hidden="true"
                                >
                                    search
                                </span>
                                <input
                                    type="search"
                                    placeholder="Nome ou cidade..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="est-search__input"
                                    aria-label="Buscar estabelecimento"
                                />
                            </div>
                        </div>

                        {/* Type filter */}
                        <div className="est-sidebar__section">
                            <p className="est-sidebar__label">Tipo</p>
                            <div className="est-filter-group">
                                {types.map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        className={`est-pill${activeType === t ? " is-active" : ""}`}
                                        onClick={() => setActiveType(t)}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Stars filter */}
                        <div className="est-sidebar__section">
                            <p className="est-sidebar__label">Avaliação</p>
                            <div className="est-filter-group">
                                {STAR_OPTIONS.map((o) => (
                                    <button
                                        key={o.value}
                                        type="button"
                                        className={`est-pill${minStars === o.value ? " is-active" : ""}`}
                                        onClick={() => setMinStars(o.value)}
                                    >
                                        {o.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* City filter */}
                        <div className="est-sidebar__section">
                            <p className="est-sidebar__label">Cidade</p>
                            <div className="est-filter-group">
                                {cities.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        className={`est-pill${activeCity === c ? " is-active" : ""}`}
                                        onClick={() => setActiveCity(c)}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Clear */}
                        {activeCount > 0 && (
                            <button
                                type="button"
                                className="est-sidebar__clear"
                                onClick={clearAll}
                            >
                                <span className="material-symbols-outlined" aria-hidden="true">
                                    filter_alt_off
                                </span>
                                Limpar filtros ({activeCount})
                            </button>
                        )}
                    </aside>

                    {/* ── Cards content ── */}
                    <div className="est-content">

                        {/* Topbar */}
                        <div className="est-topbar">
                            <p className="est-count">
                                <strong>{filtered.length}</strong>{" "}
                                {filtered.length === 1 ? "estabelecimento" : "estabelecimentos"} encontrados
                            </p>
                            <div className="est-sort">
                                <label htmlFor="est-sort-select" className="est-sort__label">
                                    Ordenar:
                                </label>
                                <select
                                    id="est-sort-select"
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value as typeof sort)}
                                    className="est-sort__select"
                                >
                                    <option value="relevance">Relevância</option>
                                    <option value="stars">Maior Avaliação</option>
                                    <option value="name">Nome A–Z</option>
                                </select>
                            </div>
                        </div>

                        {/* Cards grid */}
                        {filtered.length > 0 ? (
                            <div className="est-grid">
                                {filtered.map((e) => (
                                    <article
                                        key={e.id}
                                        className="est-card"
                                        data-type={e.type}
                                    >
                                        <div className="est-card__img-wrap">
                                            <img
                                                src={e.img}
                                                alt={e.alt}
                                                className="est-card__img"
                                                loading="lazy"
                                            />
                                            <span className="est-card__type-badge">{e.type}</span>
                                            <span className="est-card__price-badge">{e.priceLevel}</span>
                                        </div>
                                        <div className="est-card__body">
                                            <div className="est-card__rating-row">
                                                <StarRow count={e.stars} />
                                                <span className="est-card__stars-label">{e.stars}.0</span>
                                            </div>
                                            <h3 className="est-card__name">{e.name}</h3>
                                            <p className="est-card__city">
                                                <span
                                                    className="material-symbols-outlined"
                                                    aria-hidden="true"
                                                >
                                                    location_on
                                                </span>
                                                {e.city}, CE
                                            </p>
                                            <p className="est-card__desc">{e.desc}</p>
                                            <div className="est-card__features">
                                                {e.features.slice(0, 3).map((f) => (
                                                    <span key={f} className="est-card__feature">{f}</span>
                                                ))}
                                            </div>
                                            <div className="est-card__footer">
                                                <span className="est-card__hours">
                                                    <span
                                                        className="material-symbols-outlined"
                                                        aria-hidden="true"
                                                    >
                                                        schedule
                                                    </span>
                                                    {e.hours}
                                                </span>
                                                <Link
                                                    to={`/estabelecimentos/${e.id}`}
                                                    className="est-card__cta"
                                                >
                                                    Ver Detalhes
                                                    <span
                                                        className="material-symbols-outlined"
                                                        aria-hidden="true"
                                                    >
                                                        arrow_forward
                                                    </span>
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="est-empty">
                                <span className="material-symbols-outlined est-empty__icon">
                                    search_off
                                </span>
                                <p className="est-empty__msg">
                                    Nenhum estabelecimento encontrado para essa busca.
                                </p>
                                <button type="button" className="est-empty__reset" onClick={clearAll}>
                                    Limpar filtros
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── CTA ── */}
                <section className="est-cta">
                    <div className="est-cta__inner">
                        <h2 className="est-cta__title">Quer Cadastrar seu Estabelecimento?</h2>
                        <p className="est-cta__desc">
                            Faça parte da rede de parceiros do Parque Nacional de Ubajara e aumente
                            sua visibilidade para turistas de todo o Brasil.
                        </p>
                        <div className="est-cta__btns">
                            <a href="#" className="est-cta__btn">Cadastrar Estabelecimento</a>
                            <a href="#" className="est-cta__btn est-cta__btn--outline">
                                Falar com a Equipe
                            </a>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
}
