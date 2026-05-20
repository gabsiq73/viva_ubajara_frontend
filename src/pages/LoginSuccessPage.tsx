import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../admin/hooks/useAuth';
import { decodePayload } from '../admin/services/jwtUtils';
import type { UserRole } from '../admin/types';

export function LoginSuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { applyAuthResponse } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    if (!token) { navigate('/admin/login', { replace: true }); return; }

    const payload = decodePayload(token);
    if (!payload) { navigate('/admin/login', { replace: true }); return; }

    try {
      const rawRole = payload.role ?? payload.roles ?? payload.authorities ?? 'USER';
      const role = String(Array.isArray(rawRole) ? rawRole[0] : rawRole) as UserRole;

      applyAuthResponse({
        token,
        email: String(payload.sub ?? payload.email ?? ''),
        role,
        name: payload.name ? String(payload.name) : undefined,
        photo: payload.photo ? String(payload.photo) : undefined,
      });

      navigate('/admin/dashboard', { replace: true });
    } catch {
      navigate('/admin/login', { replace: true });
    }
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#6b7280' }}>
      Autenticando...
    </div>
  );
}
