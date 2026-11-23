import { useId, useRef, type RefObject } from "react";
import { createPortal } from "react-dom";
import Icon from "../ui/Icon";
import CopyAddressButton from "./CopyAddressButton";
import RouteLinks from "./RouteLinks";
import { useDragToDismiss } from "../../hooks/useDragToDismiss";
import { useModalBehavior } from "../../hooks/useModalBehavior";
import { usePresence } from "../../utils/usePresence";
import type { RouteLink } from "../../utils/directions";
import "./establishment-detail.css";

interface DirectionsSheetProps {
    open: boolean;
    address: string;
    links: RouteLink[];
    onClose: () => void;
    returnFocusRef: RefObject<HTMLElement | null>;
}

const SHEET_EXIT_MS = 250;

/** Painel por baixo do "Como chegar" no mobile. */
export default function DirectionsSheet({ open, address, links, onClose, returnFocusRef }: DirectionsSheetProps) {
    const titleId = useId();
    const panelRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const addressRef = useRef<HTMLParagraphElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const { mounted, state } = usePresence(open, SHEET_EXIT_MS);

    useModalBehavior({ panelRef, onClose, initialFocusRef: titleRef, returnFocusRef, enabled: open });
    const dragHandlers = useDragToDismiss({ panelRef, backdropRef, onClose, state });

    if (!mounted) return null;

    return createPortal(
        <div className="ui-sheet estd-sheet" data-state={state}>
            <div ref={backdropRef} className="ui-sheet__backdrop" onClick={onClose} aria-hidden="true" />
            <div ref={panelRef} className="ui-sheet__panel" role="dialog" aria-modal="true" aria-labelledby={titleId}>
                <div className="ui-sheet__drag estd-sheet__drag" {...dragHandlers}>
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
