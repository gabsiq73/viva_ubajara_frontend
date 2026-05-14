import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import PontoTuristico from "./pages/PontoTuristico";
import PontosTuristicos from "./pages/PontosTuristicos";
import Estabelecimentos from "./pages/Estabelecimentos";
import Estabelecimento from "./pages/Estabelecimento";
import Eventos from "./pages/Eventos";
import Evento from "./pages/Evento";
import { AdminRouter } from "./admin/AdminRouter";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* ─── Rotas públicas ─── */}
        <Route path="/" element={<Index/>}/>
        <Route path="/pontos-turisticos" element={<PontosTuristicos/>}/>
        <Route path="/pontos/:id" element={<PontoTuristico/>}/>
        <Route path="/estabelecimentos" element={<Estabelecimentos/>}/>
        <Route path="/estabelecimentos/:id" element={<Estabelecimento/>}/>
        <Route path="/eventos" element={<Eventos/>}/>
        <Route path="/eventos/:id" element={<Evento/>}/>

        {/* ─── Área administrativa isolada ─── */}
        <Route path="/admin/*" element={<AdminRouter />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
