export const FAVORITES_KEY = "ubajara-favorites";

export interface FavoriteItem {
    id: string;
    name: string;
    type: "attraction" | "event" | "restaurant" | "host-point";
    photo?: string;
    shortDescription?: string;
    path: string;
}

export function loadFavorites(): FavoriteItem[] {
    try {
        const parsed: unknown = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]");
        return Array.isArray(parsed) ? (parsed as FavoriteItem[]) : [];
    } catch {
        return [];
    }
}

/** Alterna o favorito e devolve o estado resultante (true = favoritado). */
export function toggleFavorite(item: FavoriteItem): boolean {
    const current = loadFavorites();
    const exists = current.some((f) => f.id === item.id);
    const next = exists ? current.filter((f) => f.id !== item.id) : [...current, item];
    try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
        return !exists;
    } catch {
        return exists;
    }
}
