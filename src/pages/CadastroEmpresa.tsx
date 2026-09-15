import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../admin/hooks/useAuth";
import { authService } from "../admin/services/authService";
import heroImg from "../assets/images/mercado.png";
import "../components/Sections/style/Content.components.css";
import "./style/CadastroEmpresa.css";

const GENERIC_ERROR = "Não foi possível concluir o cadastro. Verifique os dados e tente novamente.";

function apiErrorMsg(err: unknown): string {
    const e = err as {
        response?: { data?: { message?: string; errors?: { field: string; message: string }[] } };
    };
    const data = e?.response?.data;
    if (!data) return GENERIC_ERROR;
    if (data.errors?.length) {
        return data.errors.map((fieldError) => fieldError.message).join(" ");
    }
    return data.message ?? GENERIC_ERROR;
}

export default function CadastroEmpresa() {
    const navigate = useNavigate();
    const { applyAuthResponse } = useAuth();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [cnpj, setCnpj] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent): Promise<void> => {
        e.preventDefault();
        setError(null);

        if (!firstName.trim() || !username.trim() || !email.trim() || !password.trim() || !companyName.trim() || !cnpj.trim()) {
            setError("Preencha todos os campos obrigatórios.");
            return;
        }
        if (password.length < 6) {
            setError("A senha deve ter no mínimo 6 caracteres.");
            return;
        }

        setSubmitting(true);
        try {
            const response = await authService.registerCompany({
                firstName: firstName.trim(),
                lastName: lastName.trim() || undefined,
                username: username.trim(),
                email: email.trim(),
                password,
                companyName: companyName.trim(),
                cnpj: cnpj.trim(),
            });
            applyAuthResponse(response);
            navigate("/empresa", { replace: true });
        } catch (err) {
            setError(apiErrorMsg(err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="est-page">
            <Header />
            <main className="est-main">

                <section className="est-hero">
                    <img src={heroImg} alt="" className="est-hero__bg" aria-hidden />
                    <div className="est-hero__overlay" />
                    <div className="est-hero__content">
                        <div className="est-hero__inner">
                            <span className="est-hero__kicker">PARQUE NACIONAL DE UBAJARA</span>
                            <h1 className="est-hero__title">Cadastre seu Estabelecimento</h1>
                            <p className="est-hero__subtitle">
                                Crie sua conta de empresa para divulgar seu restaurante ou hospedagem no Viva Ubajara.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="contact-section" aria-labelledby="ce-form-title">
                    <div className="ce-section__inner">
                        <div className="contact-section__form-wrap">
                            <h2 id="ce-form-title" className="contact-section__title" style={{ marginBottom: "8px" }}>
                                Dados do Cadastro
                            </h2>
                            <p className="contact-section__desc" style={{ marginBottom: "20px" }}>
                                Seu estabelecimento passará por uma análise da equipe do parque antes de ficar visível ao público.
                            </p>

                            {error && (
                                <div className="contact-section__alert contact-section__alert--error" role="alert">
                                    <span className="material-symbols-outlined">error</span>
                                    {error}
                                </div>
                            )}

                            <form className="contact-section__form" onSubmit={handleSubmit} noValidate>
                                <div className="ce-form__row">
                                    <div className="contact-section__field">
                                        <label htmlFor="ce-firstName" className="contact-section__label">Nome</label>
                                        <input
                                            id="ce-firstName"
                                            type="text"
                                            className="contact-section__input"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            disabled={submitting}
                                            required
                                        />
                                    </div>
                                    <div className="contact-section__field">
                                        <label htmlFor="ce-lastName" className="contact-section__label">Sobrenome</label>
                                        <input
                                            id="ce-lastName"
                                            type="text"
                                            className="contact-section__input"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>

                                <div className="contact-section__field">
                                    <label htmlFor="ce-username" className="contact-section__label">Usuário</label>
                                    <input
                                        id="ce-username"
                                        type="text"
                                        className="contact-section__input"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        disabled={submitting}
                                        required
                                    />
                                </div>

                                <div className="contact-section__field">
                                    <label htmlFor="ce-email" className="contact-section__label">E-mail</label>
                                    <input
                                        id="ce-email"
                                        type="email"
                                        className="contact-section__input"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={submitting}
                                        required
                                    />
                                </div>

                                <div className="contact-section__field">
                                    <label htmlFor="ce-password" className="contact-section__label">Senha</label>
                                    <input
                                        id="ce-password"
                                        type="password"
                                        className="contact-section__input"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={submitting}
                                        required
                                        autoComplete="new-password"
                                    />
                                </div>

                                <div className="ce-form__row">
                                    <div className="contact-section__field">
                                        <label htmlFor="ce-companyName" className="contact-section__label">Nome da Empresa</label>
                                        <input
                                            id="ce-companyName"
                                            type="text"
                                            className="contact-section__input"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            disabled={submitting}
                                            required
                                        />
                                    </div>
                                    <div className="contact-section__field">
                                        <label htmlFor="ce-cnpj" className="contact-section__label">CNPJ</label>
                                        <input
                                            id="ce-cnpj"
                                            type="text"
                                            className="contact-section__input"
                                            value={cnpj}
                                            onChange={(e) => setCnpj(e.target.value)}
                                            disabled={submitting}
                                            required
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="contact-section__submit" disabled={submitting}>
                                    {submitting ? "Criando conta…" : "Criar Conta de Empresa"}
                                </button>
                            </form>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
}
