import React from 'react'
import { Link } from 'react-router-dom'

export default function CaninoCard({ canino }: { canino: any }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', padding: 12, marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ marginRight: 12 }}>
          {canino.foto_url ? (
            <img src={canino.foto_url} alt={canino.nombre} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
          ) : (
            <div style={{ width: 64, height: 64, background: '#f3f4f6', borderRadius: 8 }} />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{canino.nombre}</div>
          <div style={{ color: '#6b7280' }}>{canino.raza} · {canino.edad} años</div>
        </div>
        <div>
          <Link to={`/caninos/${canino.id}`}>Ver</Link>
        </div>
      </div>
    </div>
  )
}
