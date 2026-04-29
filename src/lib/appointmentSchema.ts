import { z } from 'zod'

export const appointmentSchema = z.object({
  servicio_id: z.string().min(1, 'Debes seleccionar un servicio'),
  canino_id: z.string().min(1, 'Debes seleccionar una mascota'),
  fecha_hora_cita: z.string().datetime('Debes seleccionar una fecha y hora válida'),
  notas: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional().default('')
})

export type AppointmentFormData = z.infer<typeof appointmentSchema>

export const APPOINTMENT_STATUSES = ['SOLICITADA', 'ACEPTADA', 'RECHAZADA', 'COMPLETADA', 'CANCELADA', 'REPROGRAMADA'] as const
export type AppointmentStatus = typeof APPOINTMENT_STATUSES[number]

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  SOLICITADA: 'Solicitada',
  ACEPTADA: 'Aceptada',
  RECHAZADA: 'Rechazada',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
  REPROGRAMADA: 'Reprogramada'
}

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, 'info' | 'success' | 'error' | 'default' | 'warning'> = {
  SOLICITADA: 'info',
  ACEPTADA: 'success',
  RECHAZADA: 'error',
  COMPLETADA: 'default',
  CANCELADA: 'warning',
  REPROGRAMADA: 'info'
}