import { describe, expect, it } from 'vitest'
import { crearDatosSinteticos } from '../mocks/datosSinteticos'
import type { Fuente, ServicioAdmin } from '../types'
import {
  calcularCalidad,
  calcularResumen,
  calcularVigencia,
  detectarIncidencias,
  ejecutarValidaciones,
  porcentaje,
} from './indicadores'

const HOY = '2026-10-21'
const base = crearDatosSinteticos(new Date(2026, 9, 21)).servicios[0]

function fuente(fechaConsulta: string): Fuente {
  return { id: 'f', tipo: 'oficial', titulo: 'Fuente', url: null, fechaConsulta, notas: null }
}

function servicio(cambios: Partial<ServicioAdmin>): ServicioAdmin {
  return { ...base, ...cambios }
}

describe('indicadores del Observatorio', () => {
  const servicios = [
    servicio({
      id: 'a',
      estado: 'publicado',
      fuentes: [fuente('2026-10-01')],
      vigenteHasta: '2027-01-01',
    }),
    servicio({
      id: 'b',
      estado: 'publicado',
      fuentes: [fuente('2025-01-01')],
      vigenteHasta: '2026-11-01',
    }),
    servicio({
      id: 'c',
      estado: 'publicado',
      fuentes: [fuente('2026-10-01')],
      vigenteHasta: '2026-10-01',
    }),
    servicio({ id: 'd', estado: 'borrador', fuentes: [] }),
    servicio({ id: 'e', estado: 'no_vigente', fuentes: [] }),
  ]

  it('cuenta servicios por estado', () => {
    expect(calcularResumen(servicios)).toEqual({
      total: 5,
      porEstado: { borrador: 1, en_revision: 0, publicado: 3, no_vigente: 1 },
    })
  })

  it('clasifica la calidad de la información de los servicios activos', () => {
    expect(calcularCalidad(servicios, HOY)).toEqual({
      conFuenteVerificable: 2,
      pendienteRevision: 1,
      sinFuente: 1,
    })
  })

  it('calcula la vigencia de los publicados', () => {
    expect(calcularVigencia(servicios, HOY)).toEqual({ vigentes: 1, porVencer: 1, vencidos: 1 })
  })

  it('detecta incidencias sin incluir los no vigentes', () => {
    const tipos = detectarIncidencias(servicios, HOY).map((i) => `${i.servicioId}:${i.tipo}`)
    expect(tipos).toContain('b:fuente_antigua')
    expect(tipos).toContain('c:vencido')
    expect(tipos).toContain('d:sin_fuente')
    expect(tipos.some((tipo) => tipo.startsWith('e:'))).toBe(false)
  })

  it('ejecuta las reglas de calidad', () => {
    const [conFuente] = ejecutarValidaciones(servicios, HOY)
    expect(conFuente).toEqual({ nombre: 'Tiene al menos una fuente', aprobados: 3, fallidos: 1 })
  })

  it('redondea porcentajes y evita dividir entre cero', () => {
    expect(porcentaje(1, 3)).toBe(33)
    expect(porcentaje(0, 0)).toBe(0)
  })
})
