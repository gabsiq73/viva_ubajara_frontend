import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../admin/hooks/useAuth";
import { usersService } from "../admin/services/usersService";
import { testimonialsService } from "../admin/services/testimonialsService";
import "./style/Dashboard.css";

// ─── localStorage helpers ──────────────────────────────────────────────────────

const FAV_KEY = "ubajara-favorites";
const MSG_KEY = "ubajara-sent-messages";
const DEP_KEY = "ubajara-testimonial-sent";

interface FavoriteItem {
  id: string;
  name: string;
  type: "attraction" | "event" | "restaurant" | "host-point";
  photo?: string;
  shortDescription?: string;
  path: string;
}

interface SentMessage {
  subject: string;
  message: string;
  sentAt: string;
}

function loadFavorites(): FavoriteItem[] {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]"); } catch { return []; }
}

function loadMessages(): SentMessage[] {
  try { return JSON.parse(localStorage.getItem(MSG_KEY) ?? "[]"); } catch { return []; }
}

// ─── Star rating ───────────────────────────────────────────────────────────────

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="dash-stars" aria-label="Avaliação">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          className={`dash-star${s <= (hover || value) ? " dash-star--active" : ""}`}
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${s} estrela${s > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

type Tab = "favorites" | "messages" | "testimonial" | "profile";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  USER: "Usuário",
  GUIDE: "Guia Turístico",
};

const TYPE_LABELS: Record<string, string> = {
  attraction: "Atração",
  event: "Evento",
  restaurant: "Restaurante",
  "host-point": "Hospedagem",
};

export default function Dashboard() {
  const { isAuthenticated, user, logout, updateUserPhoto } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialTab = (searchParams.get("tab") as Tab | null) ?? "favorites";
  const [tab, setTab] = useState<Tab>(initialTab);

  const [favorites, setFavorites] = useState<FavoriteItem[]>(loadFavorites);
  const [messages, setMessages] = useState<SentMessage[]>(loadMessages);

  // Photo upload
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(user?.photo ?? null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Testimonial
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [testimonialSent, setTestimonialSent] = useState(
    () => localStorage.getItem(DEP_KEY) === "1"
  );
  const [testimonialError, setTestimonialError] = useState<string | null>(null);

  // Profile edit
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate("/admin/login", { replace: true });
  }, [isAuthenticated, navigate]);

  // Load user profile from API to get DB-stored photoUrl + current info
  useEffect(() => {
    if (!isAuthenticated) return;
    usersService.getMe().then((data) => {
      setFirstName(data.firstName ?? "");
      setLastName(data.lastName ?? "");
      setUsername(data.username ?? "");
      setEmail(data.email ?? "");
      if (data.photoUrl) {
        setCurrentPhoto(data.photoUrl);
        updateUserPhoto(data.photoUrl);
      }
    }).catch(() => {});
  }, [isAuthenticated]);

  // Sync favorites / messages when tab changes
  useEffect(() => {
    if (tab === "favorites") setFavorites(loadFavorites());
    if (tab === "messages") setMessages(loadMessages());
  }, [tab]);

  const removeFavorite = (id: string) => {
    const updated = favorites.filter((f) => f.id !== id);
    localStorage.setItem(FAV_KEY, JSON.stringify(updated));
    setFavorites(updated);
  };

  // ─── Photo upload ──────────────────────────────────────────────────────────
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploadingPhoto(true);
    const localPreview = URL.createObjectURL(file);
    setCurrentPhoto(localPreview);
    try {
      const { photoUrl } = await usersService.uploadPhoto(file);
      updateUserPhoto(photoUrl);
      setCurrentPhoto(photoUrl);
      URL.revokeObjectURL(localPreview);
    } catch {
      setCurrentPhoto(user?.photo ?? null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ─── Testimonial ──────────────────────────────────────────────────────────
  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
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
      localStorage.setItem(DEP_KEY, "1");
      setTestimonialSent(true);
      setComment("");
    } catch {
      setTestimonialError("Não foi possível enviar o depoimento. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Profile save ─────────────────────────────────────────────────────────
  const handleInfoSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInfo(true);
    try {
      await usersService.updateMe({ firstName, lastName, username, email });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch {
    } finally {
      setSavingInfo(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    if (newPassword.length < 6) { setPwdError("A senha deve ter no mínimo 6 caracteres."); return; }
    if (newPassword !== confirmPassword) { setPwdError("As senhas não coincidem."); return; }
    setSavingPwd(true);
    try {
      await usersService.updateMe({ password: newPassword });
      setNewPassword("");
      setConfirmPassword("");
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch {
      setPwdError("Erro ao alterar senha.");
    } finally {
      setSavingPwd(false);
    }
  };

  if (!isAuthenticated || !user) return null;

  const displayName = [firstName, lastName].filter(Boolean).join(" ") || user.name || user.email?.split("@")[0] || "";
  const initials = displayName.slice(0, 2).toUpperCase();
  const roleLabel = ROLE_LABELS[user.role] ?? user.role;
  const favCount = loadFavorites().length;
  const msgCount = loadMessages().length;

  return (
    <div className="dash-page">
      <Header />

      <main className="dash-main">
        {/* ── Profile hero ──────────────────────────────────────────────────── */}
        <section className="dash-profile-hero" aria-label="Seu perfil">
          <div className="dash-profile-hero__inner">
            {/* Avatar with photo upload */}
            <div className="dash-avatar-wrap">
              <div className="dash-profile-avatar">
                {currentPhoto
                  ? <img src={currentPhoto} alt={displayName} />
                  : <span>{initials}</span>
                }
              </div>
              <button
                className="dash-avatar-camera"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                title="Alterar foto de perfil"
                aria-label="Alterar foto de perfil"
              >
                {uploadingPhoto
                  ? <span className="material-symbols-outlined" style={{ fontSize: 16, animation: "dash-spin 0.7s linear infinite" }}>autorenew</span>
                  : <span className="material-symbols-outlined" style={{ fontSize: 16 }}>photo_camera</span>
                }
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={handlePhotoChange}
              />
            </div>

            <div className="dash-profile-info">
              <h1 className="dash-profile-name">{displayName}</h1>
              <p className="dash-profile-email">{user.email}</p>
              <span className="dash-profile-role">{roleLabel}</span>
              {/* Stats row */}
              <div className="dash-profile-stats">
                <button className="dash-stat" onClick={() => setTab("favorites")}>
                  <span className="dash-stat__num">{favCount}</span>
                  <span className="dash-stat__label">favorito{favCount !== 1 ? "s" : ""}</span>
                </button>
                <span className="dash-stat-divider" />
                <button className="dash-stat" onClick={() => setTab("messages")}>
                  <span className="dash-stat__num">{msgCount}</span>
                  <span className="dash-stat__label">mensagem{msgCount !== 1 ? "s" : ""}</span>
                </button>
              </div>
            </div>

            <div className="dash-profile-actions">
              {user.role === "ADMIN" && (
                <Link to="/admin" className="dash-action-btn dash-action-btn--outline">
                  <span className="material-symbols-outlined" aria-hidden="true">admin_panel_settings</span>
                  Painel Admin
                </Link>
              )}
              <button
                className="dash-action-btn dash-action-btn--ghost"
                onClick={() => { logout(); navigate("/"); }}
              >
                <span className="material-symbols-outlined" aria-hidden="true">logout</span>
                Sair
              </button>
            </div>
          </div>
        </section>

        {/* ── Tabs ──────────────────────────────────────────────────────────── */}
        <div className="dash-container">
          <nav className="dash-tabs" role="tablist" aria-label="Seções do perfil">
            {([
              { key: "favorites", label: "Favoritos", icon: "favorite" },
              { key: "messages", label: "Mensagens", icon: "mail" },
              { key: "testimonial", label: "Depoimento", icon: "rate_review" },
              { key: "profile", label: "Editar Perfil", icon: "manage_accounts" },
            ] as { key: Tab; label: string; icon: string }[]).map(({ key, label, icon }) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                className={`dash-tab${tab === key ? " dash-tab--active" : ""}`}
                onClick={() => setTab(key)}
              >
                <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
                {label}
              </button>
            ))}
          </nav>

          <div className="dash-tab-content" role="tabpanel">

            {/* ── Favoritos ─────────────────────────────────────────────────── */}
            {tab === "favorites" && (
              <div>
                {favorites.length === 0 ? (
                  <div className="dash-empty">
                    <span className="material-symbols-outlined dash-empty__icon" aria-hidden="true">favorite_border</span>
                    <h3 className="dash-empty__title">Nenhum favorito ainda</h3>
                    <p className="dash-empty__desc">
                      Explore os pontos turísticos e clique no coração para salvar seus preferidos.
                    </p>
                    <Link to="/pontos-turisticos" className="dash-empty__cta">
                      Explorar Pontos Turísticos
                    </Link>
                  </div>
                ) : (
                  <ul className="dash-fav-grid">
                    {favorites.map((fav) => (
                      <li key={fav.id} className="dash-fav-card">
                        <Link to={fav.path} className="dash-fav-card__img-wrap">
                          {fav.photo
                            ? <img src={fav.photo} alt={fav.name} loading="lazy" />
                            : <div className="dash-fav-card__img-placeholder" aria-hidden="true" />
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
                          className="dash-fav-card__remove"
                          onClick={() => removeFavorite(fav.id)}
                          aria-label={`Remover ${fav.name} dos favoritos`}
                          title="Remover dos favoritos"
                        >
                          <span className="material-symbols-outlined" aria-hidden="true">heart_minus</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* ── Mensagens ─────────────────────────────────────────────────── */}
            {tab === "messages" && (
              <div>
                {messages.length === 0 ? (
                  <div className="dash-empty">
                    <span className="material-symbols-outlined dash-empty__icon" aria-hidden="true">mail_outline</span>
                    <h3 className="dash-empty__title">Nenhuma mensagem enviada</h3>
                    <p className="dash-empty__desc">
                      Envie uma mensagem pela página de contato e ela aparecerá aqui.
                    </p>
                    <Link to="/contato" className="dash-empty__cta">Ir para Contato</Link>
                  </div>
                ) : (
                  <ul className="dash-msg-list">
                    {[...messages].reverse().map((msg, i) => (
                      <li key={i} className="dash-msg-item">
                        <div className="dash-msg-item__header">
                          <span className="dash-msg-item__subject">{msg.subject}</span>
                          <time className="dash-msg-item__time">
                            {new Date(msg.sentAt).toLocaleDateString("pt-BR", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}
                          </time>
                        </div>
                        <p className="dash-msg-item__preview">{msg.message}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* ── Depoimento ────────────────────────────────────────────────── */}
            {tab === "testimonial" && (
              <div className="dash-dep-wrap">
                {testimonialSent ? (
                  <div className="dash-dep-sent">
                    <span className="material-symbols-outlined dash-dep-sent__icon" aria-hidden="true">check_circle</span>
                    <h3>Depoimento enviado!</h3>
                    <p>Obrigado pela sua avaliação. Seu depoimento está aguardando aprovação e em breve aparecerá no site.</p>
                    <button
                      className="dash-dep-reset"
                      onClick={() => { localStorage.removeItem(DEP_KEY); setTestimonialSent(false); }}
                    >
                      Enviar outro depoimento
                    </button>
                  </div>
                ) : (
                  <form className="dash-dep-form" onSubmit={handleTestimonialSubmit}>
                    <h3 className="dash-dep-form__title">Compartilhe sua experiência</h3>
                    <p className="dash-dep-form__sub">
                      Como foi sua visita ao Parque Nacional de Ubajara? Sua opinião ajuda outros visitantes.
                    </p>
                    <div className="dash-field">
                      <label className="dash-label">Avaliação</label>
                      <StarRating value={rating} onChange={setRating} />
                    </div>
                    <div className="dash-field">
                      <label className="dash-label" htmlFor="dep-comment">Depoimento <span aria-hidden="true">*</span></label>
                      <textarea
                        id="dep-comment"
                        className="dash-textarea"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Descreva sua experiência no parque..."
                        rows={5}
                        maxLength={600}
                        required
                      />
                      <span className="dash-char-count">{comment.length}/600</span>
                    </div>
                    {testimonialError && <p className="dash-error" role="alert">{testimonialError}</p>}
                    <button type="submit" className="dash-submit-btn" disabled={submitting || !comment.trim()}>
                      {submitting ? "Enviando…" : "Enviar Depoimento"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ── Editar Perfil ─────────────────────────────────────────────── */}
            {tab === "profile" && (
              <div className="dash-edit-profile">
                {profileSaved && (
                  <div className="dash-profile-saved">
                    <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
                    Alterações salvas com sucesso!
                  </div>
                )}

                <div className="dash-edit-card">
                  <h3 className="dash-edit-card__title">
                    <span className="material-symbols-outlined" aria-hidden="true">person</span>
                    Informações Pessoais
                  </h3>
                  <form className="dash-edit-form" onSubmit={handleInfoSave}>
                    <div className="dash-edit-row">
                      <div className="dash-edit-field">
                        <label className="dash-label" htmlFor="edit-firstname">Nome</label>
                        <input id="edit-firstname" className="dash-input" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={20} />
                      </div>
                      <div className="dash-edit-field">
                        <label className="dash-label" htmlFor="edit-lastname">Sobrenome</label>
                        <input id="edit-lastname" className="dash-input" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={20} />
                      </div>
                    </div>
                    <div className="dash-edit-row">
                      <div className="dash-edit-field">
                        <label className="dash-label" htmlFor="edit-username">Username</label>
                        <input id="edit-username" className="dash-input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={30} />
                      </div>
                      <div className="dash-edit-field">
                        <label className="dash-label" htmlFor="edit-email">Email</label>
                        <input id="edit-email" className="dash-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                    </div>
                    <button type="submit" className="dash-submit-btn" disabled={savingInfo}>
                      {savingInfo ? "Salvando…" : "Salvar Informações"}
                    </button>
                  </form>
                </div>

                <div className="dash-edit-card">
                  <h3 className="dash-edit-card__title">
                    <span className="material-symbols-outlined" aria-hidden="true">lock</span>
                    Alterar Senha
                  </h3>
                  <form className="dash-edit-form" onSubmit={handlePasswordSave}>
                    <div className="dash-edit-row">
                      <div className="dash-edit-field">
                        <label className="dash-label" htmlFor="edit-pwd">Nova Senha</label>
                        <input id="edit-pwd" className="dash-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
                      </div>
                      <div className="dash-edit-field">
                        <label className="dash-label" htmlFor="edit-pwd2">Confirmar Senha</label>
                        <input id="edit-pwd2" className="dash-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                      </div>
                    </div>
                    {pwdError && <p className="dash-error">{pwdError}</p>}
                    <button type="submit" className="dash-submit-btn" disabled={savingPwd || !newPassword}>
                      {savingPwd ? "Alterando…" : "Alterar Senha"}
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
