import type { ApiModality, ApiService, ApiServiceCategory } from '../types/api'
import type { DemoService, ServiceCategory, ServiceModality } from '../types/catalog'

/*
 * Adaptador ApiService (contrato backend, docs/API_CONTRACTS.md) → DemoService
 * (modelo de vista del frontend público). El backend ya expone comuna, horario,
 * servicios ofrecidos y el flag real de verificación; se usan esos valores. La
 * distancia al usuario no existe en el backend (queda en 0, no se muestra) y la
 * comuna 0 representa «desconocida» (no se muestra).
 */

/** Categoría del backend → categoría de la UI (con reserva `otra`). */
const CATEGORY_MAP: Record<ApiServiceCategory, ServiceCategory> = {
  salud_mental: 'salud-mental',
  prevencion_consumo: 'salud-mental',
  salud_sexual: 'otra',
  empleo: 'empleo',
  emprendimiento: 'empleo',
  educacion: 'educacion',
  deporte_cultura: 'deporte',
  juridico: 'otra',
  violencia_genero: 'otra',
  discapacidad: 'otra',
}

/** Modalidad del backend (singular) → modalidades de la UI (lista). */
const MODALITY_MAP: Record<ApiModality, ServiceModality[]> = {
  presencial: ['presencial'],
  virtual: ['informacion'],
  mixto: ['presencial', 'informacion'],
}

export function mapCategory(category: ApiServiceCategory): ServiceCategory {
  return CATEGORY_MAP[category] ?? 'otra'
}

export function mapModalities(modality: ApiModality): ServiceModality[] {
  return MODALITY_MAP[modality] ?? ['informacion']
}

// Caja envolvente aproximada de Villavicencio para ubicar marcadores en el mapa
// esquemático (porcentajes 0–100, no coordenadas). Ver MapCanvas.tsx.
const BBOX = { minLat: 4.08, maxLat: 4.18, minLng: -73.67, maxLng: -73.58 }
const MAP_MIN = 8
const MAP_MAX = 92

function clampMap(value: number): number {
  return Math.min(MAP_MAX, Math.max(MAP_MIN, value))
}

/** Dispersión determinista (0–100) a partir del id, para marcadores sin coordenadas. */
function spreadFromId(id: string): { x: number; y: number } {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 100000
  }
  return {
    x: clampMap(MAP_MIN + (hash % 1000) / 1000 * (MAP_MAX - MAP_MIN)),
    y: clampMap(MAP_MIN + (Math.floor(hash / 1000) % 1000) / 1000 * (MAP_MAX - MAP_MIN)),
  }
}

export function mapPositionFrom(
  latitude: number | null,
  longitude: number | null,
  id: string,
): { x: number; y: number } {
  if (latitude == null || longitude == null) return spreadFromId(id)
  const x = ((longitude - BBOX.minLng) / (BBOX.maxLng - BBOX.minLng)) * 100
  const y = ((BBOX.maxLat - latitude) / (BBOX.maxLat - BBOX.minLat)) * 100
  return { x: clampMap(x), y: clampMap(y) }
}

export interface MapOptions {
  /** Nombre de la entidad resuelto desde `entity_id`, para mostrar la institución. */
  institution?: string
}

/** Convierte un servicio del backend al modelo de vista del catálogo público. */
export function toDemoService(api: ApiService, options: MapOptions = {}): DemoService {
  return {
    id: api.id,
    name: api.title,
    category: mapCategory(api.category),
    summary: api.summary,
    institution: options.institution ?? 'Entidad por confirmar',
    address: api.address ?? 'Dirección por confirmar',
    comuna: api.comuna ?? 0,
    distanceKm: 0,
    schedule: api.schedule ?? 'Horario por confirmar',
    offerings: api.offerings.length > 0 ? api.offerings : ['Información y orientación'],
    modalities: mapModalities(api.modality),
    verified: api.verified,
    mapPosition: mapPositionFrom(api.latitude, api.longitude, api.id),
  }
}
