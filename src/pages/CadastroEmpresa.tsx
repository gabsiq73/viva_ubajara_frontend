import { useEffect, useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageHero from "../components/ui/PageHero";
import Field from "../components/ui/Field";
import Icon from "../components/ui/Icon";
import StateBlock from "../components/ui/StateBlock";
import { Button } from "../components/ui/Button";
import { useAuth } from "../admin/hooks/useAuth";
import { authService } from "../admin/services/authService";
import { cnpjRaw, formatCnpj, validateCnpj } from "../utils/cnpj";
import { getRoleLabel } from "../utils/roles";
import { validateEmail } from "../company/utils/fields";
import heroImg from "../assets/images/mercado.png";
import "../components/ui/ui.css";
import "./style/CadastroEmpresa.css";

type FieldName = "firstName" | "lastName" | "username" | "email" | "password" | "companyName" | "cnpj";
type Errors = Partial<Record<FieldName, string>>;

const GENERIC_ERROR = "Não foi possível concluir o cadastro. Verifique os dados e tente novamente.";
const FIELD_NAMES: FieldName[] = ["firstName", "lastName", "username", "email", "password", "companyName", "cnpj"];

const STEPS = [
    { title: "Crie sua conta de empresa", text: "Informe seus dados de acesso e os dados da empresa." },
    { title: "Cadastre seu estabelecimento", text: "No painel, escolha restaurante ou hospedagem e preencha as informações e fotos." },
    { title: "A equipe do parque revisa", text: "Depois da análise, seu estabelecimento fica visível para os visitantes." },
];

function validate(name: FieldName, values: Record<FieldName, string>, activation: boolean): string | undefined {
    const value = values[name];
    switch (name) {
        case "firstName":
            if (activation) return undefined;
            if (!value.trim()) return "Informe seu nome.";
            return value.trim().length < 2 || value.trim().length > 20 ? "O nome deve ter de 2 a 20 caracteres." : undefined;
        case "lastName":
            return !activation && value.trim().length > 20 ? "O sobrenome pode ter até 20 caracteres." : undefined;
        case "username":
            if (activation) return undefined;
            if (!value.trim()) return "Escolha um nome de usuário.";
            return value.trim().length < 2 || value.trim().length > 30 ? "O usuário deve ter de 2 a 30 caracteres." : undefined;
        case "email":
            if (activation) return undefined;
            return value.trim() ? validateEmail(value) : "Informe seu e-mail.";
        case "password":
            if (activation) return undefined;
            if (!value) return "Crie uma senha.";
            return value.length < 6 ? "A senha deve ter no mínimo 6 caracteres." : undefined;
        case "companyName":
            if (!value.trim()) return "Informe o nome da empresa.";
            return value.trim().length > 150 ? "O nome da empresa pode ter até 150 caracteres." : undefined;
        case "cnpj":
            return validateCnpj(value);
    }
}

function passwordStrength(password: string): { level: 0 | 1 | 2 | 3; label: string } {
    if (!password) return { level: 0, label: "" };
    if (password.length < 6) return { level: 0, label: "muito curta" };
    const score =
        Number(password.length >= 8) +
        Number(/[a-z]/.test(password) && /[A-Z]/.test(password)) +
        Number(/\d/.test(password)) +
        Number(/[^A-Za-z0-9]/.test(password));
    if (score <= 1) return { level: 1, label: "fraca" };
    if (score === 2) return { level: 2, label: "média" };
    return { level: 3, label: "forte" };
}

interface ApiFailure {
    fields: Errors;
    general?: string;
}

function parseApiError(err: unknown): ApiFailure {
    const data = (err as { response?: { data?: { message?: string; errors?: { field: string; message: string }[] } } })?.response?.data;
    if (!data) return { fields: {}, general: "Não foi possível falar com o servidor. Verifique sua conexão e tente novamente." };

    if (data.errors?.length) {
        const fields: Errors = {};
        const general: string[] = [];
        for (const { field, message } of data.errors) {
            if (FIELD_NAMES.includes(field as FieldName)) fields[field as FieldName] = field === "cnpj" ? "CNPJ inválido. Confira os números digitados." : message;
            else general.push(message);
        }
        return { fields, general: general.length ? general.join(" ") : undefined };
    }

    const message = data.message ?? GENERIC_ERROR;
    if (/cnpj/i.test(message)) {
        return { fields: { cnpj: /cadastrado/i.test(message) ? "Este CNPJ já está cadastrado em outra conta." : "CNPJ inválido. Confira os números digitados." } };
    }
    if (/e-?mail/i.test(message) && /cadastrado/i.test(message)) {
        return { fields: { email: "Este e-mail já está cadastrado. Entre na sua conta ou use outro e-mail." } };
    }
    return { fields: {}, general: message };
}

export default function CadastroEmpresa() {
    const navigate = useNavigate();
    const { applyAuthResponse, activateCompany, logout, isAuthenticated, isCompany, user } = useAuth();
    const activationMode = isAuthenticated && user?.role === "USER";
    const otherRoleLabel = isAuthenticated && !activationMode && !isCompany ? getRoleLabel(user?.role) : null;

    const [values, setValues] = useState<Record<FieldName, string>>({
        firstName: "", lastName: "", username: "", email: "", password: "", companyName: "", cnpj: "",
    });
    const [errors, setErrors] = useState<Errors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const alertRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isCompany) navigate("/empresa", { replace: true });
    }, [isCompany, navigate]);

    const setFieldError = (name: FieldName, message: string | undefined) =>
        setErrors((current) => {
            const next = { ...current };
            if (message) next[name] = message;
            else delete next[name];
            return next;
        });

    const handleChange = (name: FieldName, raw: string) => {
        const value = name === "cnpj" ? formatCnpj(raw) : raw;
        const next = { ...values, [name]: value };
        setValues(next);
        if (errors[name]) setFieldError(name, validate(name, next, activationMode));
    };

    const handleBlur = (name: FieldName) => setFieldError(name, validate(name, values, activationMode));

    const input = (name: FieldName) => ({
        value: values[name],
        onChange: (event: { target: { value: string } }) => handleChange(name, event.target.value),
        onBlur: () => handleBlur(name),
    });

    const focusFirstInvalid = () => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();

    const handleSubmit = async (event: FormEvent): Promise<void> => {
        event.preventDefault();
        if (submitting) return;
        setError(null);

        const found: Errors = {};
        for (const name of FIELD_NAMES) {
            const message = validate(name, values, activationMode);
            if (message) found[name] = message;
        }
        flushSync(() => setErrors(found));
        if (Object.keys(found).length) {
            focusFirstInvalid();
            return;
        }

        setSubmitting(true);
        try {
            const companyName = values.companyName.trim();
            const cnpj = cnpjRaw(values.cnpj);
            if (activationMode) {
                await activateCompany({ companyName, cnpj });
            } else {
                const response = await authService.registerCompany({
                    firstName: values.firstName.trim(),
                    lastName: values.lastName.trim() || undefined,
                    username: values.username.trim(),
                    email: values.email.trim(),
                    password: values.password,
                    companyName,
                    cnpj,
                });
                applyAuthResponse(response);
            }
            navigate("/empresa", { replace: true });
        } catch (err) {
            const failure = parseApiError(err);
            flushSync(() => {
                setErrors(failure.fields);
                setError(failure.general ?? (Object.keys(failure.fields).length ? null : GENERIC_ERROR));
                setSubmitting(false);
            });
            if (Object.keys(failure.fields).length) focusFirstInvalid();
            else alertRef.current?.focus();
        }
    };

    if (isCompany) return null;

    const strength = passwordStrength(values.password);
    const submitLabel = activationMode ? "Ativar acesso empresarial" : "Criar conta de empresa";

    return (
        <div className="ce-page">
            <Header />
            <main>
                <PageHero
                    image={heroImg}
                    breadcrumb={[{ label: "Início", to: "/" }, { label: "Cadastro de empresa" }]}
                    eyebrow="Parque Nacional de Ubajara"
                    title={activationMode ? "Ative seu acesso" : "Cadastre seu"}
                    accent={activationMode ? "empresarial" : "estabelecimento"}
                    description={
                        activationMode
                            ? "Informe os dados da sua empresa para ativar o acesso empresarial na sua conta."
                            : "Crie sua conta de empresa para divulgar seu restaurante ou hospedagem no Viva Ubajara."
                    }
                />

                <section className="ce-section" aria-labelledby="ce-form-title">
                    <div className="ui-container ce-layout">
                        <div className="ce-card">
                            <h2 id="ce-form-title" className="ce-card__title">Dados do cadastro</h2>
                            <p className="ce-card__desc">
                                {activationMode
                                    ? "Sua conta existente será mantida; nenhum novo usuário será criado."
                                    : "Seu estabelecimento passará por uma análise da equipe do parque antes de ficar visível ao público."}
                            </p>

                            {activationMode && (
                                <p className="ce-account">
                                    <Icon name="account_circle" />
                                    <span>Conta: <strong>{user?.name || user?.email}</strong>{user?.name && <> · {user.email}</>}</span>
                                </p>
                            )}

                            {otherRoleLabel && (
                                <div className="ce-notice">
                                    <StateBlock variant="notice" icon="info" title={`Você está conectado como ${otherRoleLabel}`} actions={<Button variant="outline" onClick={logout}>Sair da conta</Button>}>
                                        Ao criar a conta de empresa, esta sessão será substituída pela nova conta.
                                    </StateBlock>
                                </div>
                            )}

                            {error && (
                                <div ref={alertRef} tabIndex={-1} className="ce-alert" role="alert">
                                    <Icon name="error" filled />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form ref={formRef} className="ce-form" onSubmit={handleSubmit} noValidate>
                                {!activationMode && (
                                    <fieldset className="ce-fieldset" disabled={submitting}>
                                        <legend>Seus dados de acesso</legend>
                                        <div className="ce-row">
                                            <Field label="Nome" required error={errors.firstName}>
                                                {(control) => <input {...control} className="ui-input" type="text" autoComplete="given-name" maxLength={20} {...input("firstName")} />}
                                            </Field>
                                            <Field label="Sobrenome" optional error={errors.lastName}>
                                                {(control) => <input {...control} className="ui-input" type="text" autoComplete="family-name" maxLength={20} {...input("lastName")} />}
                                            </Field>
                                        </div>
                                        <Field label="Usuário" required error={errors.username} hint="Como você será identificado no painel.">
                                            {(control) => <input {...control} className="ui-input" type="text" autoComplete="username" autoCapitalize="none" maxLength={30} {...input("username")} />}
                                        </Field>
                                        <Field label="E-mail" required error={errors.email}>
                                            {(control) => <input {...control} className="ui-input" type="email" autoComplete="email" placeholder="voce@suaempresa.com.br" {...input("email")} />}
                                        </Field>
                                        <Field label="Senha" required error={errors.password} hint="Use no mínimo 6 caracteres; misture letras, números e símbolos para uma senha mais forte.">
                                            {(control) => (
                                                <>
                                                    <div className="ui-input-wrap">
                                                        <input {...control} className="ui-input" type={showPassword ? "text" : "password"} autoComplete="new-password" {...input("password")} />
                                                        <button
                                                            type="button"
                                                            className="ui-input-wrap__action"
                                                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                                            aria-pressed={showPassword}
                                                            onClick={() => setShowPassword((current) => !current)}
                                                        >
                                                            <Icon name={showPassword ? "visibility_off" : "visibility"} />
                                                        </button>
                                                    </div>
                                                    {strength.label && (
                                                        <div className={`ce-strength ce-strength--${strength.level}`} role="status">
                                                            <span className="ce-strength__bars" aria-hidden="true"><i /><i /><i /></span>
                                                            <span>Força da senha: {strength.label}</span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </Field>
                                    </fieldset>
                                )}

                                <fieldset className="ce-fieldset" disabled={submitting}>
                                    <legend>Dados da empresa</legend>
                                    <Field label="Nome da empresa" required error={errors.companyName}>
                                        {(control) => <input {...control} className="ui-input" type="text" autoComplete="organization" maxLength={150} {...input("companyName")} />}
                                    </Field>
                                    <Field label="CNPJ" required error={errors.cnpj} hint="Aceitamos o CNPJ numérico e o novo CNPJ alfanumérico.">
                                        {(control) => (
                                            <input
                                                {...control}
                                                className="ui-input"
                                                type="text"
                                                inputMode="text"
                                                autoComplete="off"
                                                autoCapitalize="characters"
                                                spellCheck={false}
                                                placeholder="00.000.000/0000-00"
                                                maxLength={18}
                                                {...input("cnpj")}
                                            />
                                        )}
                                    </Field>
                                </fieldset>

                                <Button type="submit" large className="ce-submit" disabled={submitting} aria-busy={submitting}>
                                    {submitting ? (
                                        <>
                                            <span className="ce-spinner" aria-hidden="true" />
                                            {activationMode ? "Ativando…" : "Criando conta…"}
                                        </>
                                    ) : (
                                        submitLabel
                                    )}
                                </Button>

                                {!isAuthenticated && (
                                    <p className="ce-login">
                                        Já tem uma conta? <Link to="/admin/login">Entrar</Link>
                                    </p>
                                )}
                            </form>
                        </div>

                        <aside className="ce-steps" aria-labelledby="ce-steps-title">
                            <h2 id="ce-steps-title">Como funciona</h2>
                            <ol>
                                {STEPS.map((step) => (
                                    <li key={step.title}>
                                        <strong>{step.title}</strong>
                                        <span>{step.text}</span>
                                    </li>
                                ))}
                            </ol>
                        </aside>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
