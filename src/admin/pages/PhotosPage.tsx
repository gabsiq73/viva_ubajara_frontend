import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { ImagePlus } from 'lucide-react';
import { photosService } from '../services/photosService';
import { useToast } from '../components/Toast';
import { Spinner } from '../components/Spinner';
import type { PhotoResponse } from '../types';

export function PhotosPage() {
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);
  const [description, setDescription] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const uploadFile = async (file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Formato inválido. Use JPEG, PNG ou WEBP.', 'error'); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Arquivo muito grande. Máximo 5MB.', 'error'); return;
    }
    setUploading(true);
    try {
      const photo = await photosService.upload(file, description);
      setPhotos((prev) => [photo, ...prev]);
      setDescription('');
      showToast('Foto enviada com sucesso!', 'success');
    } catch {
      showToast('Erro ao enviar foto.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    Array.from(files).forEach(uploadFile);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault(); setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDelete = async (photoId: string) => {
    setDeleting(photoId);
    try {
      await photosService.delete(photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      showToast('Foto deletada.', 'success');
    } catch {
      showToast('Erro ao deletar foto.', 'error');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">Fotos <span>Upload direto para S3</span></h2>
      </div>

      <div className="adm-card" style={{ marginBottom: 24 }}>
        <div className="adm-field" style={{ marginBottom: 16 }}>
          <label>Descrição (opcional)</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva a imagem…" />
        </div>

        <div
          className={`adm-upload-zone${dragOver ? ' drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }} onChange={(e: ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)} />
          {uploading ? (
            <>
              <Spinner size="lg" />
              <p>Enviando…</p>
            </>
          ) : (
            <>
              <div className="adm-upload-zone__icon-wrap">
                <ImagePlus size={28} />
              </div>
              <p>Arraste imagens aqui ou clique para selecionar</p>
              <p className="adm-upload-zone__hint">JPEG, PNG, WEBP — máximo 5MB por arquivo</p>
            </>
          )}
        </div>
      </div>

      {photos.length > 0 && (
        <div className="adm-card">
          <h3 style={{ marginBottom: 16, fontSize: 15 }}>Fotos enviadas nesta sessão ({photos.length})</h3>
          <div className="adm-photo-grid">
            {photos.map((p) => (
              <div key={p.id} className="adm-photo-item">
                <img src={p.url} alt={p.description ?? 'foto'} />
                <button
                  className="adm-photo-item__del"
                  onClick={() => handleDelete(p.id)}
                  disabled={deleting === p.id}
                  title="Deletar"
                >
                  {deleting === p.id ? '…' : '✕'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
