// Tipos espejo de los contratos documentados en docs/API_CONTRACTS.md

export interface HealthResponse {
  status: 'ok'
  service: string
  version: string
  environment: string
}

/** Envoltorio de paginación común a todas las rutas de listado `/api/v1`. */
export interface Page<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

/** Categoría de servicio tal como la expone el backend (`snake_case`). */
export type ApiServiceCategory =
  | 'salud_mental'
  | 'salud_sexual'
  | 'empleo'
  | 'educacion'
  | 'juridico'
  | 'prevencion_consumo'
  | 'violencia_genero'
  | 'discapacidad'
  | 'emprendimiento'
  | 'deporte_cultura'

export type ApiModality = 'presencial' | 'virtual' | 'mixto'

export type ApiServiceStatus = 'activo' | 'inactivo'

/** Servicio de apoyo (`GET /api/v1/services`). Ver docs/API_CONTRACTS.md → Servicios. */
export interface ApiService {
  id: string
  title: string
  slug: string
  summary: string
  description: string | null
  category: ApiServiceCategory
  modality: ApiModality
  is_free: boolean
  comuna: number | null
  schedule: string | null
  offerings: string[]
  verified: boolean
  address: string | null
  latitude: number | null
  longitude: number | null
  status: ApiServiceStatus
  entity_id: string | null
  created_at: string
  updated_at: string
}

export type ApiEntityKind = 'publica' | 'ong' | 'privada' | 'educativa' | 'comunitaria'

/** Entidad que presta servicios (`GET /api/v1/entities`). */
export interface ApiEntity {
  id: string
  name: string
  slug: string
  kind: ApiEntityKind
  description: string | null
  website: string | null
  verified: boolean
  created_at: string
  updated_at: string
}
