import { useNavigate } from 'react-router-dom';
import { eventsService } from '../services/eventsService';
import { useCrudList } from '../hooks/useCrudList';
import { useToast } from '../components/Toast';
import { DataTable, Pagination } from '../components/DataTable';
import { ConfirmModal } from '../components/Modal';
import type { EventResponse } from '../types';
import type { ReactNode } from 'react';

export function EventsListPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data, page, setPage, totalPages, totalElements, loading, search, setSearch, deleteId, deleting, confirmDelete, cancelDelete, executeDelete } =
    useCrudList<EventResponse>({ fetchFn: eventsService.getAll, deleteFn: eventsService.delete, onSuccess: (m) => showToast(m, 'success'), onError: (m) => showToast(m, 'error') });

  const fmt = (dt: string) => new Date(dt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const columns = [
    { header: 'Nome', accessor: 'name' as keyof EventResponse },
    { header: 'Local', accessor: 'location' as keyof EventResponse },
    { header: 'Início', accessor: (r: EventResponse): ReactNode => fmt(r.startDateTime) },
    { header: 'Fim', accessor: (r: EventResponse): ReactNode => fmt(r.endDateTime) },
    { header: 'Status', width: '90px', accessor: (r: EventResponse): ReactNode => <span className={`adm-badge adm-badge--${r.active ? 'green' : 'red'}`}>{r.active ? 'Ativo' : 'Inativo'}</span> },
    { header: 'Ações', width: '130px', accessor: (r: EventResponse): ReactNode => (
      <div className="adm-table__actions">
        <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => navigate(`/admin/events/${r.id}/edit`)}>✏️</button>
        <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => confirmDelete(r.id)}>🗑️</button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">Eventos <span>{totalElements} registros</span></h2>
        <button className="adm-btn adm-btn--primary" onClick={() => navigate('/admin/events/new')}>+ Novo Evento</button>
      </div>
      <div className="adm-card">
        <div className="adm-search"><span className="adm-search__icon">🔍</span><input placeholder="Buscar eventos…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <DataTable columns={columns} data={data} keyField="id" loading={loading} emptyMessage="Nenhum evento cadastrado." />
        <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
      </div>
      <ConfirmModal isOpen={!!deleteId} title="Deletar Evento" message="Tem certeza que deseja deletar este evento?" onConfirm={executeDelete} onCancel={cancelDelete} loading={deleting} />
    </div>
  );
}
