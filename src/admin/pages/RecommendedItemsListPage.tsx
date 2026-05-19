import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { recommendedItemsService } from '../services/recommendedItemsService';
import { useToast } from '../components/Toast';
import { DataTable, type Column } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { Spinner } from '../components/Spinner';
import type { RecommendedItemResponse } from '../types';
import { Star, StarOff } from 'lucide-react';

const columns: Column<RecommendedItemResponse>[] = [
  {
    key: 'name',
    label: 'Título',
    render: (item) => (
      <div>
        <strong>{item.name}</strong>
        {item.shortDescription && <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>{item.shortDescription}</p>}
      </div>
    ),
  },
  { key: 'category', label: 'Categoria' },
  {
    key: 'featured',
    label: 'Destaque',
    render: (item) =>
      item.featured
        ? <span style={{ color: '#d97706', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Star size={14} fill="currentColor" /> Destaque</span>
        : <span style={{ color: '#9ca3af', display: 'inline-flex', alignItems: 'center', gap: 4 }}><StarOff size={14} /> Padrão</span>,
  },
  {
    key: 'active',
    label: 'Status',
    render: (item) => (
      <span className={`adm-badge ${item.active ? 'adm-badge--green' : 'adm-badge--gray'}`}>
        {item.active ? 'Ativo' : 'Inativo'}
      </span>
    ),
  },
];

export function RecommendedItemsListPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [items, setItems] = useState<RecommendedItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<RecommendedItemResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await recommendedItemsService.getAll(page, 10);
      setItems(data.content);
      setTotalPages(data.totalPages);
    } catch {
      showToast('Erro ao carregar itens recomendados.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const filtered = search.trim()
    ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()))
    : items;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await recommendedItemsService.delete(deleteTarget.id);
      showToast('Item removido com sucesso.', 'success');
      setDeleteTarget(null);
      load();
    } catch {
      showToast('Erro ao remover item.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Spinner center size="lg" />;

  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">Itens Recomendados</h2>
        <button className="adm-btn adm-btn--primary" onClick={() => navigate('/admin/recommended-items/new')}>
          + Novo Item
        </button>
      </div>

      <div className="adm-card">
        <div className="adm-toolbar">
          <input
            type="search"
            placeholder="Buscar por título ou categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="adm-search"
          />
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          onEdit={(item) => navigate(`/admin/recommended-items/${item.id}/edit`)}
          onDelete={(item) => setDeleteTarget(item)}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {deleteTarget && (
        <Modal
          title="Confirmar exclusão"
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <button className="adm-btn adm-btn--ghost" onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button className="adm-btn adm-btn--danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Removendo…' : 'Remover'}
              </button>
            </>
          }
        >
          <p>Tem certeza que deseja remover <strong>{deleteTarget.name}</strong>?</p>
        </Modal>
      )}
    </div>
  );
}
