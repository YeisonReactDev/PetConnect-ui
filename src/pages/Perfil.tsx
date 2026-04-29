import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { supabase } from '../lib/supabaseClient';
import { Container, Card, CardContent, Typography, TextField, Button, Avatar, Box, Alert, CircularProgress } from '@mui/material';

export default function Perfil() {
  const { user, signOut } = useAuth();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const isPrestador = user?.user_metadata?.rol === 'PRESTADOR';
  const tableName = isPrestador ? 'prestadores' : 'propietarios';

  useEffect(() => {
    const fetchPerfil = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase.from(tableName).select('*').eq('usuario_id', user.id).single();
      if (data) {
        setNombre(isPrestador ? data.nombre_comercial || '' : data.nombre || '');
        setApellido(data.apellido || '');
        setTelefono(isPrestador ? data.telefono_comercial || '' : data.telefono || '');
      }
      setLoading(false);
    };
    fetchPerfil();
  }, [user, isPrestador, tableName]);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate required name field before hitting DB
    const nombreFinal = nombre.trim() || user.email?.split('@')[0] || 'Usuario';

    setSaving(true);
    setStatus(null);

    // Step 1: Ensure a matching row exists in public.usuarios.
    // propietarios.usuario_id and prestadores.usuario_id are FKs → usuarios(id).
    // Supabase Auth creates auth.users but NOT public.usuarios — the trigger in
    // 006_auth_sync_trigger.sql handles new signups, but existing accounts need
    // this client-side upsert as a safety net.
    const rol = (user.user_metadata?.rol || 'PROPIETARIO') as string;
    const { error: usuarioError } = await supabase
      .from('usuarios')
      .upsert({ id: user.id, email: user.email!, rol }, { onConflict: 'id' });

    if (usuarioError) {
      setStatus({ type: 'error', msg: 'Error al sincronizar usuario: ' + usuarioError.message });
      setSaving(false);
      return;
    }

    // Step 2: Upsert the role-specific profile row.
    // IMPORTANT: prestadores uses telefono_comercial, propietarios uses telefono.
    const payload: Record<string, string> = { usuario_id: user.id };
    if (isPrestador) {
      payload.nombre_comercial = nombreFinal;
      payload.telefono_comercial = telefono;
    } else {
      payload.nombre = nombreFinal;
      payload.apellido = apellido;
      payload.telefono = telefono;
    }

    const { error } = await supabase.from(tableName).upsert(payload, { onConflict: 'usuario_id' });

    if (error) {
      setStatus({ type: 'error', msg: 'Error al guardar el perfil: ' + error.message });
    } else {
      setStatus({ type: 'success', msg: 'Perfil actualizado correctamente' });
    }
    setSaving(false);
  };

  if (!user) return null;

  const initials = nombre ? nombre.charAt(0).toUpperCase() : (user.email?.charAt(0).toUpperCase() || 'U');

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card elevation={3} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
          <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main', fontSize: 32 }}>
            {initials}
          </Avatar>
          
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Tu Perfil
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {user.email} • {user.user_metadata?.rol || 'Usuario'}
          </Typography>

          {loading ? (
            <CircularProgress sx={{ mt: 4 }} />
          ) : (
            <Box component="form" onSubmit={guardar} sx={{ width: '100%', mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {status && <Alert severity={status.type}>{status.msg}</Alert>}
              
              <TextField
                label={isPrestador ? "Nombre Comercial" : "Nombre"}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                fullWidth
                variant="outlined"
              />
              
              {!isPrestador && (
                <TextField
                  label="Apellido"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  fullWidth
                  variant="outlined"
                />
              )}
              
              <TextField
                label="Teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                fullWidth
                variant="outlined"
              />
              
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={() => signOut()}
                >
                  Cerrar Sesión
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}