import { useState, useEffect, useRef, type FormEvent } from 'react';
import { gastronomyItemsService } from '../services/gastronomyItemsService';
import { useToast } from '../components/Toast';
import { Spinner } from '../components/Spinner';
import { ConfirmModal } from '../components/Modal';
import { RemovePhotoDialog } from '../components/RemovePhotoDialog';
import { FormInput, FormToggle } from '../components/FormField';
import { Plus, Pencil, Trash2, Upload, X } from 'lucide-react';
import { countLabel } from '../utils/countLabel';
import { useBrokenImage } from '../../hooks/useBrokenImage';
import type { GastronomyItemResponse, GastronomyItemRequest } from '../types';

const EMPTY: GastronomyItemRequest = { name: '', displayOrder: undefined, active: true };

function ItemImage({ url, name }: { url?: string | null; name: string }) {
  const image = useBrokenImage(url);
  return image.show ? (
    <img src={url!} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={image.onError} />
  ) : (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--adm-text-muted)', fontSize: 13 }}>
      Sem imagem
    </div>
  );
}

export function GastronomyItemsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<GastronomyItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<GastronomyItemResponse | null>(null);
  const [form, setForm] = useState<GastronomyItemRequest>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [removeImageId, setRemoveImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetId = useRef<string | null>(null);

  const load = () => {
    setLoading(true);
    gastronomyItemsService.getAll()
      .then(setItems)
      .catch(() => showToast('Erro ao carregar itens.', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditItem(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (item: GastronomyItemResponse) => {
    setEditItem(item);
    setForm({ name: item.name, displayOrder: item.displayOrder ?? undefined, active: item.active });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditItem(null); };

  const set = <K extends keyof GastronomyItemRequest>(key: K, val: GastronomyItemRequest[K]) =>
    setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { showToast('Nome é obrigatório.', 'error'); return; }
    setSaving(true);
    try {
      if (editItem) {
        await gastronomyItemsService.update(editItem.id, form);
        showToast('Item atualizado!', 'success');
      } else {
        await gastronomyItemsService.create(form);
        showToast('Item criado!', 'success');
      }
      closeForm();
      load();
    } catch { showToast('Erro ao salvar.', 'error'); }
    finally { setSaving(false); }
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await gastronomyItemsService.delete(deleteId);
      showToast('Item removido.', 'success');
      setDeleteId(null);
      load();
    } catch { showToast('Erro ao remover.', 'error'); }
    finally { setDeleting(false); }
  };

  const triggerUpload = (id: string) => {
    uploadTargetId.current = id;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const id = uploadTargetId.current;
    if (!file || !id) return;
    e.target.value = '';
    setUploadingId(id);
    try {
      await gastronomyItemsService.uploadImage(id, file);
      showToast('Imagem enviada!', 'success');
      load();
    } catch { showToast('Erro ao enviar imagem.', 'error'); }
    finally { setUploadingId(null); }
  };

  const handleRemoveImage = async (id: string) => {
    setUploadingId(id);
    try {
      await gastronomyItemsService.removeImage(id);
      showToast('Imagem removida.', 'success');
      load();
    } catch { showToast('Erro ao remover imagem.', 'error'); }
    finally { setUploadingId(null); setRemoveImageId(null); }
  };

  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">Gastronomia <span>{countLabel(items.length, 'item', 'itens')}</span></h2>
        <button className="adm-btn adm-btn--primary" onClick={openNew}><Plus size={16} aria-hidden="true" /> Novo Item</button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

      {showForm && (
        <div className="adm-card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{editItem ? 'Editar Item' : 'Novo Item'}</h3>
            <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={closeForm} aria-label="Fechar formulário"><X size={16} aria-hidden="true" /></button>
          </div>
          <form className="adm-form" onSubmit={handleSubmit}>
            <div className="adm-form-row">
              <FormInput label="Nome" value={form.name} onChange={(e) => set('name', e.target.value)} required />
              <FormInput label="Ordem de Exibição" type="number" inputMode="numeric" min={0} value={form.displayOrder ?? ''} onChange={(e) => set('displayOrder', e.target.value ? Number(e.target.value) : undefined)} hint="Menor número aparece primeiro" />
            </div>
            <FormToggle label="Ativo" checked={form.active} onChange={(v) => set('active', v)} />
            <div className="adm-form-actions">
              <button type="button" className="adm-btn adm-btn--ghost" onClick={closeForm}>Cancelar</button>
              <button type="submit" className="adm-btn adm-btn--primary" disabled={saving}>{saving ? 'Salvando…' : editItem ? 'Atualizar' : 'Criar'}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <Spinner center size="lg" /> : (
        <div className="adm-card">
          {items.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--adm-text-muted)', padding: '32px 0' }}>Nenhum item cadastrado.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {items.map((item) => (
                <div key={item.id} style={{ border: '1px solid var(--adm-border)', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
                  <div style={{ position: 'relative', aspectRatio: '4/3', background: '#f5f5f5' }}>
                    <ItemImage url={item.imageUrl} name={item.name} />
                    {uploadingId === item.id && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Spinner size="sm" />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--adm-text-muted)', marginBottom: 8 }}>
                      {item.active ? 'Ativo' : 'Inativo'}
                      {item.displayOrder != null ? ` · Ordem ${item.displayOrder}` : ''}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="adm-btn adm-btn--ghost adm-btn--sm" title="Editar" aria-label={`Editar ${item.name}`} onClick={() => openEdit(item)}><Pencil size={13} aria-hidden="true" /></button>
                      <button className="adm-btn adm-btn--ghost adm-btn--sm" title="Upload imagem" aria-label={`Enviar imagem de ${item.name}`} onClick={() => triggerUpload(item.id)}><Upload size={13} aria-hidden="true" /></button>
                      {item.imageUrl && (
                        <button className="adm-btn adm-btn--ghost adm-btn--sm" title="Remover imagem" aria-label={`Remover imagem de ${item.name}`} onClick={() => setRemoveImageId(item.id)}><X size={13} aria-hidden="true" /></button>
                      )}
                      <button className="adm-btn adm-btn--danger adm-btn--sm" title="Deletar" aria-label={`Deletar ${item.name}`} onClick={() => setDeleteId(item.id)} style={{ marginLeft: 'auto' }}><Trash2 size={13} aria-hidden="true" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Deletar Item"
        message="Tem certeza que deseja deletar este item de gastronomia?"
        onConfirm={executeDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />

      {removeImageId && (
        <RemovePhotoDialog
          loading={uploadingId === removeImageId}
          onConfirm={() => handleRemoveImage(removeImageId)}
          onCancel={() => setRemoveImageId(null)}
        />
      )}
    </div>
  );
}
