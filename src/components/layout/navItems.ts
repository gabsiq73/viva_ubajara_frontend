export interface NavItem {
    label: string;
    to: string;
    /** Prefixos de rota que também marcam o item como ativo (ex.: páginas de detalhe). */
    match: string[];
}

export const NAV_ITEMS: NavItem[] = [
    { label: "Atrativos", to: "/pontos-turisticos", match: ["/pontos-turisticos", "/pontos", "/local"] },
    { label: "Onde comer e dormir", to: "/estabelecimentos", match: ["/estabelecimentos"] },
    { label: "Eventos", to: "/eventos", match: ["/eventos"] },
    { label: "Como chegar", to: "/como-chegar", match: ["/como-chegar"] },
];

export function isNavActive(pathname: string, item: NavItem): boolean {
    return item.match.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
