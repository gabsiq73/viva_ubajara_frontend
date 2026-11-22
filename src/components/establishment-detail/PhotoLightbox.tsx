import { useEffect, useId, useRef, useState, type CSSProperties, type RefObject, type TouchEvent } from "react";
import { createPortal } from "react-dom";
import Icon from "../ui/Icon";
import { useModalBehavior } from "../../hooks/useModalBehavior";
import type { DetailPhoto } from "../../utils/establishmentDetail";
import { usePresence } from "../../utils/usePresence";
import "./establishment-detail.css";

interface PhotoLightboxProps {
    title: string;
    photos: DetailPhoto[];
    index: number | null;
    onIndexChange: (index: number) => void;
    onClose: () => void;
    returnFocusRef: RefObject<HTMLElement | null>;
}

const SWIPE_MIN_DISTANCE = 50;
const EXIT_MS = 150;
const SWAP_MS = 160;

export default function PhotoLightbox(props: PhotoLightboxProps) {
    if (props.photos.length === 0) return null;
    return <LightboxDialog {...props} />;
}

function LightboxDialog({ title, photos, index, onIndexChange, onClose, returnFocusRef }: PhotoLightboxProps) {
    const open = index !== null;
    const [shownIndex, setShownIndex] = useState(index ?? 0);
    if (index !== null && index !== shownIndex) setShownIndex(index);
    const { mounted, state } = usePresence(open, EXIT_MS);
    const [direction, setDirection] = useState(1);
    const titleId = useId();
    const panelRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const touchStart = useRef<{ x: number; y: number } | null>(null);
    const total = photos.length;

    useModalBehavior({ panelRef, onClose, initialFocusRef: closeRef, returnFocusRef, enabled: open });

    const go = (step: number) => {
        setDirection(step);
        onIndexChange((shownIndex + step + total) % total);
    };

    useEffect(() => {
        if (!open || total < 2) return;
        const handleKeyDown = (event: globalThis.KeyboardEvent) => {
            if (event.key === "ArrowLeft") go(-1);
            else if (event.key === "ArrowRight") go(1);
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    });

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

    if (!mounted) return null;

    const photo = photos[shownIndex];

    return createPortal(
        <div
            ref={panelRef}
            className="estd-lightbox"
            data-state={state}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
        >
            <h2 id={titleId} className="ui-sr-only">
                Fotos de {title}
            </h2>
            <div className="estd-lightbox__bar">
                <span className="estd-lightbox__count" aria-live="polite" aria-atomic="true">
                    {shownIndex + 1}/{total}
                </span>
                <button ref={closeRef} type="button" className="estd-lightbox__btn" aria-label="Fechar galeria" onClick={onClose}>
                    <Icon name="close" />
                </button>
            </div>
            <div className="estd-lightbox__stage" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <LightboxSlides photo={photo} direction={direction} />
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

/** Troca de foto em crossfade: a anterior continua montada até terminar de desaparecer. */
function LightboxSlides({ photo, direction }: { photo: DetailPhoto; direction: number }) {
    const [current, setCurrent] = useState(photo);
    const [outgoing, setOutgoing] = useState<DetailPhoto | null>(null);
    if (photo.url !== current.url) {
        setOutgoing(current);
        setCurrent(photo);
    }

    useEffect(() => {
        if (!outgoing) return;
        const timer = window.setTimeout(() => setOutgoing(null), SWAP_MS);
        return () => window.clearTimeout(timer);
    }, [outgoing]);

    return (
        <>
            {outgoing && <LightboxSlide key={outgoing.url} photo={outgoing} direction={direction} leaving />}
            <LightboxSlide key={current.url} photo={current} direction={direction} initial={outgoing === null} leaving={false} />
        </>
    );
}

function LightboxSlide({ photo, direction, leaving, initial }: { photo: DetailPhoto; direction: number; leaving: boolean; initial?: boolean }) {
    const [entered, setEntered] = useState(initial ?? false);

    useEffect(() => {
        if (entered) return;
        let second = 0;
        const first = requestAnimationFrame(() => {
            second = requestAnimationFrame(() => setEntered(true));
        });
        return () => {
            cancelAnimationFrame(first);
            cancelAnimationFrame(second);
        };
    }, [entered]);

    return (
        <div
            className="estd-lightbox__slide"
            data-phase={leaving ? "leave" : entered ? "idle" : "enter"}
            style={{ "--estd-dir": direction } as CSSProperties}
        >
            <img src={photo.url} alt={photo.alt} className="estd-lightbox__img" />
        </div>
    );
}
