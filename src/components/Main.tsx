import "./styles/Main.components.css";
import Content from "./Sections/Content";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";

const HERO_WORDS = ["Inesquecível", "Memorável", "Incrível"] as const;
const WORD_INTERVAL_MS = 3400;
const WORD_MAX_CYCLES = 2;

export default function Main(){
    const [wordIdx, setWordIdx] = useState(0);
    const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
    const [interacting, setInteracting] = useState(false);
    const [tabHidden, setTabHidden] = useState(() => document.hidden);
    const ticks = useRef(0);

    useEffect(() => {
        const onVisibility = () => setTabHidden(document.hidden);
        document.addEventListener("visibilitychange", onVisibility);
        return () => document.removeEventListener("visibilitychange", onVisibility);
    }, []);

    const paused = interacting || tabHidden;

    useEffect(() => {
        if (reduceMotion || paused || ticks.current >= HERO_WORDS.length * WORD_MAX_CYCLES) return;
        const t = setInterval(() => {
            ticks.current += 1;
            setWordIdx(i => (i + 1) % HERO_WORDS.length);
            if (ticks.current >= HERO_WORDS.length * WORD_MAX_CYCLES) clearInterval(t);
        }, WORD_INTERVAL_MS);
        return () => clearInterval(t);
    }, [reduceMotion, paused]);

    return(
        <main className="main" id="conteudo" tabIndex={-1}>
            <section
                className="welcome"
                aria-label="Capa do site"
                onMouseEnter={() => setInteracting(true)}
                onMouseLeave={() => setInteracting(false)}
                onFocus={() => setInteracting(true)}
                onBlur={() => setInteracting(false)}
            >
                <div className="hero-inner">
                    <span className="hero-kicker">
                        <span className="hero-kicker__dot" aria-hidden="true" />
                        Parque Nacional de Ubajara · Ceará
                    </span>
                    <h1 className="hero-title">
                        <span className="hero-title__lead">Tenha uma experiência</span>
                        <span className="hero-title--gold">
                            <span className="ui-sr-only">{HERO_WORDS[0]}</span>
                            <span key={wordIdx} className="hero-rotating-word" aria-hidden="true">
                                {HERO_WORDS[wordIdx]}
                            </span>
                        </span>
                    </h1>
                    <p className="hero-subtitle">
                        Trilhas, teleférico e a famosa Gruta de Ubajara. Venha viver as maravilhas da Serra da Ibiapaba.
                    </p>
                    <div className="hero-actions">
                        <Link to="/pontos-turisticos" className="hero-btn hero-btn--primary">
                            Explorar o Parque
                        </Link>
                        <Link to="/como-chegar" className="hero-btn hero-btn--ghost">
                            Como Chegar
                        </Link>
                    </div>
                </div>
            </section>
            <Content/>
        </main>
    )
}