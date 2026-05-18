import { useRef, useEffect } from 'react';
import { ImagePlus, X } from 'lucide-react';

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
}

export function PhotoPicker({ files, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const previewUrls = useRef<string[]>([]);

  useEffect(() => {
    previewUrls.current = files.map((f) => URL.createObjectURL(f));
    return () => {
      previewUrls.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length) onChange([...files, ...picked]);
    e.target.value = '';
  };

  const remove = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="adm-photo-picker">
      <div className="adm-photo-picker__header">
        <label className="adm-photo-picker__label">Fotos</label>
        <button
          type="button"
          className="adm-btn adm-btn--ghost"
          onClick={() => fileRef.current?.click()}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 12px' }}
        >
          <ImagePlus size={15} />
          Adicionar foto
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          style={{ display: 'none' }}
          onChange={handleAdd}
        />
      </div>

      {files.length === 0 ? (
        <p className="adm-photo-picker__empty">
          Nenhuma foto selecionada. As fotos serão enviadas ao salvar.
        </p>
      ) : (
        <div className="adm-photo-picker__grid">
          {files.map((file, i) => {
            const url = URL.createObjectURL(file);
            return (
              <div key={i} className="adm-photo-picker__thumb">
                <img src={url} alt={file.name} onLoad={() => URL.revokeObjectURL(url)} />
                <button
                  type="button"
                  className="adm-photo-picker__remove"
                  onClick={() => remove(i)}
                  aria-label="Remover foto"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
