import { useState, useEffect, useRef, type FormEvent } from 'react';
import { usersService } from '../services/usersService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import { FormInput } from '../components/FormField';
import { Spinner } from '../components/Spinner';
import { ShieldCheck, User, UserCog, Save, KeyRound, Camera, Loader } from 'lucide-react';
import type { UserResponse } from '../types';

const ROLE_LABELS = { ADMIN: 'Administrador', USER: 'Usuário', GUIDE: 'Guia' };
const ROLE_ICONS = {
  ADMIN: <ShieldCheck size={16} />,
  USER: <User size={16} />,
  GUIDE: <UserCog size={16} />,
};

export function ProfilePage() {
  const { user, updateUserPhoto } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [fetching, setFetching] = useState(true);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [savingInfo, setSavingInfo] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usersService.getMe()
      .then((data) => {
        setProfile(data);
        setFirstName(data.firstName ?? '');
        setLastName(data.lastName ?? '');
        setUsername(data.username ?? '');
        setEmail(data.email ?? '');
        if (data.photoUrl) setPreviewPhoto(data.photoUrl);
      })
      .catch(() => showToast('Erro ao carregar perfil.', 'error'))
      .finally(() => setFetching(false));
  }, []);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploadingPhoto(true);
    try {
      const localPreview = URL.createObjectURL(file);
      setPreviewPhoto(localPreview);
      const { photoUrl } = await usersService.uploadPhoto(file);
      updateUserPhoto(photoUrl);
      setPreviewPhoto(photoUrl);
      URL.revokeObjectURL(localPreview);
      showToast('Foto de perfil atualizada!', 'success');
    } catch {
      setPreviewPhoto(user?.photo ?? null);
      showToast('Erro ao enviar foto. Verifique o formato e tamanho (máx. 10MB).', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleInfoSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSavingInfo(true);
    try {
      await usersService.updateMe({ firstName, lastName, username, email });
      setProfile((prev) => prev ? { ...prev, firstName, lastName, username, email } : prev);
      showToast('Perfil atualizado com sucesso!', 'success');
    } catch {
      showToast('Erro ao atualizar perfil.', 'error');
    } finally {
      setSavingInfo(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPwdError('');
    if (newPassword.length < 6) { setPwdError('A senha deve ter no mínimo 6 caracteres.'); return; }
    if (newPassword !== confirmPassword) { setPwdError('As senhas não coincidem.'); return; }
    setSavingPwd(true);
    try {
      await usersService.updateMe({ password: newPassword });
      setNewPassword('');
      setConfirmPassword('');
      showToast('Senha alterada com sucesso!', 'success');
    } catch {
      showToast('Erro ao alterar senha.', 'error');
    } finally {
      setSavingPwd(false);
    }
  };

  if (fetching) return <Spinner center size="lg" />;

  const initials = [firstName, lastName]
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .join('') || (user?.email?.[0]?.toUpperCase() ?? '?');

  const currentPhoto = previewPhoto ?? user?.photo ?? null;
  const role = profile?.role ?? user?.role ?? 'USER';

  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">Meu Perfil</h2>
      </div>

      {/* Identity card */}
      <div className="adm-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>

          {/* Avatar with upload overlay */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              background: 'var(--adm-green)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30, fontWeight: 700, overflow: 'hidden',
              border: '3px solid var(--adm-green-dim)',
            }}>
              {currentPhoto
                ? <img src={currentPhoto} alt="Foto de perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials
              }
            </div>
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={uploadingPhoto}
              title="Alterar foto de perfil"
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--adm-gold)', border: '2px solid #fff',
                color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0,
              }}
            >
              {uploadingPhoto
                ? <Loader size={13} style={{ animation: 'adm-spin 0.6s linear infinite' }} />
                : <Camera size={13} />
              }
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--adm-text)', lineHeight: 1.2 }}>
              {[firstName, lastName].filter(Boolean).join(' ') || username || user?.email}
            </div>
            <div style={{ fontSize: 13, color: 'var(--adm-text-muted)', marginTop: 4 }}>
              @{username || '—'} · {user?.email}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, fontWeight: 600, color: 'var(--adm-green)', background: 'var(--adm-green-dim)', padding: '4px 10px', borderRadius: 20 }}>
              {ROLE_ICONS[role as keyof typeof ROLE_ICONS]}
              {ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role}
            </div>
          </div>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--adm-text-dim)' }}>
          Clique no ícone da câmera para alterar sua foto. Formatos aceitos: JPG, PNG, WEBP.
        </p>
      </div>

      {/* Info form */}
      <div className="adm-card" style={{ marginBottom: 16 }}>
        <h3 className="adm-serif" style={{ fontSize: 16, color: 'var(--adm-green)', marginBottom: 20 }}>
          Informações Pessoais
        </h3>
        <form className="adm-form" onSubmit={handleInfoSubmit}>
          <div className="adm-form-row">
            <FormInput label="Nome" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={20} />
            <FormInput label="Sobrenome" value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={20} />
          </div>
          <div className="adm-form-row">
            <FormInput label="Username" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={30} hint="Máx. 30 caracteres" />
            <FormInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="adm-form-actions">
            <button type="submit" className="adm-btn adm-btn--primary" disabled={savingInfo} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Save size={15} />
              {savingInfo ? 'Salvando…' : 'Salvar Informações'}
            </button>
          </div>
        </form>
      </div>

      {/* Password form */}
      <div className="adm-card">
        <h3 className="adm-serif" style={{ fontSize: 16, color: 'var(--adm-green)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <KeyRound size={17} />
          Alterar Senha
        </h3>
        <form className="adm-form" onSubmit={handlePasswordSubmit}>
          <div className="adm-form-row">
            <FormInput
              label="Nova Senha"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              hint="Mínimo 6 caracteres"
            />
            <FormInput
              label="Confirmar Nova Senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {pwdError && (
            <p style={{ fontSize: 13, color: 'var(--adm-red)', marginTop: -8 }}>{pwdError}</p>
          )}
          <div className="adm-form-actions">
            <button type="submit" className="adm-btn adm-btn--primary" disabled={savingPwd || !newPassword} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <KeyRound size={15} />
              {savingPwd ? 'Alterando…' : 'Alterar Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
