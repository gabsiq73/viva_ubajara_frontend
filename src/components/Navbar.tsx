import { Link } from "react-router-dom";
import "./styles/Navbar.components.css";

export default function Navbar(){
    return(
        <nav className="navbar">
            <div className="menu">
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                </ul>
            </div>
        </nav>
        
    )
}