import { describe, expect, it } from 'vitest'
import { demoServices } from '../../mocks/demoServices'
import { filterServices, isServiceCategory } from './filterServices'

const none = { query: '', category: null, verifiedOnly: false }

describe('filterServices', () => {
  it('sin filtros devuelve todo', () => {
    expect(filterServices(demoServices, none)).toHaveLength(demoServices.length)
  })

  it('busca sin distinguir tildes ni mayúsculas', () => {
    const result = filterServices(demoServices, { ...none, query: 'ORIENTACION' })
    expect(result.map((service) => service.id)).toContain('demo-orientacion-juvenil')
  })

  it('combina categoría y verificación', () => {
    const result = filterServices(demoServices, { ...none, category: 'empleo', verifiedOnly: true })
    expect(result.every((s) => s.category === 'empleo' && s.verified)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('devuelve vacío cuando nada coincide', () => {
    expect(filterServices(demoServices, { ...none, query: 'zzzz' })).toEqual([])
  })
})

describe('isServiceCategory', () => {
  it('valida categorías conocidas', () => {
    expect(isServiceCategory('cultura')).toBe(true)
    expect(isServiceCategory('otra')).toBe(false)
    expect(isServiceCategory(null)).toBe(false)
  })
})
