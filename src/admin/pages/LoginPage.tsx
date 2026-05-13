import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UnauthorizedRoleError } from '../contexts/AuthContext';
import '../styles/admin.css';

type ErrorType = 'credentials' | 'role' | 'unknown' | null;

const ERROR_MESSAGES: Record<NonNullable<ErrorType>, string> = {
  credentials: 'Email ou senha inválidos. Verifique suas credenciais.',
  role: 'Acesso restrito a administradores. Sua conta não possui permissão para acessar este painel.',
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

  // Escuta as mudanças no contexto e só navega quando tiver certeza que o estado global atualizou
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
      // A navegação agora acontece automaticamente via useEffect acima
    } catch (err) {
      if (err instanceof UnauthorizedRoleError) {
        // Usuário válido mas sem role ADMIN
        setErrorType('role');
      } else {
        // Credenciais erradas (401) ou erro de rede
        setErrorType('credentials');
      }
    }
  };

  return (
    <div className="adm-root adm-login">
      <div className="adm-login__box">
        <div className="adm-login__logo">
          <div className="adm-login__logo-icon">🌿</div>
          <h1 className="adm-login__title">Área Administrativa</h1>
          <p className="adm-login__sub">Parque Nacional de Ubajara</p>
        </div>

        {errorType && (
          <div
            className="adm-login__error"
            style={errorType === 'role' ? {
              borderColor: 'var(--adm-gold)',
              background: 'rgba(197,139,36,0.1)',
              color: 'var(--adm-gold)',
            } : {}}
          >
            {errorType === 'role' && <span style={{ marginRight: 6 }}>🔒</span>}
            {ERROR_MESSAGES[errorType]}
          </div>
        )}

        <form className="adm-form" onSubmit={handleSubmit}>
          <div className="adm-field">
            <label>Email</label>
            <input
              id="admin-email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="username"
            />
          </div>
          <div className="adm-field">
            <label>Senha</label>
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
          <button
            type="submit"
            className="adm-btn adm-btn--primary"
            disabled={isLoading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            {isLoading ? 'Verificando…' : 'Entrar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--adm-text-dim)' }}>
          Acesso exclusivo para administradores do parque.
        </p>
      </div>
    </div>
  );
}
