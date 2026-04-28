import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import CaninoCard from '../components/caninos/CaninoCard'

export default function Caninos() {
  const [caninos, setCaninos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const { data, error } = await supabase.from('caninos').select('*').order('creado_at', { ascending: false })
      if (data) setCaninos(data)
      setLoading(false)
    }
    fetch()
  }, [])

  return (
    <div>
      <h2>Mis mascotas</h2>
      <div style={{ marginBottom: 12 }}>
        <Link to="/caninos/nuevo">Crear nueva mascota</Link>
      </div>
      {loading && <div>Cargando...</div>}
      <div>
        {caninos.length === 0 && !loading && <div>No hay mascotas registradas.</div>}
        {caninos.map((c) => (
          <CaninoCard key={c.id} canino={c} />
        ))}
      </div>
    </div>
  )
}
