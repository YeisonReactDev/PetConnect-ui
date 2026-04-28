import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ServiceForm from '../components/servicios/ServiceForm'
import { ServiceFormData } from '../lib/serviceSchema'

interface Service extends ServiceFormData {
  id: string
  clinic_id: string
  created_at: string
}

export default function ServiciosGestionar() {
  const navigate = useNavigate()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [clinicId, setClinicId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formLoading, setFormLoading] = useState(false)

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
      // TODO: Get clinic_id from user profile or staff table
      // For now, using a placeholder - this should be fetched from staff table
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
        fetchServices(data.clinic_id)
      }
    } catch (err) {
      console.error('Error fetching user clinic:', err)
      setError('No se pudo determinar la clínica del usuario')
    }
  }

  const fetchServices = async (cId: string) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('servicios')
        .select('*')
        .eq('clinic_id', cId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setServices(data || [])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar servicios'
      )
      console.error('Error fetching services:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateService = async (formData: ServiceFormData) => {
    if (!clinicId) {
      setError('No se pudo determinar la clínica')
      return
    }

    try {
      setFormLoading(true)
      const { data, error: insertError } = await supabase
        .from('servicios')
        .insert([
          {
            ...formData,
            clinic_id: clinicId
          }
        ])
        .select()

      if (insertError) throw insertError

      setServices((prev) => [data[0], ...prev])
      setShowForm(false)
      setError(null)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al crear servicio'
      )
      console.error('Error creating service:', err)
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateService = async (formData: ServiceFormData) => {
    if (!editingService) return

    try {
      setFormLoading(true)
      const { error: updateError } = await supabase
        .from('servicios')
        .update(formData)
        .eq('id', editingService.id)

      if (updateError) throw updateError

      setServices((prev) =>
        prev.map((s) =>
          s.id === editingService.id ? { ...s, ...formData } : s
        )
      )
      setEditingService(null)
      setShowForm(false)
      setError(null)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al actualizar servicio'
      )
      console.error('Error updating service:', err)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este servicio?')) return

    try {
      const { error: deleteError } = await supabase
        .from('servicios')
        .delete()
        .eq('id', serviceId)

      if (deleteError) throw deleteError

      setServices((prev) => prev.filter((s) => s.id !== serviceId))
      setError(null)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al eliminar servicio'
      )
      console.error('Error deleting service:', err)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingService(null)
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
      <h1 style={{ marginBottom: '24px', color: '#333' }}>Gestionar Servicios</h1>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fee',
          color: '#c33',
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          Error: {error}
        </div>
      )}

      {!showForm && !editingService && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '10px 16px',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          + Crear nuevo servicio
        </button>
      )}

      {showForm && (
        <div style={{
          backgroundColor: '#f9f9f9',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h2 style={{ marginTop: '0' }}>Nuevo servicio</h2>
          <ServiceForm
            onSubmit={handleCreateService}
            isLoading={formLoading}
          />
          <button
            onClick={handleCancel}
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

      {editingService && (
        <div style={{
          backgroundColor: '#f9f9f9',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h2 style={{ marginTop: '0' }}>Editar servicio: {editingService.title}</h2>
          <ServiceForm
            onSubmit={handleUpdateService}
            initialData={{
              title: editingService.title,
              description: editingService.description,
              price: editingService.price,
              duration_minutes: editingService.duration_minutes,
              category: editingService.category
            }}
            isLoading={formLoading}
          />
          <button
            onClick={handleCancel}
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
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#999'
        }}>
          Cargando servicios...
        </div>
      )}

      {!loading && services.length === 0 && !showForm && !editingService && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#999',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px'
        }}>
          No tienes servicios registrados. ¡Crea uno para empezar!
        </div>
      )}

      {!loading && services.length > 0 && !showForm && !editingService && (
        <div>
          <h2 style={{ marginTop: '24px', marginBottom: '16px' }}>Tus servicios ({services.length})</h2>
          {services.map((service) => (
            <div
              key={service.id}
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
                    {service.title}
                  </h3>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                    {service.description}
                  </p>
                  <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>
                    {service.category} • ${service.price.toFixed(2)} • {service.duration_minutes} min
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setEditingService(service)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
