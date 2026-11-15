import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../admin/hooks/useAuth";
import { reviewsService } from "../../admin/services/reviewsService";
import type { ApprovalStatus, PageResponse, ReviewResponse, ReviewSummary } from "../../admin/types";
import { claimErrorMessage } from "../../utils/claims";
import { formatLongDate, parseIsoDate, toIsoDate } from "../../utils/dates";
import { RATING_LABELS, formatRating, reviewsLabel } from "../../utils/rating";
import { saveReturnTo } from "../../utils/returnTo";
import { useAsyncData } from "../../utils/useAsyncData";
import { Button } from "../ui/Button";
import Field from "../ui/Field";
import Icon from "../ui/Icon";
import { Skeleton } from "../ui/Skeleton";
import StateBlock from "../ui/StateBlock";
import { StarPicker, Stars } from "../ui/Stars";
import "../ui/ui.css";
import "./reviews.css";

const SECTION_ID = "avaliacoes";
const PAGE_SIZE = 5;
const COMMENT_MIN = 10;
const COMMENT_MAX = 600;
const SEND_ERROR = "Não foi possível enviar sua avaliação agora. Seu texto foi mantido: confira a conexão e tente enviar de novo.";

const STATUS_LABEL: Record<ApprovalStatus, string> = {
    PENDING: "Em análise",
    APPROVED: "Publicada",
    REJECTED: "Recusada",
};

interface ReviewsSectionProps {
    spotId: string;
    spotName: string;
    className?: string;
}

function ReviewCard({ review }: { review: ReviewResponse }) {
    const initials = review.authorName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
    const date = parseIsoDate(review.createdDate);
    return (
        <article className="rv-card">
            <div className="rv-card__top">
                <div className="rv-card__avatar">
                    {review.authorPhoto ? (
                        <img src={review.authorPhoto} alt="" width={40} height={40} loading="lazy" decoding="async" />
                    ) : (
                        <span aria-hidden="true">{initials}</span>
                    )}
                </div>
                <div className="rv-card__meta">
                    <strong className="rv-card__name">{review.authorName}</strong>
                    {date && (
                        <time className="rv-card__date" dateTime={toIsoDate(date)}>
                            {formatLongDate(date)}
                        </time>
                    )}
                </div>
                <Stars value={review.rating} size={16} />
            </div>
            {review.comment && <p className="rv-card__comment">{review.comment}</p>}
        </article>
    );
}

function Summary({ summary }: { summary: ReviewSummary }) {
    const average = summary.average ?? 0;
    return (
        <div className="rv-summary">
            <div className="rv-summary__score">
                <span className="rv-summary__number">{formatRating(average)}</span>
                <Stars value={Math.round(average)} size={20} />
                <span className="rv-summary__total">{reviewsLabel(summary.count)}</span>
            </div>
            <ul className="rv-summary__bars" aria-label="Distribuição das notas">
                {[5, 4, 3, 2, 1].map((star) => {
                    const count = summary.distribution?.[String(star)] ?? 0;
                    return (
                        <li key={star} className="rv-summary__row" aria-label={`${star} ${star === 1 ? "estrela" : "estrelas"}: ${reviewsLabel(count)}`}>
                            <span className="rv-summary__label" aria-hidden="true">{star} ★</span>
                            <span className="rv-summary__track" aria-hidden="true">
                                <span className="rv-summary__fill" style={{ width: `${summary.count ? (count / summary.count) * 100 : 0}%` }} />
                            </span>
                            <span className="rv-summary__count" aria-hidden="true">{count}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

function ReviewList({ spotId, first }: { spotId: string; first: PageResponse<ReviewResponse> }) {
    const [items, setItems] = useState(first.content);
    const [page, setPage] = useState(first.number);
    const [last, setLast] = useState(first.last);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [focusId, setFocusId] = useState<string | null>(null);
    const focusRef = useRef<HTMLLIElement | null>(null);

    useEffect(() => {
        if (focusId) focusRef.current?.focus();
    }, [focusId]);

    const loadMore = async () => {
        setLoading(true);
        setError(false);
        try {
            const next = await reviewsService.listBySpot(spotId, page + 1, PAGE_SIZE);
            const known = new Set(items.map((r) => r.id));
            const fresh = next.content.filter((r) => !known.has(r.id));
            setItems([...items, ...fresh]);
            setPage(next.number);
            setLast(next.last);
            setFocusId(fresh[0]?.id ?? null);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ul className="rv-list">
                {items.map((review) => (
                    <li
                        key={review.id}
                        ref={review.id === focusId ? focusRef : undefined}
                        tabIndex={review.id === focusId ? -1 : undefined}
                        className="rv-list__item"
                    >
                        <ReviewCard review={review} />
                    </li>
                ))}
            </ul>
            {error && (
                <p className="rv-inline-error" role="alert">
                    Não foi possível carregar mais avaliações. Tente de novo.
                </p>
            )}
            {!last && (
                <div className="rv-more">
                    <Button variant="outline" icon={loading ? undefined : "expand_more"} onClick={loadMore} disabled={loading} aria-busy={loading}>
                        {loading ? "Carregando…" : "Ver mais avaliações"}
                    </Button>
                </div>
            )}
        </>
    );
}

function Composer({ spotId, spotName, onSaved }: { spotId: string; spotName: string; onSaved: () => void }) {
    const { isAuthenticated } = useAuth();
    const { pathname, search } = useLocation();
    const ratingLabelId = useId();
    const ratingErrorId = useId();
    const mine = useAsyncData(
        () => (isAuthenticated ? reviewsService.mine(spotId) : Promise.resolve(null)),
        `${spotId}|${isAuthenticated}`,
    );
    const [saved, setSaved] = useState<ReviewResponse | null>(null);
    const [editing, setEditing] = useState(false);
    const [justSent, setJustSent] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [ratingError, setRatingError] = useState<string | null>(null);
    const [commentError, setCommentError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const ratingGroupRef = useRef<HTMLDivElement>(null);
    const commentRef = useRef<HTMLTextAreaElement>(null);
    const editButtonRef = useRef<HTMLButtonElement>(null);
    const [focusEdit, setFocusEdit] = useState(0);

    useEffect(() => {
        if (focusEdit > 0) editButtonRef.current?.focus();
    }, [focusEdit]);

    if (!isAuthenticated) {
        const returnPath = `${pathname}${search}#${SECTION_ID}`;
        return (
            <div className="rv-cta">
                <span className="rv-cta__icon" aria-hidden="true">
                    <Icon name="rate_review" />
                </span>
                <div className="rv-cta__text">
                    <p className="rv-cta__title">Já visitou {spotName}?</p>
                    <p className="rv-cta__desc">Entre na sua conta para avaliar e ajudar outros visitantes.</p>
                </div>
                <Link to="/admin/login" className="ui-btn ui-btn--primary" onClick={() => saveReturnTo(returnPath)}>
                    <Icon name="login" />
                    Entrar para avaliar
                </Link>
            </div>
        );
    }

    if (mine.status === "loading") {
        return (
            <div className="rv-form-card" aria-busy="true">
                <span className="ui-sr-only" role="status">Verificando sua avaliação…</span>
                <Skeleton height={20} width="40%" />
                <Skeleton height={44} width="60%" />
            </div>
        );
    }

    const current = saved ?? (mine.status === "ready" ? mine.data : null);
    const showForm = editing || current === null;

    const startEditing = () => {
        setRating(current?.rating ?? 0);
        setComment(current?.comment ?? "");
        setRatingError(null);
        setCommentError(null);
        setSubmitError(null);
        setJustSent(false);
        setEditing(true);
    };

    const cancelEditing = () => {
        setEditing(false);
        setSubmitError(null);
        setFocusEdit((n) => n + 1);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setSubmitError(null);
        const trimmed = comment.trim();
        const missingRating = rating === 0;
        const shortComment = trimmed.length > 0 && trimmed.length < COMMENT_MIN;
        setRatingError(missingRating ? "Selecione uma nota de 1 a 5 estrelas." : null);
        setCommentError(shortComment ? `O comentário precisa ter pelo menos ${COMMENT_MIN} caracteres.` : null);
        if (missingRating) {
            ratingGroupRef.current?.querySelector<HTMLElement>('[role="radio"]')?.focus();
            return;
        }
        if (shortComment) {
            commentRef.current?.focus();
            return;
        }
        setSubmitting(true);
        try {
            const result = await reviewsService.save(spotId, { rating, comment: trimmed || null });
            setSaved(result);
            setEditing(false);
            setJustSent(true);
            setFocusEdit((n) => n + 1);
            onSaved();
        } catch (error) {
            setSubmitError(claimErrorMessage(error, SEND_ERROR));
        } finally {
            setSubmitting(false);
        }
    };

    if (!showForm && current) {
        return (
            <div className="rv-form-card">
                {justSent && (
                    <div className="rv-alert rv-alert--success" role="status">
                        <Icon name="check_circle" />
                        <span>Obrigado! Sua avaliação foi enviada e aguarda aprovação.</span>
                    </div>
                )}
                <div className="rv-mine">
                    <div className="rv-mine__head">
                        <h3 className="rv-mine__title">Sua avaliação</h3>
                        <span className={`rv-status rv-status--${current.status.toLowerCase()}`}>{STATUS_LABEL[current.status]}</span>
                    </div>
                    <Stars value={current.rating} size={20} />
                    {current.comment && <p className="rv-mine__comment">{current.comment}</p>}
                    <div className="rv-mine__actions">
                        <button ref={editButtonRef} type="button" className="ui-btn ui-btn--outline" onClick={startEditing}>
                            <Icon name="edit" />
                            Editar avaliação
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form className="rv-form-card rv-form" onSubmit={handleSubmit} noValidate>
            <h3 className="rv-form__title">{current ? "Editar sua avaliação" : `Avalie ${spotName}`}</h3>
            {current && (
                <p className="rv-form__note">
                    <Icon name="info" />
                    <span>Ao salvar, sua avaliação volta para análise e só aparece publicamente depois de aprovada.</span>
                </p>
            )}

            <div className="rv-form__rating">
                <span id={ratingLabelId} className="ui-field__label">
                    Sua nota <span className="ui-field__req" aria-hidden="true">*</span>
                </span>
                <div className="rv-form__rating-row">
                    <StarPicker
                        value={rating}
                        onChange={(v) => {
                            setRating(v);
                            setRatingError(null);
                        }}
                        labelledBy={ratingLabelId}
                        describedBy={ratingError ? ratingErrorId : undefined}
                        invalid={!!ratingError}
                        disabled={submitting}
                        groupRef={ratingGroupRef}
                    />
                    {rating > 0 && (
                        <span className="rv-form__rating-label" aria-live="polite">
                            {RATING_LABELS[rating]}
                        </span>
                    )}
                </div>
                {ratingError && (
                    <p id={ratingErrorId} className="ui-field__error">
                        <Icon name="error" filled />
                        <span>{ratingError}</span>
                    </p>
                )}
            </div>

            <Field label="Seu comentário" optional error={commentError ?? undefined} counter={{ current: comment.length, max: COMMENT_MAX }}>
                {(control) => (
                    <textarea
                        {...control}
                        ref={commentRef}
                        name="comment"
                        className="ui-input"
                        rows={4}
                        maxLength={COMMENT_MAX}
                        placeholder="Conte como foi sua experiência…"
                        autoComplete="off"
                        value={comment}
                        disabled={submitting}
                        onChange={(e) => {
                            setComment(e.target.value);
                            if (commentError) setCommentError(null);
                        }}
                    />
                )}
            </Field>

            {submitError && (
                <div className="rv-alert rv-alert--error" role="alert">
                    <Icon name="error" />
                    <span>{submitError}</span>
                </div>
            )}

            <div className="rv-form__actions">
                <Button type="submit" icon={submitting ? undefined : "send"} disabled={submitting} aria-busy={submitting}>
                    {submitting ? "Enviando…" : current ? "Salvar avaliação" : "Enviar avaliação"}
                </Button>
                {current && (
                    <Button variant="outline" onClick={cancelEditing} disabled={submitting}>
                        Cancelar
                    </Button>
                )}
            </div>
        </form>
    );
}

export default function ReviewsSection({ spotId, spotName, className = "" }: ReviewsSectionProps) {
    const [version, setVersion] = useState(0);
    const overview = useAsyncData(async () => {
        const [summary, first] = await Promise.all([
            reviewsService.summary(spotId),
            reviewsService.listBySpot(spotId, 0, PAGE_SIZE),
        ]);
        return { summary, first };
    }, `${spotId}|${version}`);

    return (
        <section id={SECTION_ID} className={`rv estd-section ${className}`.trim()} aria-labelledby="rv-title">
            <div className="rv__inner">
                <div className="rv__head">
                    <p className="estd-eyebrow">Opiniões de visitantes</p>
                    <h2 id="rv-title" className="estd-h2">
                        Avaliações
                    </h2>
                </div>

                {overview.status === "loading" && (
                    <div className="rv-loading" aria-busy="true">
                        <span className="ui-sr-only" role="status">Carregando avaliações…</span>
                        <Skeleton height={96} radius={16} />
                        <Skeleton height={72} radius={16} />
                    </div>
                )}

                {overview.status === "error" && (
                    <StateBlock
                        variant="error"
                        icon="wifi_off"
                        title="Não conseguimos carregar as avaliações"
                        actions={
                            <Button icon="refresh" onClick={overview.retry}>
                                Tentar de novo
                            </Button>
                        }
                    >
                        A conexão na serra pode oscilar. Verifique o sinal e tente de novo.
                    </StateBlock>
                )}

                {overview.status === "ready" &&
                    (overview.data.summary.count > 0 ? (
                        <>
                            <Summary summary={overview.data.summary} />
                            <ReviewList key={version} spotId={spotId} first={overview.data.first} />
                        </>
                    ) : (
                        <StateBlock variant="empty" icon="rate_review" title="Ainda não há avaliações">
                            Seja a primeira pessoa a avaliar {spotName}.
                        </StateBlock>
                    ))}

                <Composer spotId={spotId} spotName={spotName} onSaved={() => setVersion((n) => n + 1)} />
            </div>
        </section>
    );
}
