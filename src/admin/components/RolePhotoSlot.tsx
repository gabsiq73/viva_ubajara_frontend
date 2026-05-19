import { useState, useRef, useEffect } from 'react';
import { ImagePlus, Trash2, RefreshCw, Loader } from 'lucide-react';
import { photosService } from '../services/photosService';
import { useToast } from './Toast';
import type { PhotoResponse } from '../types';

interface RolePhotoSlotProps {
  label: string;
  hint?: string;
  roleDescription: string;

  // Edit mode (entity already exists)
  entityPath?: string;
  entityId?: string;
  existingPhoto?: PhotoResponse | null;
  onPhotoUpdate?: (photo: PhotoResponse | null) => void;

  // Create mode (entity not created yet)
  pendingFile?: File | null;
  onPendingFileChange?: (file: File | null) => void;
}

export function RolePhotoSlot({
  label, hint, roleDescription,
  entityPath, entityId, existingPhoto, onPhotoUpdate,
  pendingFile, onPendingFileChange,
}: RolePhotoSlotProps) {
  const isEditMode = !!(entityPath && entityId);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!pendingFile) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(pendingFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const currentUrl = isEditMode ? (existingPhoto?.url ?? null) : previewUrl;
  const isBusy = uploading || deleting;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (isEditMode) {
      setUploading(true);
      try {
        if (existingPhoto) await photosService.delete(existingPhoto.id);
        const photo = await photosService.uploadForEntity(entityPath!, entityId!, file, roleDescription);
        onPhotoUpdate?.(photo);
        showToast('Foto atualizada!', 'success');
      } catch {
        showToast('Erro ao enviar foto.', 'error');
      } finally {
        setUploading(false);
      }
    } else {
      onPendingFileChange?.(file);
    }
  };

  const handleRemove = async () => {
    if (isEditMode && existingPhoto) {
      setDeleting(true);
      try {
        await photosService.delete(existingPhoto.id);
        onPhotoUpdate?.(null);
        showToast('Foto removida.', 'success');
      } catch {
        showToast('Erro ao remover foto.', 'error');
      } finally {
        setDeleting(false);
      }
    } else {
      onPendingFileChange?.(null);
    }
  };

  return (
    <div className="adm-role-slot">
      <span className="adm-role-slot__label">{label}</span>
      {hint && <span className="adm-field__hint">{hint}</span>}

      {currentUrl ? (
        <div className="adm-role-slot__preview">
          <img src={currentUrl} alt={label} className="adm-role-slot__img" />
          <div className="adm-role-slot__actions">
            <button
              type="button"
              className="adm-role-slot__btn adm-role-slot__btn--replace"
              onClick={() => fileRef.current?.click()}
              disabled={isBusy}
            >
              {uploading
                ? <Loader size={13} style={{ animation: 'adm-spin 0.6s linear infinite' }} />
                : <RefreshCw size={13} />}
              Trocar
            </button>
            <button
              type="button"
              className="adm-role-slot__btn adm-role-slot__btn--remove"
              onClick={handleRemove}
              disabled={isBusy}
            >
              {deleting
                ? <Loader size={13} style={{ animation: 'adm-spin 0.6s linear infinite' }} />
                : <Trash2 size={13} />}
              Remover
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="adm-role-slot__empty"
          onClick={() => fileRef.current?.click()}
          disabled={isBusy}
        >
          <ImagePlus size={22} />
          <span>Clique para adicionar</span>
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
    </div>
  );
}
