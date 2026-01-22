import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Layout from './components/Layout.jsx'
import Catalogo from './pages/Catalogo.jsx'
import Contacto from './pages/Contacto.jsx'
import SobreMi from './pages/SobreMi.jsx'
import FormularioPedido from './components/FormularioPedido.jsx'

// Admin Views
import Login from './pages/admin/Login.jsx'
import RequireAuth from './components/admin/RequireAuth.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<App />} />
          <Route path="catalogo/:categoria?" element={<Catalogo />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="sobre-mi" element={<SobreMi />} />
          <Route path="formulario" element={<FormularioPedido />} />
        </Route>

        {/* Admin Routes (No Layout or distinct Layout) */}
        <Route path="/login" element={<Login />} />

        <Route element={<RequireAuth />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
