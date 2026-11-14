import type { JSX } from 'react';
import { useState, useEffect, useRef, useId, type KeyboardEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Icon from "../components/ui/Icon";
import StateBlock from "../components/ui/StateBlock";
import { Button } from "../components/ui/Button";
import { useAuth } from "../admin/hooks/useAuth";
import { testimonialsService } from "../admin/services/testimonialsService";
import { pageConfigService } from "../admin/services/pageConfigService";
import type { TestimonialResponse } from "../admin/types";
import { formatLongDate, parseIsoDate, toIsoDate } from "../utils/dates";
import { useAsyncData } from "../utils/useAsyncData";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import "../components/ui/ui.css";
import "./style/Depoimentos.css";

type Rating = 1 | 2 | 3 | 4 | 5;

const STAR_PATH = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";
const averageFormat = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function reviewsLabel(count: number): string {
  return `${count} ${count === 1 ? "avaliação" : "avaliações"}`;
}

function parseRating(raw: string | null): 0 | Rating {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? (n as Rating) : 0;
}

// ─── Componente de estrelas (exibição) ─────────────────────────────────────
function Stars({ value, size = 18 }: { value: number; size?: number }) {
  return (
    <span className="dep-stars" role="img" aria-label={`${value} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={s <= value ? "#FFB527" : "#e5e7eb"}
          aria-hidden="true"
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
}

// ─── Componente de estrelas (interativo) ───────────────────────────────────
interface StarPickerProps {
  value: number;
  onChange: (v: Rating) => void;
  labelledBy: string;
  describedBy?: string;
  invalid?: boolean;
  disabled?: boolean;
  groupRef?: React.Ref<HTMLDivElement>;
}

function StarPicker({ value, onChange, labelledBy, describedBy, invalid, disabled, groupRef }: StarPickerProps) {
  const [hovered, setHovered] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const active = hovered || value;

  const select = (next: number) => {
    const clamped = Math.min(5, Math.max(1, next)) as Rating;
    onChange(clamped);
    buttons.current[clamped - 1]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = value || 0;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        event.preventDefault();
        select(current + 1);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        event.preventDefault();
        select(current === 0 ? 1 : current - 1);
        break;
      case "Home":
        event.preventDefault();
        select(1);
        break;
      case "End":
        event.preventDefault();
        select(5);
        break;
    }
  };

  return (
    <div
      ref={groupRef}
      className="dep-star-picker"
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      onKeyDown={handleKeyDown}
    >
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          ref={(el) => { buttons.current[s - 1] = el; }}
          type="button"
          role="radio"
          aria-checked={value === s}
          tabIndex={value === s || (value === 0 && s === 1) ? 0 : -1}
          className={`dep-star-picker__btn${active >= s ? " filled" : ""}`}
          onClick={() => onChange(s as Rating)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          disabled={disabled}
          aria-label={`${s} estrela${s > 1 ? "s" : ""}`}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d={STAR_PATH} />
          </svg>
        </button>
      ))}
    </div>
  );
}

// ─── Card de depoimento ────────────────────────────────────────────────────
function TestimonialCard({ t }: { t: TestimonialResponse }) {
  const initials = t.userName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const date = parseIsoDate(t.createdDate);

  return (
    <article className="dep-card">
      <div className="dep-card__top">
        <div className="dep-card__avatar">
          {t.userPhoto
            ? <img src={t.userPhoto} alt="" width={44} height={44} loading="lazy" decoding="async" />
            : <span aria-hidden="true">{initials}</span>
          }
        </div>
        <div className="dep-card__meta">
          <strong className="dep-card__name">{t.userName}</strong>
        </div>
        <Stars value={t.rating} size={15} />
      </div>
      <p className="dep-card__comment">“{t.comment}”</p>
      {date && <time className="dep-card__date" dateTime={toIsoDate(date)}>{formatLongDate(date)}</time>}
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
export default function Depoimentos(): JSX.Element {
  useDocumentTitle("Depoimentos");
  const { isAuthenticated, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const ratingLabelId = useId();
  const ratingErrorId = useId();
  const commentErrorId = useId();

  const testimonials = useAsyncData(() => testimonialsService.listApproved(), "approved");
  const [published, setPublished] = useState<TestimonialResponse[]>([]);
  const [coverImg, setCoverImg] = useState<string | null>(null);
  const [heroDesc, setHeroDesc] = useState("O que visitantes de todo o Brasil dizem sobre o Parque Nacional de Ubajara.");
  const filter = parseRating(searchParams.get("nota"));

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const ratingGroupRef = useRef<HTMLDivElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    pageConfigService.getConfig('DEPOIMENTOS').then((cfg) => { if (cfg.imageUrl) setCoverImg(cfg.imageUrl); if (cfg.description) setHeroDesc(cfg.description); });
  }, []);

  useEffect(() => {
    if (!submitSuccess) return;
    const timer = window.setTimeout(() => setSubmitSuccess(false), 4000);
    return () => window.clearTimeout(timer);
  }, [submitSuccess]);

  const setFilter = (next: 0 | Rating) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (next) params.set("nota", String(next));
      else params.delete("nota");
      return params;
    }, { replace: true });
  };

  const all = testimonials.status === "ready" ? [...published, ...testimonials.data] : [];
  const filtered = filter === 0 ? all : all.filter((t) => t.rating === filter);

  const avgRating = all.length ? all.reduce((s, t) => s + t.rating, 0) / all.length : 0;

  const countByRating = [5, 4, 3, 2, 1].map((star) => ({
    star: star as Rating,
    count: all.filter((t) => t.rating === star).length,
  }));

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);
    const missingRating = rating === 0;
    const shortComment = comment.trim().length < 10;
    setRatingError(missingRating ? "Selecione uma avaliação de 1 a 5 estrelas." : null);
    setCommentError(shortComment ? "O comentário precisa ter pelo menos 10 caracteres." : null);
    if (missingRating) { ratingGroupRef.current?.querySelector<HTMLElement>('[role="radio"]')?.focus(); return; }
    if (shortComment) { commentRef.current?.focus(); return; }

    setSubmitting(true);
    try {
      const created = await testimonialsService.create({
        userName: user?.name || user?.email?.split("@")[0] || "Visitante",
        userEmail: user?.email ?? "",
        userPhoto: user?.photo,
        rating,
        comment: comment.trim(),
      });
      if (created.approved) setPublished((prev) => [created, ...prev]);
      setRating(0);
      setComment("");
      setSubmitSuccess(true);
    } catch {
      setSubmitError("Não foi possível enviar seu depoimento agora. Seu texto foi mantido: confira a conexão e tente enviar de novo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dep-page">
      <Header />

      <main id="conteudo" tabIndex={-1}>
      {/* ── Hero ── */}
      <section className="dep-hero">
        {coverImg && <img src={coverImg} alt="" className="dep-hero__bg" fetchPriority="high" decoding="async" />}
        {coverImg && <div className="dep-hero__overlay" aria-hidden="true" />}
        <div className="dep-hero__content">
          <span className="dep-hero__label">Comunidade</span>
          <h1 className="dep-hero__title">Depoimentos</h1>
          <p className="dep-hero__sub">{heroDesc}</p>
        </div>
      </section>

      <div className="dep-container">

        {/* ── Painel de avaliação geral ── */}
        {all.length > 0 && (
          <section className="dep-summary" aria-labelledby="dep-summary-title">
            <h2 id="dep-summary-title" className="ui-sr-only">Avaliação geral</h2>
            <div className="dep-summary__score">
              <span className="dep-summary__number">{averageFormat.format(avgRating)}</span>
              <Stars value={Math.round(avgRating)} size={22} />
              <span className="dep-summary__total">{reviewsLabel(all.length)}</span>
            </div>

            <div className="dep-summary__bars" role="group" aria-label="Filtrar por nota">
              {countByRating.map(({ star, count }) => (
                <button
                  key={star}
                  type="button"
                  className={`dep-summary__bar-row${filter === star ? " active" : ""}`}
                  aria-pressed={filter === star}
                  aria-label={`${star} ${star === 1 ? "estrela" : "estrelas"}: ${reviewsLabel(count)}`}
                  onClick={() => setFilter(filter === star ? 0 : star)}
                >
                  <span className="dep-summary__bar-label" aria-hidden="true">{star} ★</span>
                  <div className="dep-summary__bar-track" aria-hidden="true">
                    <div
                      className="dep-summary__bar-fill"
                      style={{ width: `${(count / all.length) * 100}%` }}
                    />
                  </div>
                  <span className="dep-summary__bar-count" aria-hidden="true">{count}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Lista de depoimentos ── */}
        <section className="dep-list-section" aria-labelledby="dep-list-title">
          <div className="dep-list-section__head">
            <h2 id="dep-list-title" className="dep-list-section__title">
              {filter === 0 ? "Todos os depoimentos" : `Avaliações de ${filter} ★`}
            </h2>
            {filter !== 0 && (
              <button type="button" className="dep-clear-filter" onClick={() => setFilter(0)}>
                <Icon name="close" />
                Limpar filtro
              </button>
            )}
          </div>

          {testimonials.status === "loading" ? (
            <div className="dep-loading" role="status">
              <span className="dep-spinner dep-spinner--lg" aria-hidden="true" />
              Carregando depoimentos…
            </div>
          ) : testimonials.status === "error" ? (
            <StateBlock
              variant="error"
              icon="wifi_off"
              title="Não conseguimos carregar os depoimentos"
              actions={<Button icon="refresh" onClick={testimonials.retry}>Tentar de novo</Button>}
            >
              A conexão na serra pode oscilar. Verifique o sinal e tente de novo.
            </StateBlock>
          ) : all.length === 0 ? (
            <StateBlock variant="empty" icon="rate_review" title="Ainda não há depoimentos">
              Seja o primeiro a compartilhar sua experiência.
            </StateBlock>
          ) : filtered.length === 0 ? (
            <StateBlock
              variant="empty"
              icon="sentiment_neutral"
              title="Nenhum depoimento com esta avaliação ainda"
              actions={<Button variant="outline" onClick={() => setFilter(0)}>Limpar filtro</Button>}
            />
          ) : (
            <div className="dep-grid">
              {filtered.map((t) => <TestimonialCard key={t.id} t={t} />)}
            </div>
          )}
        </section>

        {/* ── Adicionar depoimento ── */}
        {isAuthenticated ? (
          <section className="dep-form-section" aria-labelledby="dep-form-title">
            <h2 id="dep-form-title" className="dep-form-section__title">
              <Icon name="rate_review" />
              Deixe seu depoimento
            </h2>
            <p className="dep-form-section__sub">Sua experiência ajuda outros visitantes a se planejar.</p>

            {submitSuccess && (
              <div className="dep-alert dep-alert--success" role="status">
                <Icon name="check_circle" />
                Obrigado! Seu depoimento foi enviado e aguarda aprovação.
              </div>
            )}

            <form className="dep-form" onSubmit={handleSubmit} noValidate>
              <div className="dep-form__rating-wrap">
                <span id={ratingLabelId} className="dep-form__label">Sua avaliação</span>
                <div className="dep-form__rating-row">
                  <StarPicker
                    value={rating}
                    onChange={(v) => { setRating(v); setRatingError(null); }}
                    labelledBy={ratingLabelId}
                    describedBy={ratingError ? ratingErrorId : undefined}
                    invalid={!!ratingError}
                    disabled={submitting}
                    groupRef={ratingGroupRef}
                  />
                  {rating > 0 && (
                    <span className="dep-form__rating-label" aria-live="polite">{RATING_LABELS[rating]}</span>
                  )}
                </div>
                {ratingError && <p id={ratingErrorId} className="dep-form__error">{ratingError}</p>}
              </div>

              <div className="dep-form__field">
                <label className="dep-form__label" htmlFor="dep-comment">Seu comentário</label>
                <textarea
                  ref={commentRef}
                  id="dep-comment"
                  name="comment"
                  className="dep-form__textarea"
                  placeholder="Conte como foi sua experiência no parque…"
                  value={comment}
                  onChange={(e) => { setComment(e.target.value); if (commentError) setCommentError(null); }}
                  rows={4}
                  maxLength={600}
                  autoComplete="off"
                  disabled={submitting}
                  aria-invalid={commentError ? true : undefined}
                  aria-describedby={commentError ? commentErrorId : undefined}
                />
                <span className="dep-form__char-count">{comment.length}/600</span>
                {commentError && <p id={commentErrorId} className="dep-form__error">{commentError}</p>}
              </div>

              {submitError && (
                <div className="dep-alert dep-alert--error" role="alert">
                  <Icon name="error" />
                  {submitError}
                </div>
              )}

              <button type="submit" className="dep-form__submit" disabled={submitting}>
                {submitting
                  ? <><span className="dep-spinner" aria-hidden="true" /> Enviando…</>
                  : <><Icon name="send" /> Enviar depoimento</>
                }
              </button>
            </form>
          </section>
        ) : (
          <section className="dep-login-cta" aria-labelledby="dep-login-title">
            <Icon name="rate_review" className="dep-login-cta__icon" />
            <h2 id="dep-login-title" className="dep-login-cta__title">Quer deixar seu depoimento?</h2>
            <p className="dep-login-cta__sub">
              Faça login para compartilhar sua experiência no parque com outros visitantes.
            </p>
            <Link to="/admin/login" className="dep-login-cta__btn">
              <Icon name="login" />
              Entrar na conta
            </Link>
          </section>
        )}

      </div>
      </main>

      <Footer />
    </div>
  );
}
