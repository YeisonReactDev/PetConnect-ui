import React, { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function CaninoForm({ existing }: { existing?: any }) {
  const [nombre, setNombre] = useState(existing?.nombre || '')
  const [raza, setRaza] = useState(existing?.raza || '')
  const [edad, setEdad] = useState(existing?.edad || '')
  const [peso, setPeso] = useState(existing?.peso || '')
  const [sexo, setSexo] = useState(existing?.sexo || 'MACHO')
  const [foto, setFoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const uploadFoto = async (file: File, caninoId: string) => {
    const filePath = `caninos/${caninoId}/${file.name}`
    const { data, error } = await supabase.storage.from('caninos').upload(filePath, file)
    if (error) throw error
    const publicUrl = supabase.storage.from('caninos').getPublicUrl(filePath).data.publicUrl
    return publicUrl
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: any = { nombre, raza, edad: parseInt(String(edad || 0)), peso: parseFloat(String(peso || 0)), sexo }
      if (existing) {
        await supabase.from('caninos').update(payload).eq('id', existing.id)
        const caninoId = existing.id
        if (foto) {
          const url = await uploadFoto(foto, caninoId)
          await supabase.from('caninos').update({ foto_url: url }).eq('id', caninoId)
        }
        navigate(`/caninos/${caninoId}`)
      } else {
        const res = await supabase.from('caninos').insert([payload]).select().single()
        const caninoId = res.data.id
        if (foto && caninoId) {
          const url = await uploadFoto(foto, caninoId)
          await supabase.from('caninos').update({ foto_url: url }).eq('id', caninoId)
        }
        navigate(`/caninos/${caninoId}`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <div>
        <label>Nombre</label>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      </div>
      <div>
        <label>Raza</label>
        <input value={raza} onChange={(e) => setRaza(e.target.value)} />
      </div>
      <div>
        <label>Edad</label>
        <input value={edad} onChange={(e) => setEdad(e.target.value)} type="number" />
      </div>
      <div>
        <label>Peso (kg)</label>
        <input value={peso} onChange={(e) => setPeso(e.target.value)} type="number" step="0.1" />
      </div>
      <div>
        <label>Sexo</label>
        <select value={sexo} onChange={(e) => setSexo(e.target.value)}>
          <option value="MACHO">Macho</option>
          <option value="HEMBRA">Hembra</option>
        </select>
      </div>
      <div>
        <label>Foto</label>
        <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} />
      </div>
      <div>
        <button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar mascota'}</button>
      </div>
    </form>
  )
}
