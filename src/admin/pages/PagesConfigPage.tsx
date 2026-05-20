import { useState, useEffect, useRef } from 'react';
import { pageConfigService } from '../services/pageConfigService';
import { useToast } from '../components/Toast';
import { Spinner } from '../components/Spinner';
import { Upload, Trash2, Save } from 'lucide-react';

interface PageCard {
  key: string;
  label: string;
  hint: string;
}

const PAGES: PageCard[] = [
  { key: 'PONTOS_TURISTICOS', label: 'Pontos Turísticos', hint: 'Página de listagem das atrações do parque' },
  { key: 'ESTABELECIMENTOS', label: 'Estabelecimentos', hint: 'Restaurantes, pousadas e hotéis' },
  { key: 'EVENTOS', label: 'Eventos', hint: 'Agenda de eventos e programação cultural' },
  { key: 'DEPOIMENTOS', label: 'Depoimentos', hint: 'Depoimentos dos visitantes' },
];

interface PageState {
  imageUrl: string | null;
  description: string;
  savedDescription: string;
  imageLoading: boolean;
  descSaving: boolean;
}

const EMPTY_STATE: PageState = {
  imageUrl: null,
  description: '',
  savedDescription: '',
  imageLoading: false,
  descSaving: false,
};

export function PagesConfigPage() {
  const { showToast } = useToast();
  const [states, setStates] = useState<Record<string, PageState>>(
    Object.fromEntries(PAGES.map(p => [p.key, { ...EMPTY_STATE }]))
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTarget = useRef<string | null>(null);

  useEffect(() => {
    PAGES.forEach(({ key }) => {
      pageConfigService.getConfig(key).then((data) => {
        setStates(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            imageUrl: data.imageUrl ?? null,
            description: data.description ?? '',
            savedDescription: data.description ?? '',
          },
        }));
      });
    });
  }, []);

  const update = (key: string, patch: Partial<PageState>) =>
    setStates(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  const triggerUpload = (key: string) => {
    uploadTarget.current = key;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const key = uploadTarget.current;
    if (!file || !key) return;
    e.target.value = '';
    update(key, { imageLoading: true });
    try {
      const url = await pageConfigService.uploadImage(key, file);
      update(key, { imageUrl: url });
      showToast('Imagem atualizada!', 'success');
    } catch { showToast('Erro ao enviar imagem.', 'error'); }
    finally { update(key, { imageLoading: false }); }
  };

  const handleRemoveImage = async (key: string) => {
    update(key, { imageLoading: true });
    try {
      await pageConfigService.removeImage(key);
      update(key, { imageUrl: null });
      showToast('Imagem removida.', 'success');
    } catch { showToast('Erro ao remover imagem.', 'error'); }
    finally { update(key, { imageLoading: false }); }
  };

  const handleSaveDescription = async (key: string) => {
    const desc = states[key].description;
    update(key, { descSaving: true });
    try {
      await pageConfigService.updateDescription(key, desc);
      update(key, { savedDescription: desc });
      showToast('Descrição salva!', 'success');
    } catch { showToast('Erro ao salvar descrição.', 'error'); }
    finally { update(key, { descSaving: false }); }
  };

  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">Configurar Páginas</h2>
      </div>
      <p style={{ color: 'var(--adm-text-muted)', marginBottom: 24, fontSize: 14 }}>
        Configure a imagem de capa e a descrição exibidas no topo de cada página pública.
      </p>

      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
        {PAGES.map(({ key, label, hint }) => {
          const s = states[key];
          const descChanged = s.description !== s.savedDescription;

          return (
            <div key={key} className="adm-card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Cover image */}
              <div style={{ position: 'relative', aspectRatio: '16/7', background: '#f0f0f0' }}>
                {s.imageUrl ? (
                  <img src={s.imageUrl} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--adm-text-muted)', fontSize: 13, flexDirection: 'column', gap: 8 }}>
                    <Upload size={28} style={{ opacity: 0.4 }} />
                    <span>Sem imagem de capa</span>
                  </div>
                )}
                {s.imageLoading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Spinner size="lg" />
                  </div>
                )}
              </div>

              <div style={{ padding: '16px 20px 20px' }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--adm-text-muted)', marginBottom: 14 }}>{hint}</div>

                {/* Image actions */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <button className="adm-btn adm-btn--primary adm-btn--sm" onClick={() => triggerUpload(key)} disabled={s.imageLoading}>
                    <Upload size={14} /> {s.imageUrl ? 'Trocar capa' : 'Enviar capa'}
                  </button>
                  {s.imageUrl && (
                    <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => handleRemoveImage(key)} disabled={s.imageLoading}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Description */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--adm-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Descrição da página
                  </label>
                  <textarea
                    value={s.description}
                    onChange={(e) => update(key, { description: e.target.value })}
                    placeholder="Texto exibido no subtítulo da página..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--adm-border)',
                      borderRadius: 8,
                      fontSize: 13,
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      outline: 'none',
                      boxSizing: 'border-box',
                      color: 'var(--adm-text)',
                      background: '#fff',
                    }}
                  />
                </div>
                <button
                  className="adm-btn adm-btn--primary adm-btn--sm"
                  onClick={() => handleSaveDescription(key)}
                  disabled={s.descSaving || !descChanged}
                >
                  <Save size={14} /> {s.descSaving ? 'Salvando…' : 'Salvar descrição'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
