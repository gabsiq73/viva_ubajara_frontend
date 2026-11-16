import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Eye, ExternalLink } from 'lucide-react';
import { useUrlListState } from '../hooks/useUrlListState';
import { claimsService } from '../services/claimsService';
import { useToast } from '../components/Toast';
import { DataTable, Pagination } from '../components/DataTable';
import { ConfirmModal, Modal } from '../components/Modal';
import { FormTextarea } from '../components/FormField';
import { formatCnpj } from '../../utils/cnpj';
import { CLAIM_STATUS_LABEL, CLAIM_TYPE_LABEL, claimErrorMessage, claimSpotPath, formatClaimDate } from '../../utils/claims';
import type { ClaimStatus, EstablishmentClaimAdminResponse } from '../types';

type StatusFilter = ClaimStatus | 'ALL';

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'APPROVED', label: 'Aprovadas' },
  { value: 'REJECTED', label: 'Rejeitadas' },
  { value: 'CANCELLED', label: 'Canceladas' },
  { value: 'ALL', label: 'Todas' },
];

const FILTER_VALUES = FILTERS.map((f) => f.value);

const BADGE_CLASS: Record<ClaimStatus, string> = {
  PENDING: 'adm-badge--gold',
  APPROVED: 'adm-badge--green',
  REJECTED: 'adm-badge--red',
  CANCELLED: 'adm-badge--blue',
};

const REJECT_REASON_MAX = 500;

function StatusBadge({ status }: { status: ClaimStatus }) {
  return <span className={`adm-badge ${BADGE_CLASS[status]}`}>{CLAIM_STATUS_LABEL[status]}</span>;
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="adm-claim__item">
      <dt>{label}</dt>
      <dd>{children || '—'}</dd>
    </div>
  );
}

export function ClaimsListPage() {
  const { showToast } = useToast();

  const [data, setData] = useState<EstablishmentClaimAdminResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const { page, getFilter, setPage, setFilter } = useUrlListState();
  const filter = getFilter<StatusFilter>('status', FILTER_VALUES, 'PENDING');

  const [selected, setSelected] = useState<EstablishmentClaimAdminResponse | null>(null);
  const [approveTarget, setApproveTarget] = useState<EstablishmentClaimAdminResponse | null>(null);
  const [rejectTarget, setRejectTarget] = useState<EstablishmentClaimAdminResponse | null>(null);
  const [reason, setReason] = useState('');
  const [acting, setActing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await claimsService.getAll(page, 10, filter === 'ALL' ? undefined : filter);
      if (page > 0 && result.content.length === 0 && result.totalPages > 0) {
        setPage(result.totalPages - 1, true);
        return;
      }
      setData(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch {
      showToast('Erro ao carregar reivindicações.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, filter, setPage, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const closeAll = () => {
    setSelected(null);
    setApproveTarget(null);
    setRejectTarget(null);
    setReason('');
  };

  const runAction = async (action: () => Promise<unknown>, successMessage: string) => {
    setActing(true);
    try {
      await action();
      showToast(successMessage, 'success');
    } catch (error) {
      showToast(claimErrorMessage(error, 'Não foi possível concluir a ação. Tente novamente.'), 'error');
    } finally {
      setActing(false);
      closeAll();
      fetchData();
    }
  };

  const handleApprove = () => {
    if (approveTarget) void runAction(() => claimsService.approve(approveTarget.id), 'Solicitação aprovada. O responsável foi atualizado.');
  };

  const handleReject = () => {
    if (rejectTarget) void runAction(() => claimsService.reject(rejectTarget.id, reason.trim() || undefined), 'Solicitação rejeitada.');
  };

  const columns = [
    {
      header: 'Estabelecimento',
      accessor: (r: EstablishmentClaimAdminResponse): ReactNode => (
        <div>
          <strong>{r.spotName}</strong>
          <div style={{ fontSize: 12, color: 'var(--adm-text-muted)' }}>{CLAIM_TYPE_LABEL[r.spotType]}</div>
        </div>
      ),
    },
    {
      header: 'Solicitante',
      accessor: (r: EstablishmentClaimAdminResponse): ReactNode => (
        <div>
          <div>{r.claimant.name}</div>
          <div style={{ fontSize: 12, color: 'var(--adm-text-muted)', overflowWrap: 'break-word' }}>{r.claimant.email}</div>
        </div>
      ),
    },
    {
      header: 'Empresa / CNPJ',
      accessor: (r: EstablishmentClaimAdminResponse): ReactNode => (
        <div>
          <div>{r.claimant.companyName || '—'}</div>
          {r.claimant.cnpj && <div style={{ fontSize: 12, color: 'var(--adm-text-muted)', whiteSpace: 'nowrap' }}>{formatCnpj(r.claimant.cnpj)}</div>}
        </div>
      ),
    },
    {
      header: 'Data',
      accessor: (r: EstablishmentClaimAdminResponse): ReactNode => formatClaimDate(r.createdAt),
    },
    {
      header: 'Status',
      accessor: (r: EstablishmentClaimAdminResponse): ReactNode => <StatusBadge status={r.status} />,
    },
    {
      header: 'Ações',
      width: '80px',
      accessor: (r: EstablishmentClaimAdminResponse): ReactNode => (
        <div className="adm-table__actions">
          <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setSelected(r)} title="Ver solicitação" aria-label={`Ver solicitação de ${r.spotName}`}>
            <Eye size={14} aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">
          Reivindicações
          <span>{totalElements} {totalElements === 1 ? 'solicitação' : 'solicitações'}</span>
        </h2>
      </div>

      <div className="adm-card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`adm-btn ${filter === f.value ? 'adm-btn--primary' : 'adm-btn--ghost'} adm-btn--sm`}
              aria-pressed={filter === f.value}
              onClick={() => setFilter('status', f.value, 'PENDING')}
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
          emptyMessage="Nenhuma solicitação encontrada."
        />
        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={setPage}
        />
      </div>

      <Modal
        isOpen={!!selected && !approveTarget && !rejectTarget}
        title="Solicitação de titularidade"
        onClose={() => setSelected(null)}
        size="lg"
      >
        {selected && (
          <div className="adm-modal__body adm-claim">
            <div className="adm-claim__status">
              <StatusBadge status={selected.status} />
              <span>Enviada em {formatClaimDate(selected.createdAt, true)}</span>
            </div>

            <h3 className="adm-claim__heading">Estabelecimento</h3>
            <dl className="adm-claim__grid">
              <Detail label="Nome">{selected.spot.name}</Detail>
              <Detail label="Tipo">{CLAIM_TYPE_LABEL[selected.spot.type]}</Detail>
              <Detail label="Endereço">{selected.spot.address}</Detail>
              <Detail label="Responsável atual">{selected.spot.hasOwner ? 'Já possui responsável' : 'Sem responsável'}</Detail>
              <Detail label="Página pública">
                <a href={claimSpotPath(selected.spot.id, selected.spot.type)} target="_blank" rel="noopener noreferrer" className="adm-claim__link">
                  Abrir página <ExternalLink size={13} aria-hidden="true" />
                </a>
              </Detail>
            </dl>

            <h3 className="adm-claim__heading">Solicitante</h3>
            <dl className="adm-claim__grid">
              <Detail label="Nome">{selected.claimant.name}</Detail>
              <Detail label="E-mail">{selected.claimant.email}</Detail>
              <Detail label="Empresa">{selected.claimant.companyName}</Detail>
              <Detail label="CNPJ">{selected.claimant.cnpj ? formatCnpj(selected.claimant.cnpj) : ''}</Detail>
              <Detail label="Telefone de contato">{selected.contactPhone}</Detail>
            </dl>

            <h3 className="adm-claim__heading">Mensagem</h3>
            <div className="adm-claim__message">{selected.message}</div>

            {selected.status !== 'PENDING' && (
              <>
                <h3 className="adm-claim__heading">Histórico da análise</h3>
                <dl className="adm-claim__grid">
                  <Detail label={selected.status === 'CANCELLED' ? 'Cancelada em' : 'Analisada em'}>{formatClaimDate(selected.reviewedAt, true)}</Detail>
                  {selected.status !== 'CANCELLED' && <Detail label="Analisada por">{selected.reviewedByName}</Detail>}
                  {selected.status === 'REJECTED' && <Detail label="Motivo da rejeição">{selected.rejectionReason}</Detail>}
                </dl>
              </>
            )}
          </div>
        )}
        <div className="adm-modal__footer">
          <button className="adm-btn adm-btn--ghost" onClick={() => setSelected(null)}>
            Fechar
          </button>
          {selected?.status === 'PENDING' && (
            <>
              <button className="adm-btn adm-btn--danger" onClick={() => { setReason(''); setRejectTarget(selected); }}>
                Rejeitar
              </button>
              <button className="adm-btn adm-btn--primary" onClick={() => setApproveTarget(selected)}>
                Aprovar
              </button>
            </>
          )}
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!approveTarget}
        title="Aprovar solicitação"
        message={`Ao aprovar, ${approveTarget?.claimant.name ?? 'o solicitante'} passa a ser o responsável por "${approveTarget?.spotName ?? ''}" e poderá editá-lo pelo painel da empresa. As outras solicitações pendentes para este mesmo estabelecimento serão rejeitadas automaticamente.`}
        confirmLabel="Aprovar"
        tone="primary"
        onConfirm={handleApprove}
        onCancel={() => setApproveTarget(null)}
        loading={acting}
      />

      <Modal isOpen={!!rejectTarget} title="Rejeitar solicitação" onClose={() => !acting && setRejectTarget(null)}>
        <div className="adm-modal__body">
          <p style={{ marginBottom: 16 }}>
            A solicitação de {rejectTarget?.claimant.name} para "{rejectTarget?.spotName}" será rejeitada. O motivo é opcional e será mostrado ao solicitante.
          </p>
          <FormTextarea
            label="Motivo (opcional)"
            value={reason}
            maxLength={REJECT_REASON_MAX}
            onChange={(event) => setReason(event.target.value)}
            rows={4}
          />
        </div>
        <div className="adm-modal__footer">
          <button className="adm-btn adm-btn--ghost" onClick={() => setRejectTarget(null)} disabled={acting}>
            Cancelar
          </button>
          <button className="adm-btn adm-btn--danger" onClick={handleReject} disabled={acting}>
            {acting ? 'Aguarde…' : 'Rejeitar solicitação'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
