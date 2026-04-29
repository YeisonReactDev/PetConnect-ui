import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, Typography, Box, CircularProgress, Alert, 
  Card, CardContent, CardActions, Button, Avatar, Divider, Grid
} from '@mui/material';
import { supabase } from '../lib/supabaseClient';
import ValoracionDisplay from '../components/valoraciones/ValoracionDisplay';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function PrestadorPerfil() {
  const { id } = useParams<{ id: string }>();
  const [prestador, setPrestador] = useState<any>(null);
  const [servicios, setServicios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchPerfil();
    }
  }, [id]);

  const fetchPerfil = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch prestador
      const { data: pData, error: pError } = await supabase
        .from('prestadores')
        .select('*')
        .eq('id', id)
        .single();
      
      if (pError) throw pError;
      setPrestador(pData);

      // Fetch servicios
      const { data: sData, error: sError } = await supabase
        .from('servicios')
        .select('*')
        .eq('prestador_id', id)
        .eq('estado', 'ACTIVO');

      if (sError) throw sError;
      setServicios(sData || []);

    } catch (err: any) {
      setError(err.message || 'Prestador no encontrado');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !prestador) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Prestador no encontrado'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 6 }}>
        {prestador.logo_url ? (
          <Box 
            component="img" 
            src={prestador.logo_url} 
            alt={prestador.nombre_comercial} 
            sx={{ width: 200, height: 200, objectFit: 'cover', borderRadius: 2 }}
          />
        ) : (
          <Avatar sx={{ width: 200, height: 200, fontSize: 64 }}>
            {prestador.nombre_comercial?.charAt(0)}
          </Avatar>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h3" gutterBottom>{prestador.nombre_comercial}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
            <LocationOnIcon fontSize="small" />
            <Typography variant="body1">{prestador.ciudad || 'Ciudad no especificada'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'text.secondary' }}>
            <PhoneIcon fontSize="small" />
            <Typography variant="body1">{prestador.telefono || 'Teléfono no disponible'}</Typography>
          </Box>
          <Typography variant="body1" sx={{ mt: 2 }}>{prestador.descripcion}</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h4" gutterBottom>Servicios Disponibles</Typography>
      {servicios.length === 0 ? (
        <Typography color="text.secondary" sx={{ mb: 4 }}>Este prestador no tiene servicios activos actualmente.</Typography>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {servicios.map((s) => (
            <Grid item xs={12} sm={6} md={4} key={s.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>{s.nombre}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {s.descripcion}
                  </Typography>
                  <Typography variant="subtitle1" color="primary" fontWeight="bold">
                    ${s.precio?.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Duración: {s.duracion_minutos} min
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button component={Link} to={`/servicios/${s.id}`} variant="contained" fullWidth>
                    Agendar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Divider sx={{ my: 4 }} />

      <Typography variant="h4" gutterBottom>Valoraciones</Typography>
      <ValoracionDisplay prestadorId={prestador.id} />
    </Container>
  );
}