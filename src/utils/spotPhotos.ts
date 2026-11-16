import type { PhotoResponse } from "../admin/types";
import type { DetailPhoto } from "./establishmentDetail";

/**
 * Galeria de pontos turísticos e locais: o cadastro guarda a mesma imagem em dois recortes ("cover" e
 * "card"), então o card é descartado; capa primeiro, "how_to_get" por último e URLs repetidas só entram uma vez.
 */
export function buildSpotGallery(name: string, photos?: PhotoResponse[] | null): DetailPhoto[] {
    const sorted = (photos ?? [])
        .filter((p) => p?.url && p.description !== "card")
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

    const seen = new Set<string>();
    const unique = sorted.filter((p) => !seen.has(p.url) && seen.add(p.url));

    const cover = unique.filter((p) => p.description === "cover");
    const howToGet = unique.filter((p) => p.description === "how_to_get");
    const rest = unique.filter((p) => p.description !== "cover" && p.description !== "how_to_get");

    const ordered = [...cover, ...rest, ...howToGet];
    return ordered.map((p, i) => ({ url: p.url, alt: `${name} — foto ${i + 1} de ${ordered.length}` }));
}
