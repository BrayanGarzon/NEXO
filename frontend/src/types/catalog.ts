/*
 * Tipos PROVISIONALES del catálogo de servicios para trabajar con datos de demostración.
 *
 * No son un contrato: los recursos `/api/v1/services` siguen pendientes de aprobación
 * (docs/API_CONTRACTS.md, tarea B2). Cuando el contrato se apruebe, los tipos espejo
 * irán a `types/api.ts` y este archivo se adaptará o eliminará (tarea F6).
 */

export type ServiceCategory =
  | 'salud-mental'
  | 'educacion'
  | 'deporte'
  | 'cultura'
  | 'empleo'
  | 'recreacion'
  | 'otra'

/** Cómo se puede empezar a usar el servicio (usado por Brújula). */
export type ServiceModality = 'presencial' | 'acompanamiento' | 'informacion' | 'grupal'

export interface DemoService {
  id: string
  name: string
  category: ServiceCategory
  summary: string
  institution: string
  address: string
  comuna: number
  distanceKm: number
  schedule: string
  offerings: string[]
  modalities: ServiceModality[]
  verified: boolean
  /** Posición relativa (0–100 %) en el mapa provisional; no son coordenadas reales. */
  mapPosition: { x: number; y: number }
}
