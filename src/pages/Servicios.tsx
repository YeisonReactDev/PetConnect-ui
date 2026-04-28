import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ServiceCard from '../components/servicios/ServiceCard'
import ServiceFilter from '../components/servicios/ServiceFilter'
import { SERVICE_CATEGORIES } from '../lib/serviceSchema'

interface Service {
  id: string
  title: string
  description: string
  price: number
  duration_minutes: number
  category: string
  clinic_id: string
  clinics?: { name: string }
}

export default function Servicios() {
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({ search: '', category: '' })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('servicios')
        .select('*, clinics(name)')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      
      const transformedData = (data || []).map((service: any) => ({
        ...service,
        clinic_name: service.clinics?.name || 'Clínica desconocida'
      }))
      
      setServices(transformedData)
      applyFilters(transformedData, filters)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar servicios'
      )
      console.error('Error fetching services:', err)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (servicesToFilter: Service[], currentFilters: typeof filters) => {
    let filtered = servicesToFilter

    if (currentFilters.search) {
      const searchLower = currentFilters.search.toLowerCase()
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(searchLower) ||
          s.description.toLowerCase().includes(searchLower)
      )
    }

    if (currentFilters.category) {
      filtered = filtered.filter((s) => s.category === currentFilters.category)
    }

    setFilteredServices(filtered)
  }

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    applyFilters(services, newFilters)
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '24px', color: '#333' }}>Catálogo de Servicios</h1>

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

      <ServiceFilter
        categories={SERVICE_CATEGORIES}
        onFilterChange={handleFilterChange}
      />

      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#999'
        }}>
          Cargando servicios...
        </div>
      )}

      {!loading && filteredServices.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#999',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px'
        }}>
          {services.length === 0
            ? 'No hay servicios disponibles en este momento.'
            : 'No se encontraron servicios que coincidan con los filtros.'}
        </div>
      )}

      <div>
        {filteredServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            showClinicName={true}
          />
        ))}
      </div>
    </div>
  )
}
