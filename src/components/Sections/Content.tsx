import "./style/Content.components.css"
import { Link } from "react-router-dom"

export default function Content(){
    return(
        <section className="section">
            <div className="cards">
                <ul className="list-cards">
                    <li id="fazer">
                        fazer
                    </li>
                    <li id="comer">
                       comer
                    </li>
                    <li id="dormir">
                        dormir
                    </li>
                    <li id="chegar">
                        chegar
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
                                <i className="material-symbols-outlined">
                                    trending_flat
                                </i>
                            </Link>
                        </div>
                    </div>
                </fieldset>
            </div>
        </section>
    )
}