import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Layout from './components/Layout.jsx'
import Catalogo from './pages/Catalogo.jsx'
import Contacto from './pages/Contacto.jsx'
import SobreMi from './pages/SobreMi.jsx'
import Personalizar from './pages/Personalizar.jsx'
import Checkout from './pages/Checkout.jsx'
import ClientDashboard from './pages/client/ClientDashboard.jsx'

// Admin Views
import Login from './pages/admin/Login.jsx'
import RequireAuth from './components/admin/RequireAuth.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

import ScrollToTop from './components/ScrollToTop.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider>
      <ToastProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<App />} />
              <Route path="catalogo/:categoria?" element={<Catalogo />} />
              <Route path="contacto" element={<Contacto />} />
              <Route path="sobre-mi" element={<SobreMi />} />

              {/* New Separated Flows */}
              <Route path="personalizar" element={<Personalizar />} />
              <Route path="formulario" element={<Personalizar />} /> {/* Legacy Redirect/Alias */}
              <Route path="checkout" element={<Checkout />} />

              <Route path="perfil" element={<ClientDashboard />} />
              <Route path="login" element={<Login />} />
            </Route>

            {/* Admin Routes (No Layout or distinct Layout) */}

            <Route element={<RequireAuth />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </CartProvider>
  </StrictMode>,
)
