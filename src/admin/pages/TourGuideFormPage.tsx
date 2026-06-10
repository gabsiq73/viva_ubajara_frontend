import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tourGuidesService } from '../services/tourGuidesService';
import { photosService } from '../services/photosService';
import { useToast } from '../components/Toast';
import { FormInput, FormTextarea, FormToggle } from '../components/FormField';
import { RolePhotoSlot } from '../components/RolePhotoSlot';
import { Spinner } from '../components/Spinner';
import { PhotoManager } from '../components/PhotoManager';
import type { TourGuideRequest, PhotoResponse } from '../types';

const EMPTY: TourGuideRequest = { name: '', phone: '', email: '', languages: [], description: '', active: true };
const ROLE_DESCS = ['cover', 'card'];

export function TourGuideFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState<TourGuideRequest>(EMPTY);
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [cardFile, setCardFile] = useState<File | null>(null);
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
      } else {
        const created = await tourGuidesService.create(payload);
        const uploads: Promise<unknown>[] = [];
        if (coverFile) uploads.push(photosService.uploadForEntity('tour-guides', created.id, coverFile, 'cover'));
        if (cardFile) uploads.push(photosService.uploadForEntity('tour-guides', created.id, cardFile, 'card'));
        await Promise.allSettled(uploads);
        showToast('Guia criado com sucesso!', 'success');
      }
      navigate('/admin/tour-guides');
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
          <FormTextarea label="Descrição" value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} maxLength={600} />
          <FormToggle label="Ativo" checked={form.active} onChange={(v) => set('active', v)} />

          <div className="adm-role-slots-section">
            <p className="adm-role-slots-section__title">Fotos</p>
            <div className="adm-role-slots-grid">
              <RolePhotoSlot
                label="Capa"
                hint="Foto principal do guia turístico"
                roleDescription="cover"
                {...(isEdit
                  ? { entityPath: 'tour-guides', entityId: id, existingPhoto: coverPhoto, onPhotoUpdate: handleRoleUpdate('cover') }
                  : { pendingFile: coverFile, onPendingFileChange: setCoverFile })}
              />
              <RolePhotoSlot
                label="Foto do Card"
                hint="Miniatura exibida na listagem de guias"
                roleDescription="card"
                {...(isEdit
                  ? { entityPath: 'tour-guides', entityId: id, existingPhoto: cardPhoto, onPhotoUpdate: handleRoleUpdate('card') }
                  : { pendingFile: cardFile, onPendingFileChange: setCardFile })}
              />
            </div>
          </div>

          <div className="adm-form-actions">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={() => navigate('/admin/tour-guides')}>Cancelar</button>
            <button type="submit" className="adm-btn adm-btn--primary" disabled={loading}>{loading ? 'Salvando…' : isEdit ? 'Atualizar' : 'Criar'}</button>
          </div>
        </form>
      </div>
      {isEdit && id && <PhotoManager entityPath="tour-guides" entityId={id} initialPhotos={galleryPhotos} />}
    </div>
  );
}
