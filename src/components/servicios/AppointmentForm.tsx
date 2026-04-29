import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthProvider';
import { Box, TextField, Button, MenuItem, Select, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material';

export default function AppointmentForm({ 
  servicioId, 
  prestadorId, 
  onSuccess 
}: { 
  servicioId: number, 
  prestadorId: number, 
  onSuccess?: () => void 
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [caninos, setCaninos] = useState<any[]>([]);
  const [caninoId, setCaninoId] = useState('');
  const [fechaHora, setFechaHora] = useState('');
  const [notas, setNotas] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCaninos = async () => {
      if (!user) return;
      const { data: propietario } = await supabase.from('propietarios').select('id').eq('usuario_id', user.id).single();
      
      if (propietario) {
        const { data } = await supabase.from('caninos').select('id, nombre').eq('propietario_id', propietario.id);
        if (data) setCaninos(data);
      }
    };
    fetchCaninos();
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    
    try {
      const { data: propietario } = await supabase.from('propietarios').select('id').eq('usuario_id', user.id).single();
      if (!propietario) throw new Error("No se encontró el propietario");

      const payload = {
        propietario_id: propietario.id,
        canino_id: caninoId,
        servicio_id: servicioId,
        prestador_id: prestadorId,
        fecha_hora_cita: new Date(fechaHora).toISOString(),
        notas,
        estado: 'SOLICITADA'
      };

      const { error: insErr } = await supabase.from('citas').insert([payload]);
      if (insErr) throw insErr;
      
      if (onSuccess) onSuccess();
      navigate('/citas');
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al agendar la cita.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      
      <FormControl fullWidth required>
        <InputLabel id="canino-label">Selecciona tu mascota</InputLabel>
        <Select
          labelId="canino-label"
          value={caninoId}
          label="Selecciona tu mascota"
          onChange={(e) => setCaninoId(e.target.value)}
        >
          {caninos.length === 0 ? (
            <MenuItem value="" disabled>No tienes mascotas registradas</MenuItem>
          ) : (
            caninos.map((c) => (
              <MenuItem key={c.id} value={c.id.toString()}>{c.nombre}</MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      <TextField
        label="Fecha y Hora"
        type="datetime-local"
        value={fechaHora}
        onChange={(e) => setFechaHora(e.target.value)}
        required
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
      />
      
      <TextField
        label="Notas (opcional)"
        multiline
        rows={3}
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
        fullWidth
        placeholder="Información adicional para el prestador..."
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        disabled={loading || !caninoId || !fechaHora}
        startIcon={loading && <CircularProgress size={20} color="inherit" />}
        sx={{ mt: 2 }}
      >
        {loading ? 'Agendando...' : 'Confirmar Cita'}
      </Button>
    </Box>
  );
}