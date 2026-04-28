import React, { useState } from 'react'
import { serviceSchema, ServiceFormData, SERVICE_CATEGORIES } from '../lib/serviceSchema'
import { ZodError } from 'zod'

interface ServiceFormProps {
  onSubmit: (data: ServiceFormData) => Promise<void>
  initialData?: ServiceFormData
  isLoading?: boolean
}

export default function ServiceForm({ onSubmit, initialData, isLoading = false }: ServiceFormProps) {
  const [formData, setFormData] = useState<Partial<ServiceFormData>>(initialData || {})
  const [errors, setErrors] = useState<Partial<Record<keyof ServiceFormData, string>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field when user starts typing
    if (errors[name as keyof ServiceFormData]) {
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
      const validatedData = serviceSchema.parse(formData)
      await onSubmit(validatedData)
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Partial<Record<keyof ServiceFormData, string>> = {}
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof ServiceFormData
          newErrors[path] = err.message
        })
        setErrors(newErrors)
      } else {
        setSubmitError(
          error instanceof Error ? error.message : 'Error al procesar el formulario'
        )
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
      {submitError && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fee',
          color: '#c33',
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          {submitError}
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '4px',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          Título del servicio *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title || ''}
          onChange={handleInputChange}
          placeholder="Ej: Esterilización de perro mediano"
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '4px',
            border: errors.title ? '2px solid #c33' : '1px solid #ddd',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
        {errors.title && (
          <p style={{ color: '#c33', fontSize: '12px', margin: '4px 0 0 0' }}>
            {errors.title}
          </p>
        )}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '4px',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          Descripción *
        </label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleInputChange}
          placeholder="Describe el servicio en detalle..."
          rows={4}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '4px',
            border: errors.description ? '2px solid #c33' : '1px solid #ddd',
            fontSize: '14px',
            boxSizing: 'border-box',
            fontFamily: 'inherit'
          }}
        />
        {errors.description && (
          <p style={{ color: '#c33', fontSize: '12px', margin: '4px 0 0 0' }}>
            {errors.description}
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            Precio (USD) *
          </label>
          <input
            type="number"
            name="price"
            value={formData.price || ''}
            onChange={handleInputChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '4px',
              border: errors.price ? '2px solid #c33' : '1px solid #ddd',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
          {errors.price && (
            <p style={{ color: '#c33', fontSize: '12px', margin: '4px 0 0 0' }}>
              {errors.price}
            </p>
          )}
        </div>

        <div>
          <label style={{
            display: 'block',
            marginBottom: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            Duración (minutos) *
          </label>
          <input
            type="number"
            name="duration_minutes"
            value={formData.duration_minutes || ''}
            onChange={handleInputChange}
            placeholder="30"
            min="1"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '4px',
              border: errors.duration_minutes ? '2px solid #c33' : '1px solid #ddd',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
          {errors.duration_minutes && (
            <p style={{ color: '#c33', fontSize: '12px', margin: '4px 0 0 0' }}>
              {errors.duration_minutes}
            </p>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '4px',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          Categoría *
        </label>
        <select
          name="category"
          value={formData.category || ''}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '4px',
            border: errors.category ? '2px solid #c33' : '1px solid #ddd',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        >
          <option value="">Selecciona una categoría</option>
          {SERVICE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p style={{ color: '#c33', fontSize: '12px', margin: '4px 0 0 0' }}>
            {errors.category}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: isLoading ? '#ccc' : '#0066cc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          marginTop: '12px'
        }}
      >
        {isLoading ? 'Guardando...' : 'Guardar servicio'}
      </button>
    </form>
  )
}
