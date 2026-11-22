import { Link } from 'react-router-dom';
import { eventsService } from '../services/eventsService';
import { useCrudList } from '../hooks/useCrudList';
import { useToast } from '../components/Toast';
import { DataTable, Pagination } from '../components/DataTable';
import { countLabel } from '../utils/countLabel';
import { ConfirmModal } from '../components/Modal';
import type { EventResponse } from '../types';
import type { ReactNode } from 'react';
import { Pencil, Trash2, Search, Plus } from 'lucide-react';

export function EventsListPage() {
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
        <Link className="adm-btn adm-btn--ghost adm-btn--sm" to={`/admin/events/${r.id}/edit`} aria-label={`Editar ${r.name}`}><Pencil size={14} aria-hidden="true" /></Link>
        <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => confirmDelete(r.id)} aria-label={`Excluir ${r.name}`}><Trash2 size={14} aria-hidden="true" /></button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">Eventos <span>{countLabel(totalElements, 'registro', 'registros')}</span></h2>
        <Link className="adm-btn adm-btn--primary" to="/admin/events/new"><Plus size={16} aria-hidden="true" /> Novo Evento</Link>
      </div>
      <div className="adm-card">
        <div className="adm-search"><span className="adm-search__icon" aria-hidden="true"><Search size={18} aria-hidden="true" /></span><input type="search" name="q" aria-label="Buscar eventos" autoComplete="off" spellCheck={false} placeholder="Buscar eventos…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <DataTable columns={columns} data={data} keyField="id" loading={loading} emptyMessage="Nenhum evento cadastrado." />
        <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
      </div>
      <ConfirmModal isOpen={!!deleteId} title="Deletar Evento" message="Tem certeza que deseja deletar este evento?" onConfirm={executeDelete} onCancel={cancelDelete} loading={deleting} />
    </div>
  );
}
