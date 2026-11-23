import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { TestimonialResponse } from "../../admin/types";
import { useBrokenImage } from "../../hooks/useBrokenImage";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { reviewerInitials } from "../layout/userDisplay";
import "./style/Testimonials.css";

interface TestimonialsShowcaseProps {
    items: TestimonialResponse[];
    /** Conteúdo exibido no lugar do depoimento quando não há itens. */
    fallback?: ReactNode;
    moreTo: string;
    moreLabel: string;
}

const AUTOPLAY_MS = 6000;
const pad = (n: number) => String(n).padStart(2, "0");

function Avatar({ name, photo, className }: { name: string; photo?: string; className: string }) {
    const image = useBrokenImage(photo);
    return image.show ? (
        <img src={photo} alt="" className={className} width={56} height={56} loading="lazy" decoding="async" onError={image.onError} />
    ) : (
        <span className={`${className} ${className}--initials`} aria-hidden="true">{reviewerInitials(name) || "?"}</span>
    );
}

function Stars({ value }: { value: number }) {
    return (
        <div className="tst__stars" role="img" aria-label={`${value} de 5 estrelas`}>
            {[0, 1, 2, 3, 4].map((i) => (
                <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill={i < value ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
        </div>
    );
}

const firstSentence = (text: string) => {
    const match = text.match(/^[^.!?]+[.!?]?/);
    return (match ? match[0] : text).trim();
};

function Arrow({ dir }: { dir: "prev" | "next" }) {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={dir === "prev" ? "M19 12H5M12 19l-7-7 7-7" : "M5 12h14M12 5l7 7-7 7"} />
        </svg>
    );
}

/** Depoimento em destaque + lista lateral; troca sozinho a cada 6s (pausa com mouse, foco ou "reduzir movimento"). */
export function TestimonialsShowcase({ items, fallback, moreTo, moreLabel }: TestimonialsShowcaseProps) {
    const n = items.length;
    const [active, setActive] = useState(0);
    const [hover, setHover] = useState(false);
    const [focus, setFocus] = useState(false);
    const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
    const paused = reduceMotion || hover || focus;
    const index = n > 0 ? Math.min(active, n - 1) : 0;

    useEffect(() => {
        if (n <= 1 || paused) return;
        const id = window.setTimeout(() => setActive((i) => (Math.min(i, n - 1) + 1) % n), AUTOPLAY_MS);
        return () => window.clearTimeout(id);
    }, [n, paused, index]);

    if (n === 0) return <>{fallback}</>;

    const go = (i: number) => setActive((i + n) % n);
    const barStyle = { animationDuration: `${AUTOPLAY_MS}ms` };

    return (
        <>
            <div
                className="tst"
                onPointerEnter={(e) => { if (e.pointerType === "mouse") setHover(true); }}
                onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(false); }}
                onFocus={() => setFocus(true)}
                onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocus(false); }}
            >
                <div className="tst__stage" role="group" aria-roledescription="carrossel" aria-label="Depoimentos de visitantes">
                    <span className="tst__mark" aria-hidden="true">”</span>
                    {items.map((item, i) => (
                        <figure key={item.id} className={`tst__quote${i === index ? " is-on" : ""}`} aria-hidden={i !== index}>
                            <Stars value={item.rating} />
                            <blockquote className="tst__text">“{item.comment}”</blockquote>
                            <figcaption className="tst__author">
                                <Avatar name={item.userName} photo={item.userPhoto} className="tst__avatar" />
                                <span className="tst__author-text">
                                    <span className="tst__name" title={item.userName}>{item.userName}</span>
                                    <span className="tst__from">Visitante</span>
                                </span>
                            </figcaption>
                        </figure>
                    ))}
                </div>

                <ul className="tst__nav" aria-label="Escolher depoimento">
                    {items.map((item, i) => (
                        <li key={item.id}>
                            <button
                                type="button"
                                className={`tst__nav-item${i === index ? " is-on" : ""}`}
                                aria-current={i === index}
                                onClick={() => setActive(i)}
                            >
                                <Avatar name={item.userName} photo={item.userPhoto} className="tst__nav-avatar" />
                                <span className="tst__nav-text">
                                    <span className="tst__nav-name">{item.userName}</span>
                                    <span className="tst__nav-short">{firstSentence(item.comment)}</span>
                                </span>
                                {i === index && (
                                    <span key={`${index}-${paused}`} className={`tst__nav-bar${paused ? " is-static" : ""}`} style={barStyle} aria-hidden="true" />
                                )}
                            </button>
                        </li>
                    ))}
                </ul>

                {n > 1 && (
                    <div className="tst__controls">
                        <div className="tst__dots" aria-hidden="true">
                            {items.map((item, i) => (
                                <button key={item.id} type="button" tabIndex={-1} className={`tst__dot${i === index ? " is-on" : ""}`} onClick={() => setActive(i)}>
                                    {i === index && (
                                        <span key={`${index}-${paused}`} className={`tst__dot-fill${paused ? " is-static" : ""}`} style={barStyle} />
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="tst__buttons">
                            <button type="button" className="tst__btn" aria-label="Depoimento anterior" onClick={() => go(index - 1)}>
                                <Arrow dir="prev" />
                            </button>
                            <button type="button" className="tst__btn tst__btn--solid" aria-label="Próximo depoimento" onClick={() => go(index + 1)}>
                                <Arrow dir="next" />
                            </button>
                        </div>
                        <span className="tst__count" aria-hidden="true">
                            <b>{pad(index + 1)}</b> / {pad(n)}
                        </span>
                    </div>
                )}
            </div>

            <Link to={moreTo} className="sec-head__cta sec-more tst__more">
                {moreLabel}
                <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
            </Link>
        </>
    );
}
