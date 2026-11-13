import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FiltersPanel from "../components/establishments/FiltersPanel";
import BottomSheet from "../components/ui/BottomSheet";
import { Button, ButtonLink } from "../components/ui/Button";
import { AppliedChip, FilterChip } from "../components/ui/Chip";
import EstablishmentCard from "../components/ui/EstablishmentCard";
import Icon from "../components/ui/Icon";
import PageHero from "../components/ui/PageHero";
import SearchField from "../components/ui/SearchField";
import { EstablishmentCardSkeleton, Skeleton } from "../components/ui/Skeleton";
import StateBlock from "../components/ui/StateBlock";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { restaurantsService } from "../admin/services/restaurantsService";
import { hostPointsService } from "../admin/services/hostPointsService";
import { pageConfigService } from "../admin/services/pageConfigService";
import {
    EMPTY_FILTERS,
    ESTABLISHMENT_TYPES,
    ROOM_RANGES,
    applyFilters,
    cuisineOptionsFrom,
    humanizeSlug,
    mapHostPoint,
    mapRestaurant,
    parseFilters,
    sanitizeFilters,
    serializeFilters,
    sortEstablishments,
    toFavoriteItem,
    type Establishment,
    type EstablishmentFilters,
    type EstablishmentType,
    type SortKey,
} from "../utils/establishments";
import { loadFavorites, toggleFavorite } from "../utils/favorites";
import "../components/ui/ui.css";
import "./style/Estabelecimentos.css";

type LoadStatus = "loading" | "ready" | "error";
type ViewMode = "grid" | "list";
type PartialFailure = "restaurantes" | "hospedagens" | null;

interface ActiveFilter {
    key: string;
    label: string;
    quoted?: boolean;
    remove: Partial<EstablishmentFilters>;
}

const VIEW_KEY = "ubajara-estabelecimentos-view";
const SEARCH_DEBOUNCE_MS = 300;
const HERO_DESCRIPTION = "Restaurantes, pousadas, hotéis e hostels de Ubajara, cadastrados por quem é daqui.";

function loadView(): ViewMode {
    try {
        return localStorage.getItem(VIEW_KEY) === "list" ? "list" : "grid";
    } catch {
        return "grid";
    }
}

async function fetchEstablishments() {
    const [restaurants, hostPoints] = await Promise.allSettled([
        restaurantsService.getAll(0, 100),
        hostPointsService.getAll(0, 100),
    ]);
    return {
        restaurants:
            restaurants.status === "fulfilled" ? restaurants.value.content.filter((r) => r.active).map(mapRestaurant) : null,
        hostPoints:
            hostPoints.status === "fulfilled" ? hostPoints.value.content.filter((h) => h.active).map(mapHostPoint) : null,
    };
}

export default function Estabelecimentos() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { filters: urlFilters, invalidType } = useMemo(() => parseFilters(searchParams), [searchParams]);

    const [items, setItems] = useState<Establishment[]>([]);
    const [status, setStatus] = useState<LoadStatus>("loading");
    const [partial, setPartial] = useState<PartialFailure>(null);
    const [heroImage, setHeroImage] = useState<string | null>(null);
    const [heroDescription, setHeroDescription] = useState(HERO_DESCRIPTION);
    const [sort, setSort] = useState<SortKey>("relevance");
    const [view, setView] = useState<ViewMode>(loadView);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set(loadFavorites().map((f) => f.id)));

    const [searchInput, setSearchInput] = useState(urlFilters.q);
    const [lastUrlQuery, setLastUrlQuery] = useState(urlFilters.q);
    if (lastUrlQuery !== urlFilters.q) {
        setLastUrlQuery(urlFilters.q);
        if (searchInput.trim() !== urlFilters.q) setSearchInput(urlFilters.q);
    }

    const isMobile = useMediaQuery("(max-width: 768px)");
    const effectiveView: ViewMode = isMobile ? "grid" : view;

    const filters = useMemo<EstablishmentFilters>(() => ({ ...urlFilters, q: searchInput.trim() }), [urlFilters, searchInput]);
    const filtersRef = useRef(filters);
    const debounceRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        filtersRef.current = filters;
    });

    useEffect(() => () => window.clearTimeout(debounceRef.current), []);

    const applyResult = useCallback((result: Awaited<ReturnType<typeof fetchEstablishments>>) => {
        if (result.restaurants === null && result.hostPoints === null) {
            setStatus("error");
            return;
        }
        setItems([...(result.restaurants ?? []), ...(result.hostPoints ?? [])]);
        setPartial(result.restaurants === null ? "restaurantes" : result.hostPoints === null ? "hospedagens" : null);
        setStatus("ready");
    }, []);

    useEffect(() => {
        let cancelled = false;
        fetchEstablishments().then((result) => {
            if (!cancelled) applyResult(result);
        });
        return () => {
            cancelled = true;
        };
    }, [applyResult]);

    useEffect(() => {
        let cancelled = false;
        pageConfigService.getConfig("ESTABELECIMENTOS").then((cfg) => {
            if (cancelled) return;
            setHeroImage(cfg.imageUrl || null);
            if (cfg.description) setHeroDescription(cfg.description);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    function retry() {
        setStatus("loading");
        fetchEstablishments().then(applyResult);
    }

    function commit(next: EstablishmentFilters) {
        window.clearTimeout(debounceRef.current);
        setSearchParams((prev) => serializeFilters(next, prev), { replace: true });
    }

    function updateFilters(patch: Partial<EstablishmentFilters>) {
        commit(sanitizeFilters({ ...filters, ...patch }));
    }

    function handleSearch(value: string) {
        setSearchInput(value);
        window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => {
            commit({ ...filtersRef.current, q: value.trim() });
        }, SEARCH_DEBOUNCE_MS);
    }

    function clearSearch() {
        setSearchInput("");
        commit({ ...filters, q: "" });
    }

    function removeFilter(filter: ActiveFilter) {
        if ("q" in filter.remove) clearSearch();
        else updateFilters(filter.remove);
    }

    function clearAll() {
        window.clearTimeout(debounceRef.current);
        setSearchInput("");
        commit(EMPTY_FILTERS);
    }

    function changeView(next: ViewMode) {
        setView(next);
        try {
            localStorage.setItem(VIEW_KEY, next);
        } catch {
            /* preferência não persistida; segue só na sessão */
        }
    }

    function handleToggleFavorite(item: Establishment) {
        const nowFavorite = toggleFavorite(toFavoriteItem(item));
        setFavoriteIds((prev) => {
            const next = new Set(prev);
            if (nowFavorite) next.add(item.id);
            else next.delete(item.id);
            return next;
        });
    }

    const closeSheet = useCallback(() => setSheetOpen(false), []);

    const cuisineOptions = useMemo(() => cuisineOptionsFrom(items), [items]);

    const typeCounts = useMemo(() => {
        const counts = { Todos: items.length, Restaurante: 0, Hotel: 0, Pousada: 0, Hostel: 0 } as Record<
            EstablishmentType | "Todos",
            number
        >;
        for (const e of items) counts[e.type] += 1;
        return counts;
    }, [items]);

    const results = useMemo(() => sortEstablishments(applyFilters(items, filters), sort), [items, filters, sort]);

    const activeFilters: ActiveFilter[] = [];
    if (filters.q) activeFilters.push({ key: "q", label: filters.q, quoted: true, remove: { q: "" } });
    if (filters.tipo) activeFilters.push({ key: "tipo", label: filters.tipo, remove: { tipo: null } });
    for (const slug of filters.culinaria) {
        activeFilters.push({
            key: `culinaria-${slug}`,
            label: cuisineOptions.find((c) => c.slug === slug)?.label ?? humanizeSlug(slug),
            remove: { culinaria: filters.culinaria.filter((s) => s !== slug) },
        });
    }
    if (filters.reserva) activeFilters.push({ key: "reserva", label: "Aceita reservas", remove: { reserva: false } });
    if (filters.avaliacao) activeFilters.push({ key: "avaliacao", label: "4★ ou mais", remove: { avaliacao: false } });
    if (filters.online) activeFilters.push({ key: "online", label: "Reserva online", remove: { online: false } });
    if (filters.quartos) {
        const range = ROOM_RANGES.find((r) => r.key === filters.quartos);
        activeFilters.push({ key: "quartos", label: `${range?.label ?? ""} quartos`, remove: { quartos: "" } });
    }

    const loading = status === "loading";
    const ready = status === "ready";
    const countLabel = `${results.length} ${results.length === 1 ? "estabelecimento" : "estabelecimentos"}`;
    const endLabel =
        results.length === 1 ? "Você viu o único resultado" : `Você viu todos os ${results.length} resultados`;

    const panelProps = { filters, typeCounts, cuisineOptions, onChange: updateFilters };

    return (
        <div className="estab-page">
            <Header />
            <main>
                <PageHero
                    image={heroImage}
                    breadcrumb={[{ label: "Início", to: "/" }, { label: "Estabelecimentos" }]}
                    eyebrow="Onde comer e dormir"
                    title="Sabores e pousos da"
                    accent="serra"
                    description={heroDescription}
                />

                {status !== "error" && (
                    <div className="estab-mobilebar">
                        <div className="ui-container">
                            {loading ? (
                                <div className="estab-mobilebar__inner" aria-hidden="true">
                                    <Skeleton height={44} radius={50} />
                                    <div className="estab-mobilebar__chips">
                                        <Skeleton width={70} height={36} radius={50} />
                                        <Skeleton width={110} height={36} radius={50} />
                                        <Skeleton width={80} height={36} radius={50} />
                                    </div>
                                </div>
                            ) : (
                                <div className="estab-mobilebar__inner">
                                    <div className="estab-mobilebar__row">
                                        <SearchField
                                            compact
                                            className="estab-mobilebar__search"
                                            value={searchInput}
                                            onChange={handleSearch}
                                            onClear={clearSearch}
                                            ariaLabel="Buscar estabelecimento"
                                        />
                                        <button
                                            type="button"
                                            className="estab-mobilebar__filters"
                                            aria-haspopup="dialog"
                                            aria-expanded={sheetOpen}
                                            onClick={() => setSheetOpen(true)}
                                        >
                                            <Icon name="tune" />
                                            Filtros
                                            {activeFilters.length > 0 && (
                                                <span className="estab-mobilebar__badge">{activeFilters.length}</span>
                                            )}
                                        </button>
                                    </div>
                                    <div className="estab-mobilebar__chips" role="group" aria-label="Tipo">
                                        {(["Todos", ...ESTABLISHMENT_TYPES] as const).map((t) => (
                                            <FilterChip
                                                key={t}
                                                label={t}
                                                count={typeCounts[t]}
                                                selected={(filters.tipo ?? "Todos") === t}
                                                onClick={() => updateFilters({ tipo: t === "Todos" ? null : t })}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="estab-body">
                    <div className={`ui-container estab-layout${status === "error" ? " estab-layout--single" : ""}`}>
                        {status !== "error" && (
                            <aside className="estab-sidebar" aria-label="Filtros">
                                {loading ? (
                                    <div className="estab-sidebar__skeleton" aria-hidden="true">
                                        <Skeleton height={48} radius={50} />
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <Skeleton key={i} height={44} radius={12} />
                                        ))}
                                    </div>
                                ) : (
                                    <FiltersPanel
                                        {...panelProps}
                                        variant="sidebar"
                                        search={searchInput}
                                        onSearch={handleSearch}
                                        onSearchClear={clearSearch}
                                    />
                                )}
                            </aside>
                        )}

                        <section className="estab-results" aria-label="Resultados" aria-busy={loading}>
                            {invalidType && (
                                <StateBlock variant="notice" icon="info" title={`Não temos a categoria “${invalidType}”.`}>
                                    Mostrando todos os estabelecimentos. Para outras experiências, veja{" "}
                                    <Link to="/pontos-turisticos">Atrativos</Link>.
                                </StateBlock>
                            )}
                            {ready && partial && (
                                <StateBlock
                                    variant="notice"
                                    icon="info"
                                    title={
                                        partial === "restaurantes"
                                            ? "Não conseguimos carregar os restaurantes agora."
                                            : "Não conseguimos carregar as hospedagens agora."
                                    }
                                >
                                    {partial === "restaurantes"
                                        ? "Estamos mostrando só as hospedagens."
                                        : "Estamos mostrando só os restaurantes."}{" "}
                                    Atualize a página para tentar de novo.
                                </StateBlock>
                            )}

                            {status === "error" && (
                                <StateBlock
                                    variant="error"
                                    icon="wifi_off"
                                    title="Não conseguimos carregar os estabelecimentos"
                                    actions={
                                        <Button large icon="refresh" onClick={retry}>
                                            Tentar de novo
                                        </Button>
                                    }
                                >
                                    A conexão na serra pode oscilar. Verifique o sinal e tente de novo.
                                </StateBlock>
                            )}

                            {loading && (
                                <>
                                    <div className="estab-toolbar" aria-hidden="true">
                                        <Skeleton width={180} height={28} />
                                    </div>
                                    <div className={effectiveView === "list" ? "estab-list" : "estab-grid"}>
                                        {Array.from({ length: effectiveView === "list" ? 4 : 6 }, (_, i) => (
                                            <EstablishmentCardSkeleton key={i} view={effectiveView} />
                                        ))}
                                    </div>
                                </>
                            )}

                            {ready && (
                                <>
                                    <h2 className="ui-sr-only">Resultados</h2>
                                    <div className="estab-toolbar">
                                        <p className="estab-count" aria-live="polite" aria-atomic="true">
                                            {countLabel}
                                        </p>
                                        <div className="estab-toolbar__controls">
                                            <label className="estab-sort">
                                                <span className="estab-sort__label">Ordenar</span>
                                                <select
                                                    className="estab-sort__select"
                                                    value={sort}
                                                    onChange={(e) => setSort(e.target.value as SortKey)}
                                                >
                                                    <option value="relevance">Relevância</option>
                                                    <option value="name">Nome A–Z</option>
                                                </select>
                                            </label>
                                            <div className="estab-view" role="group" aria-label="Visualização">
                                                <button
                                                    type="button"
                                                    className={`estab-view__btn${view === "grid" ? " estab-view__btn--on" : ""}`}
                                                    aria-label="Grade"
                                                    aria-pressed={view === "grid"}
                                                    onClick={() => changeView("grid")}
                                                >
                                                    <Icon name="grid_view" />
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`estab-view__btn${view === "list" ? " estab-view__btn--on" : ""}`}
                                                    aria-label="Lista"
                                                    aria-pressed={view === "list"}
                                                    onClick={() => changeView("list")}
                                                >
                                                    <Icon name="view_agenda" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {activeFilters.length > 0 && (
                                        <div className="estab-applied">
                                            {activeFilters.map((f) => (
                                                <AppliedChip
                                                    key={f.key}
                                                    label={f.label}
                                                    quoted={f.quoted}
                                                    onRemove={() => removeFilter(f)}
                                                />
                                            ))}
                                            <button type="button" className="estab-applied__clear" onClick={clearAll}>
                                                Limpar filtros
                                            </button>
                                        </div>
                                    )}

                                    {results.length === 0 ? (
                                        <StateBlock
                                            variant="empty"
                                            icon="search_off"
                                            title={
                                                activeFilters.length > 0
                                                    ? "Nenhum estabelecimento com esses filtros"
                                                    : "Ainda não há estabelecimentos cadastrados"
                                            }
                                            actions={activeFilters.map((f) => (
                                                <AppliedChip
                                                    key={f.key}
                                                    variant="outline"
                                                    label={f.label}
                                                    quoted={f.quoted}
                                                    onRemove={() => removeFilter(f)}
                                                />
                                            ))}
                                        >
                                            {activeFilters.length > 0
                                                ? "Remova um deles para ver mais opções:"
                                                : "Volte em breve para conhecer os lugares da serra."}
                                        </StateBlock>
                                    ) : (
                                        <>
                                            <div className={effectiveView === "list" ? "estab-list" : "estab-grid"}>
                                                {results.map((item) => (
                                                    <EstablishmentCard
                                                        key={`${item.apiType}-${item.id}`}
                                                        item={item}
                                                        view={effectiveView}
                                                        favorite={favoriteIds.has(item.id)}
                                                        onToggleFavorite={handleToggleFavorite}
                                                    />
                                                ))}
                                            </div>
                                            <div className="estab-end">
                                                <span className="estab-end__bar" aria-hidden="true" />
                                                <span className="estab-end__text">{endLabel}</span>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </section>
                    </div>
                </div>

                <section className="estab-cta">
                    <div className="ui-container estab-cta__inner">
                        <div className="estab-cta__text">
                            <span className="estab-cta__eyebrow">Para donos de negócio</span>
                            <h2 className="estab-cta__title">Tem restaurante ou pousada na serra?</h2>
                            <p className="estab-cta__desc">
                                Cadastre grátis. A equipe revisa e publica seu estabelecimento aqui.
                            </p>
                        </div>
                        <div className="estab-cta__actions">
                            <ButtonLink to="/cadastro-empresa" variant="gold" large>
                                Cadastre seu negócio
                            </ButtonLink>
                            <ButtonLink to="/contato" variant="outline" large iconAfter="arrow_forward">
                                Falar com a equipe
                            </ButtonLink>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />

            <BottomSheet
                open={sheetOpen}
                onClose={closeSheet}
                title="Filtros"
                footer={
                    <>
                        <button type="button" className="estab-sheet__clear" onClick={clearAll}>
                            Limpar
                        </button>
                        <Button large onClick={closeSheet}>
                            {results.length === 1 ? "Ver 1 resultado" : `Ver ${results.length} resultados`}
                        </Button>
                    </>
                }
            >
                <FiltersPanel {...panelProps} variant="sheet" />
            </BottomSheet>
        </div>
    );
}
