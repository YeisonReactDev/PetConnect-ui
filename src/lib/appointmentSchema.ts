import { z } from 'zod'

export const appointmentSchema = z.object({
  service_id: z.string().min(1, 'Debes seleccionar un servicio'),
  pet_id: z.string().min(1, 'Debes seleccionar una mascota'),
  scheduled_at: z.string().datetime('Debes seleccionar una fecha y hora válida'),
  notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional().default('')
})

export type AppointmentFormData = z.infer<typeof appointmentSchema>

export const APPOINTMENT_STATUSES = ['requested', 'accepted', 'declined', 'completed', 'cancelled'] as const
export type AppointmentStatus = typeof APPOINTMENT_STATUSES[number]

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  requested: 'Solicitada',
  accepted: 'Aceptada',
  declined: 'Rechazada',
  completed: 'Completada',
  cancelled: 'Cancelada'
}

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  requested: '#FFA500', // Orange
  accepted: '#4CAF50', // Green
  declined: '#f44336', // Red
  completed: '#2196F3', // Blue
  cancelled: '#9E9E9E' // Gray
}
