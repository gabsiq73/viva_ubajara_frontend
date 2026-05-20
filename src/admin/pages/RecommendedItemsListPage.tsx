import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { recommendedItemsService } from '../services/recommendedItemsService';
import { useToast } from '../components/Toast';
import { DataTable, Pagination } from '../components/DataTable';
import { ConfirmModal } from '../components/Modal';
import type { RecommendedItemResponse } from '../types';
import type { ReactNode } from 'react';
import { Star, StarOff, Pencil, Trash2, Search, Plus } from 'lucide-react';

export function RecommendedItemsListPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [items, setItems] = useState<RecommendedItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await recommendedItemsService.getAll(page, 10);
      setItems(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch {
      showToast('Erro ao carregar itens recomendados.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const filtered = search.trim()
    ? items.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.category.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await recommendedItemsService.delete(deleteTarget);
      showToast('Item removido com sucesso.', 'success');
      setDeleteTarget(null);
      load();
    } catch {
      showToast('Erro ao remover item.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Título',
      accessor: (item: RecommendedItemResponse): ReactNode => (
        <div>
          <strong>{item.name}</strong>
          {item.shortDescription && (
            <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>{item.shortDescription}</p>
          )}
        </div>
      ),
    },
    { header: 'Categoria', accessor: 'category' as keyof RecommendedItemResponse },
    {
      header: 'Destaque',
      accessor: (item: RecommendedItemResponse): ReactNode =>
        item.featured
          ? <span style={{ color: '#d97706', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Star size={14} fill="currentColor" /> Destaque</span>
          : <span style={{ color: '#9ca3af', display: 'inline-flex', alignItems: 'center', gap: 4 }}><StarOff size={14} /> Padrão</span>,
    },
    {
      header: 'Status',
      accessor: (item: RecommendedItemResponse): ReactNode => (
        <span className={`adm-badge ${item.active ? 'adm-badge--green' : 'adm-badge--gray'}`}>
          {item.active ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      header: 'Ações',
      width: '100px',
      accessor: (item: RecommendedItemResponse): ReactNode => (
        <div className="adm-table__actions">
          <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => navigate(`/admin/recommended-items/${item.id}/edit`)}>
            <Pencil size={14} />
          </button>
          <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => setDeleteTarget(item.id)}>
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">Itens Recomendados <span>{totalElements} registros</span></h2>
        <button className="adm-btn adm-btn--primary" onClick={() => navigate('/admin/recommended-items/new')}>
          <Plus size={16} /> Novo Item
        </button>
      </div>

      <div className="adm-card">
        <div className="adm-search">
          <span className="adm-search__icon"><Search size={18} /></span>
          <input
            placeholder="Buscar por título ou categoria…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          keyField="id"
          loading={loading}
          emptyMessage="Nenhum item recomendado cadastrado."
        />
        <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Deletar Item"
        message="Tem certeza que deseja remover este item recomendado?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
