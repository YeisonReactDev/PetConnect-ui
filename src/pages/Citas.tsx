import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthProvider';
import AppointmentCard from '../components/servicios/AppointmentCard';
import ValoracionForm from '../components/valoraciones/ValoracionForm';
import {
  Container, Typography, Box, CircularProgress, Select, MenuItem,
  FormControl, InputLabel, Grid, Button, Snackbar, Alert, Collapse, Card, CardContent
} from '@mui/material';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';

const CANCELLABLE_STATES = ['SOLICITADA', 'ACEPTADA'];

export default function Citas() {
  const { user } = useAuth();
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [propietarioId, setPropietarioId] = useState<string | null>(null);
  const [openReviewId, setOpenReviewId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success'
  });

  const fetchCitas = async () => {
    if (!user) return;
    setLoading(true);

    const { data: propietario } = await supabase
      .from('propietarios')
      .select('id')
      .eq('usuario_id', user.id)
      .single();

    if (propietario) {
      setPropietarioId(propietario.id);
      let query = supabase
        .from('citas')
        .select(`
          *,
          servicios(nombre),
          caninos(nombre),
          prestadores(nombre_comercial)
        `)
        .eq('propietario_id', propietario.id)
        .order('fecha_hora_cita', { ascending: false });

      if (filter) query = query.eq('estado', filter);

      const { data } = await query;
      if (data) setCitas(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCitas();
  }, [user, filter]);

  const handleCancel = async (citaId: string) => {
    setCancellingId(citaId);
    const { error } = await supabase
      .from('citas')
      .update({ estado: 'CANCELADA' })
      .eq('id', citaId);

    if (error) {
      setSnackbar({ open: true, message: 'No se pudo cancelar la cita. Intenta de nuevo.', severity: 'error' });
    } else {
      setSnackbar({ open: true, message: 'Cita cancelada correctamente.', severity: 'success' });
      fetchCitas();
    }
    setCancellingId(null);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Mis Citas
        </Typography>

        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel id="filter-label">Estado</InputLabel>
          <Select
            labelId="filter-label"
            value={filter}
            label="Estado"
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="SOLICITADA">Solicitadas</MenuItem>
            <MenuItem value="ACEPTADA">Aceptadas</MenuItem>
            <MenuItem value="RECHAZADA">Rechazadas</MenuItem>
            <MenuItem value="REPROGRAMADA">Reprogramadas</MenuItem>
            <MenuItem value="COMPLETADA">Completadas</MenuItem>
            <MenuItem value="CANCELADA">Canceladas</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {citas.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'background.paper', borderRadius: 3 }}>
                <EventBusyIcon sx={{ fontSize: 72, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {filter
                    ? `No tienes citas con estado "${filter.toLowerCase()}".`
                    : 'Aún no has agendado ninguna cita.'}
                </Typography>
                {!filter && (
                  <>
                    <Typography variant="body2" color="text.disabled" sx={{ mb: 4 }}>
                      Explora los servicios disponibles y agenda tu primera cita.
                    </Typography>
                    <Button
                      component={Link}
                      to="/servicios"
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<SearchIcon />}
                    >
                      Explorar Servicios
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          ) : (
            citas.map((cita) => (
              <Grid item xs={12} key={cita.id}>
                <Box>
                  <AppointmentCard
                    appointment={cita}
                    canCancel={CANCELLABLE_STATES.includes(cita.estado)}
                    onCancel={() => handleCancel(cita.id)}
                    cancelling={cancellingId === cita.id}
                  />
                  {cita.estado === 'COMPLETADA' && propietarioId && (
                    <Box sx={{ mt: 1 }}>
                      <Button
                        size="small"
                        startIcon={<StarIcon />}
                        onClick={() => setOpenReviewId(openReviewId === cita.id ? null : cita.id)}
                        color="warning"
                        variant={openReviewId === cita.id ? 'contained' : 'outlined'}
                      >
                        {openReviewId === cita.id ? 'Cerrar valoración' : 'Valorar servicio'}
                      </Button>
                      <Collapse in={openReviewId === cita.id}>
                        <Card variant="outlined" sx={{ mt: 1 }}>
                          <CardContent>
                            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                              Valora tu experiencia con {cita.prestadores?.nombre_comercial}
                            </Typography>
                            <ValoracionForm
                              citaId={cita.id}
                              prestadorId={cita.prestador_id}
                              propietarioId={propietarioId}
                              onSuccess={() => {
                                setOpenReviewId(null);
                                setSnackbar({ open: true, message: '¡Valoración enviada! Gracias.', severity: 'success' });
                              }}
                            />
                          </CardContent>
                        </Card>
                      </Collapse>
                    </Box>
                  )}
                </Box>
              </Grid>
            ))
          )}
        </Grid>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
