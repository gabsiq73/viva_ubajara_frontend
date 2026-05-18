import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tourGuidesService } from '../services/tourGuidesService';
import { useToast } from '../components/Toast';
import { FormInput, FormTextarea, FormToggle } from '../components/FormField';
import { Spinner } from '../components/Spinner';
import { PhotoManager } from '../components/PhotoManager';
import type { TourGuideRequest, PhotoResponse } from '../types';

const EMPTY: TourGuideRequest = { name: '', phone: '', email: '', languages: [], description: '', active: true };

export function TourGuideFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState<TourGuideRequest>(EMPTY);
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);
  const [langInput, setLangInput] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof TourGuideRequest, string>>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    setFetching(true);
    tourGuidesService.getById(id).then((d) => {
      setForm(d);
      setLangInput((d.languages ?? []).join(', '));
      setPhotos(d.photos ?? []);
    }).catch(() => showToast('Erro ao carregar.', 'error')).finally(() => setFetching(false));
  }, [id]);

  const set = <K extends keyof TourGuideRequest>(key: K, val: TourGuideRequest[K]) => setForm((p) => ({ ...p, [key]: val }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name) e.name = 'Obrigatório';
    if (!form.phone) e.phone = 'Obrigatório';
    if (!form.email) e.email = 'Obrigatório';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); if (!validate()) return;
    const languages = langInput.split(',').map((s) => s.trim()).filter(Boolean);
    setLoading(true);
    try {
      const payload = { ...form, languages };
      if (isEdit) {
        await tourGuidesService.update(id, payload);
        showToast('Guia atualizado!', 'success');
        navigate('/admin/tour-guides');
      } else {
        const created = await tourGuidesService.create(payload);
        showToast('Guia criado! Agora você pode adicionar fotos.', 'success');
        navigate(`/admin/tour-guides/${created.id}`);
      }
    } catch { showToast('Erro ao salvar.', 'error'); }
    finally { setLoading(false); }
  };

  if (fetching) return <Spinner center size="lg" />;
  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">{isEdit ? 'Editar Guia' : 'Novo Guia'}</h2>
        <button className="adm-btn adm-btn--ghost" onClick={() => navigate('/admin/tour-guides')}>← Voltar</button>
      </div>
      <div className="adm-card">
        <form className="adm-form" onSubmit={handleSubmit}>
          <FormInput label="Nome" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} required />
          <div className="adm-form-row">
            <FormInput label="Telefone" value={form.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} required />
            <FormInput label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} required />
          </div>
          <FormInput label="Idiomas" value={langInput} onChange={(e) => setLangInput(e.target.value)} hint="Separe por vírgula. Ex: Português, Inglês, Espanhol" />
          <FormTextarea label="Descrição" value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} />
          <FormToggle label="Ativo" checked={form.active} onChange={(v) => set('active', v)} />
          <div className="adm-form-actions">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={() => navigate('/admin/tour-guides')}>Cancelar</button>
            <button type="submit" className="adm-btn adm-btn--primary" disabled={loading}>{loading ? 'Salvando…' : isEdit ? 'Atualizar' : 'Criar'}</button>
          </div>
        </form>
      </div>
      {isEdit && id && (
        <PhotoManager entityPath="tour-guides" entityId={id} initialPhotos={photos} />
      )}
    </div>
  );
}
