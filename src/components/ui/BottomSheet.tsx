import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FOCUSABLE_SELECTOR } from "../../hooks/focusable";
import Icon from "./Icon";

interface BottomSheetProps {
    open: boolean;
    onClose: () => void;
    title: string;
    footer?: ReactNode;
    children: ReactNode;
}

export default function BottomSheet({ open, onClose, title, footer, children }: BottomSheetProps) {
    const titleId = useId();
    const panelRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    });

    useEffect(() => {
        if (!open) return;
        const previouslyFocused = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeRef.current?.focus();

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
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
            previouslyFocused?.focus();
        };
    }, [open]);

    if (!open) return null;

    return createPortal(
        <div className="ui-sheet">
            <div className="ui-sheet__backdrop" onClick={onClose} aria-hidden="true" />
            <div ref={panelRef} className="ui-sheet__panel" role="dialog" aria-modal="true" aria-labelledby={titleId}>
                <span className="ui-sheet__handle" aria-hidden="true" />
                <div className="ui-sheet__header">
                    <h2 id={titleId} className="ui-sheet__title">
                        {title}
                    </h2>
                    <button ref={closeRef} type="button" className="ui-sheet__close" aria-label="Fechar" onClick={onClose}>
                        <Icon name="close" />
                    </button>
                </div>
                <div className="ui-sheet__body">{children}</div>
                {footer && <div className="ui-sheet__footer">{footer}</div>}
            </div>
        </div>,
        document.body,
    );
}
