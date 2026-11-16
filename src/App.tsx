import { lazy, Suspense, type MouseEvent } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./pages/style/globalStyle.css";
import "./pages/style/SkipLink.css";
import { AuthProvider } from "./admin/contexts/AuthContext";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import ChunkErrorBoundary from "./components/ChunkErrorBoundary";
import { PageLoading } from "./pages/PageState";

const PontoTuristico = lazy(() => import("./pages/PontoTuristico"));
const PontosTuristicos = lazy(() => import("./pages/PontosTuristicos"));
const Local = lazy(() => import("./pages/Local"));
const Estabelecimentos = lazy(() => import("./pages/Estabelecimentos"));
const Estabelecimento = lazy(() => import("./pages/Estabelecimento"));
const CadastroEmpresa = lazy(() => import("./pages/CadastroEmpresa"));
const Eventos = lazy(() => import("./pages/Eventos"));
const Evento = lazy(() => import("./pages/Evento"));
const ComoChegar = lazy(() => import("./pages/ComoChegar"));
const Depoimentos = lazy(() => import("./pages/Depoimentos"));
const Contato = lazy(() => import("./pages/Contato"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const LoginSuccessPage = lazy(() =>
  import("./pages/LoginSuccessPage").then((m) => ({ default: m.LoginSuccessPage })),
);
const AdminRouter = lazy(() => import("./admin/AdminRouter").then((m) => ({ default: m.AdminRouter })));
const CompanyRouter = lazy(() => import("./company/CompanyRouter").then((m) => ({ default: m.CompanyRouter })));

function SkipLink() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin") || pathname.startsWith("/empresa")) return null;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("conteudo");
    if (!target) return;
    event.preventDefault();
    target.focus();
    target.scrollIntoView();
  };

  return (
    <a href="#conteudo" className="skip-link" onClick={handleClick}>
      Ir para o conteúdo
    </a>
  );
}

function AppRoutes() {
  const { pathname } = useLocation();

  return (
    <ChunkErrorBoundary resetKey={pathname}>
      <Suspense fallback={<PageLoading fullPage />}>
        <Routes>
          {/* ─── Rotas públicas ─── */}
          <Route path="/" element={<Index />} />
          <Route path="/pontos-turisticos" element={<PontosTuristicos />} />
          <Route path="/pontos/:id" element={<PontoTuristico />} />
          <Route path="/local/:id" element={<Local />} />
          <Route path="/estabelecimentos" element={<Estabelecimentos />} />
          <Route path="/estabelecimentos/:id" element={<Estabelecimento />} />
          <Route path="/cadastro-empresa" element={<CadastroEmpresa />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/eventos/:id" element={<Evento />} />
          <Route path="/como-chegar" element={<ComoChegar />} />
          <Route path="/depoimentos" element={<Depoimentos />} />
          <Route path="/contato" element={<Contato />} />

          {/* ─── Área do usuário autenticado ─── */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* ─── Callback OAuth2 (Google / GitHub) ─── */}
          <Route path="/login-success" element={<LoginSuccessPage />} />

          {/* ─── Área administrativa isolada ─── */}
          <Route path="/admin/*" element={<AdminRouter />} />

          {/* ─── Área self-service da empresa ─── */}
          <Route path="/empresa/*" element={<CompanyRouter />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ChunkErrorBoundary>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SkipLink />
        <ScrollToTop />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
