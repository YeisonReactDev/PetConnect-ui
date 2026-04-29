import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthProvider';
import SimpleCalendar from '../components/servicios/SimpleCalendar';
import AppointmentCard from '../components/servicios/AppointmentCard';
import {
  Container, Typography, Box, CircularProgress, Select, MenuItem,
  FormControl, InputLabel, ToggleButtonGroup, ToggleButton,
  Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, Divider, Chip
} from '@mui/material';
import ListIcon from '@mui/icons-material/List';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '../lib/appointmentSchema';

export default function CitasGestionar() {
  const { user } = useAuth();
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [filter, setFilter] = useState('');

  // Status-change modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedCita, setSelectedCita] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');

  // Calendar day-click modal
  const [openDayModal, setOpenDayModal] = useState(false);
  const [dayModalDate, setDayModalDate] = useState<Date | null>(null);
  const [dayCitas, setDayCitas] = useState<any[]>([]);

  const fetchCitas = async () => {
    if (!user) return;
    setLoading(true);

    const { data: prestador } = await supabase
      .from('prestadores')
      .select('id')
      .eq('usuario_id', user.id)
      .single();

    if (prestador) {
      let query = supabase
        .from('citas')
        .select(`
          *,
          servicios(nombre),
          caninos(nombre),
          propietarios(nombre, apellido, telefono)
        `)
        .eq('prestador_id', prestador.id)
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

  const handleUpdateStatus = async () => {
    if (!selectedCita || !newStatus) return;
    await supabase.from('citas').update({ estado: newStatus }).eq('id', selectedCita.id);
    setOpenModal(false);
    fetchCitas();
  };

  const openStatusModal = (cita: any) => {
    setSelectedCita(cita);
    setNewStatus(cita.estado);
    setOpenModal(true);
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const handleCalendarDayClick = (date: Date) => {
    const found = citas.filter((c) => isSameDay(new Date(c.fecha_hora_cita), date));
    setDayModalDate(date);
    setDayCitas(found);
    setOpenDayModal(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Gestionar Citas
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, val) => val && setView(val)}
            size="small"
          >
            <ToggleButton value="list"><ListIcon /></ToggleButton>
            <ToggleButton value="calendar"><CalendarMonthIcon /></ToggleButton>
          </ToggleButtonGroup>

          <FormControl sx={{ minWidth: 150 }} size="small">
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
              <MenuItem value="COMPLETADA">Completadas</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : view === 'calendar' ? (
        <SimpleCalendar citas={citas} onSelectDate={handleCalendarDayClick} />
      ) : (
        <Grid container spacing={3}>
          {citas.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="h6" color="text.secondary">
                  No hay citas registradas.
                </Typography>
              </Box>
            </Grid>
          ) : (
            citas.map((cita) => (
              <Grid item xs={12} md={6} key={cita.id}>
                <Box sx={{ position: 'relative' }}>
                  <AppointmentCard appointment={cita} isPrestador={true} />
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={() => openStatusModal(cita)}
                    sx={{ position: 'absolute', top: 16, right: 16 }}
                  >
                    Cambiar Estado
                  </Button>
                </Box>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Status-change dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Actualizar Estado de la Cita</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="new-status-label">Nuevo Estado</InputLabel>
            <Select
              labelId="new-status-label"
              value={newStatus}
              label="Nuevo Estado"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="SOLICITADA">Solicitada</MenuItem>
              <MenuItem value="ACEPTADA">Aceptada</MenuItem>
              <MenuItem value="RECHAZADA">Rechazada</MenuItem>
              <MenuItem value="REPROGRAMADA">Reprogramada</MenuItem>
              <MenuItem value="COMPLETADA">Completada</MenuItem>
              <MenuItem value="CANCELADA">Cancelada</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button onClick={handleUpdateStatus} variant="contained" color="primary">Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Calendar day-detail dialog */}
      <Dialog open={openDayModal} onClose={() => setOpenDayModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Citas del{' '}
          {dayModalDate
            ? new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(dayModalDate)
            : ''}
        </DialogTitle>
        <DialogContent dividers>
          {dayCitas.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No hay citas para este día.
            </Typography>
          ) : (
            <List disablePadding>
              {dayCitas.map((c, idx) => {
                const statusColor = APPOINTMENT_STATUS_COLORS[c.estado as keyof typeof APPOINTMENT_STATUS_COLORS] || 'default';
                const timeStr = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(new Date(c.fecha_hora_cita));
                return (
                  <React.Fragment key={c.id}>
                    {idx > 0 && <Divider />}
                    <ListItem
                      secondaryAction={
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip
                            label={APPOINTMENT_STATUS_LABELS[c.estado as keyof typeof APPOINTMENT_STATUS_LABELS] || c.estado}
                            color={statusColor as any}
                            size="small"
                          />
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setOpenDayModal(false);
                              openStatusModal(c);
                            }}
                          >
                            Editar
                          </Button>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={`${timeStr} — ${c.servicios?.nombre || 'Cita'}`}
                        secondary={`${c.caninos?.nombre || ''} · ${c.propietarios?.nombre || ''} ${c.propietarios?.apellido || ''}`}
                      />
                    </ListItem>
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDayModal(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
