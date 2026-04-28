import React from 'react'

interface Appointment {
  id: string
  scheduled_at: string
  services?: { title: string }
  caninos?: { name: string }
  status: string
}

interface SimpleCalendarProps {
  appointments: Appointment[]
  startDate?: Date
}

export default function SimpleCalendar({
  appointments,
  startDate = new Date()
}: SimpleCalendarProps) {
  // Get Monday of the current week
  const getMonday = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  const monday = getMonday(startDate)
  const days = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(date.getDate() + i)
    days.push(date)
  }

  const getDayAppointments = (date: Date) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.scheduled_at)
      return (
        aptDate.toLocaleDateString('es-CO') === date.toLocaleDateString('es-CO')
      )
    })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      requested: '#FFA500',
      accepted: '#4CAF50',
      declined: '#f44336',
      completed: '#2196F3',
      cancelled: '#9E9E9E'
    }
    return colors[status] || '#999'
  }

  return (
    <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', minWidth: '700px' }}>
        {days.map((date, idx) => {
          const dayAppointments = getDayAppointments(date)
          const isToday = date.toLocaleDateString('es-CO') === new Date().toLocaleDateString('es-CO')

          return (
            <div
              key={idx}
              style={{
                border: isToday ? '2px solid #0066cc' : '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '12px',
                backgroundColor: isToday ? '#f0f7ff' : '#fff',
                minHeight: '200px'
              }}
            >
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#333' }}>
                {date.toLocaleDateString('es-CO', { weekday: 'short' })}
                <br />
                {date.getDate()}
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {dayAppointments.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#ccc', margin: '0' }}>Sin citas</p>
                ) : (
                  dayAppointments.map((apt) => {
                    const aptTime = new Date(apt.scheduled_at).toLocaleTimeString('es-CO', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                    return (
                      <div
                        key={apt.id}
                        style={{
                          padding: '6px',
                          backgroundColor: getStatusColor(apt.status),
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '11px',
                          textAlign: 'center'
                        }}
                        title={`${apt.services?.title} - ${apt.caninos?.name}`}
                      >
                        <div style={{ fontWeight: 'bold' }}>{aptTime}</div>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {apt.services?.title}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
