import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  TextField, Button, Alert, CircularProgress, Box, Typography,
  MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';

export default function SignupForm() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('PROPIETARIO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nombre, apellido, rol }
        }
      });
      if (res.error) {
        setError(res.error.message);
      } else {
        setSuccessEmail(email);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (successEmail) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 4 }}>
        <EmailIcon color="primary" sx={{ fontSize: 64 }} />
        <Typography variant="h5" fontWeight="bold" align="center">
          ¡Revisa tu correo!
        </Typography>
        <Alert severity="info" sx={{ width: '100%' }}>
          Enviamos un enlace de verificación a <strong>{successEmail}</strong>.
          Ábrelo para activar tu cuenta. Si no lo ves, revisa la carpeta de spam.
        </Alert>
        <Typography variant="body2" color="text.secondary" align="center">
          Una vez verificado, podrás iniciar sesión normalmente.
        </Typography>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h5" component="h2" align="center" fontWeight="bold">
        Crea tu cuenta
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          fullWidth
          variant="outlined"
        />
        <TextField
          label="Apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          required
          fullWidth
          variant="outlined"
        />
      </Box>

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
        helperText="Mínimo 6 caracteres"
      />

      <FormControl fullWidth required>
        <InputLabel id="rol-label">Tipo de cuenta</InputLabel>
        <Select
          labelId="rol-label"
          value={rol}
          label="Tipo de cuenta"
          onChange={(e) => setRol(e.target.value as string)}
        >
          <MenuItem value="PROPIETARIO">Dueño de mascota (Propietario)</MenuItem>
          <MenuItem value="PRESTADOR">Clínica / Veterinario (Prestador)</MenuItem>
        </Select>
      </FormControl>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        disabled={loading}
        startIcon={loading && <CircularProgress size={20} color="inherit" />}
        sx={{ mt: 2 }}
      >
        {loading ? 'Creando...' : 'Crear cuenta'}
      </Button>
    </Box>
  );
}
