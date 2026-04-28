import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import AppointmentForm from '../components/servicios/AppointmentForm'
import AppointmentCard from '../components/servicios/AppointmentCard'
import { AppointmentFormData } from '../lib/appointmentSchema'

interface Pet {
  id: string
  name: string
}

interface Service {
  id: string
  title: string
  duration_minutes: number
  price: number
}

interface Appointment {
  id: string
  service_id: string
  pet_id: string
  scheduled_at: string
  status: string
  notes?: string
  services?: { title: string; duration_minutes: number; price: number }
  caninos?: { name: string }
  clinics?: { name: string }
}

export default function Citas() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [pets, setPets] = useState<Pet[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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
      await Promise.all([
        fetchUserPets(user.id),
        fetchAllServices(),
        fetchUserAppointments(user.id)
      ])
    }
    getUser()
  }, [navigate])

  const fetchUserPets = async (userId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('caninos')
        .select('id, name')
        .eq('propietario_id', userId)
        .order('creado_at', { ascending: false })

      if (fetchError) throw fetchError
      setPets(data || [])
    } catch (err) {
      console.error('Error fetching pets:', err)
      setError('Error al cargar mascotas')
    }
  }

  const fetchAllServices = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('servicios')
        .select('id, title, duration_minutes, price')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setServices(data || [])
    } catch (err) {
      console.error('Error fetching services:', err)
      setError('Error al cargar servicios')
    }
  }

  const fetchUserAppointments = async (userId: string) => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('citas')
        .select('*, servicios(title, duration_minutes, price), caninos(name), clinics(name)')
        .eq('propietario_id', userId)
        .order('scheduled_at', { ascending: false })

      if (fetchError) throw fetchError
      setAppointments(data || [])
    } catch (err) {
      console.error('Error fetching appointments:', err)
      setError('Error al cargar citas')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAppointment = async (formData: AppointmentFormData) => {
    if (!user) return

    try {
      setFormLoading(true)
      setError(null)

      const { data, error: insertError } = await supabase
        .from('citas')
        .insert([
          {
            ...formData,
            propietario_id: user.id,
            status: 'requested',
            scheduled_at: new Date(formData.scheduled_at).toISOString()
          }
        ])
        .select('*, servicios(title, duration_minutes, price), caninos(name), clinics(name)')

      if (insertError) throw insertError

      setAppointments((prev) => [data[0], ...prev])
      setShowForm(false)
      setSuccessMessage('¡Cita solicitada correctamente! El prestador la revisará pronto.')
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al crear la cita'
      )
      console.error('Error creating appointment:', err)
    } finally {
      setFormLoading(false)
    }
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta cita?')) return

    try {
      const { error: updateError } = await supabase
        .from('citas')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId)

      if (updateError) throw updateError

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt
        )
      )
      setSuccessMessage('Cita cancelada correctamente')
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cancelar la cita'
      )
      console.error('Error cancelling appointment:', err)
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
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '24px', color: '#333' }}>Mis Citas</h1>

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

      {successMessage && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#efe',
            color: '#3c3',
            borderRadius: '4px',
            marginBottom: '16px'
          }}
        >
          {successMessage}
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          disabled={pets.length === 0 || services.length === 0}
          style={{
            padding: '10px 16px',
            backgroundColor:
              pets.length === 0 || services.length === 0 ? '#ccc' : '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor:
              pets.length === 0 || services.length === 0 ? 'not-allowed' : 'pointer',
            marginBottom: '20px'
          }}
        >
          {pets.length === 0 ? '+ Crear mascota primero' : '+ Solicitar nueva cita'}
        </button>
      )}

      {showForm && (
        <div
          style={{
            backgroundColor: '#f9f9f9',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}
        >
          <h2 style={{ marginTop: '0' }}>Solicitar cita</h2>
          <AppointmentForm
            services={services}
            pets={pets}
            onSubmit={handleCreateAppointment}
            isLoading={formLoading}
          />
          <button
            onClick={() => setShowForm(false)}
            style={{
              marginTop: '12px',
              padding: '10px 16px',
              backgroundColor: '#ccc',
              color: '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancelar
          </button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
          Cargando citas...
        </div>
      )}

      {!loading && appointments.length === 0 && !showForm && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px'
          }}
        >
          No tienes citas solicitadas aún. ¡Solicita una nueva!
        </div>
      )}

      {!loading && appointments.length > 0 && (
        <div>
          <h2 style={{ marginTop: '24px', marginBottom: '16px' }}>
            Tus citas ({appointments.length})
          </h2>
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onCancel={handleCancelAppointment}
              isStaff={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}
