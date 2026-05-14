import { Link } from "react-router-dom";
import "./styles/Navbar.components.css";

export default function Navbar(){
    return(
        <nav className="navbar">
            <div className="menu">
                <ul>
                    <li>
                        <Link to="/pontos-turisticos">Atrativos</Link>
                    </li>
                    <li>
                        <Link to="/estabelecimentos">Alimentação</Link>
                    </li>
                    <li>
                        <Link to="/estabelecimentos">Hospedagem</Link>
                    </li>
                    <li>
                        <Link to="/">Condutores</Link>
                    </li>
                    <li>
                        <Link to="/">Como Chegar</Link>
                    </li>
                    <li id="contact">
                        <Link to="/">Contato</Link>
                    </li>
                </ul>
            </div>
        </nav>
        
    )
}