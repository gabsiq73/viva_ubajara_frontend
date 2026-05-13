import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import { AdminRouter } from "./admin/AdminRouter";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ─── Rotas públicas — NÃO MODIFICADAS ─── */}
        <Route path="/" element={<Index/>}/>

        {/* ─── Área administrativa isolada ─── */}
        <Route path="/admin/*" element={<AdminRouter />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
