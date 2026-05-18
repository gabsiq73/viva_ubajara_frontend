import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { hostPointsService } from '../services/hostPointsService';
import { photosService } from '../services/photosService';
import { useToast } from '../components/Toast';
import { FormInput, FormTextarea, FormSelect, FormToggle } from '../components/FormField';
import { Spinner } from '../components/Spinner';
import { PhotoManager } from '../components/PhotoManager';
import { PhotoPicker } from '../components/PhotoPicker';
import type { HostPointRequest, HostType, PhotoResponse } from '../types';

const EMPTY: HostPointRequest = { name: '', description: '', address: '', phone: '', email: '', webUrl: '', instagramUrl: '', active: true, hostType: 'HOTEL', numOfRooms: undefined, avgPrice: undefined, bookingUrl: '' };

export function HostPointFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState<HostPointRequest>(EMPTY);
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
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
        await Promise.allSettled(
          pendingFiles.map((f) => photosService.uploadForEntity('host-points', created.id, f))
        );
        showToast('Hospedagem criada com sucesso!', 'success');
      }
      navigate('/admin/host-points');
    } catch { showToast('Erro ao salvar.', 'error'); }
    finally { setLoading(false); }
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
          <FormTextarea label="Descrição" value={form.description} onChange={(e) => set('description', e.target.value)} error={errors.description} required />
          <FormInput label="Endereço" value={form.address} onChange={(e) => set('address', e.target.value)} error={errors.address} required />
          <div className="adm-form-row">
            <FormInput label="Telefone" value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
            <FormInput label="Email" type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="adm-form-row">
            <FormInput label="Nº de Quartos" type="number" value={form.numOfRooms ?? ''} onChange={(e) => set('numOfRooms', e.target.value ? Number(e.target.value) : undefined)} />
            <FormInput label="Preço Médio (R$)" type="number" value={form.avgPrice ?? ''} onChange={(e) => set('avgPrice', e.target.value ? Number(e.target.value) : undefined)} />
          </div>
          <FormInput label="URL de Reserva" type="url" value={form.bookingUrl ?? ''} onChange={(e) => set('bookingUrl', e.target.value)} />
          <FormToggle label="Ativo" checked={form.active} onChange={(v) => set('active', v)} />
          {!isEdit && <PhotoPicker files={pendingFiles} onChange={setPendingFiles} />}
          <div className="adm-form-actions">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={() => navigate('/admin/host-points')}>Cancelar</button>
            <button type="submit" className="adm-btn adm-btn--primary" disabled={loading}>{loading ? 'Salvando…' : isEdit ? 'Atualizar' : 'Criar'}</button>
          </div>
        </form>
      </div>
      {isEdit && id && <PhotoManager entityPath="host-points" entityId={id} initialPhotos={photos} />}
    </div>
  );
}
