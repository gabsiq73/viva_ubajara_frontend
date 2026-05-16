import "./styles/Main.components.css";
import Content from "./Sections/Content";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const HERO_WORDS = ["Inesquecível", "Memorável", "Incrível"] as const;

export default function Main(){
    const [wordIdx, setWordIdx] = useState(0);

    useEffect(() => {
        const t = setInterval(
            () => setWordIdx(i => (i + 1) % HERO_WORDS.length),
            3400
        );
        return () => clearInterval(t);
    }, []);

    return(
        <main className="main">
            <section className="welcome" aria-label="Capa do site">
                <div className="hero-inner">
                    <span className="hero-kicker">
                        <span className="hero-kicker__dot" aria-hidden="true" />
                        Parque Nacional de Ubajara · Ceará
                    </span>
                    <h1 className="hero-title">
                        <span className="hero-title__lead">Tenha uma experiência</span>
                        <span className="hero-title--gold">
                            <span key={wordIdx} className="hero-rotating-word" aria-live="polite">
                                {HERO_WORDS[wordIdx]}
                            </span>
                        </span>
                    </h1>
                    <p className="hero-subtitle">
                        Trilhas, teleférico e a famosa Gruta de Ubajara — venha viver as maravilhas da Serra da Ibiapaba.
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

                <div className="hero-scroll" aria-hidden="true">
                    <span className="hero-scroll__line" />
                    <span className="hero-scroll__label">Rolar</span>
                </div>
            </section>
            <Content/>
        </main>
    )
}