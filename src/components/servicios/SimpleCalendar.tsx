import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { APPOINTMENT_STATUS_COLORS } from '../../lib/appointmentSchema';

export default function SimpleCalendar({ citas, onSelectDate }: { citas: any[], onSelectDate?: (date: Date) => void }) {
  const today = new Date();
  
  // Calculate start of week (Monday)
  const start = new Date(today);
  const dayOfWeek = start.getDay();
  const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  start.setDate(diff);
  start.setHours(0,0,0,0);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getDate() === d2.getDate();

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Calendario de esta semana
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
        {days.map((day, idx) => {
          // Find appointments for this day
          const dayCitas = citas.filter(c => isSameDay(new Date(c.fecha_hora_cita), day));
          const isToday = isSameDay(day, today);

          return (
            <Paper 
              key={idx} 
              elevation={isToday ? 3 : 1}
              sx={{ 
                minWidth: 150, 
                p: 2, 
                borderRadius: 2,
                border: isToday ? 2 : 1,
                borderColor: isToday ? 'primary.main' : 'divider',
                bgcolor: isToday ? 'primary.50' : 'background.paper',
                cursor: onSelectDate ? 'pointer' : 'default',
                '&:hover': onSelectDate ? { bgcolor: 'action.hover' } : {}
              }}
              onClick={() => onSelectDate && onSelectDate(day)}
            >
              <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" fontWeight="bold">
                {new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(day)}
              </Typography>
              <Typography variant="h5" fontWeight="bold" gutterBottom color={isToday ? 'primary.main' : 'text.primary'}>
                {new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(day)}
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                {dayCitas.length === 0 ? (
                  <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                    Sin citas
                  </Typography>
                ) : (
                  dayCitas.map(c => {
                    const statusColor = APPOINTMENT_STATUS_COLORS[c.estado as keyof typeof APPOINTMENT_STATUS_COLORS] || 'default';
                    const timeStr = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(new Date(c.fecha_hora_cita));
                    return (
                      <Chip 
                        key={c.id}
                        label={`${timeStr} - ${c.servicios?.nombre || 'Cita'}`}
                        size="small"
                        color={statusColor as any}
                        variant="outlined"
                        sx={{ justifyContent: 'flex-start', maxWidth: '100%' }}
                      />
                    );
                  })
                )}
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}