import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { usersService } from '../services/usersService';
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

  const [data, setData] = useState<UserResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [roleChangeId, setRoleChangeId] = useState<string | null>(null);
  const [roleChanging, setRoleChanging] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('USER');

  const fetch = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const result = await usersService.getAll(p, 10, search || undefined, roleFilter || undefined);
      setData(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch {
      showToast('Erro ao carregar usuários.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { setPage(0); }, [search, roleFilter]);
  useEffect(() => { fetch(page); }, [page, search, roleFilter]);

  const openRoleChange = (user: UserResponse) => {
    setRoleChangeId(user.id);
    setSelectedRole(user.role);
  };

  const handleRoleChange = async () => {
    if (!roleChangeId) return;
    setRoleChanging(true);
    try {
      await usersService.changeRole(roleChangeId, selectedRole);
      showToast('Função atualizada com sucesso.', 'success');
      setRoleChangeId(null);
      fetch(page);
    } catch {
      showToast('Erro ao atualizar função.', 'error');
    } finally {
      setRoleChanging(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await usersService.delete(deleteId);
      showToast('Usuário excluído com sucesso.', 'success');
      setDeleteId(null);
      fetch(page);
    } catch {
      showToast('Erro ao excluir usuário.', 'error');
    } finally {
      setDeleting(false);
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
            onClick={() => setDeleteId(r.id)}
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
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div className="adm-search" style={{ flex: 1, minWidth: 200 }}>
            <span className="adm-search__icon"><Search size={18} /></span>
            <input
              placeholder="Buscar por username…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="adm-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
            style={{ minWidth: 160 }}
          >
            <option value="">Todas as funções</option>
            <option value="ADMIN">Administrador</option>
            <option value="USER">Usuário</option>
            <option value="GUIDE">Guia</option>
          </select>
        </div>

        <DataTable columns={columns} data={data} keyField="id" loading={loading} emptyMessage="Nenhum usuário encontrado." />
        <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Excluir Usuário"
        message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
        onConfirm={executeDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />

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
