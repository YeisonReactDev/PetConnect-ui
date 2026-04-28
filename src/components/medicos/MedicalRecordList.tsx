import React from 'react'

export interface MedicalRecord {
  id: number
  canino_id: string
  cita_id: string | null
  prestador_id: string | null
  cargado_por: string
  tipo: string
  archivo_path: string
  notas: string | null
  fecha_registro: string
  creado_at: string
}

interface MedicalRecordListProps {
  records: MedicalRecord[]
  loading?: boolean
  onDelete?: (recordId: number) => void
  isStaff?: boolean
}

export default function MedicalRecordList({ records, loading, onDelete, isStaff }: MedicalRecordListProps) {
  if (loading) return <div>Cargando registros médicos...</div>

  if (records.length === 0) return <div style={{ color: '#6b7280' }}>No hay registros médicos.</div>

  return (
    <div>
      {records.map((record) => (
        <div key={record.id} style={{ border: '1px solid #e5e7eb', padding: 12, marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>
                Tipo: {record.tipo}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                Fecha: {new Date(record.fecha_registro).toLocaleDateString('es-CO')}
              </div>
              {record.notas && (
                <div style={{ marginTop: 8, fontSize: 13 }}>
                  <strong>Notas:</strong> {record.notas}
                </div>
              )}
              {record.archivo_path && (
                <div style={{ marginTop: 8 }}>
                  <a href={record.archivo_path} target="_blank" rel="noopener noreferrer">
                    Ver archivo
                  </a>
                </div>
              )}
            </div>
            {isStaff && onDelete && (
              <button onClick={() => onDelete(record.id)} style={{ marginLeft: 8, color: 'red' }}>
                Eliminar
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
