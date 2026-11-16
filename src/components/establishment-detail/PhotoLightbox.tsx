import { useEffect, useId, useRef, type RefObject, type TouchEvent } from "react";
import { createPortal } from "react-dom";
import Icon from "../ui/Icon";
import { useModalBehavior } from "../../hooks/useModalBehavior";
import type { DetailPhoto } from "../../utils/establishmentDetail";
import "./establishment-detail.css";

interface PhotoLightboxProps {
    title: string;
    photos: DetailPhoto[];
    index: number;
    onIndexChange: (index: number) => void;
    onClose: () => void;
    returnFocusRef: RefObject<HTMLElement | null>;
}

const SWIPE_MIN_DISTANCE = 50;

export default function PhotoLightbox(props: PhotoLightboxProps) {
    if (props.photos.length === 0) return null;
    return <LightboxDialog {...props} />;
}

function LightboxDialog({ title, photos, index, onIndexChange, onClose, returnFocusRef }: PhotoLightboxProps) {
    const titleId = useId();
    const panelRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const touchStart = useRef<{ x: number; y: number } | null>(null);
    const total = photos.length;

    useModalBehavior({ panelRef, onClose, initialFocusRef: closeRef, returnFocusRef });

    const go = (step: number) => onIndexChange((index + step + total) % total);

    useEffect(() => {
        if (total < 2) return;
        const handleKeyDown = (event: globalThis.KeyboardEvent) => {
            if (event.key === "ArrowLeft") onIndexChange((index - 1 + total) % total);
            else if (event.key === "ArrowRight") onIndexChange((index + 1) % total);
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [index, total, onIndexChange]);

    const handleTouchStart = (event: TouchEvent) => {
        const touch = event.touches[0];
        touchStart.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (event: TouchEvent) => {
        const start = touchStart.current;
        touchStart.current = null;
        if (!start || total < 2) return;
        const touch = event.changedTouches[0];
        const dx = touch.clientX - start.x;
        const dy = touch.clientY - start.y;
        if (Math.abs(dx) >= SWIPE_MIN_DISTANCE && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
    };

    const photo = photos[index];

    return createPortal(
        <div
            ref={panelRef}
            className="estd-lightbox"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
        >
            <h2 id={titleId} className="ui-sr-only">
                Fotos de {title}
            </h2>
            <div className="estd-lightbox__bar">
                <span className="estd-lightbox__count" aria-live="polite" aria-atomic="true">
                    {index + 1}/{total}
                </span>
                <button ref={closeRef} type="button" className="estd-lightbox__btn" aria-label="Fechar galeria" onClick={onClose}>
                    <Icon name="close" />
                </button>
            </div>
            <div className="estd-lightbox__stage" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <img key={photo.url} src={photo.url} alt={photo.alt} className="estd-lightbox__img" />
            </div>
            {total > 1 && (
                <>
                    <button
                        type="button"
                        className="estd-lightbox__btn estd-lightbox__nav estd-lightbox__nav--prev"
                        aria-label="Foto anterior"
                        onClick={() => go(-1)}
                    >
                        <Icon name="chevron_left" />
                    </button>
                    <button
                        type="button"
                        className="estd-lightbox__btn estd-lightbox__nav estd-lightbox__nav--next"
                        aria-label="Próxima foto"
                        onClick={() => go(1)}
                    >
                        <Icon name="chevron_right" />
                    </button>
                </>
            )}
        </div>,
        document.body,
    );
}
