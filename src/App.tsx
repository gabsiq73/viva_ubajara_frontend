import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import PontoTuristico from "./pages/PontoTuristico";
import { AdminRouter } from "./admin/AdminRouter";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ─── Rotas públicas ─── */}
        <Route path="/" element={<Index/>}/>
        <Route path="/pontos/:id" element={<PontoTuristico/>}/>

        {/* ─── Área administrativa isolada ─── */}
        <Route path="/admin/*" element={<AdminRouter />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
