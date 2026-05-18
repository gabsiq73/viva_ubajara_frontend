import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./pages/style/globalStyle.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./admin/contexts/AuthContext";

import Index from "./pages/Index";
import PontoTuristico from "./pages/PontoTuristico";
import PontosTuristicos from "./pages/PontosTuristicos";
import Estabelecimentos from "./pages/Estabelecimentos";
import Estabelecimento from "./pages/Estabelecimento";
import Eventos from "./pages/Eventos";
import Evento from "./pages/Evento";
import ComoChegar from "./pages/ComoChegar";
import Depoimentos from "./pages/Depoimentos";
import Contato from "./pages/Contato";
import Dashboard from "./pages/Dashboard";
import { AdminRouter } from "./admin/AdminRouter";
import ScrollToTop from "./components/ScrollToTop";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* ─── Rotas públicas ─── */}
            <Route path="/" element={<Index />} />
            <Route path="/pontos-turisticos" element={<PontosTuristicos />} />
            <Route path="/pontos/:id" element={<PontoTuristico />} />
            <Route path="/estabelecimentos" element={<Estabelecimentos />} />
            <Route path="/estabelecimentos/:id" element={<Estabelecimento />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/eventos/:id" element={<Evento />} />
            <Route path="/como-chegar" element={<ComoChegar />} />
            <Route path="/depoimentos" element={<Depoimentos />} />
            <Route path="/contato" element={<Contato />} />

            {/* ─── Área do usuário autenticado ─── */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* ─── Área administrativa isolada ─── */}
            <Route path="/admin/*" element={<AdminRouter />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
