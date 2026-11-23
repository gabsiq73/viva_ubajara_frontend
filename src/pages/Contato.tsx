import type { JSX } from 'react';
import { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Icon from "../components/ui/Icon";
import Collapse from "../components/ui/Collapse";
import heroImg from "../assets/images/capa-pagina.webp";
import { contactMessagesService } from "../admin/services/contactMessagesService";
import { mailHref, telHref } from "../utils/establishmentDetail";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import "../components/ui/ui.css";
import "../components/Sections/style/Content.components.css";
import "./style/Contato.css";

const EMERGENCIAS = [
    { icon: "emergency",              label: "SAMU",             phone: "192", desc: "Serviço de Atendimento Móvel de Urgência" },
    { icon: "local_fire_department",  label: "Bombeiros",        phone: "193", desc: "Incêndios, resgates e acidentes" },
    { icon: "local_police",           label: "Polícia Militar",  phone: "190", desc: "Segurança pública e emergências" },
    { icon: "crisis_alert",           label: "Defesa Civil",     phone: "199", desc: "Desastres naturais e emergências ambientais" },
] as const;

const SAUDE = [
    { icon: "local_hospital",    label: "Hospital Municipal de Ubajara", phone: "(88) 3634-1100", desc: "Atendimento geral e internações" },
    { icon: "medical_services",  label: "UPA Tianguá",                   phone: "(88) 3671-2200", desc: "Pronto atendimento · 18 km de Ubajara" },
] as const;

const PARQUE = [
    { icon: "forest",          label: "ICMBio – Parque Nacional",  phone: "(88) 3634-1388", desc: "Administração e fiscalização do parque" },
    { icon: "travel_explore",  label: "Secretaria de Turismo",     phone: "(88) 3634-1234", desc: "Informações e suporte ao visitante" },
    { icon: "gavel",           label: "Delegacia Civil",           phone: "(88) 3634-1190", desc: "Boletins de ocorrência e denúncias" },
    { icon: "support_agent",   label: "Procon Ubajara",            phone: "(88) 3634-1222", desc: "Defesa do consumidor" },
] as const;

const SUBJECTS = [
    "Informações sobre o Parque",
    "Teleférico e Trilhas",
    "Hospedagem e Pousadas",
    "Eventos e Programação",
    "Outros",
] as const;

const SENT_MESSAGES_KEY = "ubajara-sent-messages";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanPhone(phone: string) {
    return phone.replace(/\D/g, "");
}

/** O histórico local é só um extra do perfil: a mensagem já foi enviada, então falha aqui não pode virar erro de envio. */
function rememberSentMessage(entry: { subject: string; message: string; sentAt: string }) {
    try {
        let sent: unknown[] = [];
        try {
            const parsed: unknown = JSON.parse(localStorage.getItem(SENT_MESSAGES_KEY) ?? "[]");
            if (Array.isArray(parsed)) sent = parsed;
        } catch {
            // valor corrompido: recomeça o histórico
        }
        sent.push(entry);
        localStorage.setItem(SENT_MESSAGES_KEY, JSON.stringify(sent));
    } catch {
        // armazenamento indisponível
    }
}

type FieldName = "name" | "email" | "message";
type FieldErrors = Partial<Record<FieldName, string>>;

function validate(name: string, email: string, message: string): FieldErrors {
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = "Informe seu nome.";
    if (!email.trim()) errors.email = "Informe seu e-mail.";
    else if (!EMAIL_PATTERN.test(email.trim())) errors.email = "Digite um e-mail válido, como maria@exemplo.com.";
    if (!message.trim()) errors.message = "Escreva sua mensagem.";
    return errors;
}

export default function Contato(): JSX.Element {
    useDocumentTitle("Contato");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState<string>(SUBJECTS[0]);
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const nameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const messageRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!success) return;
        const timer = window.setTimeout(() => setSuccess(false), 5000);
        return () => window.clearTimeout(timer);
    }, [success]);

    const clearFieldError = (field: FieldName) => {
        if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        const errors = validate(name, email, message);
        setFieldErrors(errors);
        if (errors.name) { nameRef.current?.focus(); return; }
        if (errors.email) { emailRef.current?.focus(); return; }
        if (errors.message) { messageRef.current?.focus(); return; }
        setSubmitting(true);
        try {
            await contactMessagesService.create({ name: name.trim(), email: email.trim(), subject, message: message.trim() });
            rememberSentMessage({ subject, message: message.trim(), sentAt: new Date().toISOString() });
            setSuccess(true);
            setName("");
            setEmail("");
            setSubject(SUBJECTS[0]);
            setMessage("");
        } catch {
            setError("Não foi possível enviar a mensagem. Tente novamente em instantes.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="ct-page">
            <Header />

            <main id="conteudo" tabIndex={-1}>
            <section className="ct-hero">
                <img src={heroImg} alt="" className="ct-hero__img" fetchPriority="high" decoding="async" />
                <div className="ct-hero__overlay" aria-hidden="true" />
                <div className="ct-hero__content">
                    <span className="ct-hero__label">Atendimento</span>
                    <h1 className="ct-hero__title">Contato</h1>
                    <p className="ct-hero__sub">
                        Planejando sua visita ou com alguma dúvida? Nossa equipe está pronta para ajudar.
                    </p>
                </div>
            </section>

            <section className="contact-section" aria-labelledby="ct-form-title">
                <div className="contact-section__inner">
                    <div className="contact-section__left">
                        <span className="contact-section__kicker">Fale com a gente</span>
                        <h2 id="ct-form-title" className="contact-section__title">Fale Conosco</h2>
                        <p className="contact-section__desc">
                            Planejando sua visita ou tem alguma dúvida específica? Nossa equipe da Secretaria de Turismo está pronta para ajudar você a ter a melhor experiência em Ubajara.
                        </p>
                        <ul className="contact-section__info">
                            <li className="contact-section__info-item">
                                <span className="contact-section__info-icon material-symbols-outlined" aria-hidden="true">location_on</span>
                                <div className="contact-section__info-text">
                                    <strong>Endereço</strong>
                                    <span>Centro Administrativo Municipal, Ubajara - CE</span>
                                </div>
                            </li>
                            <li className="contact-section__info-item">
                                <span className="contact-section__info-icon material-symbols-outlined" aria-hidden="true">mail</span>
                                <div className="contact-section__info-text">
                                    <strong>E-mail</strong>
                                    <span><a className="ct-link" href={mailHref("contato@vivaubajara.com.br")}>contato@vivaubajara.com.br</a></span>
                                </div>
                            </li>
                            <li className="contact-section__info-item">
                                <span className="contact-section__info-icon material-symbols-outlined" aria-hidden="true">call</span>
                                <div className="contact-section__info-text">
                                    <strong>Telefone</strong>
                                    <span><a className="ct-link" href={telHref("(88) 3634-1234")}>(88) 3634-1234</a></span>
                                </div>
                            </li>
                            <li className="contact-section__info-item">
                                <span className="contact-section__info-icon material-symbols-outlined" aria-hidden="true">schedule</span>
                                <div className="contact-section__info-text">
                                    <strong>Horário de Atendimento</strong>
                                    <span>Segunda a Sexta, das 8h às 17h</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="contact-section__form-wrap">
                        <Collapse open={success}>
                            <div className="contact-section__alert contact-section__alert--success" role="status">
                                <Icon name="check_circle" />
                                Mensagem enviada com sucesso! Retornaremos em breve.
                            </div>
                        </Collapse>
                        <form className="contact-section__form" onSubmit={handleSubmit} noValidate>
                            <div className="contact-section__field">
                                <label htmlFor="ct-name" className="contact-section__label">Nome Completo</label>
                                <input
                                    ref={nameRef}
                                    id="ct-name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    className="contact-section__input"
                                    placeholder="Ex.: Maria da Silva…"
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); clearFieldError("name"); }}
                                    disabled={submitting}
                                    required
                                    aria-invalid={fieldErrors.name ? true : undefined}
                                    aria-describedby={fieldErrors.name ? "ct-name-error" : undefined}
                                />
                                <Collapse open={!!fieldErrors.name} className="ct-error-collapse">
                                    <p id="ct-name-error" className="ct-field-error">{fieldErrors.name}</p>
                                </Collapse>
                            </div>
                            <div className="contact-section__field">
                                <label htmlFor="ct-email" className="contact-section__label">E-mail</label>
                                <input
                                    ref={emailRef}
                                    id="ct-email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    spellCheck={false}
                                    className="contact-section__input"
                                    placeholder="maria@exemplo.com…"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
                                    disabled={submitting}
                                    required
                                    aria-invalid={fieldErrors.email ? true : undefined}
                                    aria-describedby={fieldErrors.email ? "ct-email-error" : undefined}
                                />
                                <Collapse open={!!fieldErrors.email} className="ct-error-collapse">
                                    <p id="ct-email-error" className="ct-field-error">{fieldErrors.email}</p>
                                </Collapse>
                            </div>
                            <div className="contact-section__field">
                                <label htmlFor="ct-subject" className="contact-section__label">Assunto</label>
                                <select
                                    id="ct-subject"
                                    name="subject"
                                    className="contact-section__select"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    disabled={submitting}
                                >
                                    {SUBJECTS.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="contact-section__field">
                                <label htmlFor="ct-msg" className="contact-section__label">Mensagem</label>
                                <textarea
                                    ref={messageRef}
                                    id="ct-msg"
                                    name="message"
                                    autoComplete="off"
                                    className="contact-section__textarea"
                                    placeholder="Conte em que podemos ajudar…"
                                    rows={4}
                                    value={message}
                                    onChange={(e) => { setMessage(e.target.value); clearFieldError("message"); }}
                                    disabled={submitting}
                                    required
                                    aria-invalid={fieldErrors.message ? true : undefined}
                                    aria-describedby={fieldErrors.message ? "ct-msg-error" : undefined}
                                />
                                <Collapse open={!!fieldErrors.message} className="ct-error-collapse">
                                    <p id="ct-msg-error" className="ct-field-error">{fieldErrors.message}</p>
                                </Collapse>
                            </div>
                            <Collapse open={!!error} className="ct-alert-collapse">
                                <div className="contact-section__alert contact-section__alert--error" role="alert">
                                    <Icon name="error" />
                                    {error}
                                </div>
                            </Collapse>
                            <button type="submit" className="contact-section__submit" disabled={submitting}>
                                {submitting ? "Enviando…" : "Enviar Mensagem"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <section className="ct-uteis" aria-labelledby="ct-uteis-title">
                <div className="ct-uteis__inner">
                    <header className="ct-uteis__head">
                        <span className="ct-uteis__kicker">Quando precisar de ajuda</span>
                        <h2 id="ct-uteis-title" className="ct-uteis__title">Contatos Úteis</h2>
                        <p className="ct-uteis__desc">
                            Números importantes para sua segurança e conforto durante a visita ao parque.
                        </p>
                    </header>

                    <div className="ct-group">
                        <h3 className="ct-group__label ct-group__label--emergency">Emergências</h3>
                        <div className="ct-grid">
                            {EMERGENCIAS.map((c) => (
                                <a
                                    key={c.phone}
                                    href={`tel:${cleanPhone(c.phone)}`}
                                    className="ct-card ct-card--emergency"
                                    aria-label={`Ligar para ${c.label}: ${c.phone}`}
                                >
                                    <div className="ct-card__icon-wrap">
                                        <span className="material-symbols-outlined" aria-hidden="true">{c.icon}</span>
                                    </div>
                                    <span className="ct-card__name">{c.label}</span>
                                    <span className="ct-card__phone">{c.phone}</span>
                                    <p className="ct-card__desc">{c.desc}</p>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="ct-group">
                        <h3 className="ct-group__label ct-group__label--saude">Saúde</h3>
                        <div className="ct-grid ct-grid--2">
                            {SAUDE.map((c) => (
                                <a
                                    key={c.phone}
                                    href={`tel:${cleanPhone(c.phone)}`}
                                    className="ct-card ct-card--saude"
                                    aria-label={`Ligar para ${c.label}: ${c.phone}`}
                                >
                                    <div className="ct-card__icon-wrap">
                                        <span className="material-symbols-outlined" aria-hidden="true">{c.icon}</span>
                                    </div>
                                    <span className="ct-card__name">{c.label}</span>
                                    <span className="ct-card__phone">{c.phone}</span>
                                    <p className="ct-card__desc">{c.desc}</p>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="ct-group">
                        <h3 className="ct-group__label ct-group__label--parque">Parque e Turismo</h3>
                        <div className="ct-grid">
                            {PARQUE.map((c) => (
                                <a
                                    key={c.phone}
                                    href={`tel:${cleanPhone(c.phone)}`}
                                    className="ct-card ct-card--parque"
                                    aria-label={`Ligar para ${c.label}: ${c.phone}`}
                                >
                                    <div className="ct-card__icon-wrap">
                                        <span className="material-symbols-outlined" aria-hidden="true">{c.icon}</span>
                                    </div>
                                    <span className="ct-card__name">{c.label}</span>
                                    <span className="ct-card__phone">{c.phone}</span>
                                    <p className="ct-card__desc">{c.desc}</p>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            </main>

            <Footer />
        </div>
    );
}
