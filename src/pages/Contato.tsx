import Header from "../components/Header";
import Footer from "../components/Footer";
import heroImg from "../assets/images/foto-capa-parque-ubajara.png";
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

function cleanPhone(phone: string) {
    return phone.replace(/\D/g, "");
}

export default function Contato() {
    return (
        <div className="ct-page">
            <Header />

            <section className="ct-hero" aria-label="Capa da página de contato">
                <img src={heroImg} alt="Parque Nacional de Ubajara" className="ct-hero__img" />
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
                                    <span>contato@vivaubajara.com.br</span>
                                </div>
                            </li>
                            <li className="contact-section__info-item">
                                <span className="contact-section__info-icon material-symbols-outlined" aria-hidden="true">call</span>
                                <div className="contact-section__info-text">
                                    <strong>Telefone</strong>
                                    <span>(88) 3634-1234</span>
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
                        <form className="contact-section__form" onSubmit={(e) => e.preventDefault()}>
                            <div className="contact-section__field">
                                <label htmlFor="ct-name" className="contact-section__label">Nome Completo</label>
                                <input id="ct-name" type="text" className="contact-section__input" placeholder="Como podemos te chamar?" />
                            </div>
                            <div className="contact-section__field">
                                <label htmlFor="ct-email" className="contact-section__label">E-mail</label>
                                <input id="ct-email" type="email" className="contact-section__input" placeholder="seu@email.com" />
                            </div>
                            <div className="contact-section__field">
                                <label htmlFor="ct-subject" className="contact-section__label">Assunto</label>
                                <select id="ct-subject" className="contact-section__select">
                                    <option>Informações sobre o Parque</option>
                                    <option>Teleférico e Trilhas</option>
                                    <option>Hospedagem e Pousadas</option>
                                    <option>Eventos e Programação</option>
                                    <option>Outros</option>
                                </select>
                            </div>
                            <div className="contact-section__field">
                                <label htmlFor="ct-msg" className="contact-section__label">Mensagem</label>
                                <textarea id="ct-msg" className="contact-section__textarea" placeholder="Em que podemos te ajudar?" rows={4} />
                            </div>
                            <button type="submit" className="contact-section__submit">Enviar Mensagem</button>
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

            <Footer />
        </div>
    );
}
