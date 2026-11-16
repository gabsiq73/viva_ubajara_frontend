const KEY = "ubajara_return_to";
const MAX_AGE_MS = 30 * 60 * 1000;

/** sessionStorage porque o login social troca de página por completo. */
export function saveReturnTo(path: string): void {
    try {
        sessionStorage.setItem(KEY, JSON.stringify({ path, savedAt: Date.now() }));
    } catch {
        // armazenamento indisponível: a pessoa só cai no destino padrão
    }
}

/** Lê e remove o destino salvo; só devolve caminhos internos recentes. */
export function consumeReturnTo(): string | null {
    let raw: string | null = null;
    try {
        raw = sessionStorage.getItem(KEY);
        sessionStorage.removeItem(KEY);
    } catch {
        return null;
    }
    if (!raw) return null;
    try {
        const { path, savedAt } = JSON.parse(raw) as { path?: unknown; savedAt?: unknown };
        if (typeof path !== "string" || typeof savedAt !== "number") return null;
        if (Date.now() - savedAt > MAX_AGE_MS) return null;
        if (!path.startsWith("/") || path.startsWith("//") || path.includes("://") || path.includes("\\")) return null;
        return path;
    } catch {
        return null;
    }
}
