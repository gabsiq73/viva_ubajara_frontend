import axios from "axios";
import { restaurantsService } from "../admin/services/restaurantsService";
import { hostPointsService } from "../admin/services/hostPointsService";
import type { HostPointResponse, PhotoResponse, RestaurantResponse } from "../admin/types";
import { mapHostPoint, mapRestaurant, roomsLabel, shortPrice, type ApiType, type Establishment } from "./establishments";

export interface DetailPhoto {
    url: string;
    alt: string;
}

export interface EstablishmentDetail extends Establishment {
    photos: DetailPhoto[];
    phone: string;
    email: string;
    webUrl: string;
    bookingUrl: string;
    mapsUrl: string;
    instagram: { handle: string; url: string } | null;
    claimable: boolean;
}

export type DetailLoadResult =
    | { status: "ready"; data: EstablishmentDetail }
    | { status: "not-found" }
    | { status: "error" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseApiType(raw: string | null): ApiType | null {
    return raw === "restaurant" || raw === "hostpoint" ? raw : null;
}

/** Só aceita http(s); devolve "" para vazio ou esquemas perigosos (ex.: javascript:). */
function safeHttpUrl(raw?: string | null): string {
    const text = (raw ?? "").trim();
    if (!text) return "";
    try {
        const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text}`);
        return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
    } catch {
        return "";
    }
}

function instagramFrom(raw?: string | null): EstablishmentDetail["instagram"] {
    const text = (raw ?? "").trim();
    if (!text) return null;
    let handle = text;
    if (/instagram\.com/i.test(text)) {
        try {
            handle = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`).pathname.split("/").filter(Boolean)[0] ?? "";
        } catch {
            return null;
        }
    }
    handle = handle.replace(/^@/, "").trim();
    if (!handle || /[\s/]/.test(handle)) return null;
    return { handle: `@${handle}`, url: `https://www.instagram.com/${encodeURIComponent(handle)}/` };
}

/**
 * O cadastro guarda a mesma imagem em dois recortes ("cover" e "card"); a galeria usa a capa e as
 * demais fotos que não sejam o recorte de card, para não repetir a mesma foto.
 */
function galleryFrom(name: string, photos?: PhotoResponse[] | null): DetailPhoto[] {
    const list = (photos ?? []).filter((p) => p?.url).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    const cover = list.find((p) => p.description === "cover");
    const others = list.filter((p) => p !== cover && p.description !== "card");
    const chosen = [...(cover ? [cover] : []), ...others];
    const final = chosen.length > 0 ? chosen : list.slice(0, 1);
    return final.map((p, i) => ({ url: p.url, alt: `${name} — foto ${i + 1}` }));
}

/** Texto só com pontuação (ex.: ".") conta como vazio. */
export function hasMeaningfulText(text: string): boolean {
    return /[\p{L}\p{N}]/u.test(text);
}

function meaningfulText(text: string): string {
    return hasMeaningfulText(text) ? text : "";
}

function detailFromRestaurant(r: RestaurantResponse): EstablishmentDetail {
    const base = mapRestaurant(r);
    return {
        ...base,
        description: meaningfulText(base.description),
        photos: galleryFrom(base.name, r.photos),
        phone: (r.phone ?? "").trim(),
        email: (r.email ?? "").trim(),
        webUrl: safeHttpUrl(r.webUrl),
        bookingUrl: "",
        mapsUrl: safeHttpUrl(r.mapsUrl),
        instagram: instagramFrom(r.instagramUrl),
        claimable: r.claimable === true,
    };
}

function detailFromHostPoint(h: HostPointResponse): EstablishmentDetail {
    const base = mapHostPoint(h);
    return {
        ...base,
        description: meaningfulText(base.description),
        photos: galleryFrom(base.name, h.photos),
        phone: (h.phone ?? "").trim(),
        email: (h.email ?? "").trim(),
        webUrl: safeHttpUrl(h.webUrl),
        bookingUrl: safeHttpUrl(h.bookingUrl),
        mapsUrl: safeHttpUrl(h.mapsUrl),
        instagram: instagramFrom(h.instagramUrl),
        claimable: h.claimable === true,
    };
}

/** A API responde 404 quando o id não existe naquele tipo (o 401 de id malformado é barrado antes, pela validação de UUID). */
function isMissing(error: unknown): boolean {
    return axios.isAxiosError(error) && [400, 404].includes(error.response?.status ?? 0);
}

async function fetchOne(id: string, type: ApiType): Promise<EstablishmentDetail | null> {
    try {
        return type === "restaurant"
            ? detailFromRestaurant(await restaurantsService.getById(id))
            : detailFromHostPoint(await hostPointsService.getById(id));
    } catch (error) {
        if (isMissing(error)) return null;
        throw error;
    }
}

/** Tenta o tipo indicado na URL e, se o registro não existir nele, o outro tipo. */
export async function loadEstablishmentDetail(id: string, preferred: ApiType | null): Promise<DetailLoadResult> {
    if (!UUID.test(id)) return { status: "not-found" };
    const order: ApiType[] = preferred === "hostpoint" ? ["hostpoint", "restaurant"] : ["restaurant", "hostpoint"];
    try {
        for (const type of order) {
            const data = await fetchOne(id, type);
            if (data) return { status: "ready", data };
        }
        return { status: "not-found" };
    } catch {
        return { status: "error" };
    }
}

/** Ficha rápida: só as colunas que têm dado. */
export function buildFacts(detail: EstablishmentDetail): { label: string; value: string }[] {
    const price = shortPrice(detail.avgPrice);
    const facts =
        detail.type === "Restaurante"
            ? [
                  { label: "Culinária", value: detail.cuisine },
                  { label: "Preço médio", value: price },
                  { label: "Funcionamento", value: detail.openingHours },
              ]
            : [
                  { label: "Tipo", value: detail.type },
                  { label: "Quartos", value: roomsLabel(detail.numOfRooms) },
                  { label: "Preço médio", value: price },
                  { label: "Reserva", value: detail.bookingUrl ? "Online" : "" },
              ];
    return facts.filter((fact) => fact.value);
}

const NEARBY_COUNT = 4;

/** Mesmo tipo de cadastro; prioriza o mesmo bairro (quando conhecido) e depois o mesmo subtipo de hospedagem. */
export async function loadNearby(current: EstablishmentDetail): Promise<Establishment[]> {
    const items: Establishment[] =
        current.apiType === "restaurant"
            ? (await restaurantsService.getAll(0, 100)).content.filter((r) => r.active).map(mapRestaurant)
            : (await hostPointsService.getAll(0, 100)).content.filter((h) => h.active).map(mapHostPoint);

    const score = (e: Establishment) =>
        (current.neighborhood && e.neighborhood === current.neighborhood ? 2 : 0) + (e.type === current.type ? 1 : 0);

    return items
        .filter((e) => e.id !== current.id)
        .map((e, index) => ({ e, index, score: score(e) }))
        .sort((a, b) => b.score - a.score || a.index - b.index)
        .slice(0, NEARBY_COUNT)
        .map(({ e }) => e);
}

/** Devolve "" quando não há dígitos para discar. */
export function telHref(phone: string): string {
    const dialable = phone.replace(/[^\d+]/g, "");
    return /\d/.test(dialable) ? `tel:${dialable}` : "";
}

/** Devolve "" para e-mail inválido, evitando que `?`/`&` injetem parâmetros no mailto. */
export function mailHref(email: string): string {
    return /^[^\s@?&]+@[^\s@?&]+$/.test(email) ? `mailto:${email}` : "";
}

export function correctionHref(name: string): string {
    return `mailto:contato@vivaubajara.com.br?subject=${encodeURIComponent(`Sugestão de correção: ${name}`)}`;
}

/** "R$ 70 / pessoa" -> valor em destaque + unidade; sem " / ", tudo vira valor. */
export function splitPrice(price: string): { value: string; unit: string } {
    const index = price.indexOf(" / ");
    return index > 0 ? { value: price.slice(0, index), unit: price.slice(index) } : { value: price, unit: "" };
}
