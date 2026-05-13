import { useNavigate } from 'react-router-dom';
import { contactsService } from '../services/contactsService';
import { useCrudList } from '../hooks/useCrudList';
import { useToast } from '../components/Toast';
import { DataTable, Pagination } from '../components/DataTable';
import { ConfirmModal } from '../components/Modal';
import type { ContactResponse } from '../types';
import type { ReactNode } from 'react';

export function ContactsListPage() {
  const navigate = useNavigate();
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
        <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => navigate(`/admin/contacts/${r.id}/edit`)}>✏️</button>
        <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => confirmDelete(r.id)}>🗑️</button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">Contatos <span>{totalElements} registros</span></h2>
        <button className="adm-btn adm-btn--primary" onClick={() => navigate('/admin/contacts/new')}>+ Novo Contato</button>
      </div>
      <div className="adm-card">
        <div className="adm-search"><span className="adm-search__icon">🔍</span><input placeholder="Buscar contatos…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <DataTable columns={columns} data={data} keyField="id" loading={loading} emptyMessage="Nenhum contato cadastrado." />
        <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
      </div>
      <ConfirmModal isOpen={!!deleteId} title="Deletar Contato" message="Tem certeza que deseja deletar este contato?" onConfirm={executeDelete} onCancel={cancelDelete} loading={deleting} />
    </div>
  );
}
