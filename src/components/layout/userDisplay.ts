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
