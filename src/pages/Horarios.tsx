import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, CircularProgress, Alert, Button, 
  Select, MenuItem, InputLabel, FormControl, TextField, Table, 
  TableBody, TableCell, TableHead, TableRow, Paper, TableContainer, IconButton 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthProvider';

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function Horarios() {
  const { user } = useAuth();
  const [prestadorId, setPrestadorId] = useState<string | null>(null);
  const [horarios, setHorarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dia, setDia] = useState<number>(1);
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('17:00');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data: pData, error: pError } = await supabase
        .from('prestadores')
        .select('id')
        .eq('usuario_id', user.id)
        .single();
      
      if (pError) throw pError;
      setPrestadorId(pData.id);

      const { data: hData, error: hError } = await supabase
        .from('horarios_disponibilidad')
        .select('*')
        .eq('prestador_id', pData.id)
        .order('dia_semana')
        .order('hora_inicio');
      
      if (hError) throw hError;
      setHorarios(hData || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar horarios');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prestadorId) return;
    setAdding(true);
    setError(null);
    try {
      const { error: insertError } = await supabase
        .from('horarios_disponibilidad')
        .insert({
          prestador_id: prestadorId,
          dia_semana: dia,
          hora_inicio: horaInicio,
          hora_fin: horaFin
        });

      if (insertError) throw insertError;
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Error al agregar horario');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const { error: delError } = await supabase
        .from('horarios_disponibilidad')
        .delete()
        .eq('id', id);
      
      if (delError) throw delError;
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar horario');
    }
  };

  if (user?.user_metadata?.rol !== 'PRESTADOR') {
    return <Container><Typography variant="h6" sx={{mt:4}}>Acceso denegado</Typography></Container>;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Mis Horarios de Disponibilidad</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Agregar Horario</Typography>
        <Box component="form" onSubmit={handleAdd} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Día de la semana</InputLabel>
            <Select value={dia} label="Día de la semana" onChange={(e) => setDia(Number(e.target.value))}>
              {DIAS_SEMANA.map((d, i) => (
                <MenuItem key={i} value={i}>{d}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Hora Inicio"
            type="time"
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 300 }}
          />
          <TextField
            label="Hora Fin"
            type="time"
            value={horaFin}
            onChange={(e) => setHoraFin(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 300 }}
          />
          <Button type="submit" variant="contained" disabled={adding}>
            {adding ? 'Guardando...' : 'Agregar'}
          </Button>
        </Box>
      </Paper>

      {horarios.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 8 }}>
          <EventAvailableIcon sx={{ fontSize: 72, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6">Sin horarios</Typography>
          <Typography variant="body2" color="text.secondary">No tienes horarios configurados.</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Día</TableCell>
                <TableCell>Hora Inicio</TableCell>
                <TableCell>Hora Fin</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {horarios.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{DIAS_SEMANA[row.dia_semana]}</TableCell>
                  <TableCell>{row.hora_inicio}</TableCell>
                  <TableCell>{row.hora_fin}</TableCell>
                  <TableCell align="right">
                    <IconButton color="error" onClick={() => handleDelete(row.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}