/** Corta em limite de palavra e acrescenta `…`; textos que já cabem voltam intactos. */
export function truncateAtWord(text: string, max: number): string {
    const flat = text.replace(/\s+/g, " ").trim();
    if (flat.length <= max) return flat;
    const cut = flat.slice(0, max);
    const lastSpace = cut.lastIndexOf(" ");
    return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:!?-]+$/, "")}…`;
}
