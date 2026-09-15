import { useState, useEffect, type FormEvent } from 'react';
import { companyService } from '../../admin/services/companyService';
import { useToast } from '../../admin/components/Toast';
import { Spinner } from '../../admin/components/Spinner';
import { ConfirmModal } from '../../admin/components/Modal';
import { FormInput, FormToggle } from '../../admin/components/FormField';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import type { GastronomyItemResponse, GastronomyItemRequest, CompanyEstablishmentResponse } from '../../admin/types';

const EMPTY: GastronomyItemRequest = { name: '', displayOrder: undefined, active: true };

export function MenuItemsPage() {
  const { showToast } = useToast();
  const [fetching, setFetching] = useState(true);
  const [establishment, setEstablishment] = useState<CompanyEstablishmentResponse | null>(null);
  const [items, setItems] = useState<GastronomyItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<GastronomyItemResponse | null>(null);
  const [form, setForm] = useState<GastronomyItemRequest>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setFetching(true);
    companyService.getMyEstablishment()
      .then(setEstablishment)
      .catch(() => showToast('Erro ao carregar seu estabelecimento.', 'error'))
      .finally(() => setFetching(false));
  }, []);

  const load = () => {
    setLoading(true);
    companyService.getMenuItems()
      .then(setItems)
      .catch(() => showToast('Erro ao carregar itens.', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (establishment?.type === 'RESTAURANT') load();
  }, [establishment]);

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
        await companyService.updateMenuItem(editItem.id, form);
        showToast('Item atualizado!', 'success');
      } else {
        await companyService.createMenuItem(form);
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
      await companyService.deleteMenuItem(deleteId);
      showToast('Item removido.', 'success');
      setDeleteId(null);
      load();
    } catch { showToast('Erro ao remover.', 'error'); }
    finally { setDeleting(false); }
  };

  if (fetching) return <Spinner center size="lg" />;

  if (establishment?.type !== 'RESTAURANT') {
    return (
      <div>
        <div className="adm-page-header">
          <h2 className="adm-page-title">Cardápio</h2>
        </div>
        <div className="adm-card" style={{ padding: 24, textAlign: 'center', color: 'var(--adm-text-muted)' }}>
          {establishment
            ? 'Cardápio disponível apenas para estabelecimentos do tipo Restaurante.'
            : 'Cadastre seu estabelecimento como Restaurante para gerenciar o cardápio.'}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">Cardápio <span>{items.length} itens</span></h2>
        <button className="adm-btn adm-btn--primary" onClick={openNew}><Plus size={16} /> Novo Item</button>
      </div>

      {showForm && (
        <div className="adm-card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{editItem ? 'Editar Item' : 'Novo Item'}</h3>
            <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={closeForm}><X size={16} /></button>
          </div>
          <form className="adm-form" onSubmit={handleSubmit}>
            <div className="adm-form-row">
              <FormInput label="Nome" value={form.name} onChange={(e) => set('name', e.target.value)} required />
              <FormInput label="Ordem de Exibição" type="number" value={form.displayOrder ?? ''} onChange={(e) => set('displayOrder', e.target.value ? Number(e.target.value) : undefined)} hint="Menor número aparece primeiro" />
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
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--adm-text-muted)', fontSize: 13 }}>
                        Sem imagem
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
                      <button className="adm-btn adm-btn--ghost adm-btn--sm" title="Editar" onClick={() => openEdit(item)}><Pencil size={13} /></button>
                      <button className="adm-btn adm-btn--danger adm-btn--sm" title="Deletar" onClick={() => setDeleteId(item.id)} style={{ marginLeft: 'auto' }}><Trash2 size={13} /></button>
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
    </div>
  );
}
