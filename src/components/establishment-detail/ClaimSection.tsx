import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../admin/hooks/useAuth";
import { claimsService } from "../../admin/services/claimsService";
import { companyService } from "../../admin/services/companyService";
import type { CompanyEstablishmentResponse, EstablishmentClaimResponse } from "../../admin/types";
import { ConfirmDialog } from "../../company/components/ConfirmDialog";
import { maskPhoneInput, validatePhone } from "../../company/utils/fields";
import { claimErrorMessage, formatClaimDate } from "../../utils/claims";
import type { EstablishmentDetail } from "../../utils/establishmentDetail";
import { saveReturnTo } from "../../utils/returnTo";
import Field from "../ui/Field";
import Icon from "../ui/Icon";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";
import "../ui/ui.css";
import "./establishment-detail.css";

const SECTION_ID = "reivindicar";
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 1000;
const GENERIC_ERROR = "Não foi possível concluir agora. Tente novamente em instantes.";

function Notice({ icon, title, children, actions }: { icon: string; title: string; children?: ReactNode; actions?: ReactNode }) {
    return (
        <div className="estd-claim__notice">
            <span className="estd-claim__notice-icon" aria-hidden="true">
                <Icon name={icon} />
            </span>
            <div className="estd-claim__notice-text">
                <p className="estd-claim__notice-title">{title}</p>
                {children && <div className="estd-claim__notice-desc">{children}</div>}
                {actions && <div className="estd-claim__actions">{actions}</div>}
            </div>
        </div>
    );
}

function GuestPanel({ returnPath }: { returnPath: string }) {
    const remember = () => saveReturnTo(returnPath);
    return (
        <>
            <p className="estd-claim__text">
                Entre com sua conta de empresa ou cadastre seu negócio para pedir a titularidade deste estabelecimento.
            </p>
            <div className="estd-claim__actions">
                <Link to="/admin/login" className="ui-btn ui-btn--primary ui-btn--lg" onClick={remember}>
                    Entrar
                </Link>
                <Link to="/cadastro-empresa" className="ui-btn ui-btn--outline ui-btn--lg" onClick={remember}>
                    Cadastrar minha empresa
                </Link>
            </div>
        </>
    );
}

function UserPanel({ returnPath }: { returnPath: string }) {
    return (
        <>
            <p className="estd-claim__text">
                Sua conta é de visitante. Ative o acesso empresarial, informando o nome e o CNPJ da empresa, para poder enviar a solicitação.
            </p>
            <div className="estd-claim__actions">
                <Link to="/cadastro-empresa" className="ui-btn ui-btn--primary ui-btn--lg" onClick={() => saveReturnTo(returnPath)}>
                    Ativar acesso empresarial
                </Link>
            </div>
        </>
    );
}

interface LoadedData {
    establishment: CompanyEstablishmentResponse | null;
    claims: EstablishmentClaimResponse[];
}

const fetchData = async (): Promise<LoadedData> => {
    const [establishment, claims] = await Promise.all([companyService.getMyEstablishment(), claimsService.getMine()]);
    return { establishment, claims };
};

function CompanyPanel({ detail }: { detail: EstablishmentDetail }) {
    const [state, setState] = useState<{ status: "loading" } | { status: "error" } | { status: "ready"; data: LoadedData }>({ status: "loading" });
    const [message, setMessage] = useState("");
    const [phone, setPhone] = useState("");
    const [errors, setErrors] = useState<{ message?: string; phone?: string }>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [cancelError, setCancelError] = useState<string | null>(null);
    const [cancelledNotice, setCancelledNotice] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const statusRef = useRef<HTMLDivElement>(null);

    const [focusTick, setFocusTick] = useState(0);

    const load = useCallback(() => {
        setState({ status: "loading" });
        fetchData()
            .then((data) => setState({ status: "ready", data }))
            .catch(() => setState({ status: "error" }));
    }, []);

    useEffect(() => {
        let cancelled = false;
        fetchData()
            .then((data) => {
                if (!cancelled) setState({ status: "ready", data });
            })
            .catch(() => {
                if (!cancelled) setState({ status: "error" });
            });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (focusTick > 0) statusRef.current?.focus();
    }, [focusTick]);

    const focusStatus = () => setFocusTick((tick) => tick + 1);

    const updateClaims = (change: (claims: EstablishmentClaimResponse[]) => EstablishmentClaimResponse[]) =>
        setState((current) => (current.status === "ready" ? { status: "ready", data: { ...current.data, claims: change(current.data.claims) } } : current));

    if (state.status === "loading") {
        return (
            <div className="estd-claim__loading" aria-busy="true" aria-label="Verificando sua conta">
                <Skeleton height={18} width="70%" />
                <Skeleton height={18} width="90%" />
                <Skeleton height={44} width={200} radius={50} />
            </div>
        );
    }

    if (state.status === "error") {
        return (
            <Notice
                icon="cloud_off"
                title="Não conseguimos verificar sua conta"
                actions={
                    <Button variant="outline" icon="refresh" onClick={load}>
                        Tentar de novo
                    </Button>
                }
            >
                Verifique sua conexão e tente novamente.
            </Notice>
        );
    }

    const { establishment, claims } = state.data;

    if (establishment) {
        return (
            <Notice icon="info" title="Sua conta já gerencia um estabelecimento">
                Cada conta empresarial cuida de um estabelecimento. Para acompanhar ou editar o seu, abra o <Link to="/empresa/estabelecimento">painel da empresa</Link>.
            </Notice>
        );
    }

    const pendingHere = claims.find((c) => c.status === "PENDING" && c.spotId === detail.id);
    const pendingElsewhere = claims.find((c) => c.status === "PENDING" && c.spotId !== detail.id);
    const latestHere = claims.find((c) => c.spotId === detail.id);
    const rejected = latestHere?.status === "REJECTED" ? latestHere : undefined;

    if (pendingHere) {
        const cancelClaim = async () => {
            setCancelling(true);
            setCancelError(null);
            try {
                await claimsService.cancel(pendingHere.id);
                updateClaims((list) => list.map((c) => (c.id === pendingHere.id ? { ...c, status: "CANCELLED" } : c)));
                setConfirmCancel(false);
                setCancelledNotice(true);
                focusStatus();
            } catch (error) {
                setConfirmCancel(false);
                setCancelError(claimErrorMessage(error, GENERIC_ERROR));
                load();
            } finally {
                setCancelling(false);
            }
        };

        return (
            <>
                <div ref={statusRef} tabIndex={-1} role="status" className="estd-claim__status">
                    <Notice
                        icon="hourglass_top"
                        title="Solicitação enviada, aguardando análise"
                        actions={
                            <Button variant="outline" onClick={() => setConfirmCancel(true)}>
                                Cancelar solicitação
                            </Button>
                        }
                    >
                        Enviada em {formatClaimDate(pendingHere.createdAt)}. A administração vai conferir as informações e, se tudo estiver certo, liberar o estabelecimento no seu painel. Acompanhe pelo painel da empresa.
                    </Notice>
                </div>
                {cancelError && (
                    <p className="estd-claim__error" role="alert">
                        <Icon name="error" filled />
                        <span>{cancelError}</span>
                    </p>
                )}
                {confirmCancel && (
                    <ConfirmDialog
                        title="Cancelar solicitação?"
                        message="Sua solicitação deixará de ser analisada. Você poderá enviar outra depois."
                        confirmLabel="Cancelar solicitação"
                        cancelLabel="Manter"
                        tone="danger"
                        loading={cancelling}
                        onConfirm={() => void cancelClaim()}
                        onCancel={() => setConfirmCancel(false)}
                    />
                )}
            </>
        );
    }

    if (pendingElsewhere) {
        return (
            <Notice icon="hourglass_top" title="Você já tem uma solicitação em análise">
                Sua solicitação para <strong>{pendingElsewhere.spotName}</strong> ainda não foi concluída. Cada conta pode ter uma por vez: acompanhe ou cancele no <Link to="/empresa/estabelecimento">painel da empresa</Link> para pedir outro local.
            </Notice>
        );
    }

    const validate = () => {
        const found: { message?: string; phone?: string } = {};
        const text = message.trim();
        if (text.length < MESSAGE_MIN) found.message = `Explique com pelo menos ${MESSAGE_MIN} caracteres como podemos confirmar sua relação com o local.`;
        else if (text.length > MESSAGE_MAX) found.message = `A mensagem pode ter até ${MESSAGE_MAX} caracteres.`;
        const phoneError = phone.trim() ? validatePhone(phone) : "Informe um telefone para a administração entrar em contato.";
        if (phoneError) found.phone = phoneError;
        return found;
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (submitting) return;
        setFormError(null);
        const found = validate();
        setErrors(found);
        if (Object.keys(found).length) {
            window.setTimeout(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0);
            return;
        }
        setSubmitting(true);
        try {
            const created = await claimsService.create({ spotId: detail.id, message: message.trim(), contactPhone: phone.trim() });
            updateClaims((list) => [created, ...list]);
            setMessage("");
            setPhone("");
            setCancelledNotice(false);
            setCancelError(null);
            focusStatus();
        } catch (error) {
            setFormError(claimErrorMessage(error, GENERIC_ERROR));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="estd-claim__form-wrap">
            {cancelError && (
                <p className="estd-claim__error" role="alert">
                    <Icon name="error" filled />
                    <span>{cancelError}</span>
                </p>
            )}
            {cancelledNotice && (
                <div ref={statusRef} tabIndex={-1} role="status" className="estd-claim__status">
                    <Notice icon="check_circle" title="Solicitação cancelada">
                        Quando quiser, você pode enviar uma nova solicitação abaixo.
                    </Notice>
                </div>
            )}
            {rejected && !cancelledNotice && (
                <div className="estd-claim__status">
                    <Notice icon="info" title="Sua última solicitação para este local foi rejeitada">
                        {rejected.rejectionReason ? <>Motivo informado: {rejected.rejectionReason} </> : null}
                        Você pode enviar uma nova solicitação com mais informações.
                    </Notice>
                </div>
            )}
            <form ref={formRef} className="estd-claim__form" onSubmit={(event) => void handleSubmit(event)} noValidate>
                <Field
                    label="Como você se relaciona com este estabelecimento? Explique como podemos confirmar"
                    required
                    error={errors.message}
                    counter={{ current: message.length, max: MESSAGE_MAX }}
                    hint="Por exemplo: sou proprietário(a) do local, o CNPJ da minha conta é o do estabelecimento e posso confirmar por telefone."
                >
                    {(control) => (
                        <textarea
                            {...control}
                            className="ui-input"
                            rows={5}
                            maxLength={MESSAGE_MAX}
                            value={message}
                            onChange={(event) => {
                                setMessage(event.target.value);
                                if (errors.message) setErrors((current) => ({ ...current, message: undefined }));
                            }}
                        />
                    )}
                </Field>
                <Field label="Telefone de contato" required error={errors.phone} hint="Com DDD. Usamos apenas para confirmar sua solicitação.">
                    {(control) => (
                        <input
                            {...control}
                            className="ui-input"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel-national"
                            placeholder="(88) 99999-9999"
                            value={phone}
                            onChange={(event) => {
                                setPhone(maskPhoneInput(event.target.value, phone));
                                if (errors.phone) setErrors((current) => ({ ...current, phone: undefined }));
                            }}
                        />
                    )}
                </Field>
                <p className="estd-claim__privacy">
                    <Icon name="lock" />
                    <span>Essas informações só são vistas pela administração.</span>
                </p>
                {formError && (
                    <p className="estd-claim__error" role="alert">
                        <Icon name="error" filled />
                        <span>{formError}</span>
                    </p>
                )}
                <div className="estd-claim__actions">
                    <Button type="submit" large disabled={submitting} aria-busy={submitting}>
                        {submitting ? (
                            <>
                                <span className="estd-claim__spinner" aria-hidden="true" />
                                Enviando…
                            </>
                        ) : (
                            "Enviar solicitação"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default function ClaimSection({ detail }: { detail: EstablishmentDetail }) {
    const { isAuthenticated, isAdmin, isCompany, roleSynced, user } = useAuth();
    const { pathname, search } = useLocation();
    const visible = detail.claimable && !(isAuthenticated && (isAdmin || user?.role === "GUIDE"));

    useEffect(() => {
        if (visible && window.location.hash === `#${SECTION_ID}`) {
            document.getElementById(SECTION_ID)?.scrollIntoView({ block: "start" });
        }
    }, [visible]);

    if (!visible) return null;

    const returnPath = `${pathname}${search}#${SECTION_ID}`;

    let panel;
    if (!isAuthenticated) panel = <GuestPanel returnPath={returnPath} />;
    else if (!roleSynced) panel = <Skeleton height={44} width={200} radius={50} />;
    else if (isCompany) panel = <CompanyPanel detail={detail} />;
    else if (user?.role === "USER") panel = <UserPanel returnPath={returnPath} />;
    else return null;

    return (
        <section id={SECTION_ID} className="estd-claim" aria-labelledby="estd-claim-title">
            <div className="ui-container">
                <div className="estd-claim__card">
                    <div className="estd-claim__copy">
                        <p className="estd-eyebrow">Para empresas</p>
                        <h2 id="estd-claim-title" className="estd-h2">
                            Esse estabelecimento é seu?
                        </h2>
                        <p className="estd-claim__lead">
                            Peça a titularidade para atualizar as informações, as fotos e o cardápio pelo painel da empresa. A administração confere os dados antes de liberar o acesso.
                        </p>
                    </div>
                    <div className="estd-claim__panel">{panel}</div>
                </div>
            </div>
        </section>
    );
}
