import React from 'react'
import { Link } from 'react-router-dom'

interface Service {
  id: string
  title: string
  description: string
  price: number
  duration_minutes: number
  category: string
  clinic_id: string
  clinic_name?: string
}

interface ServiceCardProps {
  service: Service
  showClinicName?: boolean
}

export default function ServiceCard({ service, showClinicName = false }: ServiceCardProps) {
  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#333' }}>
        <Link to={`/servicios/${service.id}`} style={{ color: '#0066cc', textDecoration: 'none' }}>
          {service.title}
        </Link>
      </h3>
      {showClinicName && (
        <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
          <strong>Clínica:</strong> {service.clinic_name}
        </p>
      )}
      <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
        <strong>Categoría:</strong> {service.category}
      </p>
      <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
        {service.description}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#0066cc' }}>
          ${service.price.toFixed(2)}
        </span>
        <span style={{ fontSize: '14px', color: '#999' }}>
          {service.duration_minutes} min
        </span>
      </div>
    </div>
  )
}
