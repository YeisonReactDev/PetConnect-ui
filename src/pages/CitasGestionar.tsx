import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import AppointmentCard from '../components/servicios/AppointmentCard'
import SimpleCalendar from '../components/servicios/SimpleCalendar'

interface Appointment {
  id: string
  service_id: string
  pet_id: string
  owner_id: string
  scheduled_at: string
  status: string
  notes?: string
  services?: { title: string; duration_minutes: number; price: number }
  caninos?: { name: string }
  clinics?: { name: string }
}

export default function CitasGestionar() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [clinicId, setClinicId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser()
      if (authError || !user) {
        navigate('/auth')
        return
      }
      setUser(user)
      await fetchUserClinic(user.id)
    }
    getUser()
  }, [navigate])

  const fetchUserClinic = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('staff')
        .select('clinic_id')
        .eq('user_id', userId)
        .single()

      if (data?.clinic_id) {
        setClinicId(data.clinic_id)
        await fetchClinicAppointments(data.clinic_id)
      } else {
        setError('No se encontró clínica asociada a tu usuario')
      }
    } catch (err) {
      console.error('Error fetching user clinic:', err)
      setError('Error al determinar tu clínica')
    }
  }

  const fetchClinicAppointments = async (cId: string) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('citas')
        .select('*, servicios(title, duration_minutes, price), caninos(name)')
        .eq('clinic_id', cId)
        .order('scheduled_at', { ascending: true })

      if (fetchError) throw fetchError
      setAppointments(data || [])
      applyStatusFilter(data || [], statusFilter)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar citas'
      )
      console.error('Error fetching appointments:', err)
    } finally {
      setLoading(false)
    }
  }

  const applyStatusFilter = (data: Appointment[], status: string) => {
    if (status === 'all') {
      setFilteredAppointments(data)
    } else {
      setFilteredAppointments(data.filter((apt) => apt.status === status))
    }
  }

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus)
    applyStatusFilter(appointments, newStatus)
  }

  const handleAcceptAppointment = async (appointmentId: string) => {
    try {
      setActionLoading(appointmentId)
      const { error: updateError } = await supabase
        .from('citas')
        .update({ status: 'accepted' })
        .eq('id', appointmentId)

      if (updateError) throw updateError

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: 'accepted' } : apt
        )
      )
      applyStatusFilter(
        appointments.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: 'accepted' } : apt
        ),
        statusFilter
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al aceptar cita'
      )
      console.error('Error accepting appointment:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeclineAppointment = async (appointmentId: string) => {
    if (!confirm('¿Estás seguro de que deseas rechazar esta cita?')) return

    try {
      setActionLoading(appointmentId)
      const { error: updateError } = await supabase
        .from('citas')
        .update({ status: 'declined' })
        .eq('id', appointmentId)

      if (updateError) throw updateError

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: 'declined' } : apt
        )
      )
      applyStatusFilter(
        appointments.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: 'declined' } : apt
        ),
        statusFilter
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al rechazar cita'
      )
      console.error('Error declining appointment:', err)
    } finally {
      setActionLoading(null)
    }
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
        Cargando...
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '24px', color: '#333' }}>Gestionar Citas</h1>

      {error && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '4px',
            marginBottom: '16px'
          }}
        >
          Error: {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '14px', fontWeight: 'bold', marginRight: '8px' }}>
            Filtrar por estado:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px'
            }}
          >
            <option value="all">Todas las citas</option>
            <option value="requested">Solicitadas</option>
            <option value="accepted">Aceptadas</option>
            <option value="declined">Rechazadas</option>
            <option value="completed">Completadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold', marginRight: '8px' }}>
            Vista:
          </label>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '8px 12px',
              marginRight: '8px',
              backgroundColor: viewMode === 'list' ? '#0066cc' : '#ccc',
              color: viewMode === 'list' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Lista
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            style={{
              padding: '8px 12px',
              backgroundColor: viewMode === 'calendar' ? '#0066cc' : '#ccc',
              color: viewMode === 'calendar' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Calendario
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
          Cargando citas...
        </div>
      )}

      {!loading && filteredAppointments.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px'
          }}
        >
          {appointments.length === 0
            ? 'No hay citas en tu clínica aún.'
            : `No hay citas con estado "${statusFilter}".`}
        </div>
      )}

      {!loading && viewMode === 'calendar' && appointments.length > 0 && (
        <>
          <h2 style={{ fontSize: '16px', marginBottom: '16px', color: '#333' }}>
            Calendario semanal
          </h2>
          <SimpleCalendar appointments={appointments} />
        </>
      )}

      {!loading && viewMode === 'list' && filteredAppointments.length > 0 && (
        <div>
          <h2 style={{ marginTop: '24px', marginBottom: '16px' }}>
            Citas ({filteredAppointments.length})
          </h2>
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onAccept={handleAcceptAppointment}
              onDecline={handleDeclineAppointment}
              isStaff={true}
              isLoading={actionLoading === appointment.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
