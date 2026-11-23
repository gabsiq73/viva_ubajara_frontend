import { useEffect, useState } from "react";

/** Mantém o nó montado até a animação de saída terminar; `state` alimenta o `data-state` usado pelo CSS de transição. */
export function usePresence(open: boolean, exitMs: number) {
    const [exited, setExited] = useState(!open);
    const [entered, setEntered] = useState(false);

    if (open && exited) setExited(false);

    useEffect(() => {
        if (open) {
            // Dois frames: garante que o estado fechado foi pintado antes de virar aberto, senão não há transição de entrada.
            let second = 0;
            const first = requestAnimationFrame(() => {
                second = requestAnimationFrame(() => setEntered(true));
            });
            return () => {
                cancelAnimationFrame(first);
                cancelAnimationFrame(second);
            };
        }
        const timer = window.setTimeout(() => {
            setEntered(false);
            setExited(true);
        }, exitMs);
        return () => window.clearTimeout(timer);
    }, [open, exitMs]);

    return { mounted: open || !exited, state: open && entered ? ("open" as const) : ("closed" as const) };
}
