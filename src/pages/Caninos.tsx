import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import CaninoCard from '../components/caninos/CaninoCard';
import CaninoForm from '../components/caninos/CaninoForm';
import {
  Container, Typography, Grid, Fab, Dialog, DialogTitle,
  DialogContent, CircularProgress, Box, Button
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PetsIcon from '@mui/icons-material/Pets';

export default function Caninos() {
  const [caninos, setCaninos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const fetchCaninos = async () => {
    setLoading(true);
    const { data } = await supabase.from('caninos').select('*').order('creado_at', { ascending: false });
    if (data) setCaninos(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCaninos();
  }, []);

  const handleClose = () => {
    setOpenModal(false);
    fetchCaninos();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative', minHeight: '80vh' }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Mis Mascotas
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {caninos.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'background.paper', borderRadius: 3 }}>
              <PetsIcon sx={{ fontSize: 72, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Aún no has registrado ninguna mascota.
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mb: 4 }}>
                Agrega a tu peludo compañero para empezar a agendar citas.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => setOpenModal(true)}
              >
                Registrar mi primera mascota
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {caninos.map((c) => (
                <Grid item xs={12} sm={6} md={4} key={c.id}>
                  <CaninoCard canino={c} />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      <Fab
        color="primary"
        onClick={() => setOpenModal(true)}
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        title="Agregar mascota"
      >
        <AddIcon />
      </Fab>

      <Dialog open={openModal} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Nueva Mascota</DialogTitle>
        <DialogContent dividers>
          <CaninoForm onSuccess={handleClose} />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
