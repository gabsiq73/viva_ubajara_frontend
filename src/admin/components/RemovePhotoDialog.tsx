import { ConfirmDialog } from '../../company/components/ConfirmDialog';

interface RemovePhotoDialogProps {
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RemovePhotoDialog({ loading, onConfirm, onCancel }: RemovePhotoDialogProps) {
  return (
    <ConfirmDialog
      title="Remover foto?"
      message="Esta foto será removida do site e a ação não pode ser desfeita."
      confirmLabel="Remover foto"
      tone="danger"
      loading={loading}
      onConfirm={onConfirm}
      onCancel={() => { if (!loading) onCancel(); }}
    />
  );
}
