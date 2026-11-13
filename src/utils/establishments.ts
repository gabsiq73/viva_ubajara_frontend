import type { HostPointResponse, HostType, RestaurantResponse } from "../admin/types";
import type { FavoriteItem } from "./favorites";

export type EstablishmentType = "Restaurante" | "Hotel" | "Pousada" | "Hostel";
export type ApiType = "restaurant" | "hostpoint";
export type RoomRange = "ate10" | "11a30" | "mais30";
export type SortKey = "relevance" | "name";

export const ESTABLISHMENT_TYPES: EstablishmentType[] = ["Restaurante", "Hotel", "Pousada", "Hostel"];
export const LODGING_TYPES: EstablishmentType[] = ["Hotel", "Pousada", "Hostel"];

export const TYPE_ICONS: Record<EstablishmentType, string> = {
    Restaurante: "restaurant",
    Hotel: "hotel",
    Pousada: "cottage",
    Hostel: "bed",
};

const HOST_TYPE_LABELS: Record<HostType, EstablishmentType> = {
    HOTEL: "Hotel",
    ROOST: "Pousada",
    HOSTEL: "Hostel",
};

export const ROOM_RANGES: { key: RoomRange; label: string; test: (rooms: number) => boolean }[] = [
    { key: "ate10", label: "Até 10", test: (n) => n <= 10 },
    { key: "11a30", label: "11 a 30", test: (n) => n > 10 && n <= 30 },
    { key: "mais30", label: "Mais de 30", test: (n) => n > 30 },
];

export interface Establishment {
    id: string;
    apiType: ApiType;
    type: EstablishmentType;
    name: string;
    description: string;
    address: string;
    photo: string;
    neighborhood: string;
    openingHours: string;
    avgPrice: string;
    cuisine: string;
    cuisineSlug: string;
    acceptsReservation: boolean;
    starRating: number | null;
    numOfRooms: number | null;
    hasOnlineBooking: boolean;
}

export interface EstablishmentFilters {
    q: string;
    tipo: EstablishmentType | null;
    culinaria: string[];
    reserva: boolean;
    avaliacao: boolean;
    online: boolean;
    quartos: RoomRange | "";
}

export const EMPTY_FILTERS: EstablishmentFilters = {
    q: "",
    tipo: null,
    culinaria: [],
    reserva: false,
    avaliacao: false,
    online: false,
    quartos: "",
};

export interface CuisineOption {
    slug: string;
    label: string;
}

/** Minúsculas e sem acentos, para comparar textos digitados pelo usuário. */
export function normalizeText(text: string): string {
    return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

export function slugify(text: string): string {
    return normalizeText(text).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** Interino: o cadastro ainda não tem campo de bairro. */
export function neighborhoodFromAddress(address?: string | null): string {
    const text = (address ?? "").trim();
    if (!text) return "";
    if (text.includes("—")) return text.split("—").pop()?.trim() ?? "";
    return text.split(",")[0].trim();
}

/** Encurta o texto livre de preço só para exibição; sem padrão conhecido, devolve o texto original. */
export function shortPrice(raw?: string | null): string {
    const text = (raw ?? "").trim();
    if (!text) return "";
    const short = text
        .replace(/a partir de\s*/gi, "")
        .replace(/R\$\s*(\d{1,3}(?:\.\d{3})+|\d+)[,.]00(?!\d)/g, "R$ $1")
        .replace(/\s*\bpor pessoa\b/gi, " / pessoa")
        .replace(/\s*\ba di[áa]ria\b/gi, " / noite")
        .replace(/\s*\bpor cama\b/gi, " / cama")
        .trim();
    return short || text;
}

export function roomsLabel(rooms: number | null): string {
    if (!rooms) return "";
    return rooms === 1 ? "1 quarto" : `${rooms} quartos`;
}

export function mapRestaurant(r: RestaurantResponse): Establishment {
    const cuisine = (r.cuisineType ?? "").trim();
    return {
        id: r.id,
        apiType: "restaurant",
        type: "Restaurante",
        name: r.name ?? "",
        description: r.description ?? "",
        address: r.address ?? "",
        photo: r.photos?.find((p) => p.description === "card")?.url ?? r.photos?.[0]?.url ?? "",
        neighborhood: neighborhoodFromAddress(r.address),
        openingHours: (r.openingHours ?? "").trim(),
        avgPrice: (r.avgPrice ?? "").trim(),
        cuisine,
        cuisineSlug: slugify(cuisine),
        acceptsReservation: !!r.acceptsReservation,
        starRating: r.starRating && r.starRating > 0 ? r.starRating : null,
        numOfRooms: null,
        hasOnlineBooking: false,
    };
}

export function mapHostPoint(h: HostPointResponse): Establishment {
    return {
        id: h.id,
        apiType: "hostpoint",
        type: HOST_TYPE_LABELS[h.hostType] ?? "Hotel",
        name: h.name ?? "",
        description: h.description ?? "",
        address: h.address ?? "",
        photo: h.photos?.find((p) => p.description === "card")?.url ?? h.photos?.[0]?.url ?? "",
        neighborhood: neighborhoodFromAddress(h.address),
        openingHours: "",
        avgPrice: (h.avgPrice ?? "").trim(),
        cuisine: "",
        cuisineSlug: "",
        acceptsReservation: false,
        starRating: null,
        numOfRooms: h.numOfRooms && h.numOfRooms > 0 ? h.numOfRooms : null,
        hasOnlineBooking: !!h.bookingUrl?.trim(),
    };
}

export function establishmentPath(e: Pick<Establishment, "id" | "apiType">): string {
    return `/estabelecimentos/${e.id}?apiType=${e.apiType}`;
}

export function toFavoriteItem(e: Establishment): FavoriteItem {
    return {
        id: e.id,
        name: e.name,
        type: e.apiType === "restaurant" ? "restaurant" : "host-point",
        photo: e.photo || undefined,
        shortDescription: e.description.slice(0, 100) || undefined,
        path: establishmentPath(e),
    };
}

export function cuisineOptionsFrom(items: Establishment[]): CuisineOption[] {
    const bySlug = new Map<string, string>();
    for (const e of items) {
        if (e.cuisineSlug && !bySlug.has(e.cuisineSlug)) bySlug.set(e.cuisineSlug, e.cuisine);
    }
    return [...bySlug.entries()]
        .map(([slug, label]) => ({ slug, label }))
        .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}

export function humanizeSlug(slug: string): string {
    const text = slug.replace(/-/g, " ");
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Descarta filtros que não fazem sentido para o tipo escolhido. */
export function sanitizeFilters(filters: EstablishmentFilters): EstablishmentFilters {
    const lodging = filters.tipo !== null && LODGING_TYPES.includes(filters.tipo);
    const restaurant = filters.tipo === "Restaurante";
    return {
        ...filters,
        culinaria: lodging ? [] : filters.culinaria,
        reserva: lodging ? false : filters.reserva,
        avaliacao: lodging ? false : filters.avaliacao,
        online: restaurant ? false : filters.online,
        quartos: restaurant ? "" : filters.quartos,
    };
}

export function parseFilters(params: URLSearchParams): { filters: EstablishmentFilters; invalidType: string | null } {
    const rawType = (params.get("tipo") ?? "").trim();
    let tipo: EstablishmentType | null = null;
    let invalidType: string | null = null;
    if (rawType && normalizeText(rawType) !== "todos") {
        tipo = ESTABLISHMENT_TYPES.find((t) => normalizeText(t) === normalizeText(rawType)) ?? null;
        if (!tipo) invalidType = rawType;
    }

    const culinaria = [
        ...new Set(
            (params.get("culinaria") ?? "")
                .split(",")
                .map(slugify)
                .filter(Boolean),
        ),
    ];
    const quartos = params.get("quartos") ?? "";

    const filters = sanitizeFilters({
        q: (params.get("q") ?? "").trim(),
        tipo,
        culinaria,
        reserva: params.get("reserva") === "1",
        avaliacao: params.get("avaliacao") === "4",
        online: params.get("online") === "1",
        quartos: ROOM_RANGES.some((r) => r.key === quartos) ? (quartos as RoomRange) : "",
    });
    return { filters, invalidType };
}

const MANAGED_PARAMS = ["tipo", "culinaria", "reserva", "avaliacao", "online", "quartos", "q"];

/** Reescreve só os parâmetros dos filtros; os demais de `current` (ex.: utm_*) são preservados. */
export function serializeFilters(filters: EstablishmentFilters, current?: URLSearchParams): string {
    const params = new URLSearchParams(current);
    for (const key of MANAGED_PARAMS) params.delete(key);
    if (filters.tipo) params.set("tipo", filters.tipo);
    if (filters.culinaria.length) params.set("culinaria", filters.culinaria.join(","));
    if (filters.reserva) params.set("reserva", "1");
    if (filters.avaliacao) params.set("avaliacao", "4");
    if (filters.online) params.set("online", "1");
    if (filters.quartos) params.set("quartos", filters.quartos);
    if (filters.q.trim()) params.set("q", filters.q.trim());
    return params.toString().replace(/%2C/g, ",");
}

export function applyFilters(items: Establishment[], filters: EstablishmentFilters): Establishment[] {
    const q = normalizeText(filters.q);
    const range = ROOM_RANGES.find((r) => r.key === filters.quartos);
    return items.filter((e) => {
        if (filters.tipo && e.type !== filters.tipo) return false;
        if (q && !normalizeText(`${e.name} ${e.description} ${e.address} ${e.cuisine}`).includes(q)) return false;
        const isRestaurant = e.type === "Restaurante";
        if (filters.culinaria.length && !(isRestaurant && filters.culinaria.includes(e.cuisineSlug))) return false;
        if (filters.reserva && !(isRestaurant && e.acceptsReservation)) return false;
        if (filters.avaliacao && !(isRestaurant && (e.starRating ?? 0) >= 4)) return false;
        if (filters.online && !(!isRestaurant && e.hasOnlineBooking)) return false;
        if (range && !(!isRestaurant && e.numOfRooms !== null && range.test(e.numOfRooms))) return false;
        return true;
    });
}

export function sortEstablishments(items: Establishment[], sort: SortKey): Establishment[] {
    if (sort === "name") return [...items].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    return items;
}
