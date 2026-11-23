import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Check, X, Trash2, ExternalLink } from 'lucide-react';
import { useUrlListState } from '../hooks/useUrlListState';
import { reviewsService } from '../services/reviewsService';
import { useToast } from '../components/Toast';
import { DataTable, Pagination } from '../components/DataTable';
import { countLabel } from '../utils/countLabel';
import { ConfirmModal } from '../components/Modal';
import { formatClaimDate } from '../../utils/claims';
import type { ApprovalStatus, ReviewAdminResponse, ReviewSpotType } from '../types';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'pending', label: 'Pendentes' },
  { value: 'approved', label: 'Aprovadas' },
  { value: 'rejected', label: 'Rejeitadas' },
  { value: 'all', label: 'Todas' },
];

const FILTER_VALUES = FILTERS.map((f) => f.value);

const FILTER_TO_STATUS: Record<Exclude<StatusFilter, 'all'>, ApprovalStatus> = {
  pending: 'PENDING',
  approved: 'APPROVED',
  rejected: 'REJECTED',
};

const STATUS_LABEL: Record<ApprovalStatus, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovada',
  REJECTED: 'Rejeitada',
};

const BADGE_CLASS: Record<ApprovalStatus, string> = {
  PENDING: 'adm-badge--gold',
  APPROVED: 'adm-badge--green',
  REJECTED: 'adm-badge--red',
};

const TYPE_LABEL: Record<ReviewSpotType, string> = {
  RESTAURANT: 'Restaurante',
  HOST_POINT: 'Hospedagem',
  ATTRACTION: 'Atração',
  SPOT: 'Ponto turístico',
};

function spotPublicPath(spot: ReviewAdminResponse['spot']): string {
  switch (spot.type) {
    case 'RESTAURANT':
      return `/estabelecimentos/${spot.id}?apiType=restaurant`;
    case 'HOST_POINT':
      return `/estabelecimentos/${spot.id}?apiType=hostpoint`;
    case 'ATTRACTION':
      return `/pontos/${spot.id}`;
    default:
      return `/local/${spot.id}`;
  }
}

function Stars({ value }: { value: number }) {
  return (
    <span role="img" aria-label={`Nota ${value} de 5`} style={{ whiteSpace: 'nowrap' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= value ? '#FFB527' : '#e5e7eb', fontSize: 15 }}>★</span>
      ))}
    </span>
  );
}

export function ReviewsListPage() {
  const { showToast } = useToast();

  const [data, setData] = useState<ReviewAdminResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const { page, getFilter, setPage, setFilter } = useUrlListState();
  const filter = getFilter<StatusFilter>('status', FILTER_VALUES, 'pending');

  const [deleteTarget, setDeleteTarget] = useState<ReviewAdminResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? undefined : FILTER_TO_STATUS[filter];
      const result = await reviewsService.listForModeration(page, 10, status);
      if (page > 0 && result.content.length === 0 && result.totalPages > 0) {
        setPage(result.totalPages - 1, true);
        return;
      }
      setData(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch {
      showToast('Erro ao carregar avaliações.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, filter, setPage, showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatus = async (review: ReviewAdminResponse, status: ApprovalStatus) => {
    setUpdating(review.id);
    try {
      await reviewsService.updateApproval(review.id, status);
      showToast(status === 'APPROVED' ? 'Avaliação aprovada.' : 'Avaliação rejeitada.', 'success');
      fetchData();
    } catch {
      showToast('Erro ao atualizar avaliação.', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await reviewsService.delete(deleteTarget.id);
      showToast('Avaliação excluída.', 'success');
      setDeleteTarget(null);
      fetchData();
    } catch {
      showToast('Erro ao excluir avaliação.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Local',
      accessor: (r: ReviewAdminResponse): ReactNode => (
        <div>
          <a
            href={spotPublicPath(r.spot)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 500, color: 'inherit', overflowWrap: 'anywhere' }}
            aria-label={`${r.spot.name} (abre a página pública em nova aba)`}
          >
            {r.spot.name} <ExternalLink size={12} aria-hidden="true" />
          </a>
          <div style={{ fontSize: 12, color: 'var(--adm-text-muted)' }}>{TYPE_LABEL[r.spot.type] ?? r.spot.type}</div>
        </div>
      ),
    },
    {
      header: 'Autor',
      accessor: (r: ReviewAdminResponse): ReactNode => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.author.name}</div>
          <div style={{ fontSize: 12, color: 'var(--adm-text-muted)', overflowWrap: 'anywhere' }}>{r.author.email}</div>
        </div>
      ),
    },
    {
      header: 'Nota',
      accessor: (r: ReviewAdminResponse): ReactNode => <Stars value={r.rating} />,
    },
    {
      header: 'Comentário',
      accessor: (r: ReviewAdminResponse): ReactNode =>
        r.comment ? (
          <span style={{ fontSize: 13, overflowWrap: 'anywhere' }} title={r.comment}>
            {r.comment.length > 80 ? r.comment.slice(0, 80) + '…' : r.comment}
          </span>
        ) : (
          <span style={{ fontSize: 13, color: 'var(--adm-text-muted)' }}>Sem comentário</span>
        ),
    },
    {
      header: 'Status',
      accessor: (r: ReviewAdminResponse): ReactNode => (
        <span className={`adm-badge ${BADGE_CLASS[r.status]}`}>{STATUS_LABEL[r.status]}</span>
      ),
    },
    {
      header: 'Data',
      accessor: (r: ReviewAdminResponse): ReactNode => formatClaimDate(r.createdDate),
    },
    {
      header: 'Ações',
      width: '140px',
      accessor: (r: ReviewAdminResponse): ReactNode => (
        <div className="adm-table__actions">
          {r.status !== 'APPROVED' && (
            <button
              className="adm-btn adm-btn--primary adm-btn--sm"
              onClick={() => handleStatus(r, 'APPROVED')}
              disabled={updating === r.id}
              title="Aprovar"
              aria-label={`Aprovar avaliação de ${r.author.name} sobre ${r.spot.name}`}
            >
              <Check size={14} aria-hidden="true" />
            </button>
          )}
          {r.status !== 'REJECTED' && (
            <button
              className="adm-btn adm-btn--ghost adm-btn--sm"
              onClick={() => handleStatus(r, 'REJECTED')}
              disabled={updating === r.id}
              title="Rejeitar"
              aria-label={`Rejeitar avaliação de ${r.author.name} sobre ${r.spot.name}`}
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
          <button
            className="adm-btn adm-btn--danger adm-btn--sm"
            onClick={() => setDeleteTarget(r)}
            title="Excluir"
            aria-label={`Excluir avaliação de ${r.author.name} sobre ${r.spot.name}`}
          >
            <Trash2 size={14} aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">
          Avaliações
          <span>{countLabel(totalElements, 'registro', 'registros')}</span>
        </h2>
      </div>

      <div className="adm-card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`adm-btn ${filter === f.value ? 'adm-btn--primary' : 'adm-btn--ghost'} adm-btn--sm`}
              aria-pressed={filter === f.value}
              onClick={() => setFilter('status', f.value, 'pending')}
            >
              {f.label}
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={data}
          keyField="id"
          loading={loading}
          emptyMessage="Nenhuma avaliação encontrada."
        />
        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={setPage}
        />
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Excluir Avaliação"
        message={`Tem certeza que deseja excluir a avaliação de ${deleteTarget?.author.name ?? ''} sobre ${deleteTarget?.spot.name ?? ''}? A nota deixa de contar na média.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
