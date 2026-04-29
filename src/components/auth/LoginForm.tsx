import React, { useState } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { TextField, Button, Alert, CircularProgress, Box, Typography, Link } from '@mui/material';

export default function LoginForm() {
  const { signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signIn(email, password);
      if (res.error) setError(res.error.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await resetPassword(email);
      if (res.error) setError(res.error.message);
      else setResetSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showReset) {
    return (
      <Box component="form" onSubmit={handleReset} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h5" component="h2" align="center" fontWeight="bold">
          Restablecer Contraseña
        </Typography>

        {resetSent ? (
          <Alert severity="success">
            Se envió un enlace de recuperación a <strong>{email}</strong>. Revisa tu bandeja (y la carpeta de spam).
          </Alert>
        ) : (
          <>
            {error && <Alert severity="error">{error}</Alert>}
            <Typography variant="body2" color="text.secondary">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </Typography>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              variant="outlined"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </Button>
          </>
        )}

        <Box sx={{ textAlign: 'center' }}>
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={() => { setShowReset(false); setResetSent(false); setError(null); }}
          >
            ← Volver al inicio de sesión
          </Link>
        </Box>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h5" component="h2" align="center" fontWeight="bold">
        Bienvenido a PetConnect
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
        variant="outlined"
      />

      <TextField
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
        variant="outlined"
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        disabled={loading}
        startIcon={loading && <CircularProgress size={20} color="inherit" />}
        sx={{ mt: 1 }}
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Link
          component="button"
          type="button"
          variant="body2"
          onClick={() => { setShowReset(true); setError(null); }}
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </Box>
    </Box>
  );
}
