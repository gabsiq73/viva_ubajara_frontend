import { useId, useRef, type PointerEvent, type RefObject } from "react";
import { createPortal } from "react-dom";
import Icon from "../ui/Icon";
import CopyAddressButton from "./CopyAddressButton";
import RouteLinks from "./RouteLinks";
import { useModalBehavior } from "../../hooks/useModalBehavior";
import type { RouteLink } from "../../utils/directions";
import "./establishment-detail.css";

interface DirectionsSheetProps {
    address: string;
    links: RouteLink[];
    onClose: () => void;
    returnFocusRef: RefObject<HTMLElement | null>;
}

const DRAG_START_PX = 6;
const DRAG_CLOSE_PX = 100;

/** Painel por baixo do "Como chegar" no mobile. Monte só enquanto estiver aberto. */
export default function DirectionsSheet({ address, links, onClose, returnFocusRef }: DirectionsSheetProps) {
    const titleId = useId();
    const panelRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const addressRef = useRef<HTMLParagraphElement>(null);
    const drag = useRef<{ startY: number; active: boolean; pointerId: number } | null>(null);

    useModalBehavior({ panelRef, onClose, initialFocusRef: titleRef, returnFocusRef });

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        drag.current = { startY: event.clientY, active: false, pointerId: event.pointerId };
    };

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        const state = drag.current;
        const panel = panelRef.current;
        if (!state || !panel) return;
        const dy = Math.max(0, event.clientY - state.startY);
        if (!state.active) {
            if (dy < DRAG_START_PX) return;
            state.active = true;
            event.currentTarget.setPointerCapture(state.pointerId);
            panel.style.transition = "none";
        }
        panel.style.transform = `translateY(${dy}px)`;
    };

    const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
        const state = drag.current;
        const panel = panelRef.current;
        drag.current = null;
        if (!state?.active || !panel) return;
        if (event.clientY - state.startY > DRAG_CLOSE_PX) {
            onClose();
            return;
        }
        panel.style.transition = "";
        panel.style.transform = "";
    };

    return createPortal(
        <div className="ui-sheet estd-sheet">
            <div className="ui-sheet__backdrop" onClick={onClose} aria-hidden="true" />
            <div ref={panelRef} className="ui-sheet__panel" role="dialog" aria-modal="true" aria-labelledby={titleId}>
                <div
                    className="estd-sheet__drag"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerEnd}
                    onPointerCancel={handlePointerEnd}
                >
                    <span className="ui-sheet__handle" aria-hidden="true" />
                    <div className="ui-sheet__header estd-sheet__header">
                        <div className="estd-sheet__heading">
                            <h2 id={titleId} ref={titleRef} tabIndex={-1} className="ui-sheet__title">
                                Como chegar
                            </h2>
                            <p ref={addressRef} className="estd-sheet__address">
                                {address}
                            </p>
                        </div>
                        <button type="button" className="ui-sheet__close" aria-label="Fechar" onClick={onClose}>
                            <Icon name="close" />
                        </button>
                    </div>
                </div>
                <div className="ui-sheet__body">
                    <RouteLinks links={links} tall />
                </div>
                <div className="ui-sheet__footer">
                    <CopyAddressButton address={address} selectRef={addressRef} className="estd-copy--block" />
                </div>
            </div>
        </div>,
        document.body,
    );
}
