// File validation utilities for Phase 5 (Medical Records)
// Restricción: JPG/PNG para fotos de caninos, PDF para documentos clínicos

export type AllowedFileType = 'image' | 'clinical'

export const FILE_RESTRICTIONS = {
  image: { mimeTypes: ['image/jpeg', 'image/png'], extensions: ['.jpg', '.jpeg', '.png'], maxMB: 5 },
  clinical: { mimeTypes: ['application/pdf'], extensions: ['.pdf'], maxMB: 10 }
}

export function validateFile(file: File, type: AllowedFileType): { valid: boolean; error?: string } {
  const config = FILE_RESTRICTIONS[type]
  
  // Check file size
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > config.maxMB) {
    return { valid: false, error: `Archivo demasiado grande. Máximo ${config.maxMB}MB.` }
  }

  // Check MIME type
  if (!config.mimeTypes.includes(file.type)) {
    return { valid: false, error: `Tipo de archivo no permitido. Tipos válidos: ${config.extensions.join(', ')}` }
  }

  return { valid: true }
}

export function getFileTypeLabel(type: AllowedFileType): string {
  return type === 'image' ? 'Foto' : 'Documento clínico'
}
