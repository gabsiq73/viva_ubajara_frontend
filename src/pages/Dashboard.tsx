import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./style/Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dash-page">
      <Header />
      <main className="dash-main">
        <div className="dash-hero">
          <span className="dash-badge">Em breve</span>
          <h1 className="dash-title">Área do Usuário</h1>
          <p className="dash-desc">
            Esta área está sendo preparada. Em breve você poderá salvar destinos favoritos,
            acompanhar eventos e muito mais.
          </p>
          <div className="dash-features">
            <div className="dash-feature">
              <span className="material-symbols-outlined">favorite</span>
              <strong>Favoritos</strong>
              <p>Salve pontos turísticos e eventos</p>
            </div>
            <div className="dash-feature">
              <span className="material-symbols-outlined">event</span>
              <strong>Agenda</strong>
              <p>Acompanhe eventos futuros</p>
            </div>
            <div className="dash-feature">
              <span className="material-symbols-outlined">person</span>
              <strong>Perfil</strong>
              <p>Gerencie suas informações</p>
            </div>
          </div>
          <Link to="/" className="dash-cta">
            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
            Explorar o Parque
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
