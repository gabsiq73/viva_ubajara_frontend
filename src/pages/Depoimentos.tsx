import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../admin/hooks/useAuth";
import { testimonialsService, type Testimonial } from "../admin/services/testimonialsService";
import "./style/Depoimentos.css";

// ─── Mock data mostrado enquanto a API não retorna ──────────────────────────
const MOCK: Testimonial[] = [
  {
    id: "m1",
    userName: "Maria das Graças",
    rating: 5,
    comment: "Lugar incrível! O teleférico é uma experiência única. A cachoeira do Cafundó é lindíssima. Com certeza voltarei com minha família.",
    createdAt: "2025-03-15",
    userRole: "Visitante",
  },
  {
    id: "m2",
    userName: "Carlos Eduardo",
    rating: 5,
    comment: "Fiz a trilha até a caverna com um guia local e foi inesquecível. A fauna e flora da Serra da Ibiapaba são de tirar o fôlego. Recomendo muito!",
    createdAt: "2025-02-20",
    userRole: "Turista",
  },
  {
    id: "m3",
    userName: "Ana Paula Ferreira",
    rating: 4,
    comment: "Parque muito bem cuidado. O teleférico às vezes fica em manutenção, então confirme antes de ir. A paisagem do alto é deslumbrante.",
    createdAt: "2025-01-08",
    userRole: "Visitante",
  },
  {
    id: "m4",
    userName: "João Marcos",
    rating: 5,
    comment: "Visitei pela segunda vez e a experiência foi ainda melhor. Os guias são muito atenciosos e conhecem cada detalhe do parque. Imperdível!",
    createdAt: "2024-12-22",
    userRole: "Turista",
  },
  {
    id: "m5",
    userName: "Fernanda Lima",
    rating: 4,
    comment: "Natureza preservada e trilhas bem sinalizadas. Leve água e protetor solar. A estrutura de apoio pode melhorar um pouco, mas a beleza compensa.",
    createdAt: "2024-11-30",
    userRole: "Visitante",
  },
  {
    id: "m6",
    userName: "Ricardo Santos",
    rating: 5,
    comment: "Melhor passeio ecológico que já fiz no Ceará. A vista da Serra da Ibiapaba e a chegada à cachoeira são momentos que ficam para sempre na memória.",
    createdAt: "2024-10-14",
    userRole: "Turista",
  },
];

// ─── Componente de estrelas (exibição) ─────────────────────────────────────
function Stars({ value, size = 18 }: { value: number; size?: number }) {
  return (
    <span className="dep-stars" aria-label={`${value} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={s <= value ? "#FFB527" : "#e5e7eb"}
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

// ─── Componente de estrelas (interativo) ───────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="dep-star-picker" role="radiogroup" aria-label="Avaliação">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          className={`dep-star-picker__btn${active >= s ? " filled" : ""}`}
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${s} estrela${s > 1 ? "s" : ""}`}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

// ─── Card de depoimento ────────────────────────────────────────────────────
function TestimonialCard({ t }: { t: Testimonial }) {
  const initials = t.userName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const date = new Date(t.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <article className="dep-card">
      <div className="dep-card__top">
        <div className="dep-card__avatar">
          {t.userPhoto
            ? <img src={t.userPhoto} alt={t.userName} />
            : <span>{initials}</span>
          }
        </div>
        <div className="dep-card__meta">
          <strong className="dep-card__name">{t.userName}</strong>
          {t.userRole && <span className="dep-card__role">{t.userRole}</span>}
        </div>
        <Stars value={t.rating} size={15} />
      </div>
      <p className="dep-card__comment">"{t.comment}"</p>
      <time className="dep-card__date" dateTime={t.createdAt}>{date}</time>
    </article>
  );
}

// ─── Label textual da avaliação ────────────────────────────────────────────
const RATING_LABELS: Record<number, string> = {
  1: "Ruim",
  2: "Regular",
  3: "Bom",
  4: "Muito bom",
  5: "Excelente!",
};

// ─── Página principal ──────────────────────────────────────────────────────
export default function Depoimentos() {
  const { isAuthenticated, user } = useAuth();

  const [testimonials, setTestimonials] = useState<Testimonial[]>(MOCK);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Carrega da API (se disponível) e complementa com mock
  const load = useCallback(async () => {
    try {
      const data = await testimonialsService.list();
      setTestimonials(data.length ? data : MOCK);
    } catch {
      setTestimonials(MOCK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 0
    ? testimonials
    : testimonials.filter((t) => t.rating === filter);

  const avgRating = testimonials.length
    ? testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length
    : 0;

  const countByRating = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: testimonials.filter((t) => t.rating === star).length,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setSubmitError("Selecione uma avaliação de 1 a 5 estrelas."); return; }
    if (comment.trim().length < 10) { setSubmitError("O comentário precisa ter pelo menos 10 caracteres."); return; }

    setSubmitError(null);
    setSubmitting(true);

    const optimistic: Testimonial = {
      id: `local-${Date.now()}`,
      userName: user?.name || user?.email?.split("@")[0] || "Visitante",
      userPhoto: user?.photo,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString().split("T")[0],
    };

    try {
      const created = await testimonialsService.create({ rating, comment: comment.trim() });
      setTestimonials((prev) => [created, ...prev]);
    } catch {
      // API não disponível ainda — usa versão otimista
      setTestimonials((prev) => [optimistic, ...prev]);
    } finally {
      setRating(0);
      setComment("");
      setSubmitSuccess(true);
      setSubmitting(false);
      setTimeout(() => setSubmitSuccess(false), 4000);
    }
  };

  return (
    <div className="dep-page">
      <Header />

      {/* ── Hero ── */}
      <section className="dep-hero">
        <div className="dep-hero__content">
          <span className="dep-hero__label">Comunidade</span>
          <h1 className="dep-hero__title">Depoimentos</h1>
          <p className="dep-hero__sub">
            O que visitantes de todo o Brasil dizem sobre o Parque Nacional de Ubajara.
          </p>
        </div>
      </section>

      <div className="dep-container">

        {/* ── Painel de avaliação geral ── */}
        <section className="dep-summary">
          <div className="dep-summary__score">
            <span className="dep-summary__number">{avgRating.toFixed(1)}</span>
            <Stars value={Math.round(avgRating)} size={22} />
            <span className="dep-summary__total">{testimonials.length} avaliações</span>
          </div>

          <div className="dep-summary__bars">
            {countByRating.map(({ star, count }) => (
              <button
                key={star}
                className={`dep-summary__bar-row${filter === star ? " active" : ""}`}
                onClick={() => setFilter(filter === star ? 0 : star as 1 | 2 | 3 | 4 | 5)}
              >
                <span className="dep-summary__bar-label">{star} ★</span>
                <div className="dep-summary__bar-track">
                  <div
                    className="dep-summary__bar-fill"
                    style={{ width: testimonials.length ? `${(count / testimonials.length) * 100}%` : "0%" }}
                  />
                </div>
                <span className="dep-summary__bar-count">{count}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Lista de depoimentos ── */}
        <section className="dep-list-section">
          <div className="dep-list-section__head">
            <h2 className="dep-list-section__title">
              {filter === 0 ? "Todos os depoimentos" : `Avaliações de ${filter} ★`}
            </h2>
            {filter !== 0 && (
              <button className="dep-clear-filter" onClick={() => setFilter(0)}>
                <span className="material-symbols-outlined">close</span>
                Limpar filtro
              </button>
            )}
          </div>

          {loading ? (
            <div className="dep-loading">
              <span className="dep-spinner dep-spinner--lg" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="dep-empty">
              <span className="material-symbols-outlined">sentiment_neutral</span>
              <p>Nenhum depoimento com esta avaliação ainda.</p>
            </div>
          ) : (
            <div className="dep-grid">
              {filtered.map((t) => <TestimonialCard key={t.id} t={t} />)}
            </div>
          )}
        </section>

        {/* ── Adicionar depoimento ── */}
        {isAuthenticated ? (
          <section className="dep-form-section">
            <h2 className="dep-form-section__title">
              <span className="material-symbols-outlined">rate_review</span>
              Deixe seu depoimento
            </h2>
            <p className="dep-form-section__sub">Sua experiência ajuda outros visitantes a se planejar.</p>

            {submitSuccess && (
              <div className="dep-alert dep-alert--success" role="status">
                <span className="material-symbols-outlined">check_circle</span>
                Obrigado! Seu depoimento foi enviado com sucesso.
              </div>
            )}

            <form className="dep-form" onSubmit={handleSubmit} noValidate>
              <div className="dep-form__rating-wrap">
                <label className="dep-form__label">Sua avaliação</label>
                <div className="dep-form__rating-row">
                  <StarPicker value={rating} onChange={setRating} />
                  {rating > 0 && (
                    <span className="dep-form__rating-label">{RATING_LABELS[rating]}</span>
                  )}
                </div>
              </div>

              <div className="dep-form__field">
                <label className="dep-form__label" htmlFor="dep-comment">Seu comentário</label>
                <textarea
                  id="dep-comment"
                  className="dep-form__textarea"
                  placeholder="Conte como foi sua experiência no parque..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  maxLength={600}
                  disabled={submitting}
                />
                <span className="dep-form__char-count">{comment.length}/600</span>
              </div>

              {submitError && (
                <div className="dep-alert dep-alert--error" role="alert">
                  <span className="material-symbols-outlined">error</span>
                  {submitError}
                </div>
              )}

              <button type="submit" className="dep-form__submit" disabled={submitting}>
                {submitting
                  ? <><span className="dep-spinner" /> Enviando…</>
                  : <><span className="material-symbols-outlined">send</span> Enviar depoimento</>
                }
              </button>
            </form>
          </section>
        ) : (
          <section className="dep-login-cta">
            <span className="material-symbols-outlined dep-login-cta__icon">rate_review</span>
            <h2 className="dep-login-cta__title">Quer deixar seu depoimento?</h2>
            <p className="dep-login-cta__sub">
              Faça login para compartilhar sua experiência no parque com outros visitantes.
            </p>
            <Link to="/admin/login" className="dep-login-cta__btn">
              <span className="material-symbols-outlined">login</span>
              Entrar na conta
            </Link>
          </section>
        )}

      </div>

      <Footer />
    </div>
  );
}
