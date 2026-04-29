import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Rating, TextField, Typography, Alert } from '@mui/material';
import { supabase } from '../../lib/supabaseClient';

interface ValoracionFormProps {
  citaId: string;
  prestadorId: string;
  propietarioId: string;
  onSuccess: () => void;
}

export default function ValoracionForm({ citaId, prestadorId, propietarioId, onSuccess }: ValoracionFormProps) {
  const [puntuacion, setPuntuacion] = useState<number | null>(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exists, setExists] = useState(false);

  useEffect(() => {
    checkExisting();
  }, [citaId]);

  const checkExisting = async () => {
    try {
      const { data, error: err } = await supabase
        .from('valoraciones')
        .select('id')
        .eq('cita_id', citaId)
        .single();
      
      if (data) {
        setExists(true);
      }
    } catch (err) {
      // No rows found is fine, means we can review
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puntuacion || puntuacion < 1) {
      setError('Por favor selecciona una puntuación.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase
      .from('valoraciones')
      .insert({
        cita_id: citaId,
        prestador_id: prestadorId,
        propietario_id: propietarioId,
        puntuacion,
        comentario
      });

    setLoading(false);

    if (insertError) {
      console.error(insertError);
      setError('Error al enviar la valoración.');
    } else {
      onSuccess();
    }
  };

  if (checking) {
    return <CircularProgress size={24} />;
  }

  if (exists) {
    return <Typography color="text.secondary">Ya valoraste esta cita.</Typography>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <Box>
        <Typography component="legend">Puntuación</Typography>
        <Rating
          name="puntuacion"
          value={puntuacion}
          onChange={(event, newValue) => {
            setPuntuacion(newValue);
          }}
        />
      </Box>
      <TextField
        label="Comentario (opcional)"
        multiline
        rows={3}
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        fullWidth
      />
      <Button 
        type="submit" 
        variant="contained" 
        disabled={loading || !puntuacion}
        startIcon={loading ? <CircularProgress size={20} /> : undefined}
      >
        {loading ? 'Enviando...' : 'Enviar Valoración'}
      </Button>
    </Box>
  );
}