import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { ChevronLeft, CircleHelp, Hotel, ImagePlus, Trash2, Utensils, TriangleAlert, UploadCloud } from 'lucide-react';
import { companyService } from '../../admin/services/companyService';
import { useToast } from '../../admin/components/Toast';
import { FormInput, FormSelect, FormTextarea, FormToggle } from '../../admin/components/FormField';
import { Spinner } from '../../admin/components/Spinner';
import type { ApprovalStatus, CompanyEstablishmentRequest, CompanyEstablishmentResponse, CompanyEstablishmentUpdate, EstablishmentType, HostType, PhotoResponse } from '../../admin/types';
import './EstablishmentPage.css';

type FormState = Omit<CompanyEstablishmentRequest, 'type'>;
type PendingPhoto = { file: File; preview: string };
const EMPTY_FORM: FormState = {
  name: '', description: '', address: '', phone: '', email: '', webUrl: '', instagramUrl: '', mapsUrl: '',
  cuisineType: '', openingHours: '', avgPrice: '', acceptsReservation: false, starRating: undefined,
  hostType: 'HOTEL', numOfRooms: undefined, bookingUrl: '',
};

const STATUS_LABEL: Record<ApprovalStatus, string> = { PENDING: 'Aguardando aprovação', APPROVED: 'Aprovado', REJECTED: 'Precisa de ajustes' };

export function EstablishmentPage() {
  const { showToast } = useToast();
  const [fetching, setFetching] = useState(true);
  const [establishment, setEstablishment] = useState<CompanyEstablishmentResponse | null>(null);
  const [selectedType, setSelectedType] = useState<EstablishmentType | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    companyService.getMyEstablishment()
      .then((data) => {
        setEstablishment(data);
        if (data) setForm({
          name: data.name, description: data.description, address: data.address, phone: data.phone ?? '', email: data.email ?? '',
          webUrl: data.webUrl ?? '', instagramUrl: data.instagramUrl ?? '', mapsUrl: data.mapsUrl ?? '', cuisineType: data.cuisineType ?? '',
          openingHours: data.openingHours ?? '', avgPrice: data.avgPrice ?? '', acceptsReservation: data.acceptsReservation ?? false,
          starRating: data.starRating ?? undefined, hostType: data.hostType ?? 'HOTEL', numOfRooms: data.numOfRooms ?? undefined,
          bookingUrl: data.bookingUrl ?? '',
        });
      })
      .catch(() => showToast('Erro ao carregar seu estabelecimento.', 'error'))
      .finally(() => setFetching(false));
  }, []);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((previous) => ({ ...previous, [key]: value }));
  const type = establishment?.type ?? selectedType;
  const isEdit = !!establishment;

  const validate = () => {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = 'Informe o nome do estabelecimento.';
    if (!form.description.trim()) next.description = 'Informe uma descrição.';
    if (form.description.length > 600) next.description = 'A descrição pode ter até 600 caracteres.';
    if (!form.address.trim()) next.address = 'Informe o endereço.';
    if (type === 'RESTAURANT' && !form.cuisineType?.trim()) next.cuisineType = 'Informe o tipo de culinária.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const selectPhotos = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    const accepted = selected.filter((file) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) && file.size <= 5 * 1024 * 1024);
    if (accepted.length !== selected.length) showToast('Use imagens JPG, PNG, WEBP ou GIF de até 5 MB cada.', 'error');
    const slots = Math.max(0, 10 - (establishment?.photos?.length ?? 0) - photos.length);
    if (accepted.length > slots) showToast('O estabelecimento pode ter até 10 fotos.', 'error');
    setPhotos((current) => [...current, ...accepted.slice(0, slots).map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
    event.target.value = '';
  };

  const removePhoto = (index: number) => setPhotos((current) => {
    const item = current[index];
    if (item) URL.revokeObjectURL(item.preview);
    return current.filter((_, itemIndex) => itemIndex !== index);
  });

  const uploadPhotos = async (startOrder = 0): Promise<boolean> => {
    if (!photos.length) return true;
    setUploadingPhotos(true);
    let uploaded = 0;
    const uploadedItems: PhotoResponse[] = [];
    try {
      for (let index = 0; index < photos.length; index += 1) {
        uploadedItems.push(await companyService.uploadMyEstablishmentPhoto(photos[index].file, startOrder + index));
        uploaded += 1;
      }
      setEstablishment((current) => current ? { ...current, photos: [...(current.photos ?? []), ...uploadedItems] } : current);
      setPhotos((current) => { current.forEach((photo) => URL.revokeObjectURL(photo.preview)); return []; });
      return true;
    } catch {
      setPhotos((current) => {
        current.slice(0, uploaded).forEach((photo) => URL.revokeObjectURL(photo.preview));
        return current.slice(uploaded);
      });
      showToast(uploaded ? `${uploaded} foto(s) enviada(s). Não foi possível enviar as demais; tente novamente.` : 'Não foi possível enviar as fotos. Tente novamente.', 'error');
      return false;
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!type || !validate()) return;
    setSaving(true);
    try {
      if (isEdit) {
        const updated = await companyService.updateEstablishment({ ...form } as CompanyEstablishmentUpdate);
        setEstablishment(updated);
        if (photos.length && !(await uploadPhotos(updated.photos?.length ?? 0))) return;
        showToast('Estabelecimento atualizado e enviado para aprovação.', 'success');
      } else {
        const created = await companyService.createEstablishment({ type, ...form } as CompanyEstablishmentRequest);
        setEstablishment(created);
        if (photos.length && !(await uploadPhotos(created.photos?.length ?? 0))) return;
        showToast('Cadastro enviado! Aguarde a aprovação da administração.', 'success');
      }
    } catch {
      showToast('Erro ao salvar estabelecimento.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (fetching) return <Spinner center size="lg" />;

  const startNew = (newType: EstablishmentType) => { setSelectedType(newType); setForm(EMPTY_FORM); setErrors({}); };

  return (
    <div className="company-establishment">
      <div className="company-breadcrumb"><span>Painel da empresa</span><span aria-hidden="true">›</span><strong>Meu estabelecimento</strong></div>
      <header className="company-page-heading">
        <div>
          <span className="company-eyebrow">Portal oficial de turismo</span>
          <h1>{isEdit ? 'Meu estabelecimento' : type ? 'Cadastre seu estabelecimento' : 'Bem-vindo ao painel da empresa'}</h1>
          <p>{isEdit ? 'Mantenha as informações do seu negócio atualizadas para os visitantes.' : 'Apresente seu negócio na principal plataforma turística da Serra da Ibiapaba.'}</p>
        </div>
        {establishment && <span className={`company-status company-status--${establishment.approvalStatus.toLowerCase()}`}>{STATUS_LABEL[establishment.approvalStatus]}</span>}
      </header>

      {isEdit && establishment.approvalStatus !== 'APPROVED' && (
        <div className="company-notice" role="status"><TriangleAlert size={20} /><div><strong>{establishment.approvalStatus === 'REJECTED' ? 'Seu cadastro precisa de ajustes' : 'Cadastro em análise'}</strong><p>{establishment.approvalStatus === 'REJECTED' ? 'Revise os dados e envie novamente para aprovação.' : 'A administração do Viva Ubajara analisará os dados antes da publicação.'}</p></div></div>
      )}
      {isEdit && establishment.approvalStatus === 'APPROVED' && (
        <div className="company-notice" role="status"><CircleHelp size={20} /><div><strong>Atenção ao editar</strong><p>Alterações no cadastro retornam o estabelecimento para a fila de aprovação.</p></div></div>
      )}

      {!isEdit && !type ? (
        <section className="company-type-picker" aria-labelledby="type-heading">
          <div className="company-section-intro"><h2 id="type-heading">Qual é o tipo do seu estabelecimento?</h2><p>Essa escolha não poderá ser alterada depois.</p></div>
          <div className="company-type-grid">
            <button type="button" className="company-type-card" onClick={() => startNew('RESTAURANT')}><span className="company-type-icon"><Utensils /></span><span className="company-type-copy"><strong>Restaurante</strong><small>Restaurantes, cafés, lanchonetes e produtores locais.</small></span><span className="company-type-arrow">›</span></button>
            <button type="button" className="company-type-card" onClick={() => startNew('HOST_POINT')}><span className="company-type-icon"><Hotel /></span><span className="company-type-copy"><strong>Hospedagem</strong><small>Hotéis, pousadas, chalés e hostels da região.</small></span><span className="company-type-arrow">›</span></button>
          </div>
        </section>
      ) : (
        <form className="company-form" onSubmit={handleSubmit} noValidate>
          {!isEdit && <section className="company-type-switch"><span className="company-step">1</span><div className="company-type-switch__label"><strong>Tipo de estabelecimento</strong><small>Selecione para exibir os campos específicos.</small></div><div className="company-type-switch__buttons"><button type="button" className={type === 'RESTAURANT' ? 'selected' : ''} onClick={() => startNew('RESTAURANT')}><Utensils size={16} /> Restaurante</button><button type="button" className={type === 'HOST_POINT' ? 'selected' : ''} onClick={() => startNew('HOST_POINT')}><Hotel size={16} /> Hospedagem</button></div></section>}

          <section className="company-form-card">
            <div className="company-card-heading"><span className="company-step">{isEdit ? '1' : '2'}</span><div><h2>Identificação e apresentação</h2><p>Como os visitantes encontrarão seu negócio.</p></div><span className="company-required-note">* Campos obrigatórios</span></div>
            <div className="company-card-body">
              <FormInput label="Nome do estabelecimento" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} required maxLength={100} />
              <FormTextarea label="Descrição do estabelecimento" value={form.description} onChange={(e) => set('description', e.target.value)} error={errors.description} required maxLength={600} rows={4} hint="Conte o que torna seu estabelecimento especial para quem visita a região." />
            </div>
          </section>

          <section className="company-form-card">
            <div className="company-card-heading"><span className="company-step">{isEdit ? '4' : '5'}</span><div><h2>Fotos do estabelecimento</h2><p>Mostre aos visitantes os ambientes, produtos e a estrutura do seu negócio.</p></div><span className="company-kind-pill">Até 10 fotos</span></div>
            <div className="company-card-body">
              <input ref={photoInput} className="company-photo-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={selectPhotos} />
              <button type="button" className="company-photo-drop" onClick={() => photoInput.current?.click()}>
                <span className="company-photo-drop__icon"><UploadCloud size={22} /></span>
                <strong>Selecionar fotos do estabelecimento</strong>
                <small>JPG, PNG, WEBP ou GIF · até 5 MB por imagem</small>
                <span className="company-photo-drop__button"><ImagePlus size={15} /> Escolher imagens</span>
              </button>
              {photos.length > 0 && <div className="company-photo-grid">{photos.map((photo, index) => <div className="company-photo-item" key={`${photo.file.name}-${index}`}><img src={photo.preview} alt={`Prévia ${index + 1}: ${photo.file.name}`} /><span>{photo.file.name}</span><button type="button" aria-label={`Remover ${photo.file.name}`} onClick={() => removePhoto(index)}><Trash2 size={15} /></button></div>)}</div>}
              {isEdit && establishment.photos?.length > 0 && <div className="company-photo-existing"><strong>Fotos já enviadas</strong><div className="company-photo-grid">{establishment.photos.map((photo) => <div className="company-photo-item" key={photo.id}><img src={photo.url} alt={photo.description || 'Foto do estabelecimento'} /><span>{photo.description || 'Foto do estabelecimento'}</span></div>)}</div></div>}
            </div>
          </section>

          <section className="company-form-card">
            <div className="company-card-heading"><span className="company-step">{isEdit ? '2' : '3'}</span><div><h2>Localização e contato</h2><p>Informações para o visitante encontrar e contatar você.</p></div></div>
            <div className="company-card-body">
              <FormInput label="Endereço completo" value={form.address} onChange={(e) => set('address', e.target.value)} error={errors.address} required />
              <div className="company-fields-grid">
                <FormInput label="Telefone / WhatsApp" type="tel" value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
                <FormInput label="E-mail de contato" type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} />
                <FormInput label="Site oficial" type="url" value={form.webUrl ?? ''} onChange={(e) => set('webUrl', e.target.value)} hint="Link informado pela empresa." />
                <FormInput label="Instagram (perfil ou URL)" value={form.instagramUrl ?? ''} onChange={(e) => set('instagramUrl', e.target.value)} />
              </div>
              <FormInput label="Link do Google Maps" type="url" value={form.mapsUrl ?? ''} onChange={(e) => set('mapsUrl', e.target.value)} hint="Cole o link do local no mapa. O sistema não se conecta à sua conta Google." />
            </div>
          </section>

          <section className="company-form-card">
            <div className="company-card-heading"><span className="company-step">{isEdit ? '3' : '4'}</span><div><h2>{type === 'RESTAURANT' ? 'Informações do restaurante' : 'Informações da hospedagem'}</h2><p>Detalhes específicos para apresentar melhor seu negócio.</p></div><span className="company-kind-pill">{type === 'RESTAURANT' ? 'Restaurante' : 'Hospedagem'}</span></div>
            <div className="company-card-body">
              {type === 'RESTAURANT' ? <>
                <FormInput label="Tipo de culinária" value={form.cuisineType ?? ''} onChange={(e) => set('cuisineType', e.target.value)} error={errors.cuisineType} required hint="Ex.: regional nordestina, café, pizzaria." />
                <div className="company-fields-grid company-fields-grid--three">
                  <FormInput label="Horário de funcionamento" value={form.openingHours ?? ''} onChange={(e) => set('openingHours', e.target.value)} hint="Ex.: Ter-Dom 11:00-22:00" />
                  <FormInput label="Preço médio" value={form.avgPrice ?? ''} onChange={(e) => set('avgPrice', e.target.value)} hint="Ex.: R$ 65,00 por pessoa" maxLength={20} />
                  <FormInput label="Nota manual (opcional)" type="number" min={1} max={5} step={0.1} value={form.starRating ?? ''} onChange={(e) => set('starRating', e.target.value ? Math.min(5, Math.max(1, Number(e.target.value))) : undefined)} hint="Não é importada de plataformas externas." />
                </div>
                <div className="company-toggle-box"><div><strong>Aceita reservas</strong><small>Informe se o estabelecimento recebe reservas antecipadas.</small></div><FormToggle label="Aceita reservas" checked={!!form.acceptsReservation} onChange={(value) => set('acceptsReservation', value)} /></div>
                <div className="company-inline-note"><CircleHelp size={18} /><span>O cardápio é gerenciado separadamente na aba <strong>Cardápio</strong>.</span></div>
              </> : <>
                <div className="company-fields-grid company-fields-grid--three">
                  <FormSelect label="Tipo de hospedagem" value={form.hostType ?? 'HOTEL'} onChange={(e) => set('hostType', e.target.value as HostType)} required><option value="HOTEL">Hotel</option><option value="ROOST">Pousada</option><option value="HOSTEL">Hostel</option></FormSelect>
                  <FormInput label="Número de quartos" type="number" min={0} value={form.numOfRooms ?? ''} onChange={(e) => set('numOfRooms', e.target.value ? Number(e.target.value) : undefined)} />
                  <FormInput label="Preço médio por diária" value={form.avgPrice ?? ''} onChange={(e) => set('avgPrice', e.target.value)} hint="Ex.: R$ 280,00 por diária" maxLength={20} />
                </div>
                <FormInput label="Link para reservar" type="url" value={form.bookingUrl ?? ''} onChange={(e) => set('bookingUrl', e.target.value)} hint="URL externa informada pela empresa, como WhatsApp ou uma plataforma de reservas. Não há integração automática." />
              </>}
            </div>
          </section>

          <footer className="company-form-actions">
            {!isEdit && <button type="button" className="company-button company-button--secondary" onClick={() => { setSelectedType(null); setErrors({}); }}><ChevronLeft size={17} /> Voltar</button>}
            {isEdit && <button type="button" className="company-button company-button--secondary" onClick={() => setForm({
              name: establishment.name, description: establishment.description, address: establishment.address, phone: establishment.phone ?? '', email: establishment.email ?? '', webUrl: establishment.webUrl ?? '', instagramUrl: establishment.instagramUrl ?? '', mapsUrl: establishment.mapsUrl ?? '', cuisineType: establishment.cuisineType ?? '', openingHours: establishment.openingHours ?? '', avgPrice: establishment.avgPrice ?? '', acceptsReservation: establishment.acceptsReservation ?? false, starRating: establishment.starRating ?? undefined, hostType: establishment.hostType ?? 'HOTEL', numOfRooms: establishment.numOfRooms ?? undefined, bookingUrl: establishment.bookingUrl ?? '',
            })}>Descartar alterações</button>}
            <button type="submit" className="company-button company-button--primary" disabled={saving || uploadingPhotos}>{saving || uploadingPhotos ? 'Enviando…' : isEdit ? 'Salvar alterações' : 'Enviar para aprovação'}<span aria-hidden="true">✓</span></button>
          </footer>
        </form>
      )}
    </div>
  );
}
