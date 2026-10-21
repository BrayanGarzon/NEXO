import { demoServices } from '../mocks/demoServices'
import type { DemoService } from '../types/catalog'

/*
 * Acceso al catálogo de servicios.
 *
 * PROVISIONAL: devuelve datos de demostración mientras el contrato `/api/v1/services`
 * no esté aprobado (docs/API_CONTRACTS.md). Al aprobarse, estas funciones pasarán a
 * usar `apiGet` de ./apiClient sin cambiar su firma para los componentes (tarea F6).
 */

const SIMULATED_LATENCY_MS = 350

export interface ListOptions {
  signal?: AbortSignal
  /** Solo para revisar estados de interfaz en desarrollo. */
  simulate?: 'error'
}

export function listDemoServices({ signal, simulate }: ListOptions = {}): Promise<DemoService[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (simulate === 'error') reject(new Error('Error simulado del catálogo'))
      else resolve(demoServices)
    }, SIMULATED_LATENCY_MS)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Cancelado', 'AbortError'))
    })
  })
}

const FEATURED_IDS = [
  'demo-orientacion-juvenil',
  'demo-actividades-deportivas',
  'demo-casa-juventud',
]

export function getFeaturedDemoServices(): DemoService[] {
  return FEATURED_IDS.map((id) => demoServices.find((service) => service.id === id)).filter(
    (service): service is DemoService => service !== undefined,
  )
}

export function getAllDemoServicesSync(): DemoService[] {
  return demoServices
}
