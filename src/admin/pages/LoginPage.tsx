import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { BASE_URL } from '../services/api';
import logo from '../../assets/images/logo.webp';
import cachoeira from '../../assets/images/cachoeira.png';
import '../styles/admin.css';

type ErrorType = 'credentials' | 'social' | 'unknown' | null;
type Mode = 'login' | 'register';

const ERROR_MESSAGES: Record<NonNullable<ErrorType>, string> = {
  credentials: 'E-mail ou senha inválidos. Verifique suas credenciais.',
  social: 'Não foi possível autenticar com o Google. Tente novamente.',
  unknown: 'Ocorreu um erro inesperado. Tente novamente.',
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export function LoginPage() {
  const { login, register, isLoading, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/admin/dashboard';

  const [mode, setMode] = useState<Mode>('login');
  const [remember, setRemember] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [errorType, setErrorType] = useState<ErrorType>(null);

  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) navigate(from, { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, from]);

  const handleGoogleLogin = () => {
    setErrorType(null);
    window.location.href = `${BASE_URL}/oauth2/authorization/google`;
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorType(null);
    try {
      await login({ email, password });
    } catch {
      setErrorType('credentials');
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setErrorType(null);
    const parts = regName.trim().split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || undefined;
    const username = regEmail.split('@')[0];
    try {
      await register({ firstName, lastName, username, email: regEmail, password: regPassword });
    } catch {
      setErrorType('credentials');
    }
  };

  const isBusy = isLoading;

  return (
    <div className="adm-login">

      {/* ── Painel esquerdo — foto ── */}
      <div className="adm-login__photo-panel">
        <img src={cachoeira} alt="Cachoeira do Parque Nacional de Ubajara" className="adm-login__photo-img" />
        <div className="adm-login__photo-overlay" />
        <div className="adm-login__photo-top">
          <img src={logo} alt="Viva Ubajara" className="adm-login__left-logo-img" />
        </div>
        <div className="adm-login__photo-bottom">
          <blockquote className="adm-login__photo-quote">
            "Venha descobrir a natureza mais deslumbrante do Ceará"
          </blockquote>
          <div className="adm-login__photo-attr">
            <strong>Parque Nacional de Ubajara</strong>
            <span>Serra da Ibiapaba · Ceará · Brasil</span>
          </div>
        </div>
      </div>

      {/* ── Painel direito — formulário ── */}
      <div className="adm-login__right">
        <div className="adm-login__box">

          <div className="adm-login__logo-icon">
            <img src={logo} alt="Viva Ubajara" className="adm-login__logo-img" />
          </div>

          <div className="adm-login__header">
            <h1 className="adm-login__title">
              {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
            </h1>
            <p className="adm-login__sub">
              {mode === 'login'
                ? 'Entre para acessar o painel administrativo.'
                : 'Preencha os dados abaixo para começar.'}
            </p>
          </div>

          {errorType && (
            <div className="adm-login__error" role="alert">
              {ERROR_MESSAGES[errorType]}
            </div>
          )}

          <div className="adm-login__form-stage">

            {/* ── LOGIN ── */}
            <div className={`adm-login__form-panel${mode === 'login' ? ' is-active' : ' is-left'}`}>
              <form onSubmit={handleLogin} noValidate>
                <div className="adm-float-field">
                  <input
                    id="adm-email"
                    type="email"
                    placeholder=" "
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                    disabled={isBusy}
                  />
                  <label htmlFor="adm-email">E-mail</label>
                </div>

                <div className="adm-float-field">
                  <input
                    id="adm-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder=" "
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    disabled={isBusy}
                    style={{ paddingRight: '44px' }}
                  />
                  <label htmlFor="adm-password">Senha</label>
                  <button
                    type="button"
                    className="adm-float-field__eye"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="adm-login__remember-row">
                  <a href="#" className="adm-login__forgot">Esqueceu a senha?</a>
                  <label className="adm-toggle" title="Lembrar dados">
                    <span className="adm-toggle__label">Lembrar dados</span>
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    <span className="adm-toggle__track">
                      <span className="adm-toggle__thumb" />
                    </span>
                  </label>
                </div>

                <button type="submit" className="adm-btn adm-btn--primary adm-btn--full" disabled={isBusy}>
                  {isLoading
                    ? <><span className="adm-spinner adm-spinner--white" /> Verificando…</>
                    : 'Entrar'}
                </button>
              </form>

              <p className="adm-login__switch">
                Não tem conta?{' '}
                <button type="button" onClick={() => { setErrorType(null); setMode('register'); }}>
                  Cadastre-se
                </button>
              </p>

              <div className="adm-login__divider">ou entre por</div>

              <button
                type="button"
                className="adm-btn-social adm-btn-social--google adm-btn-social--full"
                onClick={handleGoogleLogin}
                disabled={isBusy}
              >
                <GoogleIcon />
                Continuar com Google
              </button>
            </div>

            {/* ── CADASTRO ── */}
            <div className={`adm-login__form-panel${mode === 'register' ? ' is-active' : ' is-right'}`}>
              <form onSubmit={handleRegister} noValidate>
                <div className="adm-float-field">
                  <input
                    id="reg-name"
                    type="text"
                    placeholder=" "
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    autoComplete="name"
                    disabled={isBusy}
                  />
                  <label htmlFor="reg-name">Nome completo</label>
                </div>

                <div className="adm-float-field">
                  <input
                    id="reg-email"
                    type="email"
                    placeholder=" "
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    autoComplete="email"
                    disabled={isBusy}
                  />
                  <label htmlFor="reg-email">E-mail</label>
                </div>

                <div className="adm-float-field">
                  <input
                    id="reg-password"
                    type={showRegPassword ? 'text' : 'password'}
                    placeholder=" "
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    disabled={isBusy}
                    style={{ paddingRight: '44px' }}
                  />
                  <label htmlFor="reg-password">Senha</label>
                  <button
                    type="button"
                    className="adm-float-field__eye"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    tabIndex={-1}
                    aria-label={showRegPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <button type="submit" className="adm-btn adm-btn--primary adm-btn--full" disabled={isBusy} style={{ marginTop: '8px' }}>
                  {isLoading
                    ? <><span className="adm-spinner adm-spinner--white" /> Criando conta…</>
                    : 'Criar conta'}
                </button>
              </form>

              <p className="adm-login__switch">
                Já tem conta?{' '}
                <button type="button" onClick={() => { setErrorType(null); setMode('login'); }}>
                  Entrar
                </button>
              </p>

              <div className="adm-login__divider">ou entre por</div>

              <button
                type="button"
                className="adm-btn-social adm-btn-social--google adm-btn-social--full"
                onClick={handleGoogleLogin}
                disabled={isBusy}
              >
                <GoogleIcon />
                Continuar com Google
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
