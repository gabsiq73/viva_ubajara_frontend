import { useState, useEffect, type FormEvent } from 'react';
import { Utensils, Hotel } from 'lucide-react';
import { companyService } from '../../admin/services/companyService';
import { useToast } from '../../admin/components/Toast';
import { FormInput, FormTextarea, FormSelect, FormToggle } from '../../admin/components/FormField';
import { Spinner } from '../../admin/components/Spinner';
import type {
  CompanyEstablishmentResponse,
  CompanyEstablishmentRequest,
  CompanyEstablishmentUpdate,
  EstablishmentType,
  HostType,
  ApprovalStatus,
} from '../../admin/types';

type FormState = Omit<CompanyEstablishmentRequest, 'type'>;

const EMPTY_FORM: FormState = {
  name: '', description: '', address: '', phone: '', email: '', webUrl: '', instagramUrl: '', mapsUrl: '',
  cuisineType: '', openingHours: '', avgPrice: undefined, acceptsReservation: false, starRating: undefined,
  hostType: 'HOTEL', numOfRooms: undefined, bookingUrl: '',
};

const STATUS_LABEL: Record<ApprovalStatus, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
};

const STATUS_BADGE: Record<ApprovalStatus, string> = {
  PENDING: 'adm-badge--gold',
  APPROVED: 'adm-badge--green',
  REJECTED: 'adm-badge--red',
};

export function EstablishmentPage() {
  const { showToast } = useToast();
  const [fetching, setFetching] = useState(true);
  const [establishment, setEstablishment] = useState<CompanyEstablishmentResponse | null>(null);
  const [selectedType, setSelectedType] = useState<EstablishmentType | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFetching(true);
    companyService.getMyEstablishment()
      .then((data) => {
        setEstablishment(data);
        if (data) {
          setForm({
            name: data.name,
            description: data.description,
            address: data.address,
            phone: data.phone ?? '',
            email: data.email ?? '',
            webUrl: data.webUrl ?? '',
            instagramUrl: data.instagramUrl ?? '',
            mapsUrl: data.mapsUrl ?? '',
            cuisineType: data.cuisineType ?? '',
            openingHours: data.openingHours ?? '',
            avgPrice: data.avgPrice ?? undefined,
            acceptsReservation: data.acceptsReservation ?? false,
            starRating: data.starRating ?? undefined,
            hostType: data.hostType ?? 'HOTEL',
            numOfRooms: data.numOfRooms ?? undefined,
            bookingUrl: data.bookingUrl ?? '',
          });
        }
      })
      .catch(() => showToast('Erro ao carregar seu estabelecimento.', 'error'))
      .finally(() => setFetching(false));
  }, []);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) => setForm((p) => ({ ...p, [key]: val }));

  const type = establishment?.type ?? selectedType;
  const isEdit = !!establishment;

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name) e.name = 'Obrigatório';
    if (!form.description) e.description = 'Obrigatório';
    if (!form.address) e.address = 'Obrigatório';
    if (type === 'RESTAURANT' && !form.cuisineType) e.cuisineType = 'Obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!type || !validate()) return;
    setSaving(true);
    try {
      if (isEdit) {
        const update: CompanyEstablishmentUpdate = { ...form };
        const updated = await companyService.updateEstablishment(update);
        setEstablishment(updated);
        showToast('Estabelecimento atualizado! Ele volta para "Pendente" até ser aprovado novamente.', 'info');
      } else {
        const request: CompanyEstablishmentRequest = { type, ...form };
        const created = await companyService.createEstablishment(request);
        setEstablishment(created);
        showToast('Estabelecimento cadastrado! Aguarde a aprovação do administrador.', 'success');
      }
    } catch {
      showToast('Erro ao salvar estabelecimento.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (fetching) return <Spinner center size="lg" />;

  if (!isEdit && !selectedType) {
    return (
      <div>
        <div className="adm-page-header">
          <h2 className="adm-page-title">Cadastre seu estabelecimento</h2>
        </div>
        <p style={{ marginBottom: 20, color: '#6b7280' }}>Escolha o tipo de estabelecimento que você deseja cadastrar. Essa escolha não poderá ser alterada depois.</p>
        <div style={{ display: 'flex', gap: 16 }}>
          <button
            type="button"
            className="adm-card"
            style={{ flex: 1, padding: 24, textAlign: 'center', cursor: 'pointer', border: 'none' }}
            onClick={() => { setSelectedType('RESTAURANT'); setForm(EMPTY_FORM); }}
          >
            <Utensils size={32} />
            <h3 style={{ marginTop: 12 }}>Restaurante</h3>
          </button>
          <button
            type="button"
            className="adm-card"
            style={{ flex: 1, padding: 24, textAlign: 'center', cursor: 'pointer', border: 'none' }}
            onClick={() => { setSelectedType('HOST_POINT'); setForm(EMPTY_FORM); }}
          >
            <Hotel size={32} />
            <h3 style={{ marginTop: 12 }}>Hospedagem</h3>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">
          {isEdit ? 'Meu Estabelecimento' : type === 'RESTAURANT' ? 'Novo Restaurante' : 'Nova Hospedagem'}
        </h2>
        {establishment && (
          <span className={`adm-badge ${STATUS_BADGE[establishment.approvalStatus]}`}>
            {STATUS_LABEL[establishment.approvalStatus]}
          </span>
        )}
      </div>

      {isEdit && (
        <div className="adm-card" style={{ marginBottom: 16, padding: 16, background: '#fffcf0' }}>
          Editar os dados do seu estabelecimento envia-o novamente para aprovação — ele ficará indisponível ao público até ser aprovado outra vez.
        </div>
      )}

      <div className="adm-card">
        <form className="adm-form" onSubmit={handleSubmit}>
          <div className="adm-form-row">
            <FormInput label="Nome" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} required />
            {type === 'RESTAURANT' && (
              <FormInput label="Tipo de Culinária" value={form.cuisineType ?? ''} onChange={(e) => set('cuisineType', e.target.value)} error={errors.cuisineType} required />
            )}
            {type === 'HOST_POINT' && (
              <FormSelect label="Tipo" value={form.hostType} onChange={(e) => set('hostType', e.target.value as HostType)} required>
                <option value="HOTEL">Hotel</option>
                <option value="ROOST">Pousada</option>
                <option value="HOSTEL">Hostel</option>
              </FormSelect>
            )}
          </div>
          <FormTextarea label="Descrição" value={form.description} onChange={(e) => set('description', e.target.value)} error={errors.description} required maxLength={600} />
          <FormInput label="Endereço" value={form.address} onChange={(e) => set('address', e.target.value)} error={errors.address} required />
          <div className="adm-form-row">
            <FormInput label="Telefone" value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
            <FormInput label="Email" type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="adm-form-row">
            <FormInput label="Website" type="url" value={form.webUrl ?? ''} onChange={(e) => set('webUrl', e.target.value)} />
            <FormInput label="Instagram" value={form.instagramUrl ?? ''} onChange={(e) => set('instagramUrl', e.target.value)} />
          </div>
          <FormInput label="URL Google Maps" type="url" value={form.mapsUrl ?? ''} onChange={(e) => set('mapsUrl', e.target.value)} hint="Link para o local no Google Maps" />

          {type === 'RESTAURANT' && (
            <>
              <div className="adm-form-row">
                <FormInput label="Horário de Funcionamento" value={form.openingHours ?? ''} onChange={(e) => set('openingHours', e.target.value)} hint="Ex: Seg-Dom 11:00-22:00" />
                <FormInput label="Preço Médio" value={form.avgPrice ?? ''} onChange={(e) => set('avgPrice', e.target.value || undefined)} hint="Ex: R$ 45,00 por pessoa" maxLength={20} />
              </div>
              <FormInput label="Avaliação (1–5 estrelas)" type="number" value={form.starRating ?? ''} onChange={(e) => set('starRating', e.target.value ? Math.min(5, Math.max(1, Number(e.target.value))) : undefined)} hint="Deixe em branco para sem avaliação" />
              <FormToggle label="Aceita Reserva" checked={!!form.acceptsReservation} onChange={(v) => set('acceptsReservation', v)} />
            </>
          )}

          {type === 'HOST_POINT' && (
            <>
              <div className="adm-form-row">
                <FormInput label="Nº de Quartos" type="number" value={form.numOfRooms ?? ''} onChange={(e) => set('numOfRooms', e.target.value ? Number(e.target.value) : undefined)} />
                <FormInput label="Preço Médio" value={form.avgPrice ?? ''} onChange={(e) => set('avgPrice', e.target.value || undefined)} hint="Ex: R$ 180,00 / noite" maxLength={20} />
              </div>
              <FormInput label="URL de Reserva" type="url" value={form.bookingUrl ?? ''} onChange={(e) => set('bookingUrl', e.target.value)} />
            </>
          )}

          <div className="adm-form-actions">
            {!isEdit && (
              <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setSelectedType(null)}>← Voltar</button>
            )}
            <button type="submit" className="adm-btn adm-btn--primary" disabled={saving}>{saving ? 'Salvando…' : isEdit ? 'Atualizar' : 'Cadastrar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
