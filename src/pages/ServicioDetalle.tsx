import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

interface Service {
  id: string
  title: string
  description: string
  price: number
  duration_minutes: number
  category: string
  clinic_id: string
  created_at: string
  clinics?: { name: string; address: string }
}

export default function ServicioDetalle() {
  const { id } = useParams<{ id: string }>()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) fetchService()
  }, [id])

  const fetchService = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('servicios')
        .select('*, clinics(name, address)')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError
      setService(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar el servicio'
      )
      console.error('Error fetching service:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
        Cargando servicio...
      </div>
    )
  }

  if (error || !service) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <div style={{
          padding: '12px',
          backgroundColor: '#fee',
          color: '#c33',
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          {error || 'Servicio no encontrado'}
        </div>
        <Link to="/servicios" style={{
          color: '#0066cc',
          textDecoration: 'none',
          fontSize: '14px'
        }}>
          ← Volver al catálogo
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      <Link to="/servicios" style={{
        color: '#0066cc',
        textDecoration: 'none',
        fontSize: '14px',
        marginBottom: '20px',
        display: 'inline-block'
      }}>
        ← Volver al catálogo
      </Link>

      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '24px',
        marginTop: '20px'
      }}>
        <h1 style={{ margin: '0 0 12px 0', color: '#333' }}>{service.title}</h1>

        <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
          <strong>Categoría:</strong> {service.category}
        </p>

        {service.clinics && (
          <>
            <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>
              <strong>Clínica:</strong> {service.clinics.name}
            </p>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
              <strong>Dirección:</strong> {service.clinics.address}
            </p>
          </>
        )}

        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '16px',
          borderRadius: '4px',
          margin: '16px 0'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#999' }}>PRECIO</p>
              <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#0066cc' }}>
                ${service.price.toFixed(2)}
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#999' }}>DURACIÓN</p>
              <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                {service.duration_minutes} min
              </p>
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: '16px', marginTop: '20px', marginBottom: '8px', color: '#333' }}>
          Descripción
        </h2>
        <p style={{ color: '#666', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
          {service.description}
        </p>

        <p style={{ margin: '24px 0 0 0', fontSize: '12px', color: '#999' }}>
          Creado: {new Date(service.created_at).toLocaleDateString('es-CO')}
        </p>
      </div>
    </div>
  )
}
