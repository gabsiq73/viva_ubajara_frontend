export function getDisplayName(user: { name?: string; email?: string } | null): string {
    return user?.name?.trim() || user?.email?.split("@")[0] || "";
}

export function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    const first = (word: string) => Array.from(word)[0];
    const letters = parts.length > 1
        ? first(parts[0]) + first(parts[parts.length - 1])
        : Array.from(parts[0]).slice(0, 2).join("");
    return letters.toUpperCase();
}

const NAME_SUFFIX = /^(jr|sr|ii|iii|iv|junior|júnior)\.?$/i;

/** Iniciais das duas primeiras palavras do nome; ignora emoji/pontuação soltos e sufixos (Jr, III) e devolve "" quando não sobra letra. */
export function reviewerInitials(name: string): string {
    return name
        .split(/\s+/)
        .filter((word, i) => /[\p{L}\p{N}]/u.test(word) && (i === 0 || !NAME_SUFFIX.test(word)))
        .slice(0, 2)
        .map((word) => Array.from(word.replace(/^[^\p{L}\p{N}]+/u, ""))[0])
        .join("")
        .toUpperCase();
}
