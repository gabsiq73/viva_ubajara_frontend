import type { CSSProperties } from "react";
import { buildFacts, hasMeaningfulText, type EstablishmentDetail } from "../../utils/establishmentDetail";
import "./establishment-detail.css";

const LEAD_MAX_CHARS = 320;

/** Só a descrição do dono; as quebras de linha do cadastro viram parágrafos. */
export default function AboutSection({ detail }: { detail: EstablishmentDetail }) {
    const paragraphs = detail.description
        .split(/\r?\n+/)
        .map((p) => p.trim())
        .filter(hasMeaningfulText);
    const facts = buildFacts(detail);
    const [lead, ...rest] = paragraphs;
    const leadIsShort = lead !== undefined && lead.length <= LEAD_MAX_CHARS;

    return (
        <section id="sobre" className="estd-section estd-about" aria-labelledby="estd-about-title">
            <h2 id="estd-about-title" className="estd-eyebrow">
                {detail.type === "Restaurante" ? "Sobre a casa" : "Sobre a hospedagem"}
            </h2>
            {lead !== undefined && <p className={leadIsShort ? "estd-lead" : "estd-body"}>{lead}</p>}
            {rest.map((paragraph, i) => (
                <p key={i} className="estd-body">
                    {paragraph}
                </p>
            ))}
            {facts.length > 0 && (
                <dl className="estd-facts" style={{ "--estd-facts-cols": facts.length === 4 ? 2 : facts.length } as CSSProperties}>
                    {facts.map((fact) => (
                        <div key={fact.label} className="estd-facts__item">
                            <dt>{fact.label}</dt>
                            <dd>{fact.value}</dd>
                        </div>
                    ))}
                </dl>
            )}
        </section>
    );
}
