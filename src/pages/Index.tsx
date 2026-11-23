import Footer from "../components/Footer";
import Header from "../components/Header";
import Main from "../components/Main";
import heroDesktop from "../assets/images/hero-gruta.webp";
import heroMobile from "../assets/images/hero-gruta-mobile.webp";
import "./style/globalStyle.css";

export default function Index(){
    return(
        <div className="container">
            <div className="hero-bg" aria-hidden="true">
                <picture>
                    <source media="(max-width: 480px)" srcSet={heroMobile} />
                    <img src={heroDesktop} alt="" width={2000} height={1125} fetchPriority="high" decoding="async" />
                </picture>
            </div>
            <Header/>
            <Main/>
            <Footer/>
        </div>
    );
}
