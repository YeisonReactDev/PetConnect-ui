import { z } from 'zod'

export const serviceSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(500),
  precio: z.coerce.number().positive('El precio debe ser positivo').min(0.01),
  duracion_minutos: z.coerce.number().int().positive('La duración debe ser positiva'),
  categoria_id: z.coerce.number().min(1, 'Debes seleccionar una categoría')
})

export type ServiceFormData = z.infer<typeof serviceSchema>