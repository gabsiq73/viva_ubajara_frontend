export type RouteAppId = "google" | "waze" | "apple" | "uber";

export interface RouteLink {
    id: RouteAppId;
    name: string;
    mark: string;
    color: string;
    href: string;
}

export interface DirectionInput {
    address: string;
    mapsUrl?: string;
    name: string;
    lat?: number | null;
    lng?: number | null;
}

type WithCoords = DirectionInput & { lat: number; lng: number };

function hasCoords(input: DirectionInput): input is WithCoords {
    return Number.isFinite(input.lat) && Number.isFinite(input.lng);
}

export function isIOS(): boolean {
    const platform = navigator.platform ?? "";
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || (platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

const APPS: Record<RouteAppId, Omit<RouteLink, "href" | "id">> = {
    google: { name: "Google Maps", mark: "G", color: "#1a73e8" },
    waze: { name: "Waze", mark: "W", color: "#1eb4e6" },
    apple: { name: "Apple Maps", mark: "A", color: "#3a3a3c" },
    uber: { name: "Uber", mark: "U", color: "#000000" },
};

function link(id: RouteAppId, href: string): RouteLink {
    return { id, href, ...APPS[id] };
}

/** Uber só entra quando há coordenadas; a ordem é a de exibição (Apple Maps primeiro no iOS). */
export function buildDirectionLinks(input: DirectionInput, iosFirst: boolean = isIOS()): RouteLink[] {
    const address = encodeURIComponent(input.address);
    const links: RouteLink[] = hasCoords(input)
        ? [
              link("google", `https://www.google.com/maps/dir/?api=1&destination=${input.lat},${input.lng}`),
              link("waze", `https://waze.com/ul?ll=${input.lat},${input.lng}&navigate=yes`),
              link("apple", `https://maps.apple.com/?daddr=${input.lat},${input.lng}`),
              link(
                  "uber",
                  `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${input.lat}&dropoff[longitude]=${input.lng}&dropoff[nickname]=${encodeURIComponent(input.name)}`,
              ),
          ]
        : [
              link("google", input.mapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${address}`),
              link("waze", `https://waze.com/ul?q=${address}&navigate=yes`),
              link("apple", `https://maps.apple.com/?daddr=${address}`),
          ];

    if (!iosFirst) return links;
    return [...links.filter((l) => l.id === "apple"), ...links.filter((l) => l.id !== "apple")];
}

/** O `mapsUrl` cadastrado costuma ser link curto/compartilhado, que não pode ser embutido; o embed usa o endereço. */
export function mapEmbedUrl(input: DirectionInput): string {
    const query = hasCoords(input) ? `${input.lat},${input.lng}` : input.address;
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

export function mapExpandUrl(input: DirectionInput): string {
    if (input.mapsUrl) return input.mapsUrl;
    const query = hasCoords(input) ? `${input.lat},${input.lng}` : input.address;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Quebra "Rua X, 120 - Centro, Ubajara - CE" em duas linhas; sem separador reconhecível, devolve uma só. */
export function splitAddress(address: string): string[] {
    const match = address.match(/^(.+?)\s+[-–—]\s+(.+)$/);
    return match ? [match[1].trim(), match[2].trim()] : [address];
}
