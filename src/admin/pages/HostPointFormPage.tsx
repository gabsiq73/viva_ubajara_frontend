import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { hostPointsService } from '../services/hostPointsService';
import { photosService } from '../services/photosService';
import { useToast } from '../components/Toast';
import { FormInput, FormTextarea, FormSelect, FormToggle } from '../components/FormField';
import { RolePhotoSlot } from '../components/RolePhotoSlot';
import { Spinner } from '../components/Spinner';
import { PhotoManager } from '../components/PhotoManager';
import type { HostPointRequest, HostType, PhotoResponse } from '../types';

const EMPTY: HostPointRequest = { name: '', description: '', address: '', phone: '', email: '', webUrl: '', instagramUrl: '', mapsUrl: '', active: true, hostType: 'HOTEL', numOfRooms: undefined, avgPrice: undefined, bookingUrl: '' };
const ROLE_DESCS = ['cover', 'card'];

export function HostPointFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState<HostPointRequest>(EMPTY);
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [cardFile, setCardFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof HostPointRequest, string>>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    setFetching(true);
    hostPointsService.getById(id).then((d) => {
      setForm({ ...d, avgPrice: d.avgPrice ?? undefined, numOfRooms: d.numOfRooms ?? undefined });
      setPhotos(d.photos ?? []);
    }).catch(() => showToast('Erro ao carregar.', 'error')).finally(() => setFetching(false));
  }, [id]);

  const set = <K extends keyof HostPointRequest>(key: K, val: HostPointRequest[K]) => setForm((p) => ({ ...p, [key]: val }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name) e.name = 'Obrigatório';
    if (!form.description) e.description = 'Obrigatório';
    if (!form.address) e.address = 'Obrigatório';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit) {
        await hostPointsService.update(id, form);
        showToast('Hospedagem atualizada!', 'success');
      } else {
        const created = await hostPointsService.create(form);
        if (coverFile) await photosService.uploadForEntity('host-points', created.id, coverFile, 'cover');
        if (cardFile) await photosService.uploadForEntity('host-points', created.id, cardFile, 'card');
        showToast('Hospedagem criada com sucesso!', 'success');
      }
      navigate('/admin/host-points');
    } catch { showToast('Erro ao salvar.', 'error'); }
    finally { setLoading(false); }
  };

  const coverPhoto = photos.find(p => p.description === 'cover') ?? null;
  const cardPhoto = photos.find(p => p.description === 'card') ?? null;
  const galleryPhotos = photos.filter(p => !ROLE_DESCS.includes(p.description ?? ''));

  const handleRoleUpdate = (role: string) => (photo: PhotoResponse | null) => {
    setPhotos(prev => {
      const filtered = prev.filter(p => p.description !== role);
      return photo ? [...filtered, photo] : filtered;
    });
  };

  if (fetching) return <Spinner center size="lg" />;
  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">{isEdit ? 'Editar Hospedagem' : 'Nova Hospedagem'}</h2>
        <button className="adm-btn adm-btn--ghost" onClick={() => navigate('/admin/host-points')}>← Voltar</button>
      </div>
      <div className="adm-card">
        <form className="adm-form" onSubmit={handleSubmit}>
          <div className="adm-form-row">
            <FormInput label="Nome" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} required />
            <FormSelect label="Tipo" value={form.hostType} onChange={(e) => set('hostType', e.target.value as HostType)} required>
              <option value="HOTEL">Hotel</option>
              <option value="ROOST">Pousada</option>
              <option value="HOSTEL">Hostel</option>
            </FormSelect>
          </div>
          <FormTextarea label="Descrição" value={form.description} onChange={(e) => set('description', e.target.value)} error={errors.description} required maxLength={600} />
          <FormInput label="Endereço" value={form.address} onChange={(e) => set('address', e.target.value)} error={errors.address} required />
          <div className="adm-form-row">
            <FormInput label="Telefone" value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
            <FormInput label="Email" type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="adm-form-row">
            <FormInput label="Nº de Quartos" type="number" value={form.numOfRooms ?? ''} onChange={(e) => set('numOfRooms', e.target.value ? Number(e.target.value) : undefined)} />
            <FormInput label="Preço Médio" value={form.avgPrice ?? ''} onChange={(e) => set('avgPrice', e.target.value || undefined)} hint="Ex: R$ 180,00 / noite" maxLength={20} />
          </div>
          <FormInput label="URL de Reserva" type="url" value={form.bookingUrl ?? ''} onChange={(e) => set('bookingUrl', e.target.value)} />
          <FormInput label="URL Google Maps" type="url" value={form.mapsUrl ?? ''} onChange={(e) => set('mapsUrl', e.target.value)} hint="Link para o local no Google Maps" />
          <FormToggle label="Ativo" checked={form.active} onChange={(v) => set('active', v)} />

          <div className="adm-role-slots-section">
            <p className="adm-role-slots-section__title">Fotos</p>
            <div className="adm-role-slots-grid">
              <RolePhotoSlot
                label="Foto de Capa"
                hint="Imagem principal exibida na página da hospedagem"
                roleDescription="cover"
                {...(isEdit
                  ? { entityPath: 'host-points', entityId: id, existingPhoto: coverPhoto, onPhotoUpdate: handleRoleUpdate('cover') }
                  : { pendingFile: coverFile, onPendingFileChange: setCoverFile })}
              />
              <RolePhotoSlot
                label="Foto do Card"
                hint="Miniatura exibida na listagem"
                roleDescription="card"
                {...(isEdit
                  ? { entityPath: 'host-points', entityId: id, existingPhoto: cardPhoto, onPhotoUpdate: handleRoleUpdate('card') }
                  : { pendingFile: cardFile, onPendingFileChange: setCardFile })}
              />
            </div>
          </div>

          <div className="adm-form-actions">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={() => navigate('/admin/host-points')}>Cancelar</button>
            <button type="submit" className="adm-btn adm-btn--primary" disabled={loading}>{loading ? 'Salvando…' : isEdit ? 'Atualizar' : 'Criar'}</button>
          </div>
        </form>
      </div>
      {isEdit && id && <PhotoManager entityPath="host-points" entityId={id} initialPhotos={galleryPhotos} />}
    </div>
  );
}
