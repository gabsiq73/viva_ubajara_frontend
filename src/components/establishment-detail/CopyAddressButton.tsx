import { useEffect, useRef, useState, type RefObject } from "react";
import Icon from "../ui/Icon";
import { copyText, selectElementText } from "../../utils/clipboard";
import "./establishment-detail.css";

interface CopyAddressButtonProps {
    address: string;
    /** Elemento com o endereço, selecionado quando a área de transferência falha. */
    selectRef: RefObject<HTMLElement | null>;
    shortLabel?: boolean;
    className?: string;
}

const FEEDBACK_MS = 2200;

export default function CopyAddressButton({ address, selectRef, shortLabel = false, className = "" }: CopyAddressButtonProps) {
    const [feedback, setFeedback] = useState<"idle" | "copied" | "selected">("idle");
    const timer = useRef<number | undefined>(undefined);

    useEffect(() => () => window.clearTimeout(timer.current), []);

    async function handleCopy() {
        const ok = await copyText(address);
        if (!ok) selectElementText(selectRef.current);
        setFeedback(ok ? "copied" : "selected");
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setFeedback("idle"), FEEDBACK_MS);
    }

    const copied = feedback === "copied";
    const message =
        feedback === "copied" ? "Endereço copiado" : feedback === "selected" ? "Não foi possível copiar. Endereço selecionado." : "";

    return (
        <>
            <button type="button" className={`estd-copy${copied ? " estd-copy--done" : ""} ${className}`.trim()} onClick={handleCopy}>
                <span className="estd-copy__icon">
                    <Icon name="content_copy" />
                    <Icon name="check" />
                </span>
                {copied ? (shortLabel ? "Copiado" : "Endereço copiado") : shortLabel ? "Copiar" : "Copiar endereço"}
            </button>
            <span className="ui-sr-only" role="status" aria-live="polite">
                {message}
            </span>
        </>
    );
}
