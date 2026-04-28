import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Perfil from './pages/Perfil'
import Caninos from './pages/Caninos'
import CaninoDetalle from './pages/CaninoDetalle'
import Servicios from './pages/Servicios'
import ServicioDetalle from './pages/ServicioDetalle'
import ServiciosGestionar from './pages/ServiciosGestionar'
import Citas from './pages/Citas'
import CitasGestionar from './pages/CitasGestionar'
import { AuthProvider } from './context/AuthProvider'
import NotificationCenter from './components/notifications/NotificationCenter'

export default function App() {
  return (
    <AuthProvider>
      <div className="app-root">
        <header>
          <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px' }}>
            <div>
              <Link to="/">Inicio</Link> | <Link to="/auth">Entrar</Link> | <Link to="/perfil">Perfil</Link> | <Link to="/caninos">Mis mascotas</Link> | <Link to="/servicios">Servicios</Link> | <Link to="/citas">Mis citas</Link>
            </div>
            <NotificationCenter />
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/caninos" element={<Caninos />} />
            <Route path="/caninos/:id" element={<CaninoDetalle />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/servicios/:id" element={<ServicioDetalle />} />
            <Route path="/servicios/gestionar" element={<ServiciosGestionar />} />
            <Route path="/citas" element={<Citas />} />
            <Route path="/citas/gestionar" element={<CitasGestionar />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}
