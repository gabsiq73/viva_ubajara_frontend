import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  size?: 'md' | 'lg';
}

export function Modal({ isOpen, title, children, onClose, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div
        className={`adm-modal${size === 'lg' ? ' adm-modal--lg' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adm-modal__header">
          <h2 className="adm-modal__title">{title}</h2>
          <button className="adm-modal__close" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmModal({
  isOpen, title, message, confirmLabel = 'Deletar',
  onConfirm, onCancel, loading,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onCancel}>
      <div className="adm-modal__body">{message}</div>
      <div className="adm-modal__footer">
        <button className="adm-btn adm-btn--ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button className="adm-btn adm-btn--danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Aguarde…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
