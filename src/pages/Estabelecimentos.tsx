import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { restaurantsService } from "../admin/services/restaurantsService";
import { hostPointsService } from "../admin/services/hostPointsService";
import type { RestaurantResponse, HostPointResponse, HostType } from "../admin/types";
import heroImg from "../assets/images/mercado.png";
import "./style/Estabelecimentos.css";

const ALL_TYPES = "Todos";

type EstabType = "Restaurante" | "Hotel" | "Pousada" | "Hostel";

const HOST_TYPE_LABELS: Record<HostType, EstabType> = {
    HOTEL: "Hotel",
    ROOST: "Pousada",
    HOSTEL: "Hostel",
};

interface EstabItem {
    id: string;
    type: EstabType;
    apiType: "restaurant" | "hostpoint";
    img: string;
    name: string;
    address: string;
    description: string;
    openingHours?: string;
    avgPrice?: number;
    features: string[];
}

function mapRestaurant(r: RestaurantResponse): EstabItem {
    const features: string[] = [];
    if (r.cuisineType) features.push(r.cuisineType);
    if (r.acceptsReservation) features.push("Aceita Reservas");
    return {
        id: r.id,
        type: "Restaurante",
        apiType: "restaurant",
        img: r.photos?.[0]?.url ?? "",
        name: r.name,
        address: r.address,
        description: r.description,
        openingHours: r.openingHours,
        avgPrice: r.avgPrice,
        features,
    };
}

function mapHostPoint(h: HostPointResponse): EstabItem {
    const typeLabel = HOST_TYPE_LABELS[h.hostType] ?? "Hospedagem";
    const features: string[] = [typeLabel];
    if (h.numOfRooms) features.push(`${h.numOfRooms} quartos`);
    if (h.bookingUrl) features.push("Reserva Online");
    return {
        id: h.id,
        type: typeLabel as EstabType,
        apiType: "hostpoint",
        img: h.photos?.[0]?.url ?? "",
        name: h.name,
        address: h.address,
        description: h.description,
        openingHours: undefined,
        avgPrice: h.avgPrice,
        features,
    };
}

function formatPrice(avgPrice?: number): string | null {
    if (avgPrice == null) return null;
    return `R$ ${avgPrice.toFixed(0)}`;
}

export default function Estabelecimentos() {
    const [searchParams] = useSearchParams();
    const initialType = searchParams.get("tipo") ?? ALL_TYPES;

    const [items, setItems] = useState<EstabItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeType, setActiveType] = useState<string>(initialType);
    const [sort, setSort] = useState<"relevance" | "name">("relevance");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        Promise.allSettled([
            restaurantsService.getAll(0, 100),
            hostPointsService.getAll(0, 100),
        ]).then(([restResult, hostResult]) => {
            const restaurants = restResult.status === "fulfilled"
                ? restResult.value.content.filter(r => r.active).map(mapRestaurant)
                : [];
            const hostPoints = hostResult.status === "fulfilled"
                ? hostResult.value.content.filter(h => h.active).map(mapHostPoint)
                : [];
            setItems([...restaurants, ...hostPoints]);
        }).finally(() => setLoading(false));
    }, []);

    const types = useMemo(() => {
        const t = Array.from(new Set(items.map(e => e.type)));
        return [ALL_TYPES, ...t];
    }, [items]);

    const filtered = useMemo(() => {
        let result = items.filter((e) => {
            const matchType = activeType === ALL_TYPES || e.type === activeType;
            const q = search.trim().toLowerCase();
            const matchSearch =
                !q ||
                e.name.toLowerCase().includes(q) ||
                e.description.toLowerCase().includes(q) ||
                e.address.toLowerCase().includes(q);
            return matchType && matchSearch;
        });

        if (sort === "name") result = [...result].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

        return result;
    }, [items, search, activeType, sort]);

    const activeCount =
        (activeType !== ALL_TYPES ? 1 : 0) +
        (search.trim() ? 1 : 0);

    function clearAll() {
        setSearch("");
        setActiveType(ALL_TYPES);
        setSort("relevance");
    }

    return (
        <div className="est-page">
            <Header />
            <main className="est-main">

                <section className="est-hero">
                    <img src={heroImg} alt="" className="est-hero__bg" aria-hidden />
                    <div className="est-hero__overlay" />
                    <div className="est-hero__content">
                        <div className="est-hero__inner">
                            <span className="est-hero__kicker">PARQUE NACIONAL DE UBAJARA</span>
                            <h1 className="est-hero__title">Estabelecimentos</h1>
                            <p className="est-hero__subtitle">
                                Restaurantes, pousadas, hotéis e cafeterias para completar
                                sua experiência na Serra da Ibiapaba.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="est-body">

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

                    <aside
                        id="est-sidebar"
                        className={`est-sidebar${sidebarOpen ? " is-open" : ""}`}
                        aria-label="Filtros"
                    >
                        <div className="est-sidebar__section">
                            <p className="est-sidebar__label">Buscar</p>
                            <div className="est-search__wrap">
                                <span className="material-symbols-outlined est-search__icon" aria-hidden="true">search</span>
                                <input
                                    type="search"
                                    placeholder="Nome ou endereço..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="est-search__input"
                                    aria-label="Buscar estabelecimento"
                                />
                            </div>
                        </div>

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

                        {activeCount > 0 && (
                            <button type="button" className="est-sidebar__clear" onClick={clearAll}>
                                <span className="material-symbols-outlined" aria-hidden="true">filter_alt_off</span>
                                Limpar filtros ({activeCount})
                            </button>
                        )}
                    </aside>

                    <div className="est-content">

                        <div className="est-topbar">
                            <p className="est-count">
                                <strong>{filtered.length}</strong>{" "}
                                {filtered.length === 1 ? "estabelecimento" : "estabelecimentos"} encontrados
                            </p>
                            <div className="est-sort">
                                <label htmlFor="est-sort-select" className="est-sort__label">Ordenar:</label>
                                <select
                                    id="est-sort-select"
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value as typeof sort)}
                                    className="est-sort__select"
                                >
                                    <option value="relevance">Relevância</option>
                                    <option value="name">Nome A–Z</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="est-empty">
                                <span className="material-symbols-outlined est-empty__icon">hourglass_top</span>
                                <p className="est-empty__msg">Carregando estabelecimentos...</p>
                            </div>
                        ) : filtered.length > 0 ? (
                            <div className="est-grid">
                                {filtered.map((e) => (
                                    <Link key={e.id} to={`/estabelecimentos/${e.id}?apiType=${e.apiType}`} style={{ textDecoration: "none", color: "inherit" }}>
                                    <article className="est-card" data-type={e.type}>
                                        <div className="est-card__img-wrap">
                                            {e.img ? (
                                                <img src={e.img} alt={e.name} className="est-card__img" loading="lazy" />
                                            ) : (
                                                <div className="est-card__img est-card__img--placeholder" aria-hidden="true" />
                                            )}
                                            <span className="est-card__type-badge">{e.type}</span>
                                            {formatPrice(e.avgPrice) && (
                                                <span className="est-card__price-badge">{formatPrice(e.avgPrice)}</span>
                                            )}
                                        </div>
                                        <div className="est-card__body">
                                            <h3 className="est-card__name">{e.name}</h3>
                                            <p className="est-card__city">
                                                <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
                                                {e.address}
                                            </p>
                                            <p className="est-card__desc">{e.description}</p>
                                            <div className="est-card__features">
                                                {e.features.slice(0, 3).map((f) => (
                                                    <span key={f} className="est-card__feature">{f}</span>
                                                ))}
                                            </div>
                                            {e.openingHours && (
                                                <div className="est-card__footer">
                                                    <span className="est-card__hours">
                                                        <span className="material-symbols-outlined" aria-hidden="true">schedule</span>
                                                        {e.openingHours}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="est-empty">
                                <span className="material-symbols-outlined est-empty__icon">search_off</span>
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

                <section className="est-cta">
                    <div className="est-cta__inner">
                        <h2 className="est-cta__title">Quer Cadastrar seu Estabelecimento?</h2>
                        <p className="est-cta__desc">
                            Faça parte da rede de parceiros do Parque Nacional de Ubajara e aumente
                            sua visibilidade para turistas de todo o Brasil.
                        </p>
                        <div className="est-cta__btns">
                            <a href="#" className="est-cta__btn">Cadastrar Estabelecimento</a>
                            <a href="#" className="est-cta__btn est-cta__btn--outline">Falar com a Equipe</a>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
}
