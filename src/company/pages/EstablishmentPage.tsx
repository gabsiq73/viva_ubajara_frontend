import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import axios from 'axios';
import { companyService } from '../../admin/services/companyService';
import { claimsService } from '../../admin/services/claimsService';
import { useToast } from '../../admin/components/Toast';
import { useUnsavedChangesWarning, useUnsavedGuard } from '../components/unsavedGuardContext';
import { PhotoUploader } from '../components/PhotoUploader';
import { ClaimHint, ClaimsPanel } from '../components/ClaimsPanel';
import Field from '../../components/ui/Field';
import Icon from '../../components/ui/Icon';
import Badge from '../../components/ui/Badge';
import StateBlock from '../../components/ui/StateBlock';
import Toggle from '../../components/ui/Toggle';
import { Button } from '../../components/ui/Button';
import { FilterChip } from '../../components/ui/Chip';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  formatPhone, maskPhoneInput, normalizeInstagram, normalizePrice, normalizeUrl,
  validateEmail, validateInstagram, validatePhone, validatePrice, validateUrl,
} from '../utils/fields';
import { claimErrorMessage } from '../../utils/claims';
import { newPhotoId, validatePhotoFiles, type PendingPhoto } from '../utils/photos';
import type { ApprovalStatus, CompanyEstablishmentRequest, EstablishmentClaimResponse, CompanyEstablishmentResponse, CompanyEstablishmentUpdate, EstablishmentType, HostType } from '../../admin/types';
import '../../components/ui/ui.css';
import './EstablishmentPage.css';

type FormState = Omit<CompanyEstablishmentRequest, 'type'>;
type FieldKey = keyof FormState;
type Errors = Partial<Record<FieldKey, string>>;

const EMPTY_FORM: FormState = {
  name: '', description: '', address: '', phone: '', email: '', webUrl: '', instagramUrl: '', mapsUrl: '',
  cuisineType: '', openingHours: '', avgPrice: '', acceptsReservation: false, starRating: undefined,
  hostType: 'HOTEL', numOfRooms: undefined, bookingUrl: '',
};

const COMMON_FIELDS: FieldKey[] = ['name', 'description', 'address', 'phone', 'email', 'webUrl', 'instagramUrl', 'mapsUrl'];
const TYPE_FIELDS: Record<EstablishmentType, FieldKey[]> = {
  RESTAURANT: ['cuisineType', 'openingHours', 'avgPrice', 'acceptsReservation', 'starRating'],
  HOST_POINT: ['hostType', 'numOfRooms', 'avgPrice', 'bookingUrl'],
};
const SPECIFIC_DEFAULTS = (({ cuisineType, openingHours, avgPrice, acceptsReservation, starRating, hostType, numOfRooms, bookingUrl }) =>
  ({ cuisineType, openingHours, avgPrice, acceptsReservation, starRating, hostType, numOfRooms, bookingUrl }))(EMPTY_FORM);

const NORMALIZERS: Partial<Record<FieldKey, (value: string) => string>> = {
  webUrl: normalizeUrl, mapsUrl: normalizeUrl, bookingUrl: normalizeUrl, instagramUrl: normalizeInstagram, avgPrice: normalizePrice,
};

const STATUS_LABEL: Record<ApprovalStatus, string> = { PENDING: 'Aguardando aprovação', APPROVED: 'Aprovado', REJECTED: 'Precisa de ajustes' };
const STATUS_VARIANT = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' } as const;

const toForm = (data: CompanyEstablishmentResponse): FormState => ({
  name: data.name, description: data.description, address: data.address, phone: formatPhone(data.phone ?? ''), email: data.email ?? '',
  webUrl: data.webUrl ?? '', instagramUrl: data.instagramUrl ?? '', mapsUrl: data.mapsUrl ?? '', cuisineType: data.cuisineType ?? '',
  openingHours: data.openingHours ?? '', avgPrice: data.avgPrice ?? '', acceptsReservation: data.acceptsReservation ?? false,
  starRating: data.starRating ?? undefined, hostType: data.hostType ?? 'HOTEL', numOfRooms: data.numOfRooms ?? undefined,
  bookingUrl: data.bookingUrl ?? '',
});

function validateField(key: FieldKey, form: FormState, type: EstablishmentType): string | undefined {
  const text = (form[key] as string | undefined) ?? '';
  switch (key) {
    case 'name':
      if (!text.trim()) return 'Informe o nome do estabelecimento.';
      return text.length > 100 ? 'O nome pode ter até 100 caracteres.' : undefined;
    case 'description':
      if (!text.trim()) return 'Escreva uma descrição para os visitantes.';
      return text.length > 600 ? 'A descrição pode ter até 600 caracteres.' : undefined;
    case 'address':
      return text.trim() ? undefined : 'Informe o endereço completo.';
    case 'phone': return validatePhone(text);
    case 'email': return validateEmail(text);
    case 'webUrl': case 'mapsUrl': case 'bookingUrl': return validateUrl(text);
    case 'instagramUrl': return validateInstagram(text);
    case 'cuisineType':
      return type === 'RESTAURANT' && !text.trim() ? 'Informe o tipo de culinária.' : undefined;
    case 'avgPrice':
      return validatePrice(text) ?? (text.length > 30 ? 'Use até 30 caracteres.' : undefined);
    case 'starRating': {
      const rating = form.starRating;
      return rating === undefined || (Number.isInteger(rating) && rating >= 1 && rating <= 5) ? undefined : 'A nota deve ser um número inteiro de 1 a 5.';
    }
    case 'numOfRooms': {
      const rooms = form.numOfRooms;
      return rooms === undefined || (Number.isInteger(rooms) && rooms >= 0 && rooms <= 9999) ? undefined : 'Informe um número inteiro de quartos, de 0 a 9999.';
    }
    default:
      return undefined;
  }
}

function validateAll(form: FormState, type: EstablishmentType): Errors {
  const errors: Errors = {};
  for (const key of [...COMMON_FIELDS, ...TYPE_FIELDS[type]]) {
    const message = validateField(key, form, type);
    if (message) errors[key] = message;
  }
  return errors;
}

function normalizeForm(form: FormState): FormState {
  const next: FormState = { ...form };
  (Object.keys(NORMALIZERS) as FieldKey[]).forEach((key) => {
    const value = next[key];
    if (typeof value === 'string') (next as Record<string, unknown>)[key] = NORMALIZERS[key]!(value);
  });
  return { ...next, name: next.name.trim(), address: next.address.trim(), description: next.description.trim() };
}

function buildPayload(form: FormState, type: EstablishmentType): FormState {
  const keys = [...COMMON_FIELDS, ...TYPE_FIELDS[type]];
  return Object.fromEntries(keys.map((key) => [key, form[key]])) as unknown as FormState;
}

/** Campos opcionais vazios saem do corpo do cadastro novo; o backend os trata como ausentes. */
function omitEmptyStrings(payload: FormState): FormState {
  return Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, value === '' ? undefined : value])) as FormState;
}

function uploadFailureMessage(error: unknown, name: string, position: number, total: number): string {
  const prefix = `Falha ao enviar "${name}" (foto ${position} de ${total}).`;
  if (axios.isAxiosError(error) && error.response) {
    const { status, data } = error.response;
    if (status === 413) return `${prefix} A foto é maior que o limite de 5 MB.`;
    if (status >= 400 && status < 500 && typeof data?.message === 'string') return `${prefix} ${/[.!?]$/.test(data.message.trim()) ? data.message.trim() : `${data.message.trim()}.`}`;
    return `${prefix} O servidor não conseguiu salvar a foto agora. Tente novamente em instantes.`;
  }
  return `${prefix} Verifique sua conexão com a internet e tente novamente.`;
}

const scrollBehavior = (): ScrollBehavior => (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

function SectionHead({ id, step, title, subtitle, aside }: { id: string; step: number; title: string; subtitle: string; aside?: ReactNode }) {
  return (
    <div className="company-card__head">
      <span className="company-step" aria-hidden="true">{step}</span>
      <div>
        <h2 id={id}>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {aside}
    </div>
  );
}

export function EstablishmentPage() {
  const { showToast } = useToast();
  const { requestLeave } = useUnsavedGuard();
  const [fetching, setFetching] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [establishment, setEstablishment] = useState<CompanyEstablishmentResponse | null>(null);
  const [claims, setClaims] = useState<EstablishmentClaimResponse[] | null>([]);
  const [selectedType, setSelectedType] = useState<EstablishmentType | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [rejections, setRejections] = useState<string[]>([]);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const photosSectionRef = useRef<HTMLElement>(null);
  const photosRef = useRef<PendingPhoto[]>([]);

  useEffect(() => { photosRef.current = photos; }, [photos]);
  useEffect(() => () => photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.preview)), []);

  const load = useCallback(() => {
    setFetching(true);
    setLoadError(false);
    Promise.all([companyService.getMyEstablishment(), claimsService.getMine().catch(() => null)])
      .then(([data, claimList]) => {
        setEstablishment(data);
        setClaims(claimList);
        if (data) setForm(toForm(data));
      })
      .catch(() => setLoadError(true))
      .finally(() => setFetching(false));
  }, []);

  const reloadClaims = useCallback(() => {
    claimsService.getMine().then(setClaims).catch(() => setClaims(null));
  }, []);

  useEffect(() => { load(); }, [load]);

  const type = establishment?.type ?? selectedType;
  const isEdit = !!establishment;
  const uploading = progress !== null;
  const busy = saving || uploading;
  const baseline = establishment ? toForm(establishment) : EMPTY_FORM;
  const dirty = !!type && (JSON.stringify(form) !== JSON.stringify(baseline) || photos.length > 0);
  useUnsavedChangesWarning(dirty);

  const setField = <K extends FieldKey>(key: K, value: FormState[K]) => {
    const next = { ...form, [key]: value };
    setForm(next);
    if (type && errors[key]) setFieldError(key, validateField(key, next, type));
  };

  const setFieldError = (key: FieldKey, message: string | undefined) =>
    setErrors((current) => {
      const next = { ...current };
      if (message) next[key] = message;
      else delete next[key];
      return next;
    });

  const handleBlur = (key: FieldKey) => {
    if (!type) return;
    let next = form;
    const value = form[key];
    const normalize = NORMALIZERS[key];
    if (normalize && typeof value === 'string') {
      const normalized = normalize(value);
      if (normalized !== value) {
        next = { ...form, [key]: normalized };
        setForm(next);
      }
    }
    setFieldError(key, validateField(key, next, type));
  };

  const text = (key: FieldKey) => ({
    value: (form[key] as string | undefined) ?? '',
    onChange: (event: { target: { value: string } }) => setField(key, event.target.value as never),
    onBlur: () => handleBlur(key),
  });

  const addPhotos = (files: File[]) => {
    const { accepted, rejected } = validatePhotoFiles(files, photos.map((photo) => photo.file), establishment?.photos?.length ?? 0);
    setRejections(rejected);
    if (accepted.length) {
      const added = accepted.map((file) => ({ id: newPhotoId(), file, preview: URL.createObjectURL(file) }));
      setPhotos((current) => [...current, ...added]);
    }
  };

  const removePhoto = (id: string) => {
    const target = photos.find((photo) => photo.id === id);
    if (target) URL.revokeObjectURL(target.preview);
    setPhotos((current) => current.filter((photo) => photo.id !== id));
  };

  const movePhoto = (id: string, direction: -1 | 1) => setPhotos((current) => {
    const index = current.findIndex((photo) => photo.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= current.length) return current;
    const next = [...current];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });

  const uploadPending = async (list: PendingPhoto[], startOrder: number): Promise<boolean> => {
    setUploadError(null);
    for (let index = 0; index < list.length; index += 1) {
      setProgress({ current: index + 1, total: list.length });
      try {
        const saved = await companyService.uploadMyEstablishmentPhoto(list[index].file, startOrder + index);
        URL.revokeObjectURL(list[index].preview);
        setPhotos((current) => current.filter((photo) => photo.id !== list[index].id));
        setEstablishment((current) => (current ? { ...current, photos: [...(current.photos ?? []), saved] } : current));
      } catch (error) {
        setProgress(null);
        const sent = index > 0 ? ` ${index} de ${list.length} foto(s) já foram enviadas.` : '';
        setUploadError(`${uploadFailureMessage(error, list[index].file.name, index + 1, list.length)}${sent}`);
        return false;
      }
    }
    setProgress(null);
    return true;
  };

  const retryUpload = async () => {
    if (!establishment) return;
    const ok = await uploadPending(photos, establishment.photos?.length ?? 0);
    if (ok) showToast('Fotos enviadas com sucesso.', 'success');
  };

  const focusFirstError = () => {
    const first = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    first?.focus();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!type || busy) return;
    const normalized = normalizeForm(form);
    const found = validateAll(normalized, type);
    flushSync(() => { setForm(normalized); setErrors(found); });
    if (Object.keys(found).length) {
      focusFirstError();
      showToast(`Revise ${Object.keys(found).length === 1 ? 'o campo destacado' : 'os campos destacados'} antes de enviar.`, 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload(normalized, type);
      const saved = isEdit
        ? await companyService.updateEstablishment(payload as CompanyEstablishmentUpdate)
        : await companyService.createEstablishment({ type, ...omitEmptyStrings(payload) } as CompanyEstablishmentRequest);
      setEstablishment(saved);
      setForm(toForm(saved));
      if (photos.length && !(await uploadPending(photos, saved.photos?.length ?? 0))) {
        showToast('Cadastro salvo, mas algumas fotos não foram enviadas. Veja o aviso na seção Fotos.', 'error');
        photosSectionRef.current?.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
        return;
      }
      showToast(isEdit ? 'Estabelecimento atualizado e enviado para aprovação.' : 'Cadastro enviado! Aguarde a aprovação da administração.', 'success');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        showToast(claimErrorMessage(error, 'Não foi possível salvar o estabelecimento. Tente novamente.'), 'error');
        reloadClaims();
      } else {
        showToast('Não foi possível salvar o estabelecimento. Tente novamente.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const resetPhotos = () => {
    photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    setPhotos([]);
    setRejections([]);
    setUploadError(null);
  };

  const startNew = (newType: EstablishmentType) => {
    if (newType === selectedType) return;
    setSelectedType(newType);
    setErrors({});
    setForm((current) => ({ ...current, ...SPECIFIC_DEFAULTS }));
  };

  const goBackToTypes = () => requestLeave(() => {
    resetPhotos();
    setSelectedType(null);
    setForm(EMPTY_FORM);
    setErrors({});
  });

  const discardChanges = () => {
    resetPhotos();
    setForm(baseline);
    setErrors({});
    showToast('Alterações descartadas.', 'info');
  };

  if (fetching) {
    return (
      <div className="company-page" aria-busy="true" aria-label="Carregando seu estabelecimento">
        <Skeleton width={180} height={14} />
        <div style={{ height: 20 }} />
        <Skeleton width="55%" height={40} />
        <div style={{ height: 24 }} />
        <div className="company-stack">
          <Skeleton height={220} radius={16} />
          <Skeleton height={320} radius={16} />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="company-page">
        <StateBlock variant="error" icon="cloud_off" title="Não conseguimos carregar seu estabelecimento" actions={<Button icon="refresh" onClick={load}>Tentar de novo</Button>}>
          Verifique sua conexão e tente novamente.
        </StateBlock>
      </div>
    );
  }

  const pendingClaim = claims?.find((claim) => claim.status === 'PENDING');
  const approvedClaim = establishment ? claims?.find((claim) => claim.status === 'APPROVED' && claim.spotId === establishment.id) : undefined;

  const sections = ['identity', 'contact', 'details', 'photos'] as const;
  const stepFor = (section: (typeof sections)[number]) => sections.indexOf(section) + 1 + (isEdit ? 0 : 1);

  return (
    <div className="company-page">
      <nav className="company-breadcrumb" aria-label="Você está em">
        <span>Painel da empresa</span><Icon name="chevron_right" /><strong aria-current="page">Meu estabelecimento</strong>
      </nav>
      <header className="company-page-heading">
        <div>
          <span className="company-eyebrow">Portal oficial de turismo</span>
          <h1>{isEdit ? 'Meu estabelecimento' : type ? 'Cadastre seu estabelecimento' : 'Bem-vindo ao painel da empresa'}</h1>
          <p>{isEdit ? 'Mantenha as informações do seu negócio atualizadas para os visitantes.' : 'Apresente seu negócio na principal plataforma turística da Serra da Ibiapaba.'}</p>
        </div>
        {establishment && <Badge variant={STATUS_VARIANT[establishment.approvalStatus]}>{STATUS_LABEL[establishment.approvalStatus]}</Badge>}
      </header>

      {isEdit && establishment.approvalStatus !== 'APPROVED' && (
        <div className="company-banner">
          <StateBlock variant="notice" icon="hourglass_top" title={establishment.approvalStatus === 'REJECTED' ? 'Seu cadastro precisa de ajustes' : 'Cadastro em análise'}>
            {establishment.approvalStatus === 'REJECTED' ? 'Revise os dados e envie novamente para aprovação.' : 'A administração do Viva Ubajara analisará os dados antes da publicação.'}
          </StateBlock>
        </div>
      )}
      {isEdit && establishment.approvalStatus === 'APPROVED' && (
        <div className="company-banner">
          <StateBlock variant="notice" icon="info" title="Atenção ao editar">
            Alterações no cadastro retornam o estabelecimento para a fila de aprovação.
          </StateBlock>
        </div>
      )}

      {approvedClaim && (
        <div className="company-banner">
          <StateBlock variant="notice" icon="verified" title="Solicitação aprovada">
            Seu estabelecimento já está no painel. Revise as informações abaixo e mantenha-as atualizadas.
          </StateBlock>
        </div>
      )}

      {!isEdit && !type ? (
        <div className="company-stack">
          {pendingClaim && (
            <StateBlock variant="notice" icon="hourglass_top" title="Você tem uma solicitação em análise">
              Enquanto ela estiver em análise, não é possível cadastrar um novo estabelecimento. Aguarde a resposta da administração ou cancele a solicitação abaixo.
            </StateBlock>
          )}
          {!pendingClaim && (
            <>
              <section className="company-card company-type-picker" aria-labelledby="type-heading">
                <div className="company-card__body">
                  <div>
                    <h2 id="type-heading">Qual é o tipo do seu estabelecimento?</h2>
                    <p>Essa escolha não poderá ser alterada depois.</p>
                  </div>
                  <div className="company-type-grid">
                    <button type="button" className="company-type-card" onClick={() => startNew('RESTAURANT')}>
                      <span className="company-type-icon"><Icon name="restaurant" /></span>
                      <span className="company-type-copy"><strong>Restaurante</strong><small>Restaurantes, cafés, lanchonetes e produtores locais.</small></span>
                      <Icon name="chevron_right" className="company-type-arrow" />
                    </button>
                    <button type="button" className="company-type-card" onClick={() => startNew('HOST_POINT')}>
                      <span className="company-type-icon"><Icon name="hotel" /></span>
                      <span className="company-type-copy"><strong>Hospedagem</strong><small>Hotéis, pousadas, chalés e hostels da região.</small></span>
                      <Icon name="chevron_right" className="company-type-arrow" />
                    </button>
                  </div>
                </div>
              </section>
              <ClaimHint />
            </>
          )}
          {claims === null && (
            <div className="company-alert company-alert--warn" role="alert">
              <Icon name="info" />
              <div className="company-alert__body">
                <strong>Não conseguimos carregar suas solicitações de titularidade.</strong>
                <div className="company-alert__actions">
                  <Button variant="outline" icon="refresh" onClick={reloadClaims}>Tentar de novo</Button>
                </div>
              </div>
            </div>
          )}
          {claims && claims.length > 0 && <ClaimsPanel claims={claims} onChanged={reloadClaims} />}
        </div>
      ) : (
        <form ref={formRef} className="company-form" onSubmit={handleSubmit} noValidate>
          {!isEdit && (
            <section className="company-card">
              <div className="company-card__head company-card__head--type">
                <span className="company-step" aria-hidden="true">1</span>
                <div>
                  <h2 id="type-switch-title">Tipo de estabelecimento</h2>
                  <p>Selecione para exibir os campos específicos.</p>
                </div>
                <div className="company-type-switch" role="group" aria-labelledby="type-switch-title">
                  <FilterChip size="lg" icon="restaurant" label="Restaurante" selected={type === 'RESTAURANT'} onClick={() => startNew('RESTAURANT')} />
                  <FilterChip size="lg" icon="hotel" label="Hospedagem" selected={type === 'HOST_POINT'} onClick={() => startNew('HOST_POINT')} />
                </div>
              </div>
            </section>
          )}

          <p className="company-required-note">Campos marcados com * são obrigatórios.</p>

          <section className="company-card" aria-labelledby="sec-identity">
            <SectionHead id="sec-identity" step={stepFor('identity')} title="Identificação e apresentação" subtitle="Como os visitantes encontrarão seu negócio." />
            <div className="company-card__body">
              <Field label="Nome do estabelecimento" required error={errors.name} counter={{ current: form.name.length, max: 100 }}>
                {(control) => <input {...control} className="ui-input" type="text" maxLength={100} autoComplete="organization" {...text('name')} />}
              </Field>
              <Field label="Descrição do estabelecimento" required error={errors.description} counter={{ current: form.description.length, max: 600 }} hint="Conte o que torna seu estabelecimento especial para quem visita a região.">
                {(control) => <textarea {...control} className="ui-input" rows={5} maxLength={600} {...text('description')} />}
              </Field>
            </div>
          </section>

          <section className="company-card" aria-labelledby="sec-contact">
            <SectionHead id="sec-contact" step={stepFor('contact')} title="Localização e contato" subtitle="Informações para o visitante encontrar e contatar você." />
            <div className="company-card__body">
              <Field label="Endereço completo" required error={errors.address} hint="Rua, número, bairro e cidade.">
                {(control) => <input {...control} className="ui-input" type="text" autoComplete="street-address" {...text('address')} />}
              </Field>
              <div className="company-grid">
                <Field label="Telefone / WhatsApp" optional error={errors.phone}>
                  {(control) => (
                    <input
                      {...control}
                      className="ui-input"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      placeholder="(88) 99999-9999"
                      value={form.phone ?? ''}
                      onChange={(event) => setField('phone', maskPhoneInput(event.target.value, form.phone ?? ''))}
                      onBlur={() => handleBlur('phone')}
                    />
                  )}
                </Field>
                <Field label="E-mail de contato" optional error={errors.email}>
                  {(control) => <input {...control} className="ui-input" type="email" autoComplete="email" placeholder="contato@seunegocio.com.br" {...text('email')} />}
                </Field>
                <Field label="Site oficial" optional error={errors.webUrl}>
                  {(control) => <input {...control} className="ui-input" type="url" inputMode="url" placeholder="https://www.seusite.com.br" {...text('webUrl')} />}
                </Field>
                <Field label="Instagram" optional error={errors.instagramUrl} hint="Digite @seuperfil ou cole o link.">
                  {(control) => <input {...control} className="ui-input" type="text" inputMode="url" autoCapitalize="none" placeholder="@seuperfil" {...text('instagramUrl')} />}
                </Field>
              </div>
              <Field label="Link do Google Maps" optional error={errors.mapsUrl} hint="Cole o link do local no mapa. O sistema não se conecta à sua conta Google.">
                {(control) => <input {...control} className="ui-input" type="url" inputMode="url" placeholder="https://maps.app.goo.gl/..." {...text('mapsUrl')} />}
              </Field>
            </div>
          </section>

          <section className="company-card" aria-labelledby="sec-details">
            <SectionHead
              id="sec-details"
              step={stepFor('details')}
              title={type === 'RESTAURANT' ? 'Informações do restaurante' : 'Informações da hospedagem'}
              subtitle="Detalhes específicos para apresentar melhor seu negócio."
              aside={<Badge variant="success">{type === 'RESTAURANT' ? 'Restaurante' : 'Hospedagem'}</Badge>}
            />
            <div className="company-card__body">
              {type === 'RESTAURANT' ? (
                <>
                  <Field label="Tipo de culinária" required error={errors.cuisineType} hint="Ex.: regional nordestina, café, pizzaria.">
                    {(control) => <input {...control} className="ui-input" type="text" {...text('cuisineType')} />}
                  </Field>
                  <div className="company-grid company-grid--three">
                    <Field label="Horário de funcionamento" optional hint="Ex.: Ter-Dom 11:00-22:00">
                      {(control) => <input {...control} className="ui-input" type="text" {...text('openingHours')} />}
                    </Field>
                    <Field label="Preço médio" optional error={errors.avgPrice} counter={{ current: (form.avgPrice ?? '').length, max: 30 }} hint="Ex.: R$ 65,00 por pessoa">
                      {(control) => <input {...control} className="ui-input" type="text" inputMode="decimal" maxLength={30} {...text('avgPrice')} />}
                    </Field>
                    <Field label="Nota manual" optional error={errors.starRating} hint="De 1 a 5. Não é importada de plataformas externas.">
                      {(control) => (
                        <input
                          {...control}
                          className="ui-input"
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={5}
                          step={1}
                          value={form.starRating ?? ''}
                          onChange={(event) => setField('starRating', event.target.value === '' ? undefined : Number(event.target.value))}
                          onBlur={() => handleBlur('starRating')}
                        />
                      )}
                    </Field>
                  </div>
                  <div className="company-toggle-box">
                    <Toggle label="Aceita reservas" checked={!!form.acceptsReservation} onChange={(value) => setField('acceptsReservation', value)} />
                    <small>Informe se o estabelecimento recebe reservas antecipadas.</small>
                  </div>
                  <StateBlock variant="notice" icon="info" title="O cardápio é gerenciado separadamente">
                    Depois de enviar o cadastro, use a aba Cardápio no menu para incluir seus pratos.
                  </StateBlock>
                </>
              ) : (
                <>
                  <div className="company-grid company-grid--three">
                    <Field label="Tipo de hospedagem" required>
                      {(control) => (
                        <select {...control} className="ui-input" value={form.hostType ?? 'HOTEL'} onChange={(event) => setField('hostType', event.target.value as HostType)}>
                          <option value="HOTEL">Hotel</option>
                          <option value="ROOST">Pousada</option>
                          <option value="HOSTEL">Hostel</option>
                        </select>
                      )}
                    </Field>
                    <Field label="Número de quartos" optional error={errors.numOfRooms}>
                      {(control) => (
                        <input
                          {...control}
                          className="ui-input"
                          type="number"
                          inputMode="numeric"
                          min={0}
                          step={1}
                          value={form.numOfRooms ?? ''}
                          onChange={(event) => setField('numOfRooms', event.target.value === '' ? undefined : Number(event.target.value))}
                          onBlur={() => handleBlur('numOfRooms')}
                        />
                      )}
                    </Field>
                    <Field label="Preço médio por diária" optional error={errors.avgPrice} counter={{ current: (form.avgPrice ?? '').length, max: 30 }} hint="Ex.: R$ 280,00 por diária">
                      {(control) => <input {...control} className="ui-input" type="text" inputMode="decimal" maxLength={30} {...text('avgPrice')} />}
                    </Field>
                  </div>
                  <Field label="Link para reservar" optional error={errors.bookingUrl} hint="URL externa informada pela empresa, como WhatsApp ou uma plataforma de reservas. Não há integração automática.">
                    {(control) => <input {...control} className="ui-input" type="url" inputMode="url" placeholder="https://..." {...text('bookingUrl')} />}
                  </Field>
                </>
              )}
            </div>
          </section>

          <section ref={photosSectionRef} className="company-card" aria-labelledby="sec-photos">
            <SectionHead id="sec-photos" step={stepFor('photos')} title="Fotos do estabelecimento" subtitle="Mostre aos visitantes os ambientes, produtos e a estrutura do seu negócio." aside={<Badge variant="neutral">Até 10 fotos</Badge>} />
            <div className="company-card__body">
              <PhotoUploader
                existing={establishment?.photos ?? []}
                pending={photos}
                disabled={busy}
                progress={progress}
                uploadError={uploadError}
                rejections={rejections}
                onAddFiles={addPhotos}
                onRemove={removePhoto}
                onMove={movePhoto}
                onRetry={retryUpload}
                onDismissRejections={() => setRejections([])}
              />
            </div>
          </section>

          <div className="company-actions" role="group" aria-label="Ações do formulário">
            {isEdit ? (
              <Button variant="outline" onClick={discardChanges} disabled={busy || !dirty}>Descartar alterações</Button>
            ) : (
              <Button variant="outline" icon="arrow_back" onClick={goBackToTypes} disabled={busy}>Voltar</Button>
            )}
            <span className="company-actions__status" role="status">{dirty ? 'Alterações não salvas' : ''}</span>
            <Button type="submit" disabled={busy} aria-busy={busy}>
              {busy ? <><span className="company-btn-spinner" aria-hidden="true" />{uploading ? 'Enviando fotos…' : 'Salvando…'}</> : isEdit ? 'Salvar alterações' : 'Enviar para aprovação'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
