import Footer from "../components/Footer";
import Header from "../components/Header";
import Main from "../components/Main";
import heroImage from "../assets/images/hero-gruta.webp";
import "./style/globalStyle.css";

export default function Index(){
    return(
        <div className="container">
            <div className="hero-bg" aria-hidden="true">
                <picture>
                    <img src={heroImage} alt="" width={1024} height={576} fetchPriority="high" decoding="async" />
                </picture>
            </div>
            <Header/>
            <Main/>
            <Footer/>
        </div>
    );
}
