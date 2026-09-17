import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../admin/hooks/useAuth';
import { decodePayload } from '../admin/services/jwtUtils';
import { usersService } from '../admin/services/usersService';
import type { UserRole } from '../admin/types';

export function LoginSuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { applyAuthResponse, isAuthenticated, isAdmin, isCompany } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = params.get('token');
    if (!token) { navigate('/admin/login', { replace: true }); return; }

    const payload = decodePayload(token);
    if (!payload) { navigate('/admin/login', { replace: true }); return; }

    const email = String(payload.sub ?? payload.email ?? '');
    const name = payload.name ? String(payload.name) : undefined;
    const photo = payload.photo ? String(payload.photo) : undefined;

    try {
      // O JWT do login social não carrega claim de role (JwtService.generateToken
      // nunca recebe extra claims), então persistimos o token com um role provisório
      // e buscamos o role real em /users/me logo em seguida.
      applyAuthResponse({ token, email, role: 'USER' as UserRole, name, photo });

      usersService.getMe()
        .then((data) => {
          const realName = [data.firstName, data.lastName].filter(Boolean).join(' ') || name;
          applyAuthResponse({ token, email: data.email, role: data.role, name: realName, photo: data.photoUrl ?? photo });
        })
        .catch(() => {})
        .finally(() => setReady(true));
    } catch {
      navigate('/admin/login', { replace: true });
    }
  }, []);

  useEffect(() => {
    if (!ready || !isAuthenticated) return;
    if (isAdmin) navigate('/admin/dashboard', { replace: true });
    else if (isCompany) navigate('/empresa/estabelecimento', { replace: true });
    else navigate('/dashboard', { replace: true });
  }, [ready, isAuthenticated, isAdmin, isCompany, navigate]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#6b7280' }}>
      Autenticando...
    </div>
  );
}
