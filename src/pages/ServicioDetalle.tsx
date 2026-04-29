import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthProvider';
import AppointmentForm from '../components/servicios/AppointmentForm';
import ValoracionDisplay from '../components/valoraciones/ValoracionDisplay';
import { Container, Typography, Card, CardContent, Button, Box, CircularProgress, Dialog, DialogTitle, DialogContent, Chip, Grid, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StoreIcon from '@mui/icons-material/Store';

export default function ServicioDetalle() {
  const { id } = useParams();
  const { user } = useAuth();
  const [servicio, setServicio] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    const fetchServicio = async () => {
      if (!id) return;
      setLoading(true);
      const { data } = await supabase
        .from('servicios')
        .select(`
          *,
          prestadores(nombre_comercial, direccion, descripcion),
          categorias_servicio(nombre)
        `)
        .eq('id', id)
        .single();
      
      setServicio(data);
      setLoading(false);
    };
    fetchServicio();
  }, [id]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
      <CircularProgress />
    </Box>
  );
  
  if (!servicio) return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h6" color="error">Servicio no encontrado.</Typography>
    </Container>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button 
        component={Link} 
        to="/servicios" 
        startIcon={<ArrowBackIcon />} 
        sx={{ mb: 3 }}
      >
        Volver a servicios
      </Button>

      <Card elevation={3} sx={{ borderRadius: 2, mb: 4 }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box>
              <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                {servicio.nombre}
              </Typography>
              <Chip 
                label={servicio.categorias_servicio?.nombre || 'Categoría General'} 
                color="primary" 
                variant="outlined" 
                sx={{ mt: 1 }}
              />
            </Box>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => setOpenModal(true)}
              disabled={!user || user.user_metadata?.rol !== 'PROPIETARIO'}
            >
              Agendar Cita
            </Button>
          </Box>

          {!user && (
            <Typography variant="body2" color="warning.main" sx={{ mb: 3 }}>
              Debes <Link to="/auth" style={{ color: 'inherit' }}>iniciar sesión</Link> como propietario para agendar una cita.
            </Typography>
          )}

          <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            Descripción
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ whiteSpace: 'pre-line' }}>
            {servicio.descripcion}
          </Typography>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <AttachMoneyIcon color="success" fontSize="large" />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Precio</Typography>
                  <Typography variant="h6" fontWeight="bold">${servicio.precio}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <AccessTimeIcon color="info" fontSize="large" />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Duración</Typography>
                  <Typography variant="h6" fontWeight="bold">{servicio.duracion_minutos} min</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 6, pt: 4, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StoreIcon color="primary" /> 
              Información del Prestador
            </Typography>
            <Typography variant="h6" gutterBottom>
              {servicio.prestadores?.nombre_comercial}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 2 }}>
              <LocationOnIcon fontSize="small" />
              <Typography variant="body2">{servicio.prestadores?.direccion || 'Dirección no especificada'}</Typography>
            </Box>
            {servicio.prestadores?.descripcion && (
              <Typography variant="body2" color="text.secondary">
                {servicio.prestadores.descripcion}
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Valoraciones del Prestador
            </Typography>
            {servicio.prestador_id && (
              <ValoracionDisplay prestadorId={servicio.prestador_id} />
            )}
          </Box>
        </CardContent>
      </Card>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agendar Cita: {servicio.nombre}</DialogTitle>
        <DialogContent dividers>
          <AppointmentForm 
            servicioId={servicio.id} 
            prestadorId={servicio.prestador_id} 
            onSuccess={() => setOpenModal(false)} 
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}