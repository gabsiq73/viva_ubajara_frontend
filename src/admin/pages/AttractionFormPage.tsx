import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { attractionsService } from '../services/attractionsService';
import { touristSpotsService } from '../services/touristSpotsService';
import { photosService } from '../services/photosService';
import { useToast } from '../components/Toast';
import { FormInput, FormTextarea, FormSelect, FormToggle } from '../components/FormField';
import { RolePhotoSlot } from '../components/RolePhotoSlot';
import { Spinner } from '../components/Spinner';
import { PhotoManager } from '../components/PhotoManager';
import type { AttractionRequest, AttractionCategory, PhotoResponse, TouristSpotSummary } from '../types';

const CATEGORIES: { value: AttractionCategory; label: string }[] = [
  { value: 'PARK', label: 'Parque' },
  { value: 'WATERFALL', label: 'Cachoeira' },
  { value: 'MUSEUM', label: 'Museu' },
  { value: 'FARM', label: 'Fazenda' },
  { value: 'ROUTE', label: 'Rota' },
  { value: 'MARKET', label: 'Mercado' },
];

const EMPTY: AttractionRequest = {
  name: '', description: '', shortDescription: '', address: '', phone: '', email: '',
  webUrl: '', instagramUrl: '', mapsUrl: '', active: true, openToPublic: true, freeAccess: false,
  openingHours: '', entryPrice: undefined, hasGuide: false, averageVisitDuration: undefined,
  category: 'PARK', linkedSpotIds: [],
};

const ROLE_DESCS = ['cover', 'how_to_get', 'card'];

export function AttractionFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState<AttractionRequest>(EMPTY);
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);
  const [allSpots, setAllSpots] = useState<TouristSpotSummary[]>([]);

  // Create-mode pending files per role
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [howToGetFile, setHowToGetFile] = useState<File | null>(null);
  const [cardFile, setCardFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<Partial<Record<keyof AttractionRequest, string>>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    touristSpotsService.getAll(0, 200).then((page) => {
      setAllSpots(page.content.map((s) => ({ id: s.id, name: s.name })));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    setFetching(true);
    attractionsService.getById(id).then((data) => {
      setForm({
        ...data,
        entryPrice: data.entryPrice ?? undefined,
        averageVisitDuration: data.averageVisitDuration ?? undefined,
        linkedSpotIds: data.linkedSpots?.map((s) => s.id) ?? [],
      });
      setPhotos(data.photos ?? []);
    }).catch(() => showToast('Erro ao carregar atração.', 'error'))
      .finally(() => setFetching(false));
  }, [id]);

  const set = <K extends keyof AttractionRequest>(key: K, val: AttractionRequest[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const toggleLinkedSpot = (id: string) => {
    setForm((prev) => {
      const ids = prev.linkedSpotIds ?? [];
      return {
        ...prev,
        linkedSpotIds: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
      };
    });
  };

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
        const uploads: Promise<unknown>[] = [];
        if (coverFile) uploads.push(photosService.uploadForEntity('attractions', created.id, coverFile, 'cover'));
        if (howToGetFile) uploads.push(photosService.uploadForEntity('attractions', created.id, howToGetFile, 'how_to_get'));
        if (cardFile) uploads.push(photosService.uploadForEntity('attractions', created.id, cardFile, 'card'));
        await Promise.allSettled(uploads);
        showToast('Atração criada com sucesso!', 'success');
      }
      navigate('/admin/attractions');
    } catch {
      showToast('Erro ao salvar atração.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Derive role photos from photos list
  const coverPhoto = photos.find(p => p.description === 'cover') ?? null;
  const howToGetPhoto = photos.find(p => p.description === 'how_to_get') ?? null;
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
          <FormTextarea label="Descrição Completa" value={form.description} onChange={(e) => set('description', e.target.value)} error={errors.description} required maxLength={300} />
          <FormInput label="Descrição Curta (exibida no topo da página e nos cards)" value={form.shortDescription ?? ''} onChange={(e) => set('shortDescription', e.target.value)} maxLength={200} hint="Máx. 200 caracteres — texto breve e impactante" />
          <FormInput label="Endereço" value={form.address} onChange={(e) => set('address', e.target.value)} error={errors.address} required />
          <div className="adm-form-row">
            <FormInput label="Telefone" value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
            <FormInput label="Email" type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="adm-form-row">
            <FormInput label="Website" type="url" value={form.webUrl ?? ''} onChange={(e) => set('webUrl', e.target.value)} />
            <FormInput label="Instagram" value={form.instagramUrl ?? ''} onChange={(e) => set('instagramUrl', e.target.value)} />
          </div>
          <FormInput label="URL Google Maps" type="url" value={form.mapsUrl ?? ''} onChange={(e) => set('mapsUrl', e.target.value)} hint="Link para o local no Google Maps — usado no botão 'Como Chegar'" />
          <div className="adm-form-row">
            <FormInput label="Horário de Funcionamento" value={form.openingHours ?? ''} onChange={(e) => set('openingHours', e.target.value)} hint="Ex: Seg-Sex 08:00-17:00" />
            <FormInput label="Preço de Entrada (R$)" type="number" value={form.entryPrice ?? ''} onChange={(e) => set('entryPrice', e.target.value ? Number(e.target.value) : undefined)} />
          </div>
          <div className="adm-form-row">
            <FormInput label="Duração Média (min)" type="number" value={form.averageVisitDuration ?? ''} onChange={(e) => set('averageVisitDuration', e.target.value ? Number(e.target.value) : undefined)} />
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <FormToggle label="Possui Guia" checked={!!form.hasGuide} onChange={(v) => set('hasGuide', v)} />
            <FormToggle label="Aberto ao Público" checked={!!form.openToPublic} onChange={(v) => set('openToPublic', v)} />
            <FormToggle label="Acesso Livre" checked={!!form.freeAccess} onChange={(v) => set('freeAccess', v)} />
            <FormToggle label="Ativo" checked={form.active} onChange={(v) => set('active', v)} />
          </div>

          {allSpots.length > 0 && (
            <div className="adm-role-slots-section">
              <p className="adm-role-slots-section__title">Pontos Turísticos Vinculados</p>
              <p style={{ fontSize: 12, color: 'var(--adm-text-muted)', marginBottom: 12 }}>
                Selecione os pontos turísticos que aparecem nesta atração (visíveis na página pública).
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {allSpots.map((spot) => {
                  const selected = (form.linkedSpotIds ?? []).includes(spot.id);
                  return (
                    <button
                      key={spot.id}
                      type="button"
                      onClick={() => toggleLinkedSpot(spot.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 20,
                        border: `2px solid ${selected ? 'var(--adm-green)' : 'var(--adm-border)'}`,
                        background: selected ? 'var(--adm-green-dim)' : 'transparent',
                        color: selected ? 'var(--adm-green)' : 'var(--adm-text-muted)',
                        fontSize: 13,
                        fontWeight: selected ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {selected ? '✓ ' : ''}{spot.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="adm-role-slots-section">
            <p className="adm-role-slots-section__title">Fotos</p>
            <div className="adm-role-slots-grid">
              <RolePhotoSlot
                label="Foto de Capa"
                hint="Hero da página e seção 'Como Chegar'"
                roleDescription="cover"
                {...(isEdit
                  ? { entityPath: 'attractions', entityId: id, existingPhoto: coverPhoto, onPhotoUpdate: handleRoleUpdate('cover') }
                  : { pendingFile: coverFile, onPendingFileChange: setCoverFile })}
              />
              <RolePhotoSlot
                label="Foto Como Chegar"
                hint="Imagem na seção de direções"
                roleDescription="how_to_get"
                {...(isEdit
                  ? { entityPath: 'attractions', entityId: id, existingPhoto: howToGetPhoto, onPhotoUpdate: handleRoleUpdate('how_to_get') }
                  : { pendingFile: howToGetFile, onPendingFileChange: setHowToGetFile })}
              />
              <RolePhotoSlot
                label="Foto do Card"
                hint="Miniatura nos cards da listagem"
                roleDescription="card"
                {...(isEdit
                  ? { entityPath: 'attractions', entityId: id, existingPhoto: cardPhoto, onPhotoUpdate: handleRoleUpdate('card') }
                  : { pendingFile: cardFile, onPendingFileChange: setCardFile })}
              />
            </div>
          </div>

          <div className="adm-form-actions">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={() => navigate('/admin/attractions')}>Cancelar</button>
            <button type="submit" className="adm-btn adm-btn--primary" disabled={loading}>
              {loading ? 'Salvando…' : isEdit ? 'Atualizar' : 'Criar Atração'}
            </button>
          </div>
        </form>
      </div>

      {isEdit && id && (
        <PhotoManager entityPath="attractions" entityId={id} initialPhotos={galleryPhotos} />
      )}
    </div>
  );
}
