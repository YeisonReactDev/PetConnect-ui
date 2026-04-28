import React, { useState } from 'react'
import { useNotifications } from '../../hooks/useNotifications'

export default function NotificationCenter() {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'CITA_CONFIRMADA':
        return '#10b981' // green
      case 'CITA_CANCELADA':
        return '#ef4444' // red
      case 'RECORDATORIO_CITA':
        return '#f59e0b' // amber
      case 'REGISTROS_MEDICOS':
        return '#3b82f6' // blue
      default:
        return '#6b7280' // gray
    }
  }

  const getTypeLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      CITA_CONFIRMADA: 'Cita Confirmada',
      CITA_CANCELADA: 'Cita Cancelada',
      RECORDATORIO_CITA: 'Recordatorio de Cita',
      REGISTROS_MEDICOS: 'Registros Médicos',
      SERVICIO_PUBLICADO: 'Nuevo Servicio',
      MENSAJE: 'Mensaje'
    }
    return labels[tipo] || tipo
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Icon / Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 20,
          position: 'relative'
        }}
        title="Notificaciones"
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -8,
              right: -8,
              background: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 'bold'
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 40,
            right: 0,
            width: 400,
            maxHeight: 500,
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
            zIndex: 1000,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: 12,
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16 }}>Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  cursor: 'pointer',
                  fontSize: 12
                }}
              >
                Marcar como leídas
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div
            style={{
              overflow: 'auto',
              flex: 1,
              maxHeight: 400
            }}
          >
            {loading ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>
                Cargando notificaciones...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>
                No tienes notificaciones
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  style={{
                    padding: 12,
                    borderBottom: '1px solid #f3f4f6',
                    background: notif.leida ? 'white' : '#f0f9ff',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 8
                  }}
                  onClick={() => !notif.leida && markAsRead(notif.id)}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        alignItems: 'center',
                        marginBottom: 4
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: getTypeColor(notif.tipo)
                        }}
                      />
                      <span style={{ fontSize: 12, fontWeight: 'bold', color: getTypeColor(notif.tipo) }}>
                        {getTypeLabel(notif.tipo)}
                      </span>
                      {!notif.leida && (
                        <span style={{ fontSize: 10, background: '#2563eb', color: 'white', padding: '2px 6px', borderRadius: 3 }}>
                          Nuevo
                        </span>
                      )}
                    </div>
                    <h4 style={{ margin: '4px 0', fontSize: 13 }}>{notif.asunto}</h4>
                    <p style={{ margin: '4px 0', fontSize: 12, color: '#6b7280' }}>
                      {notif.contenido}
                    </p>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>
                      {new Date(notif.creado_at).toLocaleDateString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNotification(notif.id)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      fontSize: 16
                    }}
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
