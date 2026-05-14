import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { TOURIST_POINTS } from "../data/touristPoints";
import heroImg from "../assets/images/foto-capa-parque-ubajara.png";
import "../components/Sections/style/Content.components.css";
import "./style/PontosTuristicos.css";

const ALL = "Todos";

export default function PontosTuristicos() {
  const categories = useMemo(() => {
    const cats = Array.from(new Set(TOURIST_POINTS.map((p) => p.category)));
    return [ALL, ...cats];
  }, []);

  const [activeCategory, setActiveCategory] = useState(ALL);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      TOURIST_POINTS.filter((pt) => {
        const matchCat =
          activeCategory === ALL || pt.category === activeCategory;
        const q = search.trim().toLowerCase();
        const matchSearch =
          !q ||
          pt.title.toLowerCase().includes(q) ||
          pt.desc.toLowerCase().includes(q);
        return matchCat && matchSearch;
      }),
    [activeCategory, search]
  );

  return (
    <div className="ptl-page">
      <Header />
      <main className="ptl-main">

        {/* ── Hero ── */}
        <section className="ptl-hero">
          <img src={heroImg} alt="" className="ptl-hero__bg" aria-hidden />
          <div className="ptl-hero__overlay" />
          <div className="ptl-hero__content">
            <div className="ptl-hero__inner">
              <span className="ptl-hero__kicker">PARQUE NACIONAL DE UBAJARA</span>
              <h1 className="ptl-hero__title">Pontos Turísticos</h1>
              <p className="ptl-hero__subtitle">
                Descubra cachoeiras, fazendas, mercados históricos e museus que
                fazem da Serra da Ibiapaba um destino único no Ceará.
              </p>
            </div>
          </div>
        </section>

        {/* ── Toolbar: filters + search ── */}
        <div className="ptl-toolbar">
          <div className="ptl-toolbar__inner">
            <div
              className="ptl-filters"
              role="group"
              aria-label="Filtrar por categoria"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`ptl-filter-btn${
                    activeCategory === cat ? " is-active" : ""
                  }`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="ptl-search">
              <label
                htmlFor="ptl-search-input"
                className="ptl-search__label"
              >
                Buscar atrativo
              </label>
              <div className="ptl-search__wrap">
                <span
                  className="material-symbols-outlined ptl-search__icon"
                  aria-hidden="true"
                >
                  search
                </span>
                <input
                  id="ptl-search-input"
                  type="search"
                  placeholder="Nome do local..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ptl-search__input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Cards grid ── */}
        <section className="ptl-section">
          <div className="ptl-section__inner">
            {filtered.length > 0 ? (
              <div className="cards-points ptl-cards-override">
                <ul>
                  {filtered.map((pt) => (
                    <li key={pt.id}>
                      <Link
                        to={`/pontos/${pt.id}`}
                        className="point-card__link"
                        aria-label={`Ver detalhes de ${pt.title}`}
                      >
                        <img
                          src={pt.img}
                          alt={pt.alt}
                          className="point-card__img"
                          loading="lazy"
                        />
                        <div className="point-card__gradient" />
                        <span className="point-card__tag" aria-hidden="true">
                          {pt.category}
                        </span>
                        <div className="point-card__body">
                          <h3 className="point-card__title">{pt.title}</h3>
                          <p className="point-card__desc">{pt.desc}</p>
                          <div className="point-card__meta">
                            <span className="point-card__meta-item">
                              <span
                                className="material-symbols-outlined"
                                aria-hidden="true"
                              >
                                directions_walk
                              </span>
                              {pt.difficulty}
                            </span>
                            <span className="point-card__meta-item">
                              <span
                                className="material-symbols-outlined"
                                aria-hidden="true"
                              >
                                schedule
                              </span>
                              {pt.duration}
                            </span>
                          </div>
                          <span className="point-card__cta" aria-hidden="true">
                            <span
                              className="material-symbols-outlined"
                              aria-hidden="true"
                            >
                              visibility
                            </span>
                            Saiba mais
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="ptl-empty">
                <span className="material-symbols-outlined ptl-empty__icon">
                  search_off
                </span>
                <p className="ptl-empty__msg">
                  Nenhum ponto turístico encontrado para essa busca.
                </p>
                <button
                  type="button"
                  className="ptl-empty__reset"
                  onClick={() => {
                    setActiveCategory(ALL);
                    setSearch("");
                  }}
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="ptl-cta">
          <div className="ptl-cta__inner">
            <h2 className="ptl-cta__title">
              Planeje sua Visita com Especialistas
            </h2>
            <p className="ptl-cta__desc">
              Nossos condutores credenciados garantem uma experiência segura e
              rica em conhecimento histórico e ambiental.
            </p>
            <div className="ptl-cta__btns">
              <Link to="/" className="ptl-cta__btn ptl-cta__btn--outline">
                Contratar um Guia
              </Link>
              <Link to="/" className="ptl-cta__btn">
                Ver Regulamento do Parque
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="ptl-stats">
          <div className="ptl-stats__inner">
            {[
              { value: "6.288", label: "Hectares Protegidos" },
              { value: "15+", label: "Grutas Catalogadas" },
              { value: "100+", label: "Espécies de Aves" },
              { value: "1978", label: "Ano de Criação" },
            ].map((s) => (
              <div key={s.label} className="ptl-stat">
                <span className="ptl-stat__value">{s.value}</span>
                <span className="ptl-stat__label">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
