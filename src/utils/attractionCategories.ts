import type { AttractionCategory } from "../admin/types";

export const ATTRACTION_CATEGORY_LABELS: Record<AttractionCategory, string> = {
    PARK: "Parque",
    WATERFALL: "Cachoeira",
    MUSEUM: "Museu",
    FARM: "Fazenda",
    ROUTE: "Rota",
    MARKET: "Mercado",
};

export const ATTRACTION_CATEGORY_ICONS: Record<AttractionCategory, string> = {
    PARK: "park",
    WATERFALL: "water_drop",
    MUSEUM: "museum",
    FARM: "agriculture",
    ROUTE: "hiking",
    MARKET: "storefront",
};

export const ATTRACTION_CATEGORY_PLURALS: Record<AttractionCategory, string> = {
    PARK: "Parques",
    WATERFALL: "Cachoeiras",
    MUSEUM: "Museus",
    FARM: "Fazendas",
    ROUTE: "Rotas",
    MARKET: "Mercados",
};
