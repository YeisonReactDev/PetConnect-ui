import React, { useState, useEffect } from 'react'
import { appointmentSchema, AppointmentFormData } from '../lib/appointmentSchema'
import { ZodError } from 'zod'

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

interface AppointmentFormProps {
  services: Service[]
  pets: Pet[]
  onSubmit: (data: AppointmentFormData) => Promise<void>
  isLoading?: boolean
}

export default function AppointmentForm({
  services,
  pets,
  onSubmit,
  isLoading = false
}: AppointmentFormProps) {
  const [formData, setFormData] = useState<Partial<AppointmentFormData>>({})
  const [errors, setErrors] = useState<Partial<Record<keyof AppointmentFormData, string>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Calculate minimum datetime (today from now onwards)
  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 30) // At least 30 minutes from now
    return now.toISOString().slice(0, 16)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field when user starts typing
    if (errors[name as keyof AppointmentFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    try {
      // Validate form data
      const validatedData = appointmentSchema.parse(formData)
      await onSubmit(validatedData)
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Partial<Record<keyof AppointmentFormData, string>> = {}
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof AppointmentFormData
          newErrors[path] = err.message
        })
        setErrors(newErrors)
      } else {
        setSubmitError(
          error instanceof Error ? error.message : 'Error al procesar la solicitud'
        )
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
      {submitError && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '4px',
            marginBottom: '16px'
          }}
        >
          {submitError}
        </div>
      )}

      {/* Service Selection */}
      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#333'
          }}
        >
          Servicio *
        </label>
        <select
          name="service_id"
          value={formData.service_id || ''}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '4px',
            border: errors.service_id ? '2px solid #c33' : '1px solid #ddd',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        >
          <option value="">Selecciona un servicio</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.title} - ${service.price.toFixed(2)} ({service.duration_minutes} min)
            </option>
          ))}
        </select>
        {errors.service_id && (
          <p style={{ color: '#c33', fontSize: '12px', margin: '4px 0 0 0' }}>
            {errors.service_id}
          </p>
        )}
      </div>

      {/* Pet Selection */}
      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#333'
          }}
        >
          Mascota *
        </label>
        <select
          name="pet_id"
          value={formData.pet_id || ''}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '4px',
            border: errors.pet_id ? '2px solid #c33' : '1px solid #ddd',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        >
          <option value="">Selecciona una mascota</option>
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>
              {pet.name}
            </option>
          ))}
        </select>
        {errors.pet_id && (
          <p style={{ color: '#c33', fontSize: '12px', margin: '4px 0 0 0' }}>
            {errors.pet_id}
          </p>
        )}
      </div>

      {/* DateTime Selection */}
      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#333'
          }}
        >
          Fecha y hora *
        </label>
        <input
          type="datetime-local"
          name="scheduled_at"
          value={formData.scheduled_at || ''}
          onChange={handleInputChange}
          min={getMinDateTime()}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '4px',
            border: errors.scheduled_at ? '2px solid #c33' : '1px solid #ddd',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
        <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 0 0' }}>
          Selecciona una fecha y hora con al menos 30 minutos de anticipación
        </p>
        {errors.scheduled_at && (
          <p style={{ color: '#c33', fontSize: '12px', margin: '4px 0 0 0' }}>
            {errors.scheduled_at}
          </p>
        )}
      </div>

      {/* Notes */}
      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#333'
          }}
        >
          Notas (opcional)
        </label>
        <textarea
          name="notes"
          value={formData.notes || ''}
          onChange={handleInputChange}
          placeholder="Ej: Mi mascota está nerviosa con los desconocidos..."
          rows={3}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '4px',
            border: errors.notes ? '2px solid #c33' : '1px solid #ddd',
            fontSize: '14px',
            boxSizing: 'border-box',
            fontFamily: 'inherit'
          }}
        />
        {errors.notes && (
          <p style={{ color: '#c33', fontSize: '12px', margin: '4px 0 0 0' }}>
            {errors.notes}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || services.length === 0 || pets.length === 0}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor:
            isLoading || services.length === 0 || pets.length === 0 ? '#ccc' : '#0066cc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor:
            isLoading || services.length === 0 || pets.length === 0 ? 'not-allowed' : 'pointer',
          marginTop: '12px'
        }}
      >
        {isLoading ? 'Solicitando cita...' : 'Solicitar cita'}
      </button>
    </form>
  )
}
