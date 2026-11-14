import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Icon from "../components/ui/Icon";
import StateBlock from "../components/ui/StateBlock";
import { Button } from "../components/ui/Button";
import { FilterChip } from "../components/ui/Chip";
import { attractionsService } from "../admin/services/attractionsService";
import { pageConfigService } from "../admin/services/pageConfigService";
import PointCard from "../components/ui/PointCard";
import { ATTRACTION_CATEGORY_LABELS as CATEGORY_LABELS } from "../utils/attractionCategories";
import { useAsyncData } from "../utils/useAsyncData";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import heroFallback from "../assets/images/foto-capa-parque-ubajara.png";
import "../components/ui/ui.css";
import "../components/Sections/style/Content.components.css";
import "./style/PontosTuristicos.css";

const ALL = "Todos";

export default function PontosTuristicos() {
  useDocumentTitle("Pontos turísticos");
  const [searchParams, setSearchParams] = useSearchParams();
  const data = useAsyncData(async () => (await attractionsService.getAll(0, 100, true)).content, "attractions");
  const [coverImg, setCoverImg] = useState<string>(heroFallback);
  const [heroDesc, setHeroDesc] = useState("Descubra cachoeiras, fazendas, mercados históricos e museus que fazem da Serra da Ibiapaba um destino único no Ceará.");
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    pageConfigService.getConfig('PONTOS_TURISTICOS').then((cfg) => {
      if (cfg.imageUrl) setCoverImg(cfg.imageUrl);
      if (cfg.description) setHeroDesc(cfg.description);
    });
  }, []);

  const items = useMemo(() => (data.status === "ready" ? data.data : []), [data]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map(p => CATEGORY_LABELS[p.category] ?? p.category)));
    return [ALL, ...cats];
  }, [items]);

  const categoryParam = searchParams.get("categoria") ?? ALL;
  const activeCategory = categories.includes(categoryParam) ? categoryParam : ALL;

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

  function updateParams(changes: Record<string, string | null>) {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(changes)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      return params;
    }, { replace: true });
  }

  function handleSearch(value: string) {
    setSearch(value);
    updateParams({ q: value.trim() ? value : null });
  }

  function clearFilters() {
    setSearch("");
    updateParams({ q: null, categoria: null });
  }

  const hasItems = data.status === "ready" && items.length > 0;
  const showToolbar = data.status === "loading" || hasItems;

  return (
    <div className="ptl-page">
      <Header />
      <main className="ptl-main" id="conteudo" tabIndex={-1}>

        <section className="ptl-hero">
          <img src={coverImg} alt="" className="ptl-hero__bg" fetchPriority="high" decoding="async" />
          <div className="ptl-hero__overlay" aria-hidden="true" />
          <div className="ptl-hero__content">
            <div className="ptl-hero__inner">
              <span className="ptl-hero__kicker">PARQUE NACIONAL DE UBAJARA</span>
              <h1 className="ptl-hero__title">Pontos Turísticos</h1>
              <p className="ptl-hero__subtitle">{heroDesc}</p>
            </div>
          </div>
        </section>

        {showToolbar && (
          <div className="ptl-toolbar">
            <div className="ptl-toolbar__inner">
              <div className="ptl-filters" role="group" aria-label="Filtrar por categoria">
                {categories.map((cat) => (
                  <FilterChip
                    key={cat}
                    label={cat}
                    selected={activeCategory === cat}
                    onClick={() => updateParams({ categoria: cat === ALL ? null : cat })}
                  />
                ))}
              </div>

              <div className="ptl-search">
                <label htmlFor="ptl-search-input" className="ptl-search__label">
                  Buscar atrativo
                </label>
                <div className="ptl-search__wrap">
                  <Icon name="search" className="ptl-search__icon" />
                  <input
                    id="ptl-search-input"
                    name="q"
                    type="search"
                    placeholder="Nome do local…"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    className="ptl-search__input"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <section className="ptl-section" aria-labelledby="ptl-list-title">
          <div className="ptl-section__inner">
            <h2 id="ptl-list-title" className="ui-sr-only">Lista de pontos turísticos</h2>
            {data.status === "loading" ? (
              <div className="ptl-empty" role="status">
                <Icon name="hourglass_top" className="ptl-empty__icon" />
                <p className="ptl-empty__msg">Carregando pontos turísticos…</p>
              </div>
            ) : data.status === "error" ? (
              <StateBlock
                variant="error"
                icon="wifi_off"
                title="Não conseguimos carregar os pontos turísticos"
                actions={<Button icon="refresh" onClick={data.retry}>Tentar de novo</Button>}
              >
                A conexão na serra pode oscilar. Verifique o sinal e tente de novo.
              </StateBlock>
            ) : items.length === 0 ? (
              <StateBlock variant="empty" icon="landscape" title="Ainda não há pontos turísticos cadastrados">
                Volte em breve para conhecer os atrativos da Serra da Ibiapaba.
              </StateBlock>
            ) : filtered.length > 0 ? (
              <ul className="ui-point-grid ui-point-grid--3">
                {filtered.map((pt) => (
                  <li key={pt.id}><PointCard item={pt} /></li>
                ))}
              </ul>
            ) : (
              <StateBlock
                variant="empty"
                icon="search_off"
                title="Nenhum ponto turístico encontrado para essa busca"
                actions={<Button variant="outline" onClick={clearFilters}>Limpar filtros</Button>}
              />
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
              <Link to="/#guias-de-turismo" className="ptl-cta__btn ptl-cta__btn--outline">Contratar um Guia</Link>
            </div>
          </div>
        </section>

        <section className="ptl-stats" aria-labelledby="ptl-stats-title">
          <h2 id="ptl-stats-title" className="ui-sr-only">O parque em números</h2>
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
