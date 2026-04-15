import Navbar from "./Navbar";
import "./styles/Header.components.css";

export default function Header(){
    return(
        <header className="header">
            <div className="flex">
                <Navbar/>
            </div>
        </header>
    )
}