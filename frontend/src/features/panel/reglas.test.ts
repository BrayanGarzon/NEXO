import { describe, expect, it } from 'vitest'
import { crearDatosSinteticos } from './mocks/datosSinteticos'
import { motivoBloqueo, transicionesDesde } from './reglas'
import type { ServicioAdmin } from './types'

const base = crearDatosSinteticos(new Date(2026, 9, 21)).servicios[0]

function servicio(cambios: Partial<ServicioAdmin>): ServicioAdmin {
  return { ...base, ...cambios }
}

describe('reglas de revisión', () => {
  it('ofrece solo las transiciones del flujo', () => {
    expect(transicionesDesde('borrador').map((t) => t.a)).toEqual(['en_revision'])
    expect(transicionesDesde('en_revision').map((t) => t.a)).toEqual(['publicado', 'borrador'])
    expect(transicionesDesde('no_vigente').map((t) => t.a)).toEqual(['en_revision'])
  })

  it('rechaza una transición no permitida', () => {
    expect(motivoBloqueo(servicio({ estado: 'borrador' }), 'publicado')).toMatch(
      /No se puede pasar/,
    )
  })

  it('no permite publicar sin fuentes', () => {
    expect(motivoBloqueo(servicio({ estado: 'en_revision', fuentes: [] }), 'publicado')).toMatch(
      /al menos una fuente/,
    )
  })

  it('permite publicar con una fuente fechada', () => {
    expect(motivoBloqueo(servicio({ estado: 'en_revision' }), 'publicado')).toBeNull()
  })
})
