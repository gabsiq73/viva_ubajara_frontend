import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { recommendedItemsService } from '../services/recommendedItemsService';
import { photosService } from '../services/photosService';
import { useToast } from '../components/Toast';
import { FormInput, FormTextarea, FormToggle } from '../components/FormField';
import { RolePhotoSlot } from '../components/RolePhotoSlot';
import { Spinner } from '../components/Spinner';
import { PhotoManager } from '../components/PhotoManager';
import type { RecommendedItemRequest, PhotoResponse } from '../types';

const CATEGORIES = [
  'Gastronomia', 'Aventura', 'Cultura', 'Natureza', 'Hospedagem',
  'Compras', 'Arte', 'Religioso', 'Esporte', 'Outro',
];

const EMPTY: RecommendedItemRequest = {
  name: '', description: '', shortDescription: '', address: '',
  webUrl: '', mapsUrl: '', category: 'Natureza', featured: false, active: true,
};

const ROLE_DESCS = ['cover', 'card'];

export function RecommendedItemFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState<RecommendedItemRequest>(EMPTY);
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [cardFile, setCardFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof RecommendedItemRequest, string>>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    setFetching(true);
    recommendedItemsService.getById(id).then((data) => {
      setForm({ ...data });
      setPhotos(data.photos ?? []);
    }).catch(() => showToast('Erro ao carregar item.', 'error'))
      .finally(() => setFetching(false));
  }, [id]);

  const set = <K extends keyof RecommendedItemRequest>(key: K, val: RecommendedItemRequest[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name) e.name = 'Título é obrigatório';
    if (!form.description) e.description = 'Descrição é obrigatória';
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
        await recommendedItemsService.update(id, form);
        showToast('Item atualizado com sucesso!', 'success');
      } else {
        const created = await recommendedItemsService.create(form);
        const uploads: Promise<unknown>[] = [];
        if (coverFile) uploads.push(photosService.uploadForEntity('recommended-items', created.id, coverFile, 'cover'));
        if (cardFile) uploads.push(photosService.uploadForEntity('recommended-items', created.id, cardFile, 'card'));
        await Promise.allSettled(uploads);
        showToast('Item criado com sucesso!', 'success');
      }
      navigate('/admin/recommended-items');
    } catch {
      showToast('Erro ao salvar item.', 'error');
    } finally {
      setLoading(false);
    }
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
        <h2 className="adm-page-title">{isEdit ? 'Editar Item Recomendado' : 'Novo Item Recomendado'}</h2>
        <button className="adm-btn adm-btn--ghost" onClick={() => navigate('/admin/recommended-items')}>← Voltar</button>
      </div>

      <div className="adm-card">
        <form className="adm-form" onSubmit={handleSubmit}>
          <div className="adm-form-row">
            <FormInput label="Título" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} required />
            <div className="adm-field">
              <label className="adm-label">Categoria <span className="adm-required">*</span></label>
              <select
                className="adm-select"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <span className="adm-error">{errors.category}</span>}
            </div>
          </div>

          <FormTextarea
            label="Descrição Completa"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            error={errors.description}
            required
            maxLength={600}
          />
          <FormInput
            label="Descrição Curta (exibida nos cards)"
            value={form.shortDescription ?? ''}
            onChange={(e) => set('shortDescription', e.target.value)}
            maxLength={200}
            hint="Máx. 200 caracteres"
          />
          <FormInput
            label="Endereço / Localização"
            value={form.address ?? ''}
            onChange={(e) => set('address', e.target.value)}
          />

          <div className="adm-form-row">
            <FormInput label="Website" type="url" value={form.webUrl ?? ''} onChange={(e) => set('webUrl', e.target.value)} />
            <FormInput label="URL Google Maps" type="url" value={form.mapsUrl ?? ''} onChange={(e) => set('mapsUrl', e.target.value)} hint="Link direto no Google Maps" />
          </div>

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <FormToggle label="Destaque" checked={!!form.featured} onChange={(v) => set('featured', v)} />
            <FormToggle label="Ativo" checked={form.active} onChange={(v) => set('active', v)} />
          </div>

          <div className="adm-role-slots-section">
            <p className="adm-role-slots-section__title">Fotos</p>
            <div className="adm-role-slots-grid">
              <RolePhotoSlot
                label="Foto de Capa"
                hint="Imagem principal da página do item"
                roleDescription="cover"
                {...(isEdit
                  ? { entityPath: 'recommended-items', entityId: id, existingPhoto: coverPhoto, onPhotoUpdate: handleRoleUpdate('cover') }
                  : { pendingFile: coverFile, onPendingFileChange: setCoverFile })}
              />
              <RolePhotoSlot
                label="Foto do Card"
                hint="Miniatura exibida na listagem"
                roleDescription="card"
                {...(isEdit
                  ? { entityPath: 'recommended-items', entityId: id, existingPhoto: cardPhoto, onPhotoUpdate: handleRoleUpdate('card') }
                  : { pendingFile: cardFile, onPendingFileChange: setCardFile })}
              />
            </div>
          </div>

          <div className="adm-form-actions">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={() => navigate('/admin/recommended-items')}>Cancelar</button>
            <button type="submit" className="adm-btn adm-btn--primary" disabled={loading}>
              {loading ? 'Salvando…' : isEdit ? 'Atualizar' : 'Criar Item'}
            </button>
          </div>
        </form>
      </div>

      {isEdit && id && (
        <PhotoManager entityPath="recommended-items" entityId={id} initialPhotos={galleryPhotos} />
      )}
    </div>
  );
}
