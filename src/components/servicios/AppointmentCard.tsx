import React from 'react';
import { Card, CardContent, Typography, Chip, Box, Grid, IconButton, Tooltip, CircularProgress } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PetsIcon from '@mui/icons-material/Pets';
import StoreIcon from '@mui/icons-material/Store';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '../../lib/appointmentSchema';

interface AppointmentCardProps {
  appointment: any;
  isPrestador?: boolean;
  canCancel?: boolean;
  onCancel?: () => void;
  cancelling?: boolean;
}

export default function AppointmentCard({
  appointment,
  isPrestador = false,
  canCancel = false,
  onCancel,
  cancelling = false,
}: AppointmentCardProps) {
  const statusLabel = APPOINTMENT_STATUS_LABELS[appointment.estado as keyof typeof APPOINTMENT_STATUS_LABELS] || appointment.estado;
  const statusColor = APPOINTMENT_STATUS_COLORS[appointment.estado as keyof typeof APPOINTMENT_STATUS_COLORS] || 'default';

  const dateObj = new Date(appointment.fecha_hora_cita);
  const dateFormatted = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);

  return (
    <Card elevation={2} sx={{ mb: 2, borderRadius: 2, borderLeft: 6, borderColor: `${statusColor}.main` }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonthIcon color="primary" />
            <span style={{ textTransform: 'capitalize' }}>{dateFormatted}</span>
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            <Chip
              label={statusLabel}
              color={statusColor as any}
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
            {canCancel && onCancel && (
              <Tooltip title="Cancelar cita">
                {/* span wrapper required so Tooltip works on disabled IconButton */}
                <span>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={onCancel}
                    disabled={cancelling}
                    aria-label="Cancelar cita"
                  >
                    {cancelling
                      ? <CircularProgress size={18} color="error" />
                      : <MoreVertIcon fontSize="small" />}
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
              <MedicalServicesIcon fontSize="small" />
              <Typography variant="body2" fontWeight="medium">
                {appointment.servicios?.nombre || 'Servicio General'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
              <PetsIcon fontSize="small" />
              <Typography variant="body2">
                {appointment.caninos?.nombre || 'Mascota no especificada'}
              </Typography>
            </Box>
          </Grid>

          {!isPrestador && (
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <StoreIcon fontSize="small" />
                <Typography variant="body2">
                  {appointment.prestadores?.nombre_comercial || 'Prestador'}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        {appointment.notas && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block" fontWeight="bold">
              Notas:
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              "{appointment.notas}"
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
