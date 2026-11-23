import { useEffect, useRef, type PointerEvent, type RefObject } from "react";

const DRAG_START_PX = 6;
const DRAG_CLOSE_PX = 100;
const DRAG_CLOSE_VELOCITY = 0.11;
const EXIT_MS = 250;

interface DragToDismissOptions {
    panelRef: RefObject<HTMLElement | null>;
    backdropRef: RefObject<HTMLElement | null>;
    onClose: () => void;
    /** `data-state` do overlay; ao voltar para "open" os estilos inline do arraste são descartados. */
    state: "open" | "closed";
}

/** Arraste vertical para baixo que fecha por distância ou velocidade, animando o painel até o fim antes de chamar `onClose`. */
export function useDragToDismiss({ panelRef, backdropRef, onClose, state }: DragToDismissOptions) {
    const drag = useRef<{ startY: number; startTime: number; active: boolean; pointerId: number } | null>(null);
    const closeTimer = useRef<number | undefined>(undefined);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    });

    useEffect(() => {
        if (state !== "open") return;
        const panel = panelRef.current;
        const backdrop = backdropRef.current;
        if (panel) {
            panel.style.transition = "";
            panel.style.transform = "";
        }
        if (backdrop) {
            backdrop.style.transition = "";
            backdrop.style.opacity = "";
        }
    }, [state, panelRef, backdropRef]);

    useEffect(() => () => window.clearTimeout(closeTimer.current), []);

    const onPointerDown = (event: PointerEvent<HTMLElement>) => {
        drag.current = { startY: event.clientY, startTime: performance.now(), active: false, pointerId: event.pointerId };
    };

    const onPointerMove = (event: PointerEvent<HTMLElement>) => {
        const d = drag.current;
        const panel = panelRef.current;
        if (!d || !panel) return;
        const dy = Math.max(0, event.clientY - d.startY);
        if (!d.active) {
            if (dy < DRAG_START_PX) return;
            d.active = true;
            event.currentTarget.setPointerCapture(d.pointerId);
            panel.style.transition = "none";
            if (backdropRef.current) backdropRef.current.style.transition = "none";
        }
        panel.style.transform = `translateY(${dy}px)`;
        if (backdropRef.current) backdropRef.current.style.opacity = String(Math.max(0, 1 - dy / panel.offsetHeight));
    };

    const onPointerEnd = (event: PointerEvent<HTMLElement>) => {
        const d = drag.current;
        const panel = panelRef.current;
        const backdrop = backdropRef.current;
        drag.current = null;
        if (!d?.active || !panel) return;
        const dy = event.clientY - d.startY;
        const elapsed = Math.max(1, performance.now() - d.startTime);
        if (event.type === "pointerup" && (dy > DRAG_CLOSE_PX || dy / elapsed > DRAG_CLOSE_VELOCITY)) {
            panel.style.transition = `transform ${EXIT_MS}ms var(--ease-drawer)`;
            panel.style.transform = "translateY(100%)";
            if (backdrop) {
                backdrop.style.transition = `opacity ${EXIT_MS}ms ease`;
                backdrop.style.opacity = "0";
            }
            closeTimer.current = window.setTimeout(() => onCloseRef.current(), EXIT_MS);
            return;
        }
        panel.style.transition = "";
        panel.style.transform = "";
        if (backdrop) {
            backdrop.style.transition = "";
            backdrop.style.opacity = "";
        }
    };

    return { onPointerDown, onPointerMove, onPointerUp: onPointerEnd, onPointerCancel: onPointerEnd };
}
