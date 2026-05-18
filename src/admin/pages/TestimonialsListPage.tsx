import { useState, useEffect, useCallback } from 'react';
import { Trash2, Search, Check, X } from 'lucide-react';
import { testimonialsService } from '../services/testimonialsService';
import { useToast } from '../components/Toast';
import { DataTable, Pagination } from '../components/DataTable';
import { ConfirmModal } from '../components/Modal';
import type { TestimonialResponse } from '../types';
import type { ReactNode } from 'react';

type ApprovedFilter = 'all' | 'pending' | 'approved';

function Stars({ value }: { value: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= value ? '#FFB527' : '#e5e7eb', fontSize: 15 }}>★</span>
      ))}
    </span>
  );
}

export function TestimonialsListPage() {
  const { showToast } = useToast();

  const [data, setData] = useState<TestimonialResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ApprovedFilter>('all');

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const approvedParam = filter === 'all' ? undefined : filter === 'approved';
      const result = await testimonialsService.getAll(page, 10, approvedParam);
      setData(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch {
      showToast('Erro ao carregar depoimentos.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, filter, showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggleApproval = async (t: TestimonialResponse) => {
    setToggling(t.id);
    try {
      await testimonialsService.update(t.id, { approved: !t.approved });
      showToast(t.approved ? 'Depoimento reprovado.' : 'Depoimento aprovado.', 'success');
      fetchData();
    } catch {
      showToast('Erro ao atualizar depoimento.', 'error');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await testimonialsService.delete(deleteId);
      showToast('Depoimento deletado.', 'success');
      setDeleteId(null);
      fetchData();
    } catch {
      showToast('Erro ao deletar depoimento.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = search
    ? data.filter((t) =>
        [t.userName, t.userEmail, t.comment].some((v) =>
          v.toLowerCase().includes(search.toLowerCase())
        )
      )
    : data;

  const columns = [
    {
      header: 'Visitante',
      accessor: (r: TestimonialResponse): ReactNode => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.userName}</div>
          <div style={{ fontSize: 12, color: 'var(--adm-text-muted)' }}>{r.userEmail}</div>
        </div>
      ),
    },
    {
      header: 'Nota',
      accessor: (r: TestimonialResponse): ReactNode => <Stars value={r.rating} />,
    },
    {
      header: 'Comentário',
      accessor: (r: TestimonialResponse): ReactNode => (
        <span style={{ fontSize: 13 }}>
          {r.comment.length > 80 ? r.comment.slice(0, 80) + '…' : r.comment}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (r: TestimonialResponse): ReactNode => (
        <span style={{
          padding: '2px 10px',
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 600,
          background: r.approved ? '#dcfce7' : '#fef9c3',
          color: r.approved ? '#166534' : '#854d0e',
        }}>
          {r.approved ? 'Aprovado' : 'Pendente'}
        </span>
      ),
    },
    {
      header: 'Data',
      accessor: (r: TestimonialResponse): ReactNode =>
        new Date(r.createdDate).toLocaleDateString('pt-BR'),
    },
    {
      header: 'Ações',
      width: '110px',
      accessor: (r: TestimonialResponse): ReactNode => (
        <div className="adm-table__actions">
          <button
            className={`adm-btn adm-btn--sm ${r.approved ? 'adm-btn--danger' : 'adm-btn--primary'}`}
            onClick={() => handleToggleApproval(r)}
            disabled={toggling === r.id}
            title={r.approved ? 'Reprovar' : 'Aprovar'}
          >
            {r.approved ? <X size={14} /> : <Check size={14} />}
          </button>
          <button
            className="adm-btn adm-btn--danger adm-btn--sm"
            onClick={() => setDeleteId(r.id)}
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
        <h2 className="adm-page-title">Depoimentos <span>{totalElements} registros</span></h2>
      </div>

      <div className="adm-card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['all', 'pending', 'approved'] as ApprovedFilter[]).map((f) => (
            <button
              key={f}
              className={`adm-btn ${filter === f ? 'adm-btn--primary' : 'adm-btn--ghost'} adm-btn--sm`}
              onClick={() => { setFilter(f); setPage(0); }}
            >
              {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendentes' : 'Aprovados'}
            </button>
          ))}
        </div>

        <div className="adm-search">
          <span className="adm-search__icon"><Search size={18} /></span>
          <input
            placeholder="Buscar por nome, e-mail ou comentário…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          keyField="id"
          loading={loading}
          emptyMessage="Nenhum depoimento encontrado."
        />
        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={setPage}
        />
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Deletar Depoimento"
        message="Tem certeza que deseja deletar este depoimento?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
