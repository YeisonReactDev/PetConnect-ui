import React, { useState } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  AppBar, Toolbar, Typography, Button, IconButton, 
  Drawer, List, ListItem, ListItemText, Box, CircularProgress
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Perfil from './pages/Perfil';
import Caninos from './pages/Caninos';
import CaninoDetalle from './pages/CaninoDetalle';
import Servicios from './pages/Servicios';
import ServicioDetalle from './pages/ServicioDetalle';
import ServiciosGestionar from './pages/ServiciosGestionar';
import Citas from './pages/Citas';
import CitasGestionar from './pages/CitasGestionar';
import Horarios from './pages/Horarios';
import PrestadorPerfil from './pages/PrestadorPerfil';
import Admin from './pages/Admin';
import { AuthProvider, useAuth } from './context/AuthProvider';
import NotificationCenter from './components/notifications/NotificationCenter';
import ProtectedRoute from './components/layout/ProtectedRoute';
import theme from './lib/theme';
import { supabase } from './lib/supabaseClient';

function Navigation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const rol = user?.user_metadata?.rol;

  const navLinks = [];
  if (user) {
    navLinks.push({ title: 'Inicio', path: '/' });
    navLinks.push({ title: 'Perfil', path: '/perfil' });
    if (rol === 'PROPIETARIO') {
      navLinks.push({ title: 'Mis Mascotas', path: '/caninos' });
      navLinks.push({ title: 'Servicios', path: '/servicios' });
      navLinks.push({ title: 'Mis Citas', path: '/citas' });
    }
    if (rol === 'PRESTADOR') {
      navLinks.push({ title: 'Mis Servicios', path: '/servicios/gestionar' });
      navLinks.push({ title: 'Gestionar Citas', path: '/citas/gestionar' });
      navLinks.push({ title: 'Horarios', path: '/horarios' });
    }
    if (rol === 'ADMINISTRADOR') {
      navLinks.push({ title: 'Admin', path: '/admin' });
    }
  } else {
    navLinks.push({ title: 'Inicio', path: '/' });
  }

  const drawerContent = (
    <Box onClick={() => setDrawerOpen(false)} sx={{ width: 250 }}>
      <List>
        {navLinks.map((link) => (
          <ListItem key={link.path} component={Link} to={link.path} sx={{ color: 'inherit', textDecoration: 'none' }}>
            <ListItemText primary={link.title} />
          </ListItem>
        ))}
        {!user ? (
          <ListItem component={Link} to="/auth" sx={{ color: 'inherit', textDecoration: 'none' }}>
            <ListItemText primary="Ingresar" />
          </ListItem>
        ) : (
          <ListItem onClick={handleLogout} sx={{ cursor: 'pointer' }}>
            <ListItemText primary="Cerrar Sesión" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>
            PetConnect 🐾
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
            {navLinks.map((link) => (
              <Button key={link.path} color="inherit" component={Link} to={link.path}>
                {link.title}
              </Button>
            ))}
            {!user ? (
              <Button color="inherit" variant="outlined" component={Link} to="/auth">
                Ingresar
              </Button>
            ) : (
              <>
                <NotificationCenter />
                <IconButton color="inherit" onClick={handleLogout} title="Cerrar Sesión">
                  <LogoutIcon />
                </IconButton>
              </>
            )}
          </Box>

          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
            {user && <NotificationCenter />}
            <IconButton color="inherit" edge="end" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {drawerContent}
      </Drawer>
    </>
  );
}

function MainLayout() {
  const { user, loading } = useAuth();
  const rol = user?.user_metadata?.rol;
  const defaultPath = rol === 'PRESTADOR' ? '/citas/gestionar' : '/citas';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={56} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navigation />
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#f3f4f6' }}>
        <Routes>
          {/* Root: send authenticated users to their default page */}
          <Route path="/" element={user ? <Navigate to={defaultPath} replace /> : <Home />} />

          {/* Auth: redirect away if already logged in */}
          <Route path="/auth" element={user ? <Navigate to={defaultPath} replace /> : <Auth />} />

          <Route path="/prestadores/:id" element={<PrestadorPerfil />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/caninos" element={<Caninos />} />
            <Route path="/caninos/:id" element={<CaninoDetalle />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/servicios/:id" element={<ServicioDetalle />} />
            <Route path="/servicios/gestionar" element={<ServiciosGestionar />} />
            <Route path="/citas" element={<Citas />} />
            <Route path="/citas/gestionar" element={<CitasGestionar />} />
            <Route path="/horarios" element={<Horarios />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}