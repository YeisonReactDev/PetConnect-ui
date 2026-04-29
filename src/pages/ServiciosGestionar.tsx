import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthProvider';
import ServiceForm from '../components/servicios/ServiceForm';
import { 
  Container, Typography, Box, Fab, Dialog, DialogTitle, DialogContent, 
  CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, IconButton, Chip 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ServiciosGestionar() {
  const { user } = useAuth();
  const [servicios, setServicios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);

  const fetchMisServicios = async () => {
    if (!user) return;
    setLoading(true);
    
    // First find the prestador id for the current user
    const { data: prestador } = await supabase.from('prestadores').select('id').eq('usuario_id', user.id).maybeSingle();
    
    if (prestador) {
      const { data } = await supabase
        .from('servicios')
        .select('*, categorias_servicio(nombre)')
        .eq('prestador_id', prestador.id)
        .order('creado_at', { ascending: false });
      
      if (data) setServicios(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMisServicios();
  }, [user]);

  const handleClose = () => {
    setOpenModal(false);
    setEditingService(null);
    fetchMisServicios();
  };

  const handleEdit = (servicio: any) => {
    setEditingService(servicio);
    setOpenModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      await supabase.from('servicios').update({ estado: 'INACTIVO' }).eq('id', id);
      fetchMisServicios();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative', minHeight: '80vh' }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Gestionar Mis Servicios
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={2} sx={{ mt: 4 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell><strong>Nombre</strong></TableCell>
                <TableCell><strong>Categoría</strong></TableCell>
                <TableCell align="right"><strong>Precio ($)</strong></TableCell>
                <TableCell align="right"><strong>Duración (min)</strong></TableCell>
                <TableCell align="center"><strong>Estado</strong></TableCell>
                <TableCell align="center"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {servicios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    No tienes servicios registrados. Haz clic en el botón + para agregar uno.
                  </TableCell>
                </TableRow>
              ) : (
                servicios.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell>{s.nombre}</TableCell>
                    <TableCell>{s.categorias_servicio?.nombre || '-'}</TableCell>
                    <TableCell align="right">{s.precio}</TableCell>
                    <TableCell align="right">{s.duracion_minutos}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={s.estado} 
                        color={s.estado === 'ACTIVO' ? 'success' : 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => handleEdit(s)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(s.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Fab 
        color="primary" 
        onClick={() => setOpenModal(true)}
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
      >
        <AddIcon />
      </Fab>

      <Dialog open={openModal} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
        </DialogTitle>
        <DialogContent dividers>
          <ServiceForm existing={editingService} onSuccess={handleClose} />
        </DialogContent>
      </Dialog>
    </Container>
  );
}