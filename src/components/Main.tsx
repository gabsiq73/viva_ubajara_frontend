import "./styles/Main.components.css";
import Content from "./Sections/Content";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";

const HERO_WORDS = ["Inesquecível", "Memorável", "Incrível"] as const;

export default function Main(){
    const [wordIdx, setWordIdx] = useState(0);
    const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

    useEffect(() => {
        if (reduceMotion) return;
        const t = setInterval(
            () => setWordIdx(i => (i + 1) % HERO_WORDS.length),
            3400
        );
        return () => clearInterval(t);
    }, [reduceMotion]);

    return(
        <main className="main" id="conteudo" tabIndex={-1}>
            <section className="welcome" aria-label="Capa do site">
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