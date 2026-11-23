import { useId } from "react";
import { FilterChip } from "../ui/Chip";
import Collapse from "../ui/Collapse";
import Icon from "../ui/Icon";
import SearchField from "../ui/SearchField";
import Toggle from "../ui/Toggle";
import {
    ESTABLISHMENT_TYPES,
    LODGING_TYPES,
    ROOM_RANGES,
    TYPE_ICONS,
    type CuisineOption,
    type EstablishmentFilters,
    type EstablishmentType,
} from "../../utils/establishments";

interface FiltersPanelProps {
    variant: "sidebar" | "sheet";
    filters: EstablishmentFilters;
    typeCounts: Record<EstablishmentType | "Todos", number>;
    cuisineOptions: CuisineOption[];
    onChange: (patch: Partial<EstablishmentFilters>) => void;
    search?: string;
    onSearch?: (value: string) => void;
    onSearchClear?: () => void;
}

export default function FiltersPanel({
    variant,
    filters,
    typeCounts,
    cuisineOptions,
    onChange,
    search = "",
    onSearch,
    onSearchClear,
}: FiltersPanelProps) {
    const uid = useId();
    const isSheet = variant === "sheet";
    const showRestaurantFilters = !filters.tipo || !LODGING_TYPES.includes(filters.tipo);
    const showLodgingFilters = filters.tipo !== "Restaurante";
    const typeOptions: (EstablishmentType | "Todos")[] = ["Todos", ...ESTABLISHMENT_TYPES];

    function toggleCuisine(slug: string) {
        const next = filters.culinaria.includes(slug)
            ? filters.culinaria.filter((s) => s !== slug)
            : [...filters.culinaria, slug];
        onChange({ culinaria: next });
    }

    return (
        <div className={`estab-panel estab-panel--${variant}`}>
            {!isSheet && onSearch && onSearchClear && (
                <SearchField
                    value={search}
                    onChange={onSearch}
                    onClear={onSearchClear}
                    placeholder="Ex.: feijoada, pousada, centro…"
                    ariaLabel="Buscar estabelecimento"
                />
            )}

            <div className="estab-panel__group" role="group" aria-labelledby={`${uid}-tipo`}>
                <span id={`${uid}-tipo`} className="estab-panel__label">Tipo</span>
                {isSheet ? (
                    <div className="estab-panel__chips">
                        {typeOptions.map((t) => (
                            <FilterChip
                                key={t}
                                size="lg"
                                icon={t === "Todos" ? "storefront" : TYPE_ICONS[t]}
                                label={t}
                                selected={(filters.tipo ?? "Todos") === t}
                                onClick={() => onChange({ tipo: t === "Todos" ? null : t })}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="estab-panel__types">
                        {typeOptions.map((t) => {
                            const selected = (filters.tipo ?? "Todos") === t;
                            return (
                                <button
                                    key={t}
                                    type="button"
                                    className={`estab-type${selected ? " estab-type--on" : ""}`}
                                    aria-pressed={selected}
                                    onClick={() => onChange({ tipo: t === "Todos" ? null : t })}
                                >
                                    <Icon name={t === "Todos" ? "storefront" : TYPE_ICONS[t]} />
                                    <span className="estab-type__label">{t}</span>
                                    <span className="estab-type__count">{typeCounts[t]}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <Collapse open={showRestaurantFilters} className="estab-panel__collapse">
                <div className="estab-panel__group estab-panel__group--section" role="group" aria-labelledby={`${uid}-rest`}>
                    <span id={`${uid}-rest`} className="estab-panel__label">{isSheet ? "Culinária" : "Restaurantes"}</span>
                    {cuisineOptions.length > 0 && (
                        <>
                            {!isSheet && <span className="estab-panel__sublabel">Culinária</span>}
                            <div className="estab-panel__chips">
                                {cuisineOptions.map((c) => (
                                    <FilterChip
                                        key={c.slug}
                                        size={isSheet ? "lg" : "sm"}
                                        label={c.label}
                                        selected={filters.culinaria.includes(c.slug)}
                                        onClick={() => toggleCuisine(c.slug)}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                    <Toggle
                        large={isSheet}
                        label="Aceita reservas"
                        checked={filters.reserva}
                        onChange={(checked) => onChange({ reserva: checked })}
                    />
                    <Toggle
                        large={isSheet}
                        label={
                            <>
                                Avaliação 4 <Icon name="star" filled /> ou mais
                            </>
                        }
                        checked={filters.avaliacao}
                        onChange={(checked) => onChange({ avaliacao: checked })}
                    />
                </div>
            </Collapse>

            <Collapse open={showLodgingFilters} className="estab-panel__collapse">
                <div className="estab-panel__group estab-panel__group--section" role="group" aria-labelledby={`${uid}-hosp`}>
                    <span id={`${uid}-hosp`} className="estab-panel__label">Hospedagem</span>
                    <span className="estab-panel__sublabel">Nº de quartos</span>
                    <div className="estab-panel__chips">
                        {ROOM_RANGES.map((range) => (
                            <FilterChip
                                key={range.key}
                                size={isSheet ? "lg" : "sm"}
                                label={range.label}
                                selected={filters.quartos === range.key}
                                onClick={() => onChange({ quartos: filters.quartos === range.key ? "" : range.key })}
                            />
                        ))}
                    </div>
                    <Toggle
                        large={isSheet}
                        label="Reserva online"
                        checked={filters.online}
                        onChange={(checked) => onChange({ online: checked })}
                    />
                </div>
            </Collapse>
        </div>
    );
}
