import { useState, useEffect, useRef } from 'react';
import { pageConfigService } from '../services/pageConfigService';
import { useToast } from '../components/Toast';
import { Spinner } from '../components/Spinner';
import { Upload, Trash2 } from 'lucide-react';

interface PageCard {
  key: string;
  label: string;
  description: string;
}

const PAGES: PageCard[] = [
  { key: 'ESTABELECIMENTOS', label: 'Estabelecimentos', description: 'Capa da página de estabelecimentos (restaurantes e hospedagem)' },
  { key: 'EVENTOS', label: 'Eventos', description: 'Capa da página de eventos' },
  { key: 'DEPOIMENTOS', label: 'Depoimentos', description: 'Capa da página de depoimentos de visitantes' },
];

export function PagesConfigPage() {
  const { showToast } = useToast();
  const [images, setImages] = useState<Record<string, string | null>>({});
  const [loadingKeys, setLoadingKeys] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTarget = useRef<string | null>(null);

  useEffect(() => {
    PAGES.forEach(({ key }) => {
      pageConfigService.getImageUrl(key).then((url) => {
        setImages((prev) => ({ ...prev, [key]: url }));
      });
    });
  }, []);

  const setLoading = (key: string, val: boolean) =>
    setLoadingKeys((prev) => ({ ...prev, [key]: val }));

  const triggerUpload = (key: string) => {
    uploadTarget.current = key;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const key = uploadTarget.current;
    if (!file || !key) return;
    e.target.value = '';
    setLoading(key, true);
    try {
      const url = await pageConfigService.uploadImage(key, file);
      setImages((prev) => ({ ...prev, [key]: url }));
      showToast('Imagem atualizada com sucesso!', 'success');
    } catch { showToast('Erro ao enviar imagem.', 'error'); }
    finally { setLoading(key, false); }
  };

  const handleRemove = async (key: string) => {
    setLoading(key, true);
    try {
      await pageConfigService.removeImage(key);
      setImages((prev) => ({ ...prev, [key]: null }));
      showToast('Imagem removida.', 'success');
    } catch { showToast('Erro ao remover imagem.', 'error'); }
    finally { setLoading(key, false); }
  };

  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">Configurar Páginas</h2>
      </div>
      <p style={{ color: 'var(--adm-text-muted)', marginBottom: 24, fontSize: 14 }}>
        Defina a imagem de capa exibida no topo de cada página pública.
      </p>

      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {PAGES.map(({ key, label, description }) => {
          const imageUrl = images[key];
          const isLoading = loadingKeys[key];

          return (
            <div key={key} className="adm-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ position: 'relative', aspectRatio: '16/7', background: '#f0f0f0' }}>
                {imageUrl ? (
                  <img src={imageUrl} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--adm-text-muted)', fontSize: 13, flexDirection: 'column', gap: 8 }}>
                    <Upload size={28} style={{ opacity: 0.4 }} />
                    <span>Sem imagem de capa</span>
                  </div>
                )}
                {isLoading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Spinner size="lg" />
                  </div>
                )}
              </div>
              <div style={{ padding: '16px 20px' }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--adm-text-muted)', marginBottom: 14 }}>{description}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="adm-btn adm-btn--primary adm-btn--sm" onClick={() => triggerUpload(key)} disabled={isLoading}>
                    <Upload size={14} /> {imageUrl ? 'Trocar imagem' : 'Enviar imagem'}
                  </button>
                  {imageUrl && (
                    <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => handleRemove(key)} disabled={isLoading}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
