import { useNavigate } from 'react-router-dom';
import { attractionsService } from '../services/attractionsService';
import { useCrudList } from '../hooks/useCrudList';
import { useToast } from '../components/Toast';
import { DataTable, Pagination } from '../components/DataTable';
import { ConfirmModal } from '../components/Modal';
import type { AttractionResponse } from '../types';
import type { ReactNode } from 'react';
import { Pencil, Trash2, Search, Plus } from 'lucide-react';

export function AttractionsListPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    data, page, setPage, totalPages, totalElements, loading,
    search, setSearch, deleteId, deleting, confirmDelete, cancelDelete, executeDelete,
  } = useCrudList<AttractionResponse>({
    fetchFn: attractionsService.getAll,
    deleteFn: attractionsService.delete,
    onSuccess: (m) => showToast(m, 'success'),
    onError: (m) => showToast(m, 'error'),
  });

  const CATEGORY_LABELS: Record<string, string> = {
    PARK: 'Parque', WATERFALL: 'Cachoeira', MUSEUM: 'Museu',
    FARM: 'Fazenda', ROUTE: 'Rota', MARKET: 'Mercado',
  };

  const columns = [
    { header: 'Nome', accessor: 'name' as keyof AttractionResponse },
    { header: 'Categoria', accessor: (r: AttractionResponse): ReactNode => CATEGORY_LABELS[r.category] ?? r.category },
    { header: 'Endereço', accessor: 'address' as keyof AttractionResponse },
    {
      header: 'Status', width: '90px',
      accessor: (r: AttractionResponse): ReactNode => (
        <span className={`adm-badge adm-badge--${r.active ? 'green' : 'red'}`}>
          {r.active ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      header: 'Ações', width: '130px',
      accessor: (r: AttractionResponse): ReactNode => (
        <div className="adm-table__actions">
          <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => navigate(`/admin/attractions/${r.id}/edit`)}>
            <Pencil size={14} />
          </button>
          <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => confirmDelete(r.id)}>
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">Atrações <span>{totalElements} registros</span></h2>
        <button className="adm-btn adm-btn--primary" onClick={() => navigate('/admin/attractions/new')}>
          <Plus size={16} /> Nova Atração
        </button>
      </div>

      <div className="adm-card">
        <div className="adm-search">
          <span className="adm-search__icon"><Search size={18} /></span>
          <input placeholder="Buscar atrações…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <DataTable columns={columns} data={data} keyField="id" loading={loading} emptyMessage="Nenhuma atração cadastrada." />
        <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Deletar Atração"
        message="Tem certeza que deseja deletar esta atração? Esta ação não pode ser desfeita."
        onConfirm={executeDelete}
        onCancel={cancelDelete}
        loading={deleting}
      />
    </div>
  );
}
