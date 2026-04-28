import { supabase } from './supabaseClient'

export interface NotificationPayload {
  usuario_id: string
  tipo: 'CITA_CONFIRMADA' | 'CITA_CANCELADA' | 'RECORDATORIO_CITA' | 'REGISTROS_MEDICOS' | 'SERVICIO_PUBLICADO' | 'MENSAJE'
  asunto: string
  contenido: string
}

export interface EmailPayload {
  to_email: string
  subject: string
  html_body: string
  text_body: string
  tipo?: string
}

/**
 * Send in-app notification to a user
 * Stores in notificaciones table for real-time retrieval
 */
export const sendNotification = async (payload: NotificationPayload): Promise<boolean> => {
  try {
    const { error } = await supabase.from('notificaciones').insert([
      {
        usuario_id: payload.usuario_id,
        tipo: payload.tipo,
        asunto: payload.asunto,
        contenido: payload.contenido,
        leida: false,
        creado_at: new Date().toISOString()
      }
    ])

    if (error) {
      console.error('Error sending notification:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Unexpected error sending notification:', err)
    return false
  }
}

/**
 * Send email via Supabase Edge Function
 * Requires a backend function to handle SMTP/email service
 * For development, logs to console
 */
export const sendEmail = async (payload: EmailPayload): Promise<boolean> => {
  try {
    // In production, call a Supabase Edge Function
    // Example: const { data, error } = await supabase.functions.invoke('send-email', { body: payload })
    
    // For now, log to console for development
    console.log('📧 Email to send:', {
      to: payload.to_email,
      subject: payload.subject,
      body: payload.html_body
    })

    // TODO: Implement actual email sending via:
    // 1. Supabase Edge Functions (serverless)
    // 2. SendGrid API
    // 3. Resend API
    // 4. Mailgun API

    return true
  } catch (err) {
    console.error('Error sending email:', err)
    return false
  }
}

/**
 * Send notification + email to a user
 * Useful for important events like appointment confirmations
 */
export const sendNotificationAndEmail = async (
  notification: NotificationPayload,
  email: EmailPayload
): Promise<{ notif: boolean; email: boolean }> => {
  const [notifResult, emailResult] = await Promise.all([
    sendNotification(notification),
    sendEmail(email)
  ])

  return { notif: notifResult, email: emailResult }
}

/**
 * Helper to create appointment confirmation notification + email
 */
export const notifyAppointmentConfirmed = async (data: {
  usuario_id: string
  usuario_email: string
  propietarioNombre: string
  canino: string
  servicio: string
  fecha: string
  hora: string
  prestador: string
  clinica: string
}) => {
  const { emailTemplates } = await import('./emailTemplates')

  const template = emailTemplates.citaConfirmada({
    propietarioNombre: data.propietarioNombre,
    canino: data.canino,
    servicio: data.servicio,
    fecha: data.fecha,
    hora: data.hora,
    prestador: data.prestador,
    clinica: data.clinica
  })

  return sendNotificationAndEmail(
    {
      usuario_id: data.usuario_id,
      tipo: 'CITA_CONFIRMADA',
      asunto: `Cita confirmada para ${data.canino}`,
      contenido: `Tu cita de ${data.servicio} ha sido confirmada para ${data.fecha} a las ${data.hora}`
    },
    {
      to_email: data.usuario_email,
      subject: template.subject,
      html_body: template.html,
      text_body: template.text,
      tipo: 'CITA_CONFIRMADA'
    }
  )
}

/**
 * Helper to create appointment cancellation notification + email
 */
export const notifyAppointmentCancelled = async (data: {
  usuario_id: string
  usuario_email: string
  propietarioNombre: string
  canino: string
  servicio: string
  fecha: string
  razon?: string
}) => {
  const { emailTemplates } = await import('./emailTemplates')

  const template = emailTemplates.citaCancelada({
    propietarioNombre: data.propietarioNombre,
    canino: data.canino,
    servicio: data.servicio,
    fecha: data.fecha,
    razon: data.razon
  })

  return sendNotificationAndEmail(
    {
      usuario_id: data.usuario_id,
      tipo: 'CITA_CANCELADA',
      asunto: `Cita cancelada - ${data.canino}`,
      contenido: `Tu cita de ${data.servicio} para ${data.fecha} ha sido cancelada`
    },
    {
      to_email: data.usuario_email,
      subject: template.subject,
      html_body: template.html,
      text_body: template.text,
      tipo: 'CITA_CANCELADA'
    }
  )
}

/**
 * Helper to create medical records added notification
 */
export const notifyMedicalRecordsAdded = async (data: {
  usuario_id: string
  usuario_email: string
  propietarioNombre: string
  canino: string
  tipoRegistro: string
  fecha: string
  prestador: string
}) => {
  const { emailTemplates } = await import('./emailTemplates')

  const template = emailTemplates.registrosMedicosAnadidos({
    propietarioNombre: data.propietarioNombre,
    canino: data.canino,
    tipoRegistro: data.tipoRegistro,
    fecha: data.fecha,
    prestador: data.prestador
  })

  return sendNotificationAndEmail(
    {
      usuario_id: data.usuario_id,
      tipo: 'REGISTROS_MEDICOS',
      asunto: `Nuevos registros médicos para ${data.canino}`,
      contenido: `Se han añadido registros de ${data.tipoRegistro} para ${data.canino}`
    },
    {
      to_email: data.usuario_email,
      subject: template.subject,
      html_body: template.html,
      text_body: template.text,
      tipo: 'REGISTROS_MEDICOS'
    }
  )
}

/**
 * Helper to send welcome email
 */
export const sendWelcomeEmail = async (data: {
  usuario_id: string
  usuario_email: string
  nombre: string
  tipo: 'PROPIETARIO' | 'PRESTADOR'
}) => {
  const { emailTemplates } = await import('./emailTemplates')

  const template = emailTemplates.bienvenida({
    nombre: data.nombre,
    tipo: data.tipo
  })

  return sendEmail({
    to_email: data.usuario_email,
    subject: template.subject,
    html_body: template.html,
    text_body: template.text,
    tipo: 'BIENVENIDA'
  })
}
