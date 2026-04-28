import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthProvider'
import { supabase } from '../lib/supabaseClient'

export default function Perfil() {
  const { user, signOut } = useAuth()
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [telefono, setTelefono] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchPerfil = async () => {
      if (!user) return
      setLoading(true)
      const { data, error } = await supabase.from('propietarios').select('*').eq('usuario_id', user.id).single()
      if (data) {
        setNombre(data.nombre || '')
        setApellido(data.apellido || '')
        setTelefono(data.telefono || '')
      }
      setLoading(false)
    }
    fetchPerfil()
  }, [user])

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    const payload = { usuario_id: user.id, nombre, apellido, telefono }
    // upsert para crear o actualizar
    await supabase.from('propietarios').upsert(payload, { onConflict: 'usuario_id' })
    setLoading(false)
  }

  if (!user) return <div>Debes iniciar sesión para ver tu perfil.</div>

  return (
    <div>
      <h2>Perfil</h2>
      <div>
        <strong>Email:</strong> {user.email}
      </div>
      <form onSubmit={guardar} style={{ marginTop: 12 }}>
        <div>
          <label>Nombre</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div>
          <label>Apellido</label>
          <input value={apellido} onChange={(e) => setApellido(e.target.value)} />
        </div>
        <div>
          <label>Teléfono</label>
          <input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        </div>
        <div>
          <button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
          <button type="button" onClick={() => signOut()} style={{ marginLeft: 8 }}>Cerrar sesión</button>
        </div>
      </form>
    </div>
  )
}
