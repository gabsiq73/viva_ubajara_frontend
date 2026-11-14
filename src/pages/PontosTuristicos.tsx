import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { attractionsService } from "../admin/services/attractionsService";
import { pageConfigService } from "../admin/services/pageConfigService";
import type { AttractionResponse } from "../admin/types";
import PointCard from "../components/ui/PointCard";
import { ATTRACTION_CATEGORY_LABELS as CATEGORY_LABELS } from "../utils/attractionCategories";
import heroFallback from "../assets/images/foto-capa-parque-ubajara.png";
import "../components/Sections/style/Content.components.css";
import "./style/PontosTuristicos.css";

const ALL = "Todos";

export default function PontosTuristicos() {
  const [items, setItems] = useState<AttractionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [coverImg, setCoverImg] = useState<string>(heroFallback);
  const [heroDesc, setHeroDesc] = useState("Descubra cachoeiras, fazendas, mercados históricos e museus que fazem da Serra da Ibiapaba um destino único no Ceará.");
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [search, setSearch] = useState("");

  useEffect(() => {
    pageConfigService.getConfig('PONTOS_TURISTICOS').then((cfg) => {
      if (cfg.imageUrl) setCoverImg(cfg.imageUrl);
      if (cfg.description) setHeroDesc(cfg.description);
    });
    attractionsService.getAll(0, 100, true)
      .then(page => setItems(page.content))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map(p => CATEGORY_LABELS[p.category] ?? p.category)));
    return [ALL, ...cats];
  }, [items]);

  const filtered = useMemo(
    () =>
      items.filter((pt) => {
        const catLabel = CATEGORY_LABELS[pt.category] ?? pt.category;
        const matchCat = activeCategory === ALL || catLabel === activeCategory;
        const q = search.trim().toLowerCase();
        const matchSearch =
          !q ||
          pt.name.toLowerCase().includes(q) ||
          pt.description.toLowerCase().includes(q);
        return matchCat && matchSearch;
      }),
    [items, activeCategory, search]
  );

  return (
    <div className="ptl-page">
      <Header />
      <main className="ptl-main">

        <section className="ptl-hero">
          <img src={coverImg} alt="" className="ptl-hero__bg" aria-hidden />
          <div className="ptl-hero__overlay" />
          <div className="ptl-hero__content">
            <div className="ptl-hero__inner">
              <span className="ptl-hero__kicker">PARQUE NACIONAL DE UBAJARA</span>
              <h1 className="ptl-hero__title">Pontos Turísticos</h1>
              <p className="ptl-hero__subtitle">{heroDesc}</p>
            </div>
          </div>
        </section>

        <div className="ptl-toolbar">
          <div className="ptl-toolbar__inner">
            <div className="ptl-filters" role="group" aria-label="Filtrar por categoria">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`ptl-filter-btn${activeCategory === cat ? " is-active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="ptl-search">
              <label htmlFor="ptl-search-input" className="ptl-search__label">
                Buscar atrativo
              </label>
              <div className="ptl-search__wrap">
                <span className="material-symbols-outlined ptl-search__icon" aria-hidden="true">search</span>
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

        <section className="ptl-section">
          <div className="ptl-section__inner">
            {loading ? (
              <div className="ptl-empty">
                <span className="material-symbols-outlined ptl-empty__icon">hourglass_top</span>
                <p className="ptl-empty__msg">Carregando pontos turísticos...</p>
              </div>
            ) : filtered.length > 0 ? (
              <ul className="ui-point-grid ui-point-grid--3">
                {filtered.map((pt) => (
                  <li key={pt.id}><PointCard item={pt} /></li>
                ))}
              </ul>
            ) : (
              <div className="ptl-empty">
                <span className="material-symbols-outlined ptl-empty__icon">search_off</span>
                <p className="ptl-empty__msg">
                  Nenhum ponto turístico encontrado para essa busca.
                </p>
                <button
                  type="button"
                  className="ptl-empty__reset"
                  onClick={() => { setActiveCategory(ALL); setSearch(""); }}
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="ptl-cta">
          <div className="ptl-cta__inner">
            <h2 className="ptl-cta__title">Planeje sua Visita com Especialistas</h2>
            <p className="ptl-cta__desc">
              Nossos condutores credenciados garantem uma experiência segura e
              rica em conhecimento histórico e ambiental.
            </p>
            <div className="ptl-cta__btns">
              <Link to="/" className="ptl-cta__btn ptl-cta__btn--outline">Contratar um Guia</Link>
              <Link to="/" className="ptl-cta__btn">Ver Regulamento do Parque</Link>
            </div>
          </div>
        </section>

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
