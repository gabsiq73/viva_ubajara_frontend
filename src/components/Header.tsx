import Navbar from "./Navbar";
import "./styles/Header.components.css";
import logo from './../assets/images/logo.webp';

export default function Header(){
    return(
        <header className="header">
            <div className="logo grid-l">
                <div className="img">
                    <img src={logo} alt="logo" />
                </div>
            </div>

            <div className="nav">
                <Navbar/>
            </div>

            <div className="icon-position">
                <ul id="list-icons" style={{ display: 'flex', listStyle: 'none', gap: '15px' }}>
                    <li>icon1</li>
                    <li>icon2</li>
                    <li>icon3</li>
                </ul>
            </div>
        </header>
    )
}