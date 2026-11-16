import { useState } from 'react';
import { Link } from 'react-router-dom';
import { claimsService } from '../../admin/services/claimsService';
import { useToast } from '../../admin/components/Toast';
import { ConfirmDialog } from './ConfirmDialog';
import Badge from '../../components/ui/Badge';
import Icon from '../../components/ui/Icon';
import { Button, ButtonLink } from '../../components/ui/Button';
import { CLAIM_STATUS_LABEL, CLAIM_TYPE_LABEL, claimErrorMessage, claimSpotPath, formatClaimDate } from '../../utils/claims';
import type { ClaimStatus, EstablishmentClaimResponse } from '../../admin/types';
import '../../components/ui/ui.css';
import './ClaimsPanel.css';

const STATUS_VARIANT = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger', CANCELLED: 'neutral' } as const satisfies Record<ClaimStatus, string>;

export function ClaimHint() {
  return (
    <section className="company-card company-claim-hint-card" aria-labelledby="company-claim-hint-title">
      <div className="company-card__body company-claim-hint">
        <span className="company-claim-hint__icon" aria-hidden="true"><Icon name="storefront" /></span>
        <div className="company-claim-hint__text">
          <h2 id="company-claim-hint-title">Já existe cadastro do seu negócio?</h2>
          <p>Abra a página do seu estabelecimento e use a seção "Esse estabelecimento é seu?" para pedir a titularidade, em vez de cadastrar de novo.</p>
        </div>
        <ButtonLink to="/estabelecimentos" variant="outline" icon="search">Buscar meu estabelecimento</ButtonLink>
      </div>
    </section>
  );
}

interface ClaimsPanelProps {
  claims: EstablishmentClaimResponse[];
  onChanged: () => void;
}

export function ClaimsPanel({ claims, onChanged }: ClaimsPanelProps) {
  const { showToast } = useToast();
  const [cancelTarget, setCancelTarget] = useState<EstablishmentClaimResponse | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const cancelClaim = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await claimsService.cancel(cancelTarget.id);
      showToast('Solicitação cancelada.', 'success');
    } catch (error) {
      showToast(claimErrorMessage(error, 'Não foi possível cancelar a solicitação. Tente novamente.'), 'error');
    } finally {
      setCancelling(false);
      setCancelTarget(null);
      onChanged();
    }
  };

  return (
    <section className="company-card" aria-labelledby="company-claims-title">
      <div className="company-card__head">
        <div>
          <h2 id="company-claims-title">Suas solicitações de titularidade</h2>
          <p>Acompanhe os pedidos para assumir estabelecimentos já cadastrados.</p>
        </div>
      </div>
      <ul className="company-claim-list">
        {claims.map((claim) => (
          <li key={claim.id} className="company-claim">
            <div className="company-claim__main">
              <div className="company-claim__title">
                <strong>{claim.spotName}</strong>
                <Badge variant={STATUS_VARIANT[claim.status]}>{CLAIM_STATUS_LABEL[claim.status]}</Badge>
              </div>
              <p className="company-claim__meta">
                {CLAIM_TYPE_LABEL[claim.spotType]} · enviada em {formatClaimDate(claim.createdAt)}
              </p>
              {claim.status === 'PENDING' && <p className="company-claim__note">Aguardando a análise da administração.</p>}
              {claim.status === 'APPROVED' && (
                <p className="company-claim__note company-claim__note--ok">Solicitação aprovada: seu estabelecimento já está no painel.</p>
              )}
              {claim.status === 'REJECTED' && (
                <p className="company-claim__note company-claim__note--danger">
                  {claim.rejectionReason ? <>Motivo: {claim.rejectionReason}</> : 'A solicitação não foi aceita. Nenhum motivo foi informado.'}
                </p>
              )}
            </div>
            <div className="company-claim__actions">
              <Link to={claimSpotPath(claim.spotId, claim.spotType)} className="company-claim__link">
                Ver página <Icon name="arrow_forward" />
              </Link>
              {claim.status === 'PENDING' && (
                <Button variant="outline" onClick={() => setCancelTarget(claim)}>Cancelar</Button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {cancelTarget && (
        <ConfirmDialog
          title="Cancelar solicitação?"
          message={`Sua solicitação para "${cancelTarget.spotName}" deixará de ser analisada. Você poderá enviar outra depois.`}
          confirmLabel="Cancelar solicitação"
          cancelLabel="Manter"
          tone="danger"
          loading={cancelling}
          onConfirm={() => void cancelClaim()}
          onCancel={() => setCancelTarget(null)}
        />
      )}
    </section>
  );
}
