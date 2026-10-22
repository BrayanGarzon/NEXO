import { describe, expect, it } from 'vitest'
import { searchSite } from './searchIndex'

describe('searchSite', () => {
  it('sin texto no devuelve resultados', () => {
    expect(searchSite('   ')).toEqual([])
  })

  it('busca en todas las secciones sin distinguir tildes ni mayúsculas', () => {
    const groups = searchSite('RESPIRACION').map((result) => result.group)
    expect(groups).toContain('Espacio Pausa')
    expect(groups).toContain('Mi siguiente paso')
  })

  it('los servicios enlazan a su detalle en el mapa', () => {
    const servicios = searchSite('liga juvenil').find((result) => result.group === 'Servicios')
    expect(servicios?.entries[0]).toMatchObject({
      title: 'Liga Juvenil de Fútbol',
      to: '/?servicio=demo-liga-futbol#territorio',
    })
  })

  it('cada palabra debe aparecer en el resultado', () => {
    expect(searchSite('respiración xyzzy')).toEqual([])
  })
})
