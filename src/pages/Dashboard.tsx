import { useState, useEffect, useRef, useId, type KeyboardEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Icon from "../components/ui/Icon";
import StateBlock from "../components/ui/StateBlock";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../company/components/ConfirmDialog";
import { useAuth } from "../admin/hooks/useAuth";
import { usersService } from "../admin/services/usersService";
import { testimonialsService } from "../admin/services/testimonialsService";
import { formatMediumDate, parseIsoDate, toIsoDate } from "../utils/dates";
import { loadFavorites, toggleFavorite, type FavoriteItem } from "../utils/favorites";
import { getRoleLabel } from "../utils/roles";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import "../components/ui/ui.css";
import "./style/Dashboard.css";

// ─── localStorage helpers ──────────────────────────────────────────────────────

const MSG_KEY = "ubajara-sent-messages";
const DEP_KEY = "ubajara-testimonial-sent";

interface SentMessage {
  subject: string;
  message: string;
  sentAt: string;
}

function loadMessages(): SentMessage[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(MSG_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is SentMessage =>
        !!m && typeof m.subject === "string" && typeof m.message === "string" && typeof m.sentAt === "string",
    );
  } catch {
    return [];
  }
}

function readTestimonialFlag(): boolean {
  try {
    return localStorage.getItem(DEP_KEY) === "1";
  } catch {
    return false;
  }
}

function writeTestimonialFlag(sent: boolean) {
  try {
    if (sent) localStorage.setItem(DEP_KEY, "1");
    else localStorage.removeItem(DEP_KEY);
  } catch {
    // só lembra o envio neste navegador; o depoimento já foi enviado
  }
}

// ─── Star rating ───────────────────────────────────────────────────────────────

function StarRating({ value, onChange, labelledBy }: { value: number; onChange: (v: number) => void; labelledBy: string }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="dash-stars" role="group" aria-labelledby={labelledBy}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          className={`dash-star${s <= (hover || value) ? " dash-star--active" : ""}`}
          aria-pressed={value === s}
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${s} estrela${s > 1 ? "s" : ""}`}
        >
          <span aria-hidden="true">★</span>
        </button>
      ))}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: "favorites", label: "Favoritos", icon: "favorite" },
  { key: "messages", label: "Mensagens", icon: "mail" },
  { key: "testimonial", label: "Depoimento", icon: "rate_review" },
  { key: "profile", label: "Editar Perfil", icon: "manage_accounts" },
] as const;

type Tab = (typeof TABS)[number]["key"];

function parseTab(raw: string | null): Tab {
  return TABS.find((t) => t.key === raw)?.key ?? "favorites";
}

const TYPE_LABELS: Record<string, string> = {
  attraction: "Atração",
  event: "Evento",
  restaurant: "Restaurante",
  "host-point": "Hospedagem",
};

type Confirming = { kind: "photo" } | { kind: "favorite"; item: FavoriteItem } | null;
type PhotoNotice = { kind: "error" | "ok"; text: string } | null;

export default function Dashboard() {
  useDocumentTitle("Meu perfil");
  const { isAuthenticated, user, logout, updateUserPhoto } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const ratingLabelId = useId();

  const tab = parseTab(searchParams.get("tab"));

  const [favorites, setFavorites] = useState<FavoriteItem[]>(loadFavorites);
  const [messages, setMessages] = useState<SentMessage[]>(loadMessages);
  const [favNotice, setFavNotice] = useState("");
  const [confirming, setConfirming] = useState<Confirming>(null);

  // Photo upload
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(user?.photo ?? null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoNotice, setPhotoNotice] = useState<PhotoNotice>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLButtonElement>(null);

  // Testimonial
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [testimonialSent, setTestimonialSent] = useState(readTestimonialFlag);
  const [testimonialError, setTestimonialError] = useState<string | null>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  // Profile edit
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [infoError, setInfoError] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);
  const [profileLoadFailed, setProfileLoadFailed] = useState(false);
  const [profileAttempt, setProfileAttempt] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate("/admin/login", { replace: true });
  }, [isAuthenticated, navigate]);

  // Load user profile from API to get DB-stored photoUrl + current info
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    usersService.getMe().then((data) => {
      if (cancelled) return;
      setFirstName(data.firstName ?? "");
      setLastName(data.lastName ?? "");
      setUsername(data.username ?? "");
      setEmail(data.email ?? "");
      if (data.photoUrl) {
        setCurrentPhoto(data.photoUrl);
        updateUserPhoto(data.photoUrl);
      }
    }).catch(() => {
      if (!cancelled) setProfileLoadFailed(true);
    });
    return () => { cancelled = true; };
  }, [isAuthenticated, updateUserPhoto, profileAttempt]);

  useEffect(() => {
    if (!profileSaved) return;
    const timer = window.setTimeout(() => setProfileSaved(false), 2500);
    return () => window.clearTimeout(timer);
  }, [profileSaved]);

  const selectTab = (next: Tab) => {
    if (next === "favorites") setFavorites(loadFavorites());
    if (next === "messages") setMessages(loadMessages());
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (next === "favorites") params.delete("tab");
      else params.set("tab", next);
      return params;
    }, { replace: true });
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = TABS.findIndex((t) => t.key === tab);
    let nextIndex: number;
    switch (event.key) {
      case "ArrowRight": nextIndex = (index + 1) % TABS.length; break;
      case "ArrowLeft": nextIndex = (index - 1 + TABS.length) % TABS.length; break;
      case "Home": nextIndex = 0; break;
      case "End": nextIndex = TABS.length - 1; break;
      default: return;
    }
    event.preventDefault();
    selectTab(TABS[nextIndex].key);
    document.getElementById(`dash-tab-${TABS[nextIndex].key}`)?.focus();
  };

  const confirmRemoveFavorite = (item: FavoriteItem) => {
    toggleFavorite(item);
    setFavorites(loadFavorites());
    setFavNotice(`${item.name} foi removido dos favoritos.`);
    setConfirming(null);
    panelRef.current?.focus();
  };

  // ─── Photo upload ──────────────────────────────────────────────────────────
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploadingPhoto(true);
    setPhotoNotice(null);
    const localPreview = URL.createObjectURL(file);
    setCurrentPhoto(localPreview);
    try {
      const { photoUrl } = await usersService.uploadPhoto(file);
      updateUserPhoto(photoUrl);
      setCurrentPhoto(photoUrl);
      setPhotoNotice({ kind: "ok", text: "Foto de perfil atualizada." });
    } catch {
      setCurrentPhoto(user?.photo ?? null);
      setPhotoNotice({ kind: "error", text: "Não foi possível enviar a foto. Use uma imagem JPG, PNG ou WebP e tente de novo." });
    } finally {
      URL.revokeObjectURL(localPreview);
      setUploadingPhoto(false);
    }
  };

  // ─── Testimonial ──────────────────────────────────────────────────────────
  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setTestimonialError("Escreva seu depoimento antes de enviar.");
      commentRef.current?.focus();
      return;
    }
    setSubmitting(true);
    setTestimonialError(null);
    try {
      await testimonialsService.create({
        userName: user?.name || user?.email?.split("@")[0] || "Visitante",
        userEmail: user?.email ?? "",
        userPhoto: currentPhoto ?? user?.photo,
        rating,
        comment: comment.trim(),
      });
      writeTestimonialFlag(true);
      setTestimonialSent(true);
      setComment("");
    } catch {
      setTestimonialError("Não foi possível enviar o depoimento. Seu texto foi mantido: confira a conexão e tente de novo.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Profile save ─────────────────────────────────────────────────────────
  const handleInfoSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoError("");
    setSavingInfo(true);
    try {
      await usersService.updateMe({ firstName, lastName, username, email });
      setProfileSaved(true);
    } catch {
      setInfoError("Não foi possível salvar suas informações. Confira se o e-mail e o username não estão em uso por outra conta e tente de novo.");
    } finally {
      setSavingInfo(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    if (!currentPassword) { setPwdError("Informe a senha atual."); return; }
    if (newPassword.length < 6) { setPwdError("A nova senha deve ter no mínimo 6 caracteres."); return; }
    if (newPassword !== confirmPassword) { setPwdError("As senhas não coincidem."); return; }
    setSavingPwd(true);
    try {
      await usersService.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setProfileSaved(true);
    } catch (error) {
      const wrongPassword = axios.isAxiosError(error) && error.response?.status === 400;
      setPwdError(wrongPassword ? "Senha atual incorreta." : "Não foi possível alterar a senha agora. Verifique a conexão e tente de novo.");
    } finally {
      setSavingPwd(false);
    }
  };

  const handleRemovePhoto = async () => {
    setRemovingPhoto(true);
    setPhotoNotice(null);
    try {
      await usersService.removePhoto();
      updateUserPhoto("");
      setCurrentPhoto(null);
      setPhotoNotice({ kind: "ok", text: "Foto de perfil removida." });
      cameraRef.current?.focus();
    } catch {
      setPhotoNotice({ kind: "error", text: "Não foi possível remover a foto agora. Tente de novo em instantes." });
    } finally {
      setRemovingPhoto(false);
      setConfirming(null);
    }
  };

  const retryProfile = () => {
    setProfileLoadFailed(false);
    setProfileAttempt((n) => n + 1);
  };

  if (!isAuthenticated || !user) return null;

  const displayName = [firstName, lastName].filter(Boolean).join(" ") || user.name || user.email?.split("@")[0] || "";
  const initials = displayName.slice(0, 2).toUpperCase();
  const roleLabel = getRoleLabel(user.role);
  const favCount = favorites.length;
  const msgCount = messages.length;

  return (
    <div className="dash-page">
      <Header />

      <main className="dash-main" id="conteudo" tabIndex={-1}>
        {/* ── Profile hero ──────────────────────────────────────────────────── */}
        <section className="dash-profile-hero" aria-label="Seu perfil">
          <div className="dash-profile-hero__inner">
            {/* Avatar with photo upload */}
            <div className="dash-avatar-wrap">
              <div className="dash-profile-avatar">
                {currentPhoto
                  ? <img src={currentPhoto} alt="" width={88} height={88} fetchPriority="high" decoding="async" />
                  : <span aria-hidden="true">{initials}</span>
                }
              </div>
              <button
                ref={cameraRef}
                type="button"
                className="dash-avatar-camera"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                title="Alterar foto de perfil"
                aria-label="Alterar foto de perfil"
              >
                <Icon name={uploadingPhoto ? "autorenew" : "photo_camera"} className={uploadingPhoto ? "dash-spin" : ""} />
              </button>
              <input
                ref={photoInputRef}
                type="file"
                name="photo"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={handlePhotoChange}
              />
              {currentPhoto && (
                <button
                  type="button"
                  className="dash-avatar-camera dash-avatar-camera--remove"
                  onClick={() => setConfirming({ kind: "photo" })}
                  disabled={removingPhoto}
                  title="Remover foto de perfil"
                  aria-label="Remover foto de perfil"
                >
                  <Icon name={removingPhoto ? "autorenew" : "delete"} className={removingPhoto ? "dash-spin" : ""} />
                </button>
              )}
            </div>

            <div className="dash-profile-info">
              <h1 className="dash-profile-name">{displayName}</h1>
              <p className="dash-profile-email">{user.email}</p>
              <span className="dash-profile-role">{roleLabel}</span>
              {photoNotice && (
                <p
                  className={`dash-photo-notice dash-photo-notice--${photoNotice.kind}`}
                  role={photoNotice.kind === "error" ? "alert" : "status"}
                >
                  {photoNotice.text}
                </p>
              )}
              {/* Stats row */}
              <div className="dash-profile-stats">
                <button type="button" className="dash-stat" onClick={() => selectTab("favorites")}>
                  <span className="dash-stat__num">{favCount}</span>
                  <span className="dash-stat__label">favorito{favCount !== 1 ? "s" : ""}</span>
                </button>
                <span className="dash-stat-divider" aria-hidden="true" />
                <button type="button" className="dash-stat" onClick={() => selectTab("messages")}>
                  <span className="dash-stat__num">{msgCount}</span>
                  <span className="dash-stat__label">mensagem{msgCount !== 1 ? "s" : ""}</span>
                </button>
              </div>
            </div>

            <div className="dash-profile-actions">
              {user.role === "ADMIN" && (
                <Link to="/admin" className="dash-action-btn dash-action-btn--outline">
                  <Icon name="admin_panel_settings" />
                  Painel Admin
                </Link>
              )}
              <button
                type="button"
                className="dash-action-btn dash-action-btn--ghost"
                onClick={() => { logout(); navigate("/"); }}
              >
                <Icon name="logout" />
                Sair
              </button>
            </div>
          </div>
        </section>

        {/* ── Tabs ──────────────────────────────────────────────────────────── */}
        <div className="dash-container">
          <div className="dash-tabs" role="tablist" aria-label="Seções do perfil" onKeyDown={handleTabKeyDown}>
            {TABS.map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                role="tab"
                id={`dash-tab-${key}`}
                aria-selected={tab === key}
                aria-controls={`dash-panel-${key}`}
                tabIndex={tab === key ? 0 : -1}
                className={`dash-tab${tab === key ? " dash-tab--active" : ""}`}
                onClick={() => selectTab(key)}
              >
                <Icon name={icon} />
                {label}
              </button>
            ))}
          </div>

          <div
            ref={panelRef}
            className="dash-tab-content"
            role="tabpanel"
            id={`dash-panel-${tab}`}
            aria-labelledby={`dash-tab-${tab}`}
            tabIndex={0}
          >

            {/* ── Favoritos ─────────────────────────────────────────────────── */}
            {tab === "favorites" && (
              <div>
                <p className="ui-sr-only" role="status">{favNotice}</p>
                {favorites.length === 0 ? (
                  <div className="dash-empty">
                    <Icon name="favorite_border" className="dash-empty__icon" />
                    <h2 className="dash-empty__title">Nenhum favorito ainda</h2>
                    <p className="dash-empty__desc">
                      Explore os pontos turísticos e clique no coração para salvar seus preferidos.
                    </p>
                    <Link to="/pontos-turisticos" className="dash-empty__cta">
                      Explorar Pontos Turísticos
                    </Link>
                  </div>
                ) : (
                  <>
                    <h2 className="ui-sr-only">Seus favoritos</h2>
                    <ul className="dash-fav-grid">
                      {favorites.map((fav) => (
                        <li key={fav.id} className="dash-fav-card">
                          <Link to={fav.path} className="dash-fav-card__img-wrap" tabIndex={-1} aria-hidden="true">
                            {fav.photo
                              ? <img src={fav.photo} alt="" width={400} height={160} loading="lazy" decoding="async" />
                              : <div className="dash-fav-card__img-placeholder" />
                            }
                          </Link>
                          <div className="dash-fav-card__body">
                            <span className="dash-fav-card__type">{TYPE_LABELS[fav.type] ?? fav.type}</span>
                            <Link to={fav.path} className="dash-fav-card__name">{fav.name}</Link>
                            {fav.shortDescription && (
                              <p className="dash-fav-card__desc">{fav.shortDescription}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            className="dash-fav-card__remove"
                            onClick={() => setConfirming({ kind: "favorite", item: fav })}
                            aria-label={`Remover ${fav.name} dos favoritos`}
                            title="Remover dos favoritos"
                          >
                            <Icon name="heart_minus" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            {/* ── Mensagens ─────────────────────────────────────────────────── */}
            {tab === "messages" && (
              <div>
                {messages.length === 0 ? (
                  <div className="dash-empty">
                    <Icon name="mail_outline" className="dash-empty__icon" />
                    <h2 className="dash-empty__title">Nenhuma mensagem enviada</h2>
                    <p className="dash-empty__desc">
                      Envie uma mensagem pela página de contato e ela aparecerá aqui.
                    </p>
                    <Link to="/contato" className="dash-empty__cta">Ir para Contato</Link>
                  </div>
                ) : (
                  <>
                    <h2 className="ui-sr-only">Mensagens enviadas</h2>
                    <ul className="dash-msg-list">
                      {messages.map((msg, i) => ({ msg, i })).reverse().map(({ msg, i }) => {
                        const sentAt = parseIsoDate(msg.sentAt);
                        return (
                          <li key={i} className="dash-msg-item">
                            <div className="dash-msg-item__header">
                              <span className="dash-msg-item__subject">{msg.subject}</span>
                              {sentAt && (
                                <time className="dash-msg-item__time" dateTime={toIsoDate(sentAt)}>
                                  {formatMediumDate(sentAt)}
                                </time>
                              )}
                            </div>
                            <p className="dash-msg-item__preview">{msg.message}</p>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
              </div>
            )}

            {/* ── Depoimento ────────────────────────────────────────────────── */}
            {tab === "testimonial" && (
              <div className="dash-dep-wrap">
                {testimonialSent ? (
                  <div className="dash-dep-sent">
                    <Icon name="check_circle" className="dash-dep-sent__icon" />
                    <h2>Depoimento enviado!</h2>
                    <p>Obrigado pela sua avaliação. Seu depoimento está aguardando aprovação e em breve aparecerá no site.</p>
                    <button
                      type="button"
                      className="dash-dep-reset"
                      onClick={() => { writeTestimonialFlag(false); setTestimonialSent(false); }}
                    >
                      Enviar outro depoimento
                    </button>
                  </div>
                ) : (
                  <form className="dash-dep-form" onSubmit={handleTestimonialSubmit} noValidate>
                    <h2 className="dash-dep-form__title">Compartilhe sua experiência</h2>
                    <p className="dash-dep-form__sub">
                      Como foi sua visita ao Parque Nacional de Ubajara? Sua opinião ajuda outros visitantes.
                    </p>
                    <div className="dash-field">
                      <span id={ratingLabelId} className="dash-label">Avaliação</span>
                      <StarRating value={rating} onChange={setRating} labelledBy={ratingLabelId} />
                    </div>
                    <div className="dash-field">
                      <label className="dash-label" htmlFor="dep-comment">Depoimento <span aria-hidden="true">*</span></label>
                      <textarea
                        ref={commentRef}
                        id="dep-comment"
                        name="comment"
                        className="dash-textarea"
                        value={comment}
                        onChange={(e) => { setComment(e.target.value); if (testimonialError) setTestimonialError(null); }}
                        placeholder="Descreva sua experiência no parque…"
                        rows={5}
                        maxLength={600}
                        autoComplete="off"
                        required
                        aria-invalid={testimonialError ? true : undefined}
                        aria-describedby={testimonialError ? "dep-comment-error" : undefined}
                      />
                      <span className="dash-char-count">{comment.length}/600</span>
                    </div>
                    {testimonialError && <p id="dep-comment-error" className="dash-error" role="alert">{testimonialError}</p>}
                    <button type="submit" className="dash-submit-btn" disabled={submitting}>
                      {submitting ? "Enviando…" : "Enviar Depoimento"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ── Editar Perfil ─────────────────────────────────────────────── */}
            {tab === "profile" && (
              <div className="dash-edit-profile">
                <p className="ui-sr-only" role="status">{profileSaved ? "Alterações salvas com sucesso!" : ""}</p>
                {profileSaved && (
                  <div className="dash-profile-saved" aria-hidden="true">
                    <Icon name="check_circle" />
                    Alterações salvas com sucesso!
                  </div>
                )}

                {profileLoadFailed ? (
                  <StateBlock
                    variant="error"
                    icon="wifi_off"
                    title="Não conseguimos carregar seus dados"
                    actions={<Button icon="refresh" onClick={retryProfile}>Tentar de novo</Button>}
                  >
                    Sem os dados atuais não dá para editar o perfil com segurança. Verifique a conexão e tente de novo.
                  </StateBlock>
                ) : (
                  <>
                    <div className="dash-edit-card">
                      <h2 className="dash-edit-card__title">
                        <Icon name="person" />
                        Informações Pessoais
                      </h2>
                      <form className="dash-edit-form" onSubmit={handleInfoSave}>
                        <div className="dash-edit-row">
                          <div className="dash-edit-field">
                            <label className="dash-label" htmlFor="edit-firstname">Nome</label>
                            <input id="edit-firstname" name="firstName" className="dash-input" type="text" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={20} />
                          </div>
                          <div className="dash-edit-field">
                            <label className="dash-label" htmlFor="edit-lastname">Sobrenome</label>
                            <input id="edit-lastname" name="lastName" className="dash-input" type="text" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={20} />
                          </div>
                        </div>
                        <div className="dash-edit-row">
                          <div className="dash-edit-field">
                            <label className="dash-label" htmlFor="edit-username">Username</label>
                            <input id="edit-username" name="username" className="dash-input" type="text" autoComplete="username" spellCheck={false} value={username} onChange={(e) => setUsername(e.target.value)} maxLength={30} />
                          </div>
                          <div className="dash-edit-field">
                            <label className="dash-label" htmlFor="edit-email">E-mail</label>
                            <input id="edit-email" name="email" className="dash-input" type="email" autoComplete="email" spellCheck={false} value={email} onChange={(e) => setEmail(e.target.value)} />
                          </div>
                        </div>
                        {infoError && <p className="dash-error" role="alert">{infoError}</p>}
                        <button type="submit" className="dash-submit-btn" disabled={savingInfo}>
                          {savingInfo ? "Salvando…" : "Salvar Informações"}
                        </button>
                      </form>
                    </div>

                    <div className="dash-edit-card">
                      <h2 className="dash-edit-card__title">
                        <Icon name="lock" />
                        Alterar Senha
                      </h2>
                      <form className="dash-edit-form" onSubmit={handlePasswordSave}>
                        <div className="dash-edit-field">
                          <label className="dash-label" htmlFor="edit-current-pwd">Senha Atual</label>
                          <input id="edit-current-pwd" name="currentPassword" className="dash-input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
                        </div>
                        <div className="dash-edit-row">
                          <div className="dash-edit-field">
                            <label className="dash-label" htmlFor="edit-pwd">Nova Senha</label>
                            <input id="edit-pwd" name="newPassword" className="dash-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo de 6 caracteres…" autoComplete="new-password" />
                          </div>
                          <div className="dash-edit-field">
                            <label className="dash-label" htmlFor="edit-pwd2">Confirmar Nova Senha</label>
                            <input id="edit-pwd2" name="confirmPassword" className="dash-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
                          </div>
                        </div>
                        {pwdError && <p className="dash-error" role="alert">{pwdError}</p>}
                        <button type="submit" className="dash-submit-btn" disabled={savingPwd}>
                          {savingPwd ? "Alterando…" : "Alterar Senha"}
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />

      {confirming?.kind === "photo" && (
        <ConfirmDialog
          title="Remover foto de perfil?"
          message="Sua foto atual será removida. Você pode enviar outra quando quiser."
          confirmLabel="Remover foto"
          tone="danger"
          loading={removingPhoto}
          onConfirm={handleRemovePhoto}
          onCancel={() => setConfirming(null)}
        />
      )}
      {confirming?.kind === "favorite" && (
        <ConfirmDialog
          title="Remover dos favoritos?"
          message={`“${confirming.item.name}” será removido da sua lista de favoritos.`}
          confirmLabel="Remover"
          tone="danger"
          onConfirm={() => confirmRemoveFavorite(confirming.item)}
          onCancel={() => setConfirming(null)}
        />
      )}
    </div>
  );
}
