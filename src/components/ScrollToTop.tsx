import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const FIND_RETRIES = 20;
const POLL_MS = 50;
const SETTLE_TICKS = 3;
const SETTLE_MAX_TICKS = 60;
const MAX_CORRECTIONS = 3;

export default function ScrollToTop() {
    const { pathname, hash } = useLocation();
    const previousPathname = useRef<string | null>(null);

    useEffect(() => {
        const pathChanged = previousPathname.current !== pathname;
        previousPathname.current = pathname;

        if (!hash) {
            window.scrollTo(0, 0);
            return;
        }

        if (pathChanged) window.scrollTo(0, 0);

        let id = hash.slice(1);
        try {
            id = decodeURIComponent(id);
        } catch {
            // hash malformado: usa o texto cru
        }
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let timer: number | undefined;
        let cancelled = false;
        let target: HTMLElement | null = null;
        let attempts = 0;
        let ticks = 0;
        let stableTicks = 0;
        let corrections = 0;
        let lastY = -1;

        const isAligned = (el: HTMLElement) => {
            const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
            return Math.abs(el.getBoundingClientRect().top - margin) <= 4;
        };

        // O conteúdo acima do alvo pode crescer depois do primeiro scroll (imagens, dados),
        // então, quando a rolagem assenta, confere o alinhamento e corrige.
        const settle = () => {
            if (cancelled || !target) return;
            ticks += 1;
            const y = window.scrollY;
            stableTicks = y === lastY ? stableTicks + 1 : 0;
            lastY = y;
            if (stableTicks >= SETTLE_TICKS) {
                if (isAligned(target) || corrections >= MAX_CORRECTIONS) return;
                corrections += 1;
                stableTicks = 0;
                target.scrollIntoView({ behavior: "auto", block: "start" });
            }
            if (ticks < SETTLE_MAX_TICKS) timer = window.setTimeout(settle, POLL_MS);
        };

        const find = () => {
            if (cancelled) return;
            const el = document.getElementById(id);
            if (el) {
                target = el;
                el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
                timer = window.setTimeout(settle, POLL_MS);
                return;
            }
            attempts += 1;
            if (attempts < FIND_RETRIES) timer = window.setTimeout(find, POLL_MS);
        };

        // Se o usuário assumir a rolagem, para de corrigir.
        const cancel = () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
        const userEvents = ["wheel", "touchstart", "keydown", "mousedown"] as const;
        userEvents.forEach((name) => window.addEventListener(name, cancel, { passive: true, once: true }));

        find();

        return () => {
            cancel();
            userEvents.forEach((name) => window.removeEventListener(name, cancel));
        };
    }, [pathname, hash]);

    return null;
}
