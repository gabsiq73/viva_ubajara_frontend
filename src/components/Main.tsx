import "./styles/Main.components.css";
import Content from "./Sections/Content";

export default function Main(){
    return(
        <main className="main">
            <section className="welcome">
                <div id="center">
                    <h3>Venha para Ubajara</h3>
                    <h1>Tenha uma experiência</h1>
                    <h1 id="gold">Inesquecível</h1>
                </div>
                
            </section>
            <Content/>
        </main>
    )
}