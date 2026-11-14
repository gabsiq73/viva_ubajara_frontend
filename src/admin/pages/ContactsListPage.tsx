import { Link } from 'react-router-dom';
import { contactsService } from '../services/contactsService';
import { useCrudList } from '../hooks/useCrudList';
import { useToast } from '../components/Toast';
import { DataTable, Pagination } from '../components/DataTable';
import { ConfirmModal } from '../components/Modal';
import type { ContactResponse } from '../types';
import type { ReactNode } from 'react';
import { Pencil, Trash2, Search, Plus } from 'lucide-react';

export function ContactsListPage() {
  const { showToast } = useToast();
  const { data, page, setPage, totalPages, totalElements, loading, search, setSearch, deleteId, deleting, confirmDelete, cancelDelete, executeDelete } =
    useCrudList<ContactResponse>({ fetchFn: contactsService.getAll, deleteFn: contactsService.delete, onSuccess: (m) => showToast(m, 'success'), onError: (m) => showToast(m, 'error') });

  const columns = [
    { header: 'Nome', accessor: 'name' as keyof ContactResponse },
    { header: 'Categoria', accessor: (r: ContactResponse): ReactNode => r.category || '—' },
    { header: 'Telefone', accessor: 'phone' as keyof ContactResponse },
    { header: 'Email', accessor: 'email' as keyof ContactResponse },
    { header: 'Ações', width: '130px', accessor: (r: ContactResponse): ReactNode => (
      <div className="adm-table__actions">
        <Link className="adm-btn adm-btn--ghost adm-btn--sm" to={`/admin/contacts/${r.id}/edit`} aria-label={`Editar ${r.name}`}><Pencil size={14} aria-hidden="true" /></Link>
        <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => confirmDelete(r.id)} aria-label={`Excluir ${r.name}`}><Trash2 size={14} aria-hidden="true" /></button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">Contatos <span>{totalElements} registros</span></h2>
        <Link className="adm-btn adm-btn--primary" to="/admin/contacts/new"><Plus size={16} aria-hidden="true" /> Novo Contato</Link>
      </div>
      <div className="adm-card">
        <div className="adm-search"><span className="adm-search__icon" aria-hidden="true"><Search size={18} aria-hidden="true" /></span><input type="search" name="q" aria-label="Buscar contatos" autoComplete="off" spellCheck={false} placeholder="Buscar contatos…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <DataTable columns={columns} data={data} keyField="id" loading={loading} emptyMessage="Nenhum contato cadastrado." />
        <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
      </div>
      <ConfirmModal isOpen={!!deleteId} title="Deletar Contato" message="Tem certeza que deseja deletar este contato?" onConfirm={executeDelete} onCancel={cancelDelete} loading={deleting} />
    </div>
  );
}
