import React, { useEffect, useState } from 'react';
import { Box, Typography, Rating, CircularProgress, Chip } from '@mui/material';
import { supabase } from '../../lib/supabaseClient';

interface ValoracionDisplayProps {
  prestadorId: string;
}

export default function ValoracionDisplay({ prestadorId }: ValoracionDisplayProps) {
  const [valoraciones, setValoraciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    fetchValoraciones();
  }, [prestadorId]);

  const fetchValoraciones = async () => {
    try {
      const { data, error } = await supabase
        .from('valoraciones')
        .select('*')
        .eq('prestador_id', prestadorId)
        .order('creado_at', { ascending: false });

      if (error) throw error;

      setValoraciones(data || []);
      
      if (data && data.length > 0) {
        const sum = data.reduce((acc, curr) => acc + curr.puntuacion, 0);
        setAvgRating(sum / data.length);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (valoraciones.length === 0) {
    return <Typography color="text.secondary">Sin valoraciones aún</Typography>;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Rating value={avgRating} readOnly precision={0.5} />
        <Typography variant="body1">
          ({valoraciones.length} valoraciones)
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {valoraciones.map((v) => (
          <Box key={v.id} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip label={<Rating value={v.puntuacion} size="small" readOnly />} variant="outlined" />
              <Typography variant="caption" color="text.secondary">
                {new Date(v.creado_at).toLocaleDateString()}
              </Typography>
            </Box>
            {v.comentario && (
              <Typography variant="body2">{v.comentario}</Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}