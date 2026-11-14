import type { MouseEvent } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./pages/style/globalStyle.css";
import "./pages/style/SkipLink.css";
import { AuthProvider } from "./admin/contexts/AuthContext";

import Index from "./pages/Index";
import PontoTuristico from "./pages/PontoTuristico";
import PontosTuristicos from "./pages/PontosTuristicos";
import Local from "./pages/Local";
import Estabelecimentos from "./pages/Estabelecimentos";
import Estabelecimento from "./pages/Estabelecimento";
import CadastroEmpresa from "./pages/CadastroEmpresa";
import Eventos from "./pages/Eventos";
import Evento from "./pages/Evento";
import ComoChegar from "./pages/ComoChegar";
import Depoimentos from "./pages/Depoimentos";
import Contato from "./pages/Contato";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { LoginSuccessPage } from "./pages/LoginSuccessPage";
import { AdminRouter } from "./admin/AdminRouter";
import { CompanyRouter } from "./company/CompanyRouter";
import ScrollToTop from "./components/ScrollToTop";

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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SkipLink />
        <ScrollToTop />
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
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
