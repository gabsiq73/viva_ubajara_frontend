import { useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { useModalBehavior } from '../../hooks/useModalBehavior';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  size?: 'md' | 'lg';
  role?: 'dialog' | 'alertdialog';
  descriptionId?: string;
}

function ModalDialog({ title, children, onClose, size = 'md', role = 'dialog', descriptionId }: Omit<ModalProps, 'isOpen'>) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  useModalBehavior({ panelRef, onClose, initialFocusRef: panelRef });

  return (
    <div
      className="adm-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        className={`adm-modal${size === 'lg' ? ' adm-modal--lg' : ''}`}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        style={{ outline: 'none' }}
      >
        <div className="adm-modal__header">
          <h2 id={titleId} className="adm-modal__title">{title}</h2>
          <button type="button" className="adm-modal__close" aria-label="Fechar" onClick={onClose}>
            <span aria-hidden="true">×</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Modal({ isOpen, ...props }: ModalProps) {
  if (!isOpen) return null;
  return <ModalDialog {...props} />;
}

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmModal({
  isOpen, title, message, confirmLabel = 'Deletar', tone = 'danger',
  onConfirm, onCancel, loading,
}: ConfirmModalProps) {
  const messageId = useId();
  return (
    <Modal isOpen={isOpen} title={title} onClose={onCancel} role="alertdialog" descriptionId={messageId}>
      <div id={messageId} className="adm-modal__body">{message}</div>
      <div className="adm-modal__footer">
        <button type="button" className="adm-btn adm-btn--ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button type="button" className={`adm-btn adm-btn--${tone}`} onClick={onConfirm} disabled={loading}>
          {loading ? 'Aguarde…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
