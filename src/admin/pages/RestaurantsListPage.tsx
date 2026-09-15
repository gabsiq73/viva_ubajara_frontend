import { useNavigate } from 'react-router-dom';
import { restaurantsService } from '../services/restaurantsService';
import { useCrudList } from '../hooks/useCrudList';
import { useToast } from '../components/Toast';
import { DataTable, Pagination } from '../components/DataTable';
import { ConfirmModal } from '../components/Modal';
import type { ApprovalStatus, RestaurantResponse } from '../types';
import type { ReactNode } from 'react';
import { Pencil, Trash2, Search, Plus, Check, X } from 'lucide-react';

const STATUS_LABEL: Record<ApprovalStatus, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
};

const STATUS_BADGE: Record<ApprovalStatus, string> = {
  PENDING: 'adm-badge--gold',
  APPROVED: 'adm-badge--green',
  REJECTED: 'adm-badge--red',
};

export function RestaurantsListPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data, page, setPage, totalPages, totalElements, loading, search, setSearch, deleteId, deleting, confirmDelete, cancelDelete, executeDelete, refresh } =
    useCrudList<RestaurantResponse>({ fetchFn: restaurantsService.getAllForModeration, deleteFn: restaurantsService.delete, onSuccess: (m) => showToast(m, 'success'), onError: (m) => showToast(m, 'error') });

  const handleApproval = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await restaurantsService.approveOrReject(id, status);
      showToast(status === 'APPROVED' ? 'Restaurante aprovado.' : 'Restaurante rejeitado.', 'success');
      refresh();
    } catch {
      showToast('Erro ao atualizar aprovação.', 'error');
    }
  };

  const columns = [
    { header: 'Nome', accessor: 'name' as keyof RestaurantResponse },
    { header: 'Tipo', accessor: 'cuisineType' as keyof RestaurantResponse },
    { header: 'Endereço', accessor: 'address' as keyof RestaurantResponse },
    { header: 'Preço Médio', accessor: (r: RestaurantResponse): ReactNode => r.avgPrice || '—' },
    { header: 'Status', width: '90px', accessor: (r: RestaurantResponse): ReactNode => r.approvalStatus
      ? <span className={`adm-badge ${STATUS_BADGE[r.approvalStatus]}`}>{STATUS_LABEL[r.approvalStatus]}</span>
      : <span className={`adm-badge adm-badge--${r.active ? 'green' : 'red'}`}>{r.active ? 'Ativo' : 'Inativo'}</span> },
    { header: 'Ações', width: '190px', accessor: (r: RestaurantResponse): ReactNode => (
      <div className="adm-table__actions">
        {(r.approvalStatus ? r.approvalStatus !== 'APPROVED' : !r.active) && (
          <>
            <button className="adm-btn adm-btn--ghost adm-btn--sm" title="Aprovar" onClick={() => handleApproval(r.id, 'APPROVED')}><Check size={14} /></button>
            <button className="adm-btn adm-btn--ghost adm-btn--sm" title="Rejeitar" onClick={() => handleApproval(r.id, 'REJECTED')}><X size={14} /></button>
          </>
        )}
        <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => navigate(`/admin/restaurants/${r.id}/edit`)}><Pencil size={14} /></button>
        <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => confirmDelete(r.id)}><Trash2 size={14} /></button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">Restaurantes <span>{totalElements} registros</span></h2>
        <button className="adm-btn adm-btn--primary" onClick={() => navigate('/admin/restaurants/new')}><Plus size={16} /> Novo Restaurante</button>
      </div>
      <div className="adm-card">
        <div className="adm-search"><span className="adm-search__icon"><Search size={18} /></span><input placeholder="Buscar restaurantes…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <DataTable columns={columns} data={data} keyField="id" loading={loading} emptyMessage="Nenhum restaurante cadastrado." />
        <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
      </div>
      <ConfirmModal isOpen={!!deleteId} title="Deletar Restaurante" message="Tem certeza que deseja deletar este restaurante?" onConfirm={executeDelete} onCancel={cancelDelete} loading={deleting} />
    </div>
  );
}
