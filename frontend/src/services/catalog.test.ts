import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ApiEntity, ApiService, Page } from '../types/api'
import * as apiClient from './apiClient'
import { getAllDemoServicesSync, getFeaturedDemoServices, listDemoServices } from './catalog'

function page<T>(items: T[]): Page<T> {
  return { items, total: items.length, page: 1, page_size: 100 }
}

const apiService: ApiService = {
  id: 'svc-1',
  title: 'Centro de Orientación',
  slug: 'centro-de-orientacion',
  summary: 'Orientación psicológica para jóvenes.',
  description: 'Atención individual.',
  category: 'salud_mental',
  modality: 'presencial',
  is_free: true,
  comuna: 5,
  schedule: 'Lun a Vie 8:00 a. m. – 5:00 p. m.',
  offerings: ['Atención individual', 'Acompañamiento psicosocial'],
  verified: true,
  address: 'Calle 1 # 2-3',
  latitude: 4.13,
  longitude: -73.62,
  status: 'activo',
  entity_id: 'ent-1',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

const apiEntity: ApiEntity = {
  id: 'ent-1',
  name: 'Alcaldía de Villavicencio',
  slug: 'alcaldia',
  kind: 'publica',
  description: null,
  website: null,
  verified: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

function mockApi(services: ApiService[], entities: ApiEntity[] = [apiEntity]) {
  return vi.spyOn(apiClient, 'apiGet').mockImplementation(async (path: string) => {
    if (path.startsWith('/api/v1/services')) return page(services)
    if (path.startsWith('/api/v1/entities')) return page(entities)
    throw new Error(`ruta inesperada: ${path}`)
  })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('listDemoServices', () => {
  it('consume /api/v1/services y adapta al modelo de la UI', async () => {
    const spy = mockApi([apiService])
    const services = await listDemoServices()

    expect(spy).toHaveBeenCalledWith(
      expect.stringMatching(/^\/api\/v1\/services\?/),
      undefined,
    )
    expect(services).toHaveLength(1)
    expect(services[0]).toMatchObject({
      id: 'svc-1',
      name: 'Centro de Orientación',
      category: 'salud-mental',
      verified: true,
      institution: 'Alcaldía de Villavicencio',
      offerings: ['Atención individual', 'Acompañamiento psicosocial'],
    })
  })

  it('propaga el error simulado sin llamar a la API', async () => {
    const spy = mockApi([apiService])
    await expect(listDemoServices({ simulate: 'error' })).rejects.toThrow('Error simulado')
    expect(spy).not.toHaveBeenCalled()
  })

  it('tras cargar, los accesos síncronos devuelven datos reales', async () => {
    mockApi([apiService])
    await listDemoServices()
    expect(getAllDemoServicesSync()).toHaveLength(1)
    expect(getAllDemoServicesSync()[0].id).toBe('svc-1')
    expect(getFeaturedDemoServices()[0].id).toBe('svc-1')
  })

  it('aunque falten las entidades, el servicio se mapea con institución de reserva', async () => {
    vi.spyOn(apiClient, 'apiGet').mockImplementation(async (path: string) => {
      if (path.startsWith('/api/v1/services')) return page([apiService])
      throw new Error('entidades caídas')
    })
    const services = await listDemoServices()
    expect(services[0].institution).toBe('Entidad por confirmar')
  })
})
