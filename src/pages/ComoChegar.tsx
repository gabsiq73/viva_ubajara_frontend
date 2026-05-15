import Header from "../components/Header";
import Footer from "../components/Footer";
import heroImg from "../assets/images/foto-capa-parque-ubajara.png";
import "./style/ComoChegar.css";

const PARK_DESTINATION = "Parque+Nacional+de+Ubajara,Ubajara,CE,Brasil";

function mapsRoute(origin: string) {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${PARK_DESTINATION}&travelmode=driving`;
}

const AIRPORTS = [
  {
    iata: "FOR",
    name: "Aeroporto Internacional Pinto Martins",
    city: "Fortaleza",
    state: "CE",
    distance: "334 km",
    duration: "~4h de carro",
    note: "Principal aeroporto do Ceará. Voos diretos de todo o Brasil e internacionais.",
    origin: "Aeroporto Internacional Pinto Martins, Fortaleza, CE",
  },
  {
    iata: "PHB",
    name: "Aeroporto de Parnaíba – Prefeito Dr. João Silva Filho",
    city: "Parnaíba",
    state: "PI",
    distance: "200 km",
    duration: "~2h30 de carro",
    note: "Alternativa para quem vem do Piauí. Voos regionais com conexão em Fortaleza.",
    origin: "Aeroporto de Parnaíba, Parnaíba, PI",
  },
  {
    iata: "SOD",
    name: "Aeroporto Municipal de Sobral",
    city: "Sobral",
    state: "CE",
    distance: "100 km",
    duration: "~1h30 de carro",
    note: "Aeroporto regional mais próximo. Operações limitadas — verifique disponibilidade antes.",
    origin: "Aeroporto Municipal de Sobral, Sobral, CE",
  },
];

const BUS_STATIONS = [
  {
    name: "Rodoviária de Ubajara",
    city: "Ubajara",
    state: "CE",
    distance: "2 km do parque",
    duration: "5 min de carro",
    note: "Terminal mais próximo. Ônibus de Tianguá e Sobral chegam aqui diariamente.",
    origin: "Rodoviária de Ubajara, Ubajara, CE",
  },
  {
    name: "Rodoviária de Tianguá",
    city: "Tianguá",
    state: "CE",
    distance: "18 km",
    duration: "25 min de carro",
    note: "Principal hub da Serra da Ibiapaba. Linhas de Fortaleza, Sobral e Piauí.",
    origin: "Rodoviária de Tianguá, Tianguá, CE",
  },
  {
    name: "Terminal Rodoviário de Sobral",
    city: "Sobral",
    state: "CE",
    distance: "100 km",
    duration: "~1h30 de carro",
    note: "Maior terminal da região. Ônibus de Fortaleza em ~3h. Conexões para Ubajara.",
    origin: "Terminal Rodoviário de Sobral, Sobral, CE",
  },
  {
    name: "Terminal Rodoviário de Fortaleza",
    city: "Fortaleza",
    state: "CE",
    distance: "334 km",
    duration: "~5h de ônibus",
    note: "Saída da capital. Ônibus diretos para Tianguá e Ubajara pela Viação Ibiapaba.",
    origin: "Terminal Rodoviário de Fortaleza, Fortaleza, CE",
  },
];

const APPS = [
  {
    name: "Uber",
    icon: "directions_car",
    coverage: "Disponível em Sobral e Fortaleza",
    tip: "Use para trajetos de Sobral ou Fortaleza até Ubajara. Confirme disponibilidade antes de chegar.",
    color: "#000000",
    badge: "Disponível",
  },
  {
    name: "99",
    icon: "local_taxi",
    coverage: "Disponível em Sobral e região",
    tip: "Boa opção para corridas na cidade de Sobral. Nem sempre disponível em Ubajara.",
    color: "#F5A623",
    badge: "Disponível",
  },
  {
    name: "inDrive",
    icon: "two_wheeler",
    coverage: "Disponível em Sobral",
    tip: "Permite negociar o preço da corrida. Crescente presença na região Noroeste do Ceará.",
    color: "#00C566",
    badge: "Disponível",
  },
  {
    name: "Táxi Local",
    icon: "local_taxi",
    coverage: "Ubajara e Tianguá",
    tip: "Táxis e mototáxis locais atendem toda a cidade. Pergunte na recepção do seu hotel.",
    color: "#153a27",
    badge: "Local",
  },
];

const TIPS = [
  {
    icon: "calendar_month",
    title: "Melhor época para visitar",
    text: "De julho a dezembro, na estação seca. O teleférico opera com mais regularidade e os trilhos estão em melhores condições.",
  },
  {
    icon: "directions_car",
    title: "Carro alugado",
    text: "Locadoras disponíveis no Aeroporto de Fortaleza (FOR). A BR-222 e CE-187 oferecem belas paisagens até a Serra.",
  },
  {
    icon: "map",
    title: "Dentro do parque",
    text: "Dentro do parque não há serviço de transporte por app. Planeje o retorno com antecedência ou combine com o guia.",
  },
  {
    icon: "emergency",
    title: "Serviços de emergência",
    text: "Hospital Regional de Tianguá (18 km). SAMU: 192. Bombeiros: 193. Guarda do Parque: (88) 3634-1388.",
  },
];

export default function ComoChegar() {
  return (
    <div className="cg-page">
      <Header />

      {/* ── Hero ── */}
      <section className="cg-hero">
        <img src={heroImg} alt="Parque Nacional de Ubajara" className="cg-hero__img" />
        <div className="cg-hero__overlay" />
        <div className="cg-hero__content">
          <span className="cg-hero__label">Planejamento</span>
          <h1 className="cg-hero__title">Como Chegar</h1>
          <p className="cg-hero__sub">
            Informações completas sobre aeroportos, rodoviárias e aplicativos
            de mobilidade para sua viagem ao Parque Nacional de Ubajara.
          </p>
        </div>
      </section>

      <div className="cg-container">

        {/* ── Aeroportos ── */}
        <section className="cg-section">
          <div className="cg-section__head">
            <span className="material-symbols-outlined cg-section__icon">flight</span>
            <div>
              <h2 className="cg-section__title">Aeroportos Próximos</h2>
              <p className="cg-section__sub">Voe até o aeroporto mais conveniente e siga de carro ou ônibus até o parque.</p>
            </div>
          </div>

          <div className="cg-cards">
            {AIRPORTS.map((a) => (
              <div key={a.iata} className="cg-card">
                <div className="cg-card__top">
                  <span className="cg-card__badge cg-card__badge--iata">{a.iata}</span>
                  <span className="cg-card__dist">
                    <span className="material-symbols-outlined">near_me</span>
                    {a.distance}
                  </span>
                </div>
                <h3 className="cg-card__name">{a.name}</h3>
                <p className="cg-card__city">{a.city} · {a.state}</p>
                <p className="cg-card__note">{a.note}</p>
                <div className="cg-card__footer">
                  <span className="cg-card__duration">
                    <span className="material-symbols-outlined">schedule</span>
                    {a.duration}
                  </span>
                  <a
                    href={mapsRoute(a.origin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cg-btn-maps"
                  >
                    <span className="material-symbols-outlined">map</span>
                    Traçar rota
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Rodoviárias ── */}
        <section className="cg-section">
          <div className="cg-section__head">
            <span className="material-symbols-outlined cg-section__icon">directions_bus</span>
            <div>
              <h2 className="cg-section__title">Rodoviárias Próximas</h2>
              <p className="cg-section__sub">Ônibus é a opção mais econômica. Há linhas regulares a partir de Fortaleza e Sobral.</p>
            </div>
          </div>

          <div className="cg-cards">
            {BUS_STATIONS.map((b) => (
              <div key={b.name} className="cg-card">
                <div className="cg-card__top">
                  <span className="cg-card__badge cg-card__badge--bus">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>directions_bus</span>
                    Rodoviária
                  </span>
                  <span className="cg-card__dist">
                    <span className="material-symbols-outlined">near_me</span>
                    {b.distance}
                  </span>
                </div>
                <h3 className="cg-card__name">{b.name}</h3>
                <p className="cg-card__city">{b.city} · {b.state}</p>
                <p className="cg-card__note">{b.note}</p>
                <div className="cg-card__footer">
                  <span className="cg-card__duration">
                    <span className="material-symbols-outlined">schedule</span>
                    {b.duration}
                  </span>
                  <a
                    href={mapsRoute(b.origin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cg-btn-maps"
                  >
                    <span className="material-symbols-outlined">map</span>
                    Traçar rota
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Aplicativos ── */}
        <section className="cg-section">
          <div className="cg-section__head">
            <span className="material-symbols-outlined cg-section__icon">smartphone</span>
            <div>
              <h2 className="cg-section__title">Aplicativos de Mobilidade</h2>
              <p className="cg-section__sub">Opções disponíveis na região para facilitar seu deslocamento.</p>
            </div>
          </div>

          <div className="cg-apps">
            {APPS.map((app) => (
              <div key={app.name} className="cg-app-card">
                <div className="cg-app-card__icon" style={{ background: app.color }}>
                  <span className="material-symbols-outlined">{app.icon}</span>
                </div>
                <div className="cg-app-card__body">
                  <div className="cg-app-card__top">
                    <strong className="cg-app-card__name">{app.name}</strong>
                    <span className="cg-app-card__badge">{app.badge}</span>
                  </div>
                  <p className="cg-app-card__coverage">{app.coverage}</p>
                  <p className="cg-app-card__tip">{app.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Dicas de viagem ── */}
        <section className="cg-section">
          <div className="cg-section__head">
            <span className="material-symbols-outlined cg-section__icon">tips_and_updates</span>
            <div>
              <h2 className="cg-section__title">Dicas de Viagem</h2>
              <p className="cg-section__sub">Informações úteis para planejar melhor sua ida ao parque.</p>
            </div>
          </div>

          <div className="cg-tips">
            {TIPS.map((tip) => (
              <div key={tip.title} className="cg-tip-card">
                <span className="material-symbols-outlined cg-tip-card__icon">{tip.icon}</span>
                <h4 className="cg-tip-card__title">{tip.title}</h4>
                <p className="cg-tip-card__text">{tip.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA maps ── */}
        <section className="cg-cta">
          <span className="material-symbols-outlined cg-cta__icon">explore</span>
          <h2 className="cg-cta__title">Ver o parque no mapa</h2>
          <p className="cg-cta__sub">Veja a localização exata do Parque Nacional de Ubajara e planeje sua rota de qualquer ponto de partida.</p>
          <a
            href="https://www.google.com/maps/search/Parque+Nacional+de+Ubajara,+CE"
            target="_blank"
            rel="noopener noreferrer"
            className="cg-cta__btn"
          >
            <span className="material-symbols-outlined">map</span>
            Abrir no Google Maps
          </a>
        </section>

      </div>

      <Footer />
    </div>
  );
}
