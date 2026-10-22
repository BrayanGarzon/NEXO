import { describe, expect, it } from 'vitest'
import type { ApiService } from '../types/api'
import { mapCategory, mapModalities, mapPositionFrom, toDemoService } from './serviceMapper'

const baseApiService: ApiService = {
  id: 'svc-1',
  title: 'Centro de Orientación',
  slug: 'centro-de-orientacion',
  summary: 'Orientación psicológica para jóvenes.',
  description: 'Atención individual y talleres grupales.',
  category: 'salud_mental',
  modality: 'presencial',
  is_free: true,
  comuna: 5,
  schedule: 'Lun a Vie 8:00 a. m. – 5:00 p. m.',
  offerings: ['Atención individual', 'Talleres grupales'],
  verified: true,
  address: 'Calle 1 # 2-3',
  latitude: 4.13,
  longitude: -73.62,
  status: 'activo',
  entity_id: 'ent-1',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

describe('mapCategory', () => {
  it('traduce categorías conocidas al enum del frontend', () => {
    expect(mapCategory('salud_mental')).toBe('salud-mental')
    expect(mapCategory('prevencion_consumo')).toBe('salud-mental')
    expect(mapCategory('empleo')).toBe('empleo')
    expect(mapCategory('emprendimiento')).toBe('empleo')
    expect(mapCategory('deporte_cultura')).toBe('deporte')
    expect(mapCategory('educacion')).toBe('educacion')
  })

  it('usa "otra" para categorías sin equivalente directo', () => {
    expect(mapCategory('juridico')).toBe('otra')
    expect(mapCategory('violencia_genero')).toBe('otra')
    expect(mapCategory('discapacidad')).toBe('otra')
    expect(mapCategory('salud_sexual')).toBe('otra')
  })
})

describe('mapModalities', () => {
  it('convierte la modalidad única del backend en una lista para la UI', () => {
    expect(mapModalities('presencial')).toEqual(['presencial'])
    expect(mapModalities('virtual')).toEqual(['informacion'])
    expect(mapModalities('mixto')).toEqual(['presencial', 'informacion'])
  })
})

describe('mapPositionFrom', () => {
  it('ubica coordenadas reales dentro del rango del mapa (8–92)', () => {
    const pos = mapPositionFrom(4.13, -73.62, 'svc-1')
    expect(pos.x).toBeGreaterThanOrEqual(8)
    expect(pos.x).toBeLessThanOrEqual(92)
    expect(pos.y).toBeGreaterThanOrEqual(8)
    expect(pos.y).toBeLessThanOrEqual(92)
  })

  it('un punto al noroeste queda arriba a la izquierda', () => {
    const noroeste = mapPositionFrom(4.18, -73.67, 'a')
    const sureste = mapPositionFrom(4.08, -73.58, 'b')
    expect(noroeste.x).toBeLessThan(sureste.x)
    expect(noroeste.y).toBeLessThan(sureste.y)
  })

  it('sin coordenadas, dispersa de forma determinista por id', () => {
    const first = mapPositionFrom(null, null, 'svc-1')
    const again = mapPositionFrom(null, null, 'svc-1')
    const other = mapPositionFrom(null, null, 'svc-2')
    expect(first).toEqual(again)
    expect(first).not.toEqual(other)
    expect(first.x).toBeGreaterThanOrEqual(8)
    expect(first.x).toBeLessThanOrEqual(92)
  })
})

describe('toDemoService', () => {
  it('mapea los campos directos del contrato', () => {
    const result = toDemoService(baseApiService, { institution: 'Alcaldía de Villavicencio' })
    expect(result.id).toBe('svc-1')
    expect(result.name).toBe('Centro de Orientación')
    expect(result.summary).toBe('Orientación psicológica para jóvenes.')
    expect(result.category).toBe('salud-mental')
    expect(result.modalities).toEqual(['presencial'])
    expect(result.institution).toBe('Alcaldía de Villavicencio')
    expect(result.address).toBe('Calle 1 # 2-3')
  })

  it('mapea comuna, horario y servicios reales del backend', () => {
    const result = toDemoService(baseApiService)
    expect(result.comuna).toBe(5)
    expect(result.schedule).toBe('Lun a Vie 8:00 a. m. – 5:00 p. m.')
    expect(result.offerings).toEqual(['Atención individual', 'Talleres grupales'])
  })

  it('usa el flag real de verificación, no el estado', () => {
    expect(toDemoService(baseApiService).verified).toBe(true)
    expect(toDemoService({ ...baseApiService, verified: false }).verified).toBe(false)
    // El estado ya no determina la verificación.
    expect(toDemoService({ ...baseApiService, status: 'inactivo', verified: true }).verified).toBe(
      true,
    )
  })

  it('usa reservas neutras para campos que el backend no provee', () => {
    const result = toDemoService({
      ...baseApiService,
      description: null,
      address: null,
      comuna: null,
      schedule: null,
      offerings: [],
    })
    expect(result.institution).toBe('Entidad por confirmar')
    expect(result.address).toBe('Dirección por confirmar')
    expect(result.schedule).toBe('Horario por confirmar')
    expect(result.offerings).toEqual(['Información y orientación'])
    expect(result.comuna).toBe(0)
    expect(result.distanceKm).toBe(0)
  })
})
