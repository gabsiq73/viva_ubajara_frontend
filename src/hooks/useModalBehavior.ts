import { useEffect, useRef, type RefObject } from "react";
import { FOCUSABLE_SELECTOR } from "./focusable";

interface ModalBehaviorOptions {
    panelRef: RefObject<HTMLElement | null>;
    onClose: () => void;
    initialFocusRef: RefObject<HTMLElement | null>;
    /** Elemento que abriu o diálogo; evita depender de `document.activeElement` (Safari não foca botões ao toque). */
    returnFocusRef?: RefObject<HTMLElement | null>;
    /** Desligue ao iniciar a saída animada para soltar o scroll e devolver o foco sem esperar o desmonte. */
    enabled?: boolean;
}

/** Trava a rolagem do body, prende o foco, fecha com Esc e devolve o foco a quem abriu. Use enquanto o diálogo está montado. */
export function useModalBehavior({ panelRef, onClose, initialFocusRef, returnFocusRef, enabled = true }: ModalBehaviorOptions) {
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    });

    useEffect(() => {
        if (!enabled) return;
        const opener = returnFocusRef?.current ?? (document.activeElement as HTMLElement | null);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        initialFocusRef.current?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onCloseRef.current();
                return;
            }
            if (event.key !== "Tab" || !panelRef.current) return;
            const focusables = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
            if (focusables.length === 0) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement;
            if (event.shiftKey && (active === first || !Array.from(focusables).includes(active as HTMLElement))) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && (active === last || !panelRef.current.contains(active))) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
            if (opener?.isConnected) opener.focus();
        };
    }, [panelRef, initialFocusRef, returnFocusRef, enabled]);
}
