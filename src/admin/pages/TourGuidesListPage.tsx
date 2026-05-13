import { useNavigate } from 'react-router-dom';
import { tourGuidesService } from '../services/tourGuidesService';
import { useCrudList } from '../hooks/useCrudList';
import { useToast } from '../components/Toast';
import { DataTable, Pagination } from '../components/DataTable';
import { ConfirmModal } from '../components/Modal';
import type { TourGuideResponse } from '../types';
import type { ReactNode } from 'react';
import { Pencil, Trash2, Search, Plus } from 'lucide-react';

export function TourGuidesListPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data, page, setPage, totalPages, totalElements, loading, search, setSearch, deleteId, deleting, confirmDelete, cancelDelete, executeDelete } =
    useCrudList<TourGuideResponse>({ fetchFn: tourGuidesService.getAll, deleteFn: tourGuidesService.delete, onSuccess: (m) => showToast(m, 'success'), onError: (m) => showToast(m, 'error') });

  const columns = [
    { header: 'Nome', accessor: 'name' as keyof TourGuideResponse },
    { header: 'Telefone', accessor: 'phone' as keyof TourGuideResponse },
    { header: 'Email', accessor: 'email' as keyof TourGuideResponse },
    { header: 'Idiomas', accessor: (r: TourGuideResponse): ReactNode => r.languages?.join(', ') || '—' },
    { header: 'Status', width: '90px', accessor: (r: TourGuideResponse): ReactNode => <span className={`adm-badge adm-badge--${r.active ? 'green' : 'red'}`}>{r.active ? 'Ativo' : 'Inativo'}</span> },
    { header: 'Ações', width: '130px', accessor: (r: TourGuideResponse): ReactNode => (
      <div className="adm-table__actions">
        <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => navigate(`/admin/tour-guides/${r.id}/edit`)}><Pencil size={14} /></button>
        <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => confirmDelete(r.id)}><Trash2 size={14} /></button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">Guias Turísticos <span>{totalElements} registros</span></h2>
        <button className="adm-btn adm-btn--primary" onClick={() => navigate('/admin/tour-guides/new')}><Plus size={16} /> Novo Guia</button>
      </div>
      <div className="adm-card">
        <div className="adm-search"><span className="adm-search__icon"><Search size={18} /></span><input placeholder="Buscar guias…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <DataTable columns={columns} data={data} keyField="id" loading={loading} emptyMessage="Nenhum guia cadastrado." />
        <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
      </div>
      <ConfirmModal isOpen={!!deleteId} title="Deletar Guia" message="Tem certeza que deseja deletar este guia?" onConfirm={executeDelete} onCancel={cancelDelete} loading={deleting} />
    </div>
  );
}
