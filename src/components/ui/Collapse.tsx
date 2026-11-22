import { useState, type ReactNode } from "react";
import { usePresence } from "../../utils/usePresence";
import "./collapse.css";

interface CollapseProps {
    open: boolean;
    children: ReactNode;
    className?: string;
}

/** Entrada/saída de mensagens (erro, sucesso) sem empurrar o layout de golpe; guarda o último conteúdo para a saída. */
export default function Collapse({ open, children, className = "" }: CollapseProps) {
    const { mounted, state } = usePresence(open, 150);
    const [kept, setKept] = useState(children);
    const [skipEnter, setSkipEnter] = useState(open);
    if (!open && skipEnter) setSkipEnter(false);
    if (open && children !== kept) setKept(children);
    if (!mounted) return null;

    return (
        <div className={`ui-collapse ${className}`.trim()} data-state={skipEnter ? "open" : state} inert={!open}>
            <div className="ui-collapse__inner">{open ? children : kept}</div>
        </div>
    );
}
