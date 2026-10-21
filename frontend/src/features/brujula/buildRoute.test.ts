import { describe, expect, it } from 'vitest'
import { demoServices } from '../../mocks/demoServices'
import { needOptions, preferenceOptions } from './brujulaContent'
import { buildRoute } from './buildRoute'

const need = (id: string) => needOptions.find((option) => option.id === id)!
const preference = (id: string) => preferenceOptions.find((option) => option.id === id)!

describe('buildRoute', () => {
  it('solo devuelve servicios de las categorías de la necesidad', () => {
    const result = buildRoute(need('cultura'), preference('grupo'), demoServices)
    expect(result.services.length).toBeGreaterThan(0)
    expect(result.services.every((service) => service.category === 'cultura')).toBe(true)
  })

  it('prioriza la modalidad preferida', () => {
    const result = buildRoute(need('hablar'), preference('persona'), demoServices)
    expect(result.services[0].modalities).toContain('acompanamiento')
  })

  it('limita la ruta a tres resultados', () => {
    const result = buildRoute(need('otra'), preference('lugar'), demoServices)
    expect(result.services).toHaveLength(3)
  })

  it('marca la ayuda inmediata solo cuando la opción lo indica', () => {
    expect(buildRoute(need('dificil'), preference('persona'), demoServices).showUrgentHelp).toBe(
      true,
    )
    expect(buildRoute(need('estudio'), preference('leer'), demoServices).showUrgentHelp).toBe(false)
  })
})
