import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UnauthorizedRoleError } from '../contexts/AuthContext';
import { Leaf } from 'lucide-react';
import '../styles/admin.css';

type ErrorType = 'credentials' | 'role' | 'unknown' | null;

const ERROR_MESSAGES: Record<NonNullable<ErrorType>, string> = {
  credentials: 'Email ou senha inválidos. Verifique suas credenciais.',
  role: 'Acesso restrito a administradores. Sua conta não possui permissão.',
  unknown: 'Ocorreu um erro inesperado. Tente novamente.',
};

export function LoginPage() {
  const { login, isLoading, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/admin/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorType, setErrorType] = useState<ErrorType>(null);

  // Escuta as mudanças no contexto e navega quando logado
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, from]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorType(null);

    try {
      await login({ email, password });
    } catch (err) {
      if (err instanceof UnauthorizedRoleError) {
        setErrorType('role');
      } else {
        setErrorType('credentials');
      }
    }
  };

  return (
    <div className="adm-login">
      <div className="adm-login__header">
        <div className="adm-login__logo-icon">
          <Leaf size={24} fill="currentColor" />
        </div>
        <h1 className="adm-login__title">Viva Ubajara</h1>
        <p className="adm-login__sub">Painel Administrativo</p>
      </div>

      <div className="adm-login__box">
        <h2 className="adm-login__box-title">Acessar Conta</h2>
        <p className="adm-login__box-sub">Entre com suas credenciais para gerenciar o destino.</p>

        {errorType && (
          <div className="adm-login__error">
            {ERROR_MESSAGES[errorType]}
          </div>
        )}

        <form className="adm-form" onSubmit={handleSubmit}>
          <div className="adm-field">
            <label>E-mail Corporativo</label>
            <input
              id="admin-email"
              type="email"
              placeholder="exemplo@vivaubajara.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="adm-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Senha</label>
              <a href="#" style={{ fontSize: '12px', color: '#4a90d9', textDecoration: 'none' }}>
                Esqueceu a senha?
              </a>
            </div>
            <input
              id="admin-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="adm-field--toggle" style={{ margin: '8px 0', fontSize: '13px' }}>
            <input type="checkbox" id="remember" />
            <label htmlFor="remember" style={{ color: 'var(--adm-text-dim)' }}>Lembrar acesso neste dispositivo</label>
          </div>

          <button
            type="submit"
            className="adm-btn adm-btn--primary"
            disabled={isLoading}
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
          >
            {isLoading ? 'Verificando…' : 'Entrar no Painel'}
          </button>
        </form>
      </div>

    </div>
  );
}
