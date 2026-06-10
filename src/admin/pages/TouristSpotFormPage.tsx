import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { touristSpotsService } from '../services/touristSpotsService';
import { photosService } from '../services/photosService';
import { useToast } from '../components/Toast';
import { FormInput, FormTextarea, FormToggle } from '../components/FormField';
import { RolePhotoSlot } from '../components/RolePhotoSlot';
import { Spinner } from '../components/Spinner';
import { PhotoManager } from '../components/PhotoManager';
import type { TouristSpotRequest, PhotoResponse } from '../types';

const EMPTY: TouristSpotRequest = { name: '', description: '', address: '', phone: '', email: '', webUrl: '', instagramUrl: '', active: true };
const ROLE_DESCS = ['cover', 'card'];

export function TouristSpotFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState<TouristSpotRequest>(EMPTY);
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [cardFile, setCardFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof TouristSpotRequest, string>>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    setFetching(true);
    touristSpotsService.getById(id).then((d) => {
      setForm(d);
      setPhotos(d.photos ?? []);
    }).catch(() => showToast('Erro ao carregar.', 'error')).finally(() => setFetching(false));
  }, [id]);

  const set = <K extends keyof TouristSpotRequest>(key: K, val: TouristSpotRequest[K]) => setForm((p) => ({ ...p, [key]: val }));

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
        await touristSpotsService.update(id, form);
        showToast('Ponto turístico atualizado!', 'success');
      } else {
        const created = await touristSpotsService.create(form);
        const uploads: Promise<unknown>[] = [];
        if (coverFile) uploads.push(photosService.uploadForEntity('tourist-spots', created.id, coverFile, 'cover'));
        if (cardFile) uploads.push(photosService.uploadForEntity('tourist-spots', created.id, cardFile, 'card'));
        await Promise.allSettled(uploads);
        showToast('Ponto turístico criado com sucesso!', 'success');
      }
      navigate('/admin/tourist-spots');
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
        <h2 className="adm-page-title">{isEdit ? 'Editar Ponto Turístico' : 'Novo Ponto Turístico'}</h2>
        <button className="adm-btn adm-btn--ghost" onClick={() => navigate('/admin/tourist-spots')}>← Voltar</button>
      </div>
      <div className="adm-card">
        <form className="adm-form" onSubmit={handleSubmit}>
          <FormInput label="Nome" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} required />
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
          <FormToggle label="Ativo" checked={form.active} onChange={(v) => set('active', v)} />

          <div className="adm-role-slots-section">
            <p className="adm-role-slots-section__title">Fotos</p>
            <div className="adm-role-slots-grid">
              <RolePhotoSlot
                label="Foto de Capa"
                hint="Imagem principal da página do ponto turístico"
                roleDescription="cover"
                {...(isEdit
                  ? { entityPath: 'tourist-spots', entityId: id, existingPhoto: coverPhoto, onPhotoUpdate: handleRoleUpdate('cover') }
                  : { pendingFile: coverFile, onPendingFileChange: setCoverFile })}
              />
              <RolePhotoSlot
                label="Foto do Card"
                hint="Miniatura exibida na listagem"
                roleDescription="card"
                {...(isEdit
                  ? { entityPath: 'tourist-spots', entityId: id, existingPhoto: cardPhoto, onPhotoUpdate: handleRoleUpdate('card') }
                  : { pendingFile: cardFile, onPendingFileChange: setCardFile })}
              />
            </div>
          </div>

          <div className="adm-form-actions">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={() => navigate('/admin/tourist-spots')}>Cancelar</button>
            <button type="submit" className="adm-btn adm-btn--primary" disabled={loading}>{loading ? 'Salvando…' : isEdit ? 'Atualizar' : 'Criar'}</button>
          </div>
        </form>
      </div>
      {isEdit && id && <PhotoManager entityPath="tourist-spots" entityId={id} initialPhotos={galleryPhotos} />}
    </div>
  );
}
