import { Link } from "react-router-dom";
import "./styles/Navbar.components.css";

export default function Navbar(){
    return(
        <nav className="navbar">
            <div className="menu">
                <ul>
                    <li>
                        <Link to="/">Atrativos</Link>
                    </li>
                    <li>
                        <Link to="/">Alimentação</Link>
                    </li>
                    <li>
                        <Link to="/">Hospedagem</Link>
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