import type { ApiEntity, ApiService, Page } from '../types/api'
import type { DemoService } from '../types/catalog'
import { demoServices } from '../mocks/demoServices'
import { apiGet } from './apiClient'
import { toDemoService } from './serviceMapper'

/*
 * Acceso al catálogo de servicios (tarea F6).
 *
 * Consume la API real `/api/v1/services` y adapta cada servicio al modelo de vista
 * `DemoService` con `toDemoService`. Los componentes no cambian: siguen recibiendo
 * `DemoService`.
 *
 * Reserva: si la API no responde, `listDemoServices` propaga el error (la UI de
 * Territorio muestra su estado de error con reintento). Los accesos síncronos
 * (`getFeaturedDemoServices`, `getAllDemoServicesSync`) leen una caché llenada por
 * `listDemoServices`; mientras esté vacía devuelven los datos de demostración, para
 * que Inicio, Brújula y «Mi siguiente paso» nunca queden sin contenido.
 */

const PAGE_SIZE = 100

export interface ListOptions {
  signal?: AbortSignal
  /** Solo para revisar estados de interfaz en desarrollo. */
  simulate?: 'error'
}

/** Caché del último catálogo cargado desde la API (null = aún no se ha cargado). */
let cache: DemoService[] | null = null

/** Descarga todas las páginas de un recurso `/api/v1` y las concatena. */
async function fetchAllPages<T>(path: string, signal?: AbortSignal): Promise<T[]> {
  const items: T[] = []
  let page = 1
  for (;;) {
    const sep = path.includes('?') ? '&' : '?'
    const result = await apiGet<Page<T>>(
      `${path}${sep}page=${page}&page_size=${PAGE_SIZE}`,
      signal,
    )
    items.push(...result.items)
    if (items.length >= result.total || result.items.length === 0) break
    page += 1
  }
  return items
}

/** Mapa `entity_id → nombre` para mostrar la institución en el detalle. */
async function fetchEntityNames(signal?: AbortSignal): Promise<Map<string, string>> {
  try {
    const entities = await fetchAllPages<ApiEntity>('/api/v1/entities', signal)
    return new Map(entities.map((entity) => [entity.id, entity.name]))
  } catch {
    // La institución no es crítica: si falla, el mapeo usa su reserva.
    return new Map()
  }
}

export async function listDemoServices({
  signal,
  simulate,
}: ListOptions = {}): Promise<DemoService[]> {
  if (simulate === 'error') {
    throw new Error('Error simulado del catálogo')
  }
  const [apiServices, entityNames] = await Promise.all([
    fetchAllPages<ApiService>('/api/v1/services', signal),
    fetchEntityNames(signal),
  ])
  const services = apiServices.map((service) =>
    toDemoService(service, {
      institution: service.entity_id ? entityNames.get(service.entity_id) : undefined,
    }),
  )
  cache = services
  return services
}

/** Hasta tres servicios destacados: verificados primero; reserva a datos demo. */
export function getFeaturedDemoServices(): DemoService[] {
  const source = cache ?? demoServices
  const verified = source.filter((service) => service.verified)
  return (verified.length > 0 ? verified : source).slice(0, 3)
}

export function getAllDemoServicesSync(): DemoService[] {
  return cache ?? demoServices
}
