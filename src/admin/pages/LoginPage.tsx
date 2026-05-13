import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/admin.css';

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/admin/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch {
      setError('Email ou senha inválidos. Verifique as credenciais e tente novamente.');
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

        {error && <div className="adm-login__error">{error}</div>}

        <form className="adm-form" onSubmit={handleSubmit}>
          <div className="adm-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="adm-field">
            <label>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="adm-btn adm-btn--primary" disabled={isLoading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            {isLoading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
