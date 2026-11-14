import { useEffect, useState } from "react";

function readOffset(): number {
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--site-header-h"));
    return (Number.isFinite(header) ? header : 64) + 72 + 8;
}

/** Devolve o id da primeira seção visível na faixa logo abaixo do header + barra de seções. */
export function useScrollSpy(ids: string[]): string | undefined {
    const [active, setActive] = useState<string | undefined>(ids[0]);
    const key = ids.join("|");

    useEffect(() => {
        const list = key ? key.split("|") : [];
        const elements = list.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
        if (elements.length === 0 || typeof IntersectionObserver === "undefined") return;

        const visible = new Set<string>();
        const offset = readOffset();
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) visible.add(entry.target.id);
                    else visible.delete(entry.target.id);
                }
                const first = list.find((id) => visible.has(id));
                if (first) setActive(first);
            },
            { rootMargin: `-${offset}px 0px -55% 0px` },
        );
        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [key]);

    return active !== undefined && ids.includes(active) ? active : ids[0];
}
