import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useModalBehavior } from '../../hooks/useModalBehavior';
import { Button } from '../../components/ui/Button';
import '../../components/ui/ui.css';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ title, message, confirmLabel, cancelLabel = 'Cancelar', tone = 'primary', loading, onConfirm, onCancel }: ConfirmDialogProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  useModalBehavior({ panelRef, onClose: onCancel, initialFocusRef: cancelRef });

  return createPortal(
    <div className="company-dialog">
      <div className="company-dialog__backdrop" onClick={onCancel} aria-hidden="true" />
      <div ref={panelRef} className="company-dialog__panel" role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId}>
        <h2 id={titleId} className="company-dialog__title">{title}</h2>
        <p id={descId} className="company-dialog__message">{message}</p>
        <div className="company-dialog__actions">
          <button ref={cancelRef} type="button" className="ui-btn ui-btn--outline" onClick={onCancel} disabled={loading}>{cancelLabel}</button>
          <Button variant="primary" className={tone === 'danger' ? 'company-btn--danger' : ''} onClick={onConfirm} disabled={loading}>
            {loading ? 'Aguarde…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
