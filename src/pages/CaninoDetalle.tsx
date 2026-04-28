import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthProvider'
import MedicalRecordForm from '../components/medicos/MedicalRecordForm'
import MedicalRecordList, { MedicalRecord } from '../components/medicos/MedicalRecordList'

export default function CaninoDetalle() {
  const { id } = useParams()
  const { user } = useAuth()
  const [canino, setCanino] = useState<any | null>(null)
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'general' | 'medical'>('general')
  const [isStaff, setIsStaff] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      setLoading(true)

      // Fetch canino
      const { data: caninoData } = await supabase.from('caninos').select('*').eq('id', id).single()
      setCanino(caninoData)

      // Fetch medical records
      const { data: recordsData } = await supabase
        .from('registros_medicos')
        .select('*')
        .eq('canino_id', id)
        .order('creado_at', { ascending: false })

      setMedicalRecords(recordsData || [])

      // Check if user is staff
      if (user) {
        const { data: userData } = await supabase.from('usuarios').select('rol').eq('id', user.id).single()
        setIsStaff(userData?.rol === 'PRESTADOR')
      }

      setLoading(false)
    }

    fetchData()
  }, [id, user])

  if (loading) return <div>Cargando...</div>
  if (!canino) return <div>Canino no encontrado.</div>

  return (
    <div>
      <h2>{canino.nombre}</h2>

      {/* Tabs */}
      <div style={{ marginTop: 12, marginBottom: 12, borderBottom: '1px solid #e5e7eb' }}>
        <button
          onClick={() => setTab('general')}
          style={{
            padding: '8px 16px',
            borderBottom: tab === 'general' ? '3px solid #2563eb' : 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: tab === 'general' ? 'bold' : 'normal'
          }}
        >
          General
        </button>
        <button
          onClick={() => setTab('medical')}
          style={{
            padding: '8px 16px',
            borderBottom: tab === 'medical' ? '3px solid #2563eb' : 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: tab === 'medical' ? 'bold' : 'normal'
          }}
        >
          Historial Médico
        </button>
      </div>

      {/* General Tab */}
      {tab === 'general' && (
        <div>
          <div>Raza: {canino.raza}</div>
          <div>Edad: {canino.edad}</div>
          <div>Peso: {canino.peso}</div>
          <div>Sexo: {canino.sexo}</div>
          {canino.observaciones && (
            <div style={{ marginTop: 8 }}>
              <strong>Observaciones:</strong> {canino.observaciones}
            </div>
          )}
          {canino.foto_url && (
            <div style={{ marginTop: 12 }}>
              <img src={canino.foto_url} alt={canino.nombre} style={{ maxWidth: 300 }} />
            </div>
          )}
        </div>
      )}

      {/* Medical History Tab */}
      {tab === 'medical' && (
        <div>
          {isStaff && id && <MedicalRecordForm caninoId={id} onSuccess={() => {}} />}
          <MedicalRecordList records={medicalRecords} loading={loading} isStaff={isStaff} />
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <Link to="/caninos">Volver a mascotas</Link>
      </div>
    </div>
  )
}
