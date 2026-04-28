import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthProvider'
import { validateFile } from '../../lib/fileValidation'

interface MedicalRecordFormProps {
  caninoId: string
  onSuccess?: () => void
}

export default function MedicalRecordForm({ caninoId, onSuccess }: MedicalRecordFormProps) {
  const { user } = useAuth()
  const [tipo, setTipo] = useState('CONSULTA')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [notas, setNotas] = useState('')
  const [citaId, setCitaId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isStaff, setIsStaff] = useState(false)
  const [completedCitas, setCompletedCitas] = useState<any[]>([])

  // Check if user is staff and fetch completed citas
  useEffect(() => {
    const checkRoleAndFetchCitas = async () => {
      if (!user) return

      // Check if user is prestador (staff)
      const { data: userData } = await supabase.from('usuarios').select('rol').eq('id', user.id).single()
      setIsStaff(userData?.rol === 'PRESTADOR')

      // Fetch completed citas for this canino
      const { data: citas } = await supabase
        .from('citas')
        .select('*')
        .eq('canino_id', caninoId)
        .eq('estado', 'COMPLETADA')
        .order('fecha_hora_cita', { ascending: false })

      setCompletedCitas(citas || [])
    }

    checkRoleAndFetchCitas()
  }, [user, caninoId])

  if (!isStaff) {
    return <div style={{ color: 'orange' }}>Solo el personal clínico puede subir registros médicos.</div>
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateFile(file, 'clinical')
    if (!validation.valid) {
      setError(validation.error || 'Archivo inválido')
      setArchivo(null)
      return
    }

    setArchivo(file)
    setError(null)
  }

  const uploadFile = async (file: File, recordId: number): Promise<string> => {
    const filePath = `registros_medicos/${caninoId}/record_${recordId}_${Date.now()}.pdf`
    const { data, error } = await supabase.storage.from('registros_medicos').upload(filePath, file)
    if (error) throw error
    const publicUrl = supabase.storage.from('registros_medicos').getPublicUrl(filePath).data.publicUrl
    return publicUrl
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !archivo) {
      setError('Debe seleccionar un archivo')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Insert record metadata
      const payload = {
        canino_id: caninoId,
        cita_id: citaId || null,
        cargado_por: user.id,
        tipo,
        notas: notas || null,
        archivo_path: '' // Will update after upload
      }

      const { data: inserted, error: insertErr } = await supabase
        .from('registros_medicos')
        .insert([payload])
        .select()
        .single()

      if (insertErr || !inserted) throw insertErr

      // Upload file to storage
      const publicUrl = await uploadFile(archivo, inserted.id)

      // Update record with file path
      await supabase
        .from('registros_medicos')
        .update({ archivo_path: publicUrl })
        .eq('id', inserted.id)

      // Reset form
      setTipo('CONSULTA')
      setArchivo(null)
      setNotas('')
      setCitaId(null)

      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.message || 'Error al subir registro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} style={{ border: '1px solid #e5e7eb', padding: 12, marginBottom: 12 }}>
      <h4>Agregar registro médico</h4>

      <div>
        <label>Tipo de registro</label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="CONSULTA">Consulta</option>
          <option value="RADIOGRAFIA">Radiografía</option>
          <option value="ECOGRAFIA">Ecografía</option>
          <option value="ANALISIS">Análisis</option>
          <option value="CIRUGÍA">Cirugía</option>
          <option value="OTRO">Otro</option>
        </select>
      </div>

      <div>
        <label>Cita relacionada (opcional)</label>
        <select value={citaId || ''} onChange={(e) => setCitaId(e.target.value || null)}>
          <option value="">Sin cita</option>
          {completedCitas.map((c) => (
            <option key={c.id} value={c.id}>
              {new Date(c.fecha_hora_cita).toLocaleDateString('es-CO')} - {c.notas || 'Sin descripción'}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Documento (PDF)</label>
        <input type="file" accept=".pdf" onChange={handleFileChange} required />
        {archivo && <div style={{ fontSize: 12, color: '#16a34a' }}>✓ {archivo.name}</div>}
      </div>

      <div>
        <label>Notas</label>
        <textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Observaciones adicionales..." rows={3} />
      </div>

      <div>
        <button type="submit" disabled={loading || !archivo}>
          {loading ? 'Subiendo...' : 'Guardar registro'}
        </button>
      </div>

      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </form>
  )
}
