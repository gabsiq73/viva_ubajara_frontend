import "./style/Content.components.css"
import { Link } from "react-router-dom"
import paper from "./../../assets/images/paper.png"

export default function Content(){
    return(
        <>
        <section className="section">
            <div className="paper">
                <img src={paper}/>
            </div>
            <div className="fundo">
                <div className="cards">
                    <ul className="list-cards">
                        <li id="fazer">
                            <div id="icon">
                                <svg width="22" height="33" viewBox="0 0 22 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3.74062 32.25L8.35312 8.925C8.50312 8.2 8.84063 7.65625 9.36563 7.29375C9.89062 6.93125 10.4406 6.75 11.0156 6.75C11.5906 6.75 12.1219 6.875 12.6094 7.125C13.0969 7.375 13.4906 7.75 13.7906 8.25L15.2906 10.65C15.7406 11.375 16.3219 12.0312 17.0344 12.6187C17.7469 13.2062 18.5656 13.6375 19.4906 13.9125V11.25H21.7406V32.25H19.4906V17.025C18.2906 16.75 17.1781 16.3125 16.1531 15.7125C15.1281 15.1125 14.2406 14.375 13.4906 13.5L12.5906 18L15.7406 21V32.25H12.7406V23.25L9.59062 20.25L6.89062 32.25H3.74062ZM4.37813 17.4375L1.19062 16.8375C0.790625 16.7625 0.478125 16.5562 0.253125 16.2188C0.028125 15.8813 -0.046875 15.5 0.028125 15.075L1.15313 9.1875C1.30313 8.3875 1.72812 7.75625 2.42812 7.29375C3.12812 6.83125 3.87812 6.675 4.67812 6.825L6.40312 7.1625L4.37813 17.4375ZM13.4906 6C12.6656 6 11.9594 5.70625 11.3719 5.11875C10.7844 4.53125 10.4906 3.825 10.4906 3C10.4906 2.175 10.7844 1.46875 11.3719 0.88125C11.9594 0.29375 12.6656 0 13.4906 0C14.3156 0 15.0219 0.29375 15.6094 0.88125C16.1969 1.46875 16.4906 2.175 16.4906 3C16.4906 3.825 16.1969 4.53125 15.6094 5.11875C15.0219 5.70625 14.3156 6 13.4906 6Z" fill="white"/>
                                </svg>
                            </div>
                            <div className="title">
                                <h3>
                                    O que fazer
                                </h3>
                            </div>
                            <div className="text">
                                <p>
                                    Trilhas ecológicas, mirantes de tirar o fôlego e o famoso teleférico
                                </p>
                            </div>
                            <div className="knowmore">
                                <Link to="/">
                                    <span>Saiba Mais</span>
                                    <div className="arrow">
                                        <i className="material-symbols-outlined">
                                            arrow_forward
                                        </i>
                                    </div>
                                </Link>
                            </div>
                        </li>
                        <li id="comer">
                            <div id="icon">
                                <svg width="23" height="30" viewBox="0 0 23 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4.5 30V16.275C3.225 15.925 2.15625 15.225 1.29375 14.175C0.43125 13.125 0 11.9 0 10.5V0H3V10.5H4.5V0H7.5V10.5H9V0H12V10.5C12 11.9 11.5688 13.125 10.7063 14.175C9.84375 15.225 8.775 15.925 7.5 16.275V30H4.5ZM19.5 30V18H15V7.5C15 5.425 15.7313 3.65625 17.1938 2.19375C18.6562 0.73125 20.425 0 22.5 0V30H19.5Z" fill="white"/>
                                </svg>
                            </div>
                            <div className="title">
                                <h3>
                                    Onde Comer
                                </h3>
                            </div>
                            <div className="text">
                                <p>
                                    A melhor gastronomia da Ibiapaba, com temperos regionais e requinte.
                                </p>
                            </div>
                            <div className="knowmore">
                                <Link to="/">
                                    <span>Saiba Mais</span>
                                    <div className="arrow">
                                        <i className="material-symbols-outlined">
                                            arrow_forward
                                        </i>
                                    </div>
                                </Link>
                            </div>
                        </li>
                        <li id="dormir">
                            <div id="icon">
                                <svg width="41" height="28" viewBox="0 0 41 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 28V0H3.72727V18.6667H18.6364V3.73333H33.5455C35.5955 3.73333 37.3504 4.46444 38.8102 5.92667C40.2701 7.38889 41 9.14667 41 11.2V28H37.2727V22.4H3.72727V28H0ZM11.1818 16.8C9.62879 16.8 8.30871 16.2556 7.22159 15.1667C6.13447 14.0778 5.59091 12.7556 5.59091 11.2C5.59091 9.64444 6.13447 8.32222 7.22159 7.23333C8.30871 6.14444 9.62879 5.6 11.1818 5.6C12.7348 5.6 14.0549 6.14444 15.142 7.23333C16.2292 8.32222 16.7727 9.64444 16.7727 11.2C16.7727 12.7556 16.2292 14.0778 15.142 15.1667C14.0549 16.2556 12.7348 16.8 11.1818 16.8ZM22.3636 18.6667H37.2727V11.2C37.2727 10.1733 36.9078 9.29445 36.1778 8.56333C35.4479 7.83222 34.5705 7.46667 33.5455 7.46667H22.3636V18.6667ZM11.1818 13.0667C11.7098 13.0667 12.1525 12.8878 12.5097 12.53C12.8669 12.1722 13.0455 11.7289 13.0455 11.2C13.0455 10.6711 12.8669 10.2278 12.5097 9.87C12.1525 9.51222 11.7098 9.33333 11.1818 9.33333C10.6538 9.33333 10.2112 9.51222 9.85398 9.87C9.49678 10.2278 9.31818 10.6711 9.31818 11.2C9.31818 11.7289 9.49678 12.1722 9.85398 12.53C10.2112 12.8878 10.6538 13.0667 11.1818 13.0667Z" fill="white"/>
                                </svg>
                            </div>
                            <div className="title">
                                <h3>
                                    Onde Dormir
                                </h3>
                            </div>
                            <div className="text">
                                <p>
                                    Pousadas charmosas e hotéis integrados à natureza para seu descanso.
                                </p>
                            </div>
                            <div className="knowmore">
                                <Link to="/">
                                    <span>Saiba Mais</span>
                                    <div className="arrow">
                                        <i className="material-symbols-outlined">
                                            arrow_forward
                                        </i>
                                    </div>
                                </Link>
                            </div>
                        </li>
                        <li id="chegar">
                            <div id="icon">
                                <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 27L9 23.85L2.025 26.55C1.525 26.75 1.0625 26.6938 0.6375 26.3813C0.2125 26.0688 0 25.65 0 25.125V4.125C0 3.8 0.09375 3.5125 0.28125 3.2625C0.46875 3.0125 0.725 2.825 1.05 2.7L9 0L18 3.15L24.975 0.45C25.475 0.25 25.9375 0.30625 26.3625 0.61875C26.7875 0.93125 27 1.35 27 1.875V22.875C27 23.2 26.9062 23.4875 26.7188 23.7375C26.5312 23.9875 26.275 24.175 25.95 24.3L18 27ZM16.5 23.325V5.775L10.5 3.675V21.225L16.5 23.325ZM19.5 23.325L24 21.825V4.05L19.5 5.775V23.325ZM3 22.95L7.5 21.225V3.675L3 5.175V22.95ZM19.5 5.775V23.325V5.775ZM7.5 3.675V21.225V3.675Z" fill="white"/>
                                </svg>
                            </div>
                            <div className="title">
                                <h3>
                                    Como Chegar
                                </h3>
                            </div>
                            <div className="text">
                                <p>
                                    Rotas aéreas e terrestres para chegar ao paraíso serrano com segurança.
                                </p>
                            </div>
                            <div className="knowmore">
                                <Link to="/">
                                    <span>Saiba Mais</span>
                                    <div className="arrow">
                                        <i className="material-symbols-outlined">
                                            arrow_forward
                                        </i>
                                    </div>
                                </Link>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="point">
                    <fieldset className="box">
                        <legend className="legend">
                            Esperiências Únicas
                        </legend>
                        <div className="position">
                            <h1>Pontos Turísticos</h1>

                            <div id="more">
                                <Link to="/">
                                    Ver Todos
                                    <svg width="19" height="9" viewBox="0 0 19 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14.5 9L13.075 7.6L15.175 5.5H0V3.5H15.175L13.1 1.4L14.525 0L19 4.5L14.5 9Z" fill="#006B32"/>
                                    </svg>
                                </Link>
                            </div>
                        </div>
                        <div className="cards-points">
                            <ul className="list-points">
                                <li>
                                    <Link to="/">
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </fieldset>
                </div> 
            </div>
        </section>
        </>
    )
}