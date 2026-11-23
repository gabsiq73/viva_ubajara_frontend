import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import Icon from '../../components/ui/Icon';
import Badge from '../../components/ui/Badge';
import { useBrokenImage } from '../../hooks/useBrokenImage';
import { formatFileSize } from '../utils/fields';
import { MAX_PHOTOS, type PendingPhoto } from '../utils/photos';
import type { PhotoResponse } from '../../admin/types';

function SentPhoto({ photo }: { photo: PhotoResponse }) {
  const image = useBrokenImage(photo.url);
  return image.show
    ? <img src={photo.url} alt={photo.description || 'Foto do estabelecimento'} onError={image.onError} />
    : <span className="company-photo-item__broken"><Icon name="photo" /><span>Imagem indisponível</span></span>;
}

interface PhotoUploaderProps {
  existing: PhotoResponse[];
  pending: PendingPhoto[];
  disabled: boolean;
  progress: { current: number; total: number } | null;
  uploadError: string | null;
  rejections: string[];
  onAddFiles: (files: File[]) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onRetry: () => void;
  onDismissRejections: () => void;
}

export function PhotoUploader({ existing, pending, disabled, progress, uploadError, rejections, onAddFiles, onRemove, onMove, onRetry, onDismissRejections }: PhotoUploaderProps) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const total = existing.length + pending.length;
  const full = total >= MAX_PHOTOS;

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    onAddFiles(Array.from(event.target.files ?? []));
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) onAddFiles(Array.from(event.dataTransfer.files));
  };

  return (
    <div className="company-photos">
      <input ref={input} className="company-photos__input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple tabIndex={-1} aria-hidden="true" onChange={handleSelect} />

      <button
        type="button"
        className={`company-photo-drop${dragging ? ' is-dragging' : ''}`}
        disabled={disabled || full}
        onClick={() => input.current?.click()}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <span className="company-photo-drop__icon"><Icon name="cloud_upload" /></span>
        <strong>{full ? 'Você atingiu o limite de fotos' : 'Selecionar fotos do estabelecimento'}</strong>
        <small>JPG, PNG, WEBP ou GIF · até 5 MB por foto · {total} de {MAX_PHOTOS} fotos</small>
      </button>

      {rejections.length > 0 && (
        <div className="company-alert" role="alert">
          <Icon name="error" filled />
          <div className="company-alert__body">
            <strong>{rejections.length === 1 ? 'Uma foto não foi adicionada' : `${rejections.length} fotos não foram adicionadas`}</strong>
            <ul>{rejections.map((message) => <li key={message}>{message}</li>)}</ul>
            <div className="company-alert__actions">
              <button type="button" className="ui-btn ui-btn--outline" onClick={onDismissRejections}>Entendi</button>
            </div>
          </div>
        </div>
      )}

      {progress && (
        <div className="company-progress" role="status">
          <span>Enviando foto {progress.current} de {progress.total}…</span>
          <progress max={progress.total} value={progress.current - 1} aria-label="Progresso do envio das fotos" />
        </div>
      )}

      {uploadError && pending.length > 0 && !progress && (
        <div className="company-alert" role="alert">
          <Icon name="cloud_off" filled />
          <div className="company-alert__body">
            <strong>{pending.length === 1 ? '1 foto ainda não foi enviada' : `${pending.length} fotos ainda não foram enviadas`}</strong>
            <span>Seu cadastro já está salvo. {uploadError}</span>
            <div className="company-alert__actions">
              <button type="button" className="ui-btn ui-btn--primary" disabled={disabled} onClick={onRetry}>
                <Icon name="refresh" />
                Tentar enviar novamente
              </button>
            </div>
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <div className="company-photo-group">
          <h3>{uploadError ? 'Aguardando envio' : 'Fotos para enviar'}</h3>
          <ul className="company-photo-grid">
            {pending.map((photo, index) => (
              <li className="company-photo-item" key={photo.id}>
                <div className="company-photo-item__media">
                  <img src={photo.preview} alt={`Prévia da foto ${index + 1}: ${photo.file.name}`} />
                  {existing.length === 0 && index === 0 && <Badge variant="success" className="company-photo-item__cover">Capa</Badge>}
                </div>
                <div className="company-photo-item__meta">
                  <span title={photo.file.name}>{photo.file.name}</span>
                  <small>{formatFileSize(photo.file.size)}</small>
                </div>
                <div className="company-photo-item__actions">
                  <button type="button" aria-label={`Mover ${photo.file.name} para a esquerda`} disabled={disabled || index === 0} onClick={() => onMove(photo.id, -1)}><Icon name="arrow_back" /></button>
                  <button type="button" aria-label={`Mover ${photo.file.name} para a direita`} disabled={disabled || index === pending.length - 1} onClick={() => onMove(photo.id, 1)}><Icon name="arrow_forward" /></button>
                  <button type="button" className="is-danger" aria-label={`Remover ${photo.file.name}`} disabled={disabled} onClick={() => onRemove(photo.id)}><Icon name="delete" /></button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {existing.length > 0 && (
        <div className="company-photo-group">
          <h3>Fotos já enviadas</h3>
          <ul className="company-photo-grid">
            {existing.map((photo) => (
              <li className="company-photo-item company-photo-item--sent" key={photo.id}>
                <div className="company-photo-item__media">
                  <SentPhoto photo={photo} />
                </div>
                <div className="company-photo-item__meta">
                  <span>{photo.description || 'Foto do estabelecimento'}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
