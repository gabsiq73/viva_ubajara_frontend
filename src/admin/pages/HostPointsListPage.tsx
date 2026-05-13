import { useNavigate } from 'react-router-dom';
import { hostPointsService } from '../services/hostPointsService';
import { useCrudList } from '../hooks/useCrudList';
import { useToast } from '../components/Toast';
import { DataTable, Pagination } from '../components/DataTable';
import { ConfirmModal } from '../components/Modal';
import type { HostPointResponse } from '../types';
import type { ReactNode } from 'react';

const TYPE_LABELS: Record<string, string> = { HOTEL: 'Hotel', ROOST: 'Pousada', HOSTEL: 'Hostel' };

export function HostPointsListPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data, page, setPage, totalPages, totalElements, loading, search, setSearch, deleteId, deleting, confirmDelete, cancelDelete, executeDelete } =
    useCrudList<HostPointResponse>({ fetchFn: hostPointsService.getAll, deleteFn: hostPointsService.delete, onSuccess: (m) => showToast(m, 'success'), onError: (m) => showToast(m, 'error') });

  const columns = [
    { header: 'Nome', accessor: 'name' as keyof HostPointResponse },
    { header: 'Tipo', accessor: (r: HostPointResponse): ReactNode => TYPE_LABELS[r.hostType] ?? r.hostType },
    { header: 'Quartos', accessor: (r: HostPointResponse): ReactNode => r.numOfRooms ?? '—' },
    { header: 'Preço Médio', accessor: (r: HostPointResponse): ReactNode => r.avgPrice ? `R$ ${r.avgPrice.toFixed(2)}` : '—' },
    { header: 'Status', width: '90px', accessor: (r: HostPointResponse): ReactNode => <span className={`adm-badge adm-badge--${r.active ? 'green' : 'red'}`}>{r.active ? 'Ativo' : 'Inativo'}</span> },
    { header: 'Ações', width: '130px', accessor: (r: HostPointResponse): ReactNode => (
      <div className="adm-table__actions">
        <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => navigate(`/admin/host-points/${r.id}/edit`)}>✏️</button>
        <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => confirmDelete(r.id)}>🗑️</button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">Hospedagem <span>{totalElements} registros</span></h2>
        <button className="adm-btn adm-btn--primary" onClick={() => navigate('/admin/host-points/new')}>+ Nova Hospedagem</button>
      </div>
      <div className="adm-card">
        <div className="adm-search"><span className="adm-search__icon">🔍</span><input placeholder="Buscar hospedagens…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <DataTable columns={columns} data={data} keyField="id" loading={loading} emptyMessage="Nenhuma hospedagem cadastrada." />
        <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
      </div>
      <ConfirmModal isOpen={!!deleteId} title="Deletar Hospedagem" message="Tem certeza que deseja deletar esta hospedagem?" onConfirm={executeDelete} onCancel={cancelDelete} loading={deleting} />
    </div>
  );
}
