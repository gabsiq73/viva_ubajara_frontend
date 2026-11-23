import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useModalBehavior } from '../../hooks/useModalBehavior';
import { Button } from '../../components/ui/Button';
import { usePresence } from '../../utils/usePresence';
import '../../components/ui/ui.css';
import './ConfirmDialog.css';

const EXIT_MS = 150;
const SHEET_EXIT_MS = 250;
const SHEET_QUERY = '(max-width: 480px)';

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
  const [closing, setClosing] = useState(false);
  const { state } = usePresence(!closing, SHEET_EXIT_MS);
  const cancelTimer = useRef<number | undefined>(undefined);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    onCancelRef.current = onCancel;
  });

  useEffect(() => () => window.clearTimeout(cancelTimer.current), []);

  // Cancelar/Esc/backdrop tocam a animação de saída antes de avisar quem renderiza; confirmar fecha pelo chamador, que costuma desmontar já.
  const requestCancel = () => {
    if (closing || loading) return;
    setClosing(true);
    const exitMs = window.matchMedia(SHEET_QUERY).matches ? SHEET_EXIT_MS : EXIT_MS;
    cancelTimer.current = window.setTimeout(() => onCancelRef.current(), exitMs);
  };

  useModalBehavior({ panelRef, onClose: requestCancel, initialFocusRef: cancelRef, enabled: !closing });

  return createPortal(
    <div className="company-dialog" data-state={state}>
      <div className="company-dialog__backdrop" onClick={requestCancel} aria-hidden="true" />
      <div ref={panelRef} className="company-dialog__panel" role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId}>
        <h2 id={titleId} className="company-dialog__title">{title}</h2>
        <p id={descId} className="company-dialog__message">{message}</p>
        <div className="company-dialog__actions">
          <button ref={cancelRef} type="button" className="ui-btn ui-btn--outline" onClick={requestCancel} disabled={loading}>{cancelLabel}</button>
          <Button variant="primary" className={tone === 'danger' ? 'company-btn--danger' : ''} onClick={onConfirm} disabled={loading}>
            {loading ? 'Aguarde…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
