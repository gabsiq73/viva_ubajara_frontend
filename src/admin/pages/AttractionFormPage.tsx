import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { attractionsService } from '../services/attractionsService';
import { photosService } from '../services/photosService';
import { useToast } from '../components/Toast';
import { FormInput, FormTextarea, FormSelect, FormToggle } from '../components/FormField';
import { Spinner } from '../components/Spinner';
import { PhotoManager } from '../components/PhotoManager';
import { PhotoPicker } from '../components/PhotoPicker';
import type { AttractionRequest, AttractionCategory, PhotoResponse } from '../types';

const CATEGORIES: { value: AttractionCategory; label: string }[] = [
  { value: 'PARK', label: 'Parque' },
  { value: 'WATERFALL', label: 'Cachoeira' },
  { value: 'MUSEUM', label: 'Museu' },
  { value: 'FARM', label: 'Fazenda' },
  { value: 'ROUTE', label: 'Rota' },
  { value: 'MARKET', label: 'Mercado' },
];

const EMPTY: AttractionRequest = {
  name: '', description: '', address: '', phone: '', email: '',
  webUrl: '', instagramUrl: '', active: true, openingHours: '',
  entryPrice: undefined, hasGuide: false, averageVisitDuration: undefined,
  category: 'PARK',
};

export function AttractionFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState<AttractionRequest>(EMPTY);
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof AttractionRequest, string>>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    setFetching(true);
    attractionsService.getById(id).then((data) => {
      setForm({ ...data, entryPrice: data.entryPrice ?? undefined, averageVisitDuration: data.averageVisitDuration ?? undefined });
      setPhotos(data.photos ?? []);
    }).catch(() => showToast('Erro ao carregar atração.', 'error'))
      .finally(() => setFetching(false));
  }, [id]);

  const set = <K extends keyof AttractionRequest>(key: K, val: AttractionRequest[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name) e.name = 'Nome é obrigatório';
    if (!form.description) e.description = 'Descrição é obrigatória';
    if (!form.address) e.address = 'Endereço é obrigatório';
    if (!form.category) e.category = 'Categoria é obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit) {
        await attractionsService.update(id, form);
        showToast('Atração atualizada com sucesso!', 'success');
      } else {
        const created = await attractionsService.create(form);
        await Promise.allSettled(
          pendingFiles.map((f) => photosService.uploadForEntity('attractions', created.id, f))
        );
        showToast('Atração criada com sucesso!', 'success');
      }
      navigate('/admin/attractions');
    } catch {
      showToast('Erro ao salvar atração.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Spinner center size="lg" />;

  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">{isEdit ? 'Editar Atração' : 'Nova Atração'}</h2>
        <button className="adm-btn adm-btn--ghost" onClick={() => navigate('/admin/attractions')}>← Voltar</button>
      </div>

      <div className="adm-card">
        <form className="adm-form" onSubmit={handleSubmit}>
          <div className="adm-form-row">
            <FormInput label="Nome" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} required />
            <FormSelect label="Categoria" value={form.category} onChange={(e) => set('category', e.target.value as AttractionCategory)} error={errors.category} required>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </FormSelect>
          </div>
          <FormTextarea label="Descrição" value={form.description} onChange={(e) => set('description', e.target.value)} error={errors.description} required maxLength={300} />
          <FormInput label="Endereço" value={form.address} onChange={(e) => set('address', e.target.value)} error={errors.address} required />
          <div className="adm-form-row">
            <FormInput label="Telefone" value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
            <FormInput label="Email" type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="adm-form-row">
            <FormInput label="Website" type="url" value={form.webUrl ?? ''} onChange={(e) => set('webUrl', e.target.value)} />
            <FormInput label="Instagram" value={form.instagramUrl ?? ''} onChange={(e) => set('instagramUrl', e.target.value)} />
          </div>
          <div className="adm-form-row">
            <FormInput label="Horário de Funcionamento" value={form.openingHours ?? ''} onChange={(e) => set('openingHours', e.target.value)} hint="Ex: Seg-Sex 08:00-17:00" />
            <FormInput label="Preço de Entrada (R$)" type="number" value={form.entryPrice ?? ''} onChange={(e) => set('entryPrice', e.target.value ? Number(e.target.value) : undefined)} />
          </div>
          <div className="adm-form-row">
            <FormInput label="Duração Média (min)" type="number" value={form.averageVisitDuration ?? ''} onChange={(e) => set('averageVisitDuration', e.target.value ? Number(e.target.value) : undefined)} />
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <FormToggle label="Possui Guia" checked={!!form.hasGuide} onChange={(v) => set('hasGuide', v)} />
            <FormToggle label="Ativo" checked={form.active} onChange={(v) => set('active', v)} />
          </div>

          {!isEdit && <PhotoPicker files={pendingFiles} onChange={setPendingFiles} />}

          <div className="adm-form-actions">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={() => navigate('/admin/attractions')}>Cancelar</button>
            <button type="submit" className="adm-btn adm-btn--primary" disabled={loading}>
              {loading ? 'Salvando…' : isEdit ? 'Atualizar' : 'Criar Atração'}
            </button>
          </div>
        </form>
      </div>

      {isEdit && id && (
        <PhotoManager entityPath="attractions" entityId={id} initialPhotos={photos} />
      )}
    </div>
  );
}
