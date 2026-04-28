import React from 'react'
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS, AppointmentStatus } from '../lib/appointmentSchema'

interface Appointment {
  id: string
  service_id: string
  pet_id: string
  scheduled_at: string
  status: AppointmentStatus
  notes?: string
  services?: { title: string; duration_minutes: number; price: number }
  caninos?: { name: string }
  clinics?: { name: string }
  owner_id?: string
  clinic_id?: string
}

interface AppointmentCardProps {
  appointment: Appointment
  onAccept?: (id: string) => void
  onDecline?: (id: string) => void
  onCancel?: (id: string) => void
  isStaff?: boolean
  isLoading?: boolean
}

export default function AppointmentCard({
  appointment,
  onAccept,
  onDecline,
  onCancel,
  isStaff = false,
  isLoading = false
}: AppointmentCardProps) {
  const statusLabel = APPOINTMENT_STATUS_LABELS[appointment.status]
  const statusColor = APPOINTMENT_STATUS_COLORS[appointment.status]
  const scheduledDate = new Date(appointment.scheduled_at)
  const formattedDate = scheduledDate.toLocaleDateString('es-CO')
  const formattedTime = scheduledDate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

  const canAcceptAction =
    (isStaff && appointment.status === 'requested') ||
    (!isStaff && ['requested', 'accepted'].includes(appointment.status))

  return (
    <div
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        backgroundColor: '#fff'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#333' }}>
            {appointment.services?.title || 'Servicio desconocido'}
          </h3>

          <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
            <strong>Mascota:</strong> {appointment.caninos?.name || 'Desconocida'}
          </p>

          {isStaff && (
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
              <strong>Propietario:</strong> ID {appointment.owner_id}
            </p>
          )}

          {!isStaff && appointment.clinics && (
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
              <strong>Clínica:</strong> {appointment.clinics.name}
            </p>
          )}

          <div style={{ display: 'flex', gap: '16px', margin: '8px 0' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>
              📅 {formattedDate} {formattedTime}
            </span>
            <span style={{ fontSize: '14px', color: '#666' }}>
              ⏱️ {appointment.services?.duration_minutes || 0} min
            </span>
          </div>

          {appointment.notes && (
            <p style={{ margin: '8px 0', fontSize: '13px', color: '#999', fontStyle: 'italic' }}>
              Notas: {appointment.notes}
            </p>
          )}
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              backgroundColor: statusColor,
              color: 'white',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '12px'
            }}
          >
            {statusLabel}
          </div>
        </div>
      </div>

      {/* Action buttons for prestador */}
      {isStaff && appointment.status === 'requested' && (
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onAccept?.(appointment.id)}
            disabled={isLoading}
            style={{
              padding: '8px 12px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            {isLoading ? 'Procesando...' : 'Aceptar'}
          </button>
          <button
            onClick={() => onDecline?.(appointment.id)}
            disabled={isLoading}
            style={{
              padding: '8px 12px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            {isLoading ? 'Procesando...' : 'Rechazar'}
          </button>
        </div>
      )}

      {/* Cancel button for clients */}
      {!isStaff && canAcceptAction && (
        <div style={{ marginTop: '12px' }}>
          <button
            onClick={() => onCancel?.(appointment.id)}
            disabled={isLoading}
            style={{
              padding: '8px 12px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            {isLoading ? 'Procesando...' : 'Cancelar cita'}
          </button>
        </div>
      )}
    </div>
  )
}
