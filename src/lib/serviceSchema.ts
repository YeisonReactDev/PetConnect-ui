import { z } from 'zod'

export const serviceSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(100),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(500),
  price: z.coerce.number().positive('El precio debe ser positivo').min(0.01),
  duration_minutes: z.coerce.number().int().positive('La duración debe ser positiva'),
  category: z.string().min(1, 'Debes seleccionar una categoría')
})

export type ServiceFormData = z.infer<typeof serviceSchema>

export const SERVICE_CATEGORIES = [
  'Salud (Esterilización)',
  'Salud (Vacunación)',
  'Salud (Radiología)',
  'Salud (Cirugías)',
  'Salud (Laboratorios)',
  'Estética (Grooming)',
  'Nutrición (Consulta)',
  'Guardería/Hotel',
  'Servicio Funerario'
]
