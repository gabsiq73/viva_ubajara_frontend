import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../admin/hooks/useAuth';
import { decodePayload } from '../admin/services/jwtUtils';
import { usersService } from '../admin/services/usersService';
import { Button, ButtonLink } from '../components/ui/Button';
import StateBlock from '../components/ui/StateBlock';
import { consumeReturnTo } from '../utils/returnTo';
import { useDocumentTitle } from '../utils/useDocumentTitle';
import type { UserRole } from '../admin/types';
import '../components/ui/ui.css';
import './style/PageState.css';

export function LoginSuccessPage() {
  useDocumentTitle('Entrando');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { applyAuthResponse, logout, isAuthenticated, isAdmin, isCompany } = useAuth();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const returnTarget = useRef<string | null | undefined>(undefined);
  const token = params.get('token');

  useEffect(() => {
    if (!token) { navigate('/admin/login', { replace: true }); return; }

    const payload = decodePayload(token);
    if (!payload) { navigate('/admin/login', { replace: true }); return; }

    const email = String(payload.sub ?? payload.email ?? '');
    const name = payload.name ? String(payload.name) : undefined;
    const photo = payload.photo ? String(payload.photo) : undefined;
    let cancelled = false;

    try {
      // O JWT do login social não carrega claim de role (JwtService.generateToken
      // nunca recebe extra claims), então persistimos o token com um role provisório
      // e buscamos o role real em /users/me logo em seguida.
      applyAuthResponse({ token, email, role: 'USER' as UserRole, name, photo });

      usersService.getMe()
        .then((data) => {
          if (cancelled) return;
          const realName = [data.firstName, data.lastName].filter(Boolean).join(' ') || name;
          applyAuthResponse({ token, email: data.email, role: data.role, name: realName, photo: data.photoUrl ?? photo });
          setReady(true);
        })
        .catch(() => {
          if (cancelled) return;
          // Sem o papel real, seguir com o provisório mandaria admin/empresa para o perfil comum.
          logout();
          setFailed(true);
        });
    } catch {
      navigate('/admin/login', { replace: true });
    }

    return () => { cancelled = true; };
  }, [token, attempt, navigate, applyAuthResponse, logout]);

  useEffect(() => {
    if (!ready || !isAuthenticated) return;
    if (isAdmin) { navigate('/admin/dashboard', { replace: true }); return; }
    if (returnTarget.current === undefined) returnTarget.current = consumeReturnTo();
    navigate(returnTarget.current ?? (isCompany ? '/empresa/estabelecimento' : '/dashboard'), { replace: true });
  }, [ready, isAuthenticated, isAdmin, isCompany, navigate]);

  const retry = () => {
    setFailed(false);
    setAttempt((n) => n + 1);
  };

  return (
    <main className="pg-fullscreen" id="conteudo" tabIndex={-1}>
      {failed ? (
        <StateBlock
          variant="error"
          icon="wifi_off"
          title="Não conseguimos concluir seu login"
          actions={
            <>
              <Button icon="refresh" onClick={retry}>Tentar de novo</Button>
              <ButtonLink to="/admin/login" variant="outline">Voltar ao login</ButtonLink>
            </>
          }
        >
          Não foi possível confirmar seu perfil de acesso. Verifique a conexão e tente de novo.
        </StateBlock>
      ) : (
        <div className="pg-loading pg-loading--page" role="status">
          <span className="pg-spinner" aria-hidden="true" />
          Autenticando…
        </div>
      )}
    </main>
  );
}
