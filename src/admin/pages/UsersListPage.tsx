import { useState, type ReactNode } from 'react';
import { usersService } from '../services/usersService';
import { useCrudList } from '../hooks/useCrudList';
import { useToast } from '../components/Toast';
import { DataTable, Pagination } from '../components/DataTable';
import { ConfirmModal } from '../components/Modal';
import { Search, Trash2, ShieldCheck, User, UserCog } from 'lucide-react';
import type { UserResponse, UserRole } from '../types';

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  USER: 'Usuário',
  GUIDE: 'Guia',
};

const ROLE_BADGE: Record<UserRole, string> = {
  ADMIN: 'adm-badge--green',
  USER: 'adm-badge--blue',
  GUIDE: 'adm-badge--gold',
};

const ROLE_ICONS: Record<UserRole, ReactNode> = {
  ADMIN: <ShieldCheck size={13} />,
  USER: <User size={13} />,
  GUIDE: <UserCog size={13} />,
};

export function UsersListPage() {
  const { showToast } = useToast();
  const [roleChangeId, setRoleChangeId] = useState<string | null>(null);
  const [roleChanging, setRoleChanging] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('USER');

  const {
    data, page, setPage, totalPages, totalElements, loading,
    search, setSearch, deleteId, deleting, confirmDelete, cancelDelete, executeDelete, refresh,
  } = useCrudList<UserResponse>({
    fetchFn: usersService.getAll,
    deleteFn: usersService.delete,
    onSuccess: (m) => showToast(m, 'success'),
    onError: (m) => showToast(m, 'error'),
  });

  const openRoleChange = (user: UserResponse) => {
    setRoleChangeId(user.id);
    setSelectedRole(user.role);
  };

  const handleRoleChange = async () => {
    if (!roleChangeId) return;
    setRoleChanging(true);
    try {
      await usersService.update(roleChangeId, { role: selectedRole });
      showToast('Função atualizada com sucesso.', 'success');
      setRoleChangeId(null);
      refresh();
    } catch {
      showToast('Erro ao atualizar função.', 'error');
    } finally {
      setRoleChanging(false);
    }
  };

  const columns = [
    {
      header: 'Nome',
      accessor: (r: UserResponse): ReactNode => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <strong style={{ fontSize: 13 }}>{[r.firstName, r.lastName].filter(Boolean).join(' ') || '—'}</strong>
          <span style={{ fontSize: 11, color: 'var(--adm-text-muted)' }}>@{r.username}</span>
        </div>
      ),
    },
    { header: 'Email', accessor: 'email' as keyof UserResponse },
    {
      header: 'Função', width: '140px',
      accessor: (r: UserResponse): ReactNode => (
        <span className={`adm-badge ${ROLE_BADGE[r.role] ?? 'adm-badge--blue'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {ROLE_ICONS[r.role]}
          {ROLE_LABELS[r.role] ?? r.role}
        </span>
      ),
    },
    {
      header: 'Ações', width: '120px',
      accessor: (r: UserResponse): ReactNode => (
        <div className="adm-table__actions">
          <button
            className="adm-btn adm-btn--ghost adm-btn--sm"
            onClick={() => openRoleChange(r)}
            title="Alterar função"
          >
            <ShieldCheck size={14} />
          </button>
          <button
            className="adm-btn adm-btn--danger adm-btn--sm"
            onClick={() => confirmDelete(r.id)}
            title="Excluir usuário"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">Usuários <span>{totalElements} registros</span></h2>
      </div>

      <div className="adm-card">
        <div className="adm-search">
          <span className="adm-search__icon"><Search size={18} /></span>
          <input placeholder="Buscar por nome, email ou username…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <DataTable columns={columns} data={data} keyField="id" loading={loading} emptyMessage="Nenhum usuário encontrado." />
        <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
      </div>

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Excluir Usuário"
        message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
        onConfirm={executeDelete}
        onCancel={cancelDelete}
        loading={deleting}
      />

      {/* Role change modal */}
      {roleChangeId && (
        <div className="adm-modal-overlay" onClick={() => setRoleChangeId(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h3 className="adm-modal__title">Alterar Função do Usuário</h3>
            <p style={{ fontSize: 14, color: 'var(--adm-text-muted)', marginBottom: 16 }}>
              Selecione a nova função para este usuário.
            </p>
            <div className="adm-field">
              <label className="adm-label">Função</label>
              <select
                className="adm-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              >
                <option value="USER">Usuário</option>
                <option value="GUIDE">Guia</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <div className="adm-modal__footer">
              <button className="adm-btn adm-btn--ghost" onClick={() => setRoleChangeId(null)} disabled={roleChanging}>
                Cancelar
              </button>
              <button className="adm-btn adm-btn--primary" onClick={handleRoleChange} disabled={roleChanging}>
                {roleChanging ? 'Salvando…' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
