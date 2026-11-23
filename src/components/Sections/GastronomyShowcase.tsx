import { useEffect, useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import "./style/Gastronomy.css";

export type GastronomySlide = {
    tag: string;
    src: string;
    alt: string;
    desc?: string;
};

interface GastronomyShowcaseProps {
    slides: GastronomySlide[];
    activeIndex: number;
    onActiveChange: (index: number) => void;
    /** Autoplay parado (mouse/foco/reduzir movimento): a barra de progresso fica cheia e parada. */
    paused: boolean;
    autoplayMs: number;
    header: ReactNode;
}

const pad = (n: number) => String(n).padStart(2, "0");

function Arrow({ dir }: { dir: "prev" | "next" }) {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={dir === "prev" ? "M19 12H5M12 19l-7-7 7-7" : "M5 12h14M12 5l7 7-7 7"} />
        </svg>
    );
}

/**
 * Prato em destaque: a foto troca com uma "borda rasgada" subindo (clip-path),
 * o texto do prato entra em seguida e as abas mostram o progresso do autoplay.
 */
export function GastronomyShowcase({ slides, activeIndex, onActiveChange, paused, autoplayMs, header }: GastronomyShowcaseProps) {
    const uid = useId();
    const n = slides.length;
    const index = n > 0 ? Math.min(Math.max(0, activeIndex), n - 1) : 0;

    // prev/reset reproduzem a troca de slide: o novo começa escondido (reset) e só então revela.
    const [track, setTrack] = useState<{ index: number; prev: number | null; reset: number | null }>({ index, prev: null, reset: null });
    if (track.index !== index) {
        setTrack({ index, prev: track.index, reset: index });
    }
    useEffect(() => {
        if (track.reset === null) return;
        const id = window.setTimeout(() => setTrack((t) => ({ ...t, reset: null })), 40);
        return () => window.clearTimeout(id);
    }, [track.reset]);

    if (n === 0) return null;

    const tabId = (i: number) => `${uid}-tab-${i}`;
    const panelId = (i: number) => `${uid}-panel-${i}`;
    const go = (i: number) => onActiveChange((i + n) % n);

    const stateOf = (i: number) => {
        if (i === index) return track.reset === i ? "is-on is-reset" : "is-on";
        return track.prev === i ? "is-prev" : "";
    };

    const handleTabsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const next =
            event.key === "ArrowRight" ? (index + 1) % n
            : event.key === "ArrowLeft" ? (index - 1 + n) % n
            : event.key === "Home" ? 0
            : event.key === "End" ? n - 1
            : null;
        if (next === null) return;
        event.preventDefault();
        onActiveChange(next);
        document.getElementById(tabId(next))?.focus();
    };

    return (
        <div className="gastro">
            <div className="gastro__stage">
                <div className="gastro__viewport" role="group" aria-roledescription="carrossel" aria-label="Pratos típicos da Ibiapaba">
                    {slides.map((slide, i) => (
                        <div
                            key={slide.tag}
                            id={panelId(i)}
                            role={n > 1 ? "tabpanel" : undefined}
                            aria-labelledby={n > 1 ? tabId(i) : undefined}
                            aria-hidden={i !== index}
                            className={`gastro__slide ${stateOf(i)}`.trim()}
                        >
                            <div className="gastro__slide-img">
                                <img
                                    src={slide.src}
                                    alt={slide.alt}
                                    width={900}
                                    height={700}
                                    decoding="async"
                                    loading={i === 0 ? "eager" : "lazy"}
                                />
                            </div>
                        </div>
                    ))}
                    <span className="gastro__count" aria-hidden="true">
                        {pad(index + 1)}<i> / {pad(n)}</i>
                    </span>
                    {n > 1 && (
                        <div className="gastro__arrows">
                            <button type="button" className="gastro__arrow" aria-label="Prato anterior" onClick={() => go(index - 1)}>
                                <Arrow dir="prev" />
                            </button>
                            <button type="button" className="gastro__arrow" aria-label="Próximo prato" onClick={() => go(index + 1)}>
                                <Arrow dir="next" />
                            </button>
                        </div>
                    )}
                </div>

                {n > 1 && (
                    <div className="gastro__tabs" role="tablist" aria-label="Pratos" onKeyDown={handleTabsKeyDown}>
                        {slides.map((slide, i) => (
                            <button
                                key={slide.tag}
                                id={tabId(i)}
                                type="button"
                                role="tab"
                                aria-selected={i === index}
                                aria-controls={panelId(i)}
                                tabIndex={i === index ? 0 : -1}
                                className={`gastro__tab${i === index ? " is-active" : ""}`}
                                onClick={() => onActiveChange(i)}
                            >
                                <span className="gastro__bar" aria-hidden="true">
                                    {i === index && (
                                        <span
                                            key={`${index}-${paused}`}
                                            className={`gastro__bar-fill${paused ? " is-static" : ""}`}
                                            style={{ animationDuration: `${autoplayMs}ms` }}
                                        />
                                    )}
                                </span>
                                <span className="gastro__tab-name">{slide.tag}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="gastro__info">
                {header}
                <div className="gastro__dish" aria-live="polite">
                    {slides.map((slide, i) => (
                        <div key={slide.tag} className={`gastro__dish-item ${stateOf(i)}`.trim()} aria-hidden={i !== index}>
                            <span className="gastro__dish-num">Prato {pad(i + 1)}</span>
                            <span className="gastro__dish-name">{slide.tag}</span>
                            {slide.desc && <span className="gastro__dish-desc">{slide.desc}</span>}
                        </div>
                    ))}
                </div>
                <Link to="/estabelecimentos?tipo=Restaurante" className="gastro__cta">
                    Ver restaurantes
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}
