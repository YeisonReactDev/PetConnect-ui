/**
 * Email template builders for PetConnect
 * Generate HTML and plain text emails for common scenarios
 */

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export const emailTemplates = {
  // Cita confirmada
  citaConfirmada: (data: {
    propietarioNombre: string
    canino: string
    servicio: string
    fecha: string
    hora: string
    prestador: string
    clinica: string
  }): EmailTemplate => ({
    subject: `Cita confirmada para ${data.canino} - ${data.servicio}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>¡Cita Confirmada!</h2>
        <p>Hola ${data.propietarioNombre},</p>
        <p>Tu cita ha sido confirmada exitosamente.</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Mascota:</strong> ${data.canino}</p>
          <p><strong>Servicio:</strong> ${data.servicio}</p>
          <p><strong>Fecha:</strong> ${data.fecha}</p>
          <p><strong>Hora:</strong> ${data.hora}</p>
          <p><strong>Prestador:</strong> ${data.prestador}</p>
          <p><strong>Clínica:</strong> ${data.clinica}</p>
        </div>
        <p>Por favor, llega 10 minutos antes de tu cita.</p>
        <p>Si necesitas cancelar o reprogramar, contáctanos lo antes posible.</p>
        <p>Saludos,<br/>El equipo de PetConnect</p>
      </div>
    `,
    text: `
¡Cita Confirmada!

Hola ${data.propietarioNombre},

Tu cita ha sido confirmada exitosamente.

Mascota: ${data.canino}
Servicio: ${data.servicio}
Fecha: ${data.fecha}
Hora: ${data.hora}
Prestador: ${data.prestador}
Clínica: ${data.clinica}

Por favor, llega 10 minutos antes de tu cita.
Si necesitas cancelar o reprogramar, contáctanos lo antes posible.

Saludos,
El equipo de PetConnect
    `
  }),

  // Cita cancelada
  citaCancelada: (data: {
    propietarioNombre: string
    canino: string
    servicio: string
    fecha: string
    razon?: string
  }): EmailTemplate => ({
    subject: `Cita cancelada - ${data.canino}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Cita Cancelada</h2>
        <p>Hola ${data.propietarioNombre},</p>
        <p>Tu cita ha sido cancelada.</p>
        <div style="background: #fee2e2; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Mascota:</strong> ${data.canino}</p>
          <p><strong>Servicio:</strong> ${data.servicio}</p>
          <p><strong>Fecha original:</strong> ${data.fecha}</p>
          ${data.razon ? `<p><strong>Motivo:</strong> ${data.razon}</p>` : ''}
        </div>
        <p>Puedes agendar una nueva cita en cualquier momento desde nuestra plataforma.</p>
        <p>Si tienes preguntas, no dudes en contactarnos.</p>
        <p>Saludos,<br/>El equipo de PetConnect</p>
      </div>
    `,
    text: `
Cita Cancelada

Hola ${data.propietarioNombre},

Tu cita ha sido cancelada.

Mascota: ${data.canino}
Servicio: ${data.servicio}
Fecha original: ${data.fecha}
${data.razon ? `Motivo: ${data.razon}` : ''}

Puedes agendar una nueva cita en cualquier momento desde nuestra plataforma.
Si tienes preguntas, no dudes en contactarnos.

Saludos,
El equipo de PetConnect
    `
  }),

  // Recordatorio de cita
  recordatorioCita: (data: {
    propietarioNombre: string
    canino: string
    servicio: string
    fecha: string
    hora: string
    horasAntes: number
  }): EmailTemplate => ({
    subject: `Recordatorio: Cita de ${data.canino} en ${data.horasAntes} horas`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Recordatorio de Cita</h2>
        <p>Hola ${data.propietarioNombre},</p>
        <p>Te recordamos que tienes una cita próxima en ${data.horasAntes} horas.</p>
        <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Mascota:</strong> ${data.canino}</p>
          <p><strong>Servicio:</strong> ${data.servicio}</p>
          <p><strong>Fecha:</strong> ${data.fecha}</p>
          <p><strong>Hora:</strong> ${data.hora}</p>
        </div>
        <p>Por favor, llega 10 minutos antes.</p>
        <p>Saludos,<br/>El equipo de PetConnect</p>
      </div>
    `,
    text: `
Recordatorio de Cita

Hola ${data.propietarioNombre},

Te recordamos que tienes una cita próxima en ${data.horasAntes} horas.

Mascota: ${data.canino}
Servicio: ${data.servicio}
Fecha: ${data.fecha}
Hora: ${data.hora}

Por favor, llega 10 minutos antes.

Saludos,
El equipo de PetConnect
    `
  }),

  // Registros médicos añadidos
  registrosMedicosAnadidos: (data: {
    propietarioNombre: string
    canino: string
    tipoRegistro: string
    fecha: string
    prestador: string
  }): EmailTemplate => ({
    subject: `Nuevos registros médicos para ${data.canino}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Registros Médicos Actualizados</h2>
        <p>Hola ${data.propietarioNombre},</p>
        <p>Se han añadido nuevos registros médicos para ${data.canino}.</p>
        <div style="background: #dbeafe; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Mascota:</strong> ${data.canino}</p>
          <p><strong>Tipo de registro:</strong> ${data.tipoRegistro}</p>
          <p><strong>Fecha:</strong> ${data.fecha}</p>
          <p><strong>Agregado por:</strong> ${data.prestador}</p>
        </div>
        <p>Puedes ver los detalles completos en tu perfil de mascotas.</p>
        <p>Saludos,<br/>El equipo de PetConnect</p>
      </div>
    `,
    text: `
Registros Médicos Actualizados

Hola ${data.propietarioNombre},

Se han añadido nuevos registros médicos para ${data.canino}.

Mascota: ${data.canino}
Tipo de registro: ${data.tipoRegistro}
Fecha: ${data.fecha}
Agregado por: ${data.prestador}

Puedes ver los detalles completos en tu perfil de mascotas.

Saludos,
El equipo de PetConnect
    `
  }),

  // Email de bienvenida
  bienvenida: (data: {
    nombre: string
    tipo: string
  }): EmailTemplate => ({
    subject: 'Bienvenido a PetConnect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>¡Bienvenido a PetConnect!</h2>
        <p>Hola ${data.nombre},</p>
        <p>Tu cuenta ha sido creada exitosamente como ${data.tipo === 'PROPIETARIO' ? 'propietario' : 'prestador de servicios'}.</p>
        <p>Ahora puedes:</p>
        <ul>
          ${data.tipo === 'PROPIETARIO' ? `
            <li>Registrar y gestionar tus mascotas</li>
            <li>Agendar citas con veterinarios y prestadores</li>
            <li>Ver el historial médico de tus mascotas</li>
            <li>Recibir recordatorios de citas</li>
          ` : `
            <li>Crear y gestionar tus servicios</li>
            <li>Configurar tu disponibilidad</li>
            <li>Recibir solicitudes de citas</li>
            <li>Registrar historial médico de mascotas</li>
          `}
        </ul>
        <p>Si tienes dudas, puedes contactarnos en cualquier momento.</p>
        <p>Saludos,<br/>El equipo de PetConnect</p>
      </div>
    `,
    text: `
¡Bienvenido a PetConnect!

Hola ${data.nombre},

Tu cuenta ha sido creada exitosamente como ${data.tipo === 'PROPIETARIO' ? 'propietario' : 'prestador de servicios'}.

Ahora puedes:
${data.tipo === 'PROPIETARIO' ? `
- Registrar y gestionar tus mascotas
- Agendar citas con veterinarios y prestadores
- Ver el historial médico de tus mascotas
- Recibir recordatorios de citas
` : `
- Crear y gestionar tus servicios
- Configurar tu disponibilidad
- Recibir solicitudes de citas
- Registrar historial médico de mascotas
`}

Si tienes dudas, puedes contactarnos en cualquier momento.

Saludos,
El equipo de PetConnect
    `
  })
}
