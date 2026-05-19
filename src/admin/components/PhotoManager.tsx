import { useState, useRef } from 'react';
import { Trash2, ImagePlus, Loader } from 'lucide-react';
import { photosService } from '../services/photosService';
import { useToast } from './Toast';
import type { PhotoResponse } from '../types';

interface Props {
  entityPath: string;
  entityId: string;
  initialPhotos: PhotoResponse[];
  title?: string;
}

export function PhotoManager({ entityPath, entityId, initialPhotos, title }: Props) {
  const [photos, setPhotos] = useState<PhotoResponse[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    try {
      const photo = await photosService.uploadForEntity(entityPath, entityId, file);
      setPhotos((prev) => [...prev, photo]);
      showToast('Foto adicionada com sucesso!', 'success');
    } catch {
      showToast('Erro ao enviar foto. Verifique o formato e tamanho (máx. 5MB).', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    setDeletingId(photoId);
    try {
      await photosService.delete(photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      showToast('Foto removida.', 'success');
    } catch {
      showToast('Erro ao remover foto.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="adm-card" style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 className="adm-serif" style={{ fontSize: 16, color: 'var(--adm-green)', margin: 0 }}>
          {title ?? 'Fotos'} ({photos.length})
        </h3>
        <button
          type="button"
          className="adm-btn adm-btn--primary"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {uploading ? <Loader size={16} style={{ animation: 'adm-spin 0.6s linear infinite' }} /> : <ImagePlus size={16} />}
          {uploading ? 'Enviando…' : 'Adicionar Foto'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {photos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--adm-text-muted)', fontSize: 14 }}>
          <ImagePlus size={32} style={{ opacity: 0.3, marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
          Nenhuma foto adicionada. Clique em "Adicionar Foto" para começar.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {photos.map((photo) => (
            <div
              key={photo.id}
              style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', aspectRatio: '4/3', background: 'var(--adm-bg)' }}
            >
              <img
                src={photo.url}
                alt={photo.description ?? 'Foto'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                loading="lazy"
              />
              <button
                type="button"
                onClick={() => handleDelete(photo.id)}
                disabled={deletingId === photo.id}
                aria-label="Remover foto"
                style={{
                  position: 'absolute', top: 6, right: 6,
                  background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: 6,
                  color: '#fff', cursor: 'pointer', padding: '4px 6px',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {deletingId === photo.id
                  ? <Loader size={14} style={{ animation: 'adm-spin 0.6s linear infinite' }} />
                  : <Trash2 size={14} />
                }
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
