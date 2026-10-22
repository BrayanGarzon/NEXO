import { afterEach, describe, expect, it } from 'vitest'
import { crearDatosSinteticos } from '../mocks/datosSinteticos'
import { calcularVigencia } from '../observatorio/indicadores'
import { aplicarConfiguracion, CONFIGURACION_POR_DEFECTO } from '../reglas'
import { resumirCategorias } from './resumenCategorias'

const HOY = '2026-10-21'
const { servicios } = crearDatosSinteticos(new Date(2026, 9, 21))

describe('resumen por categoría', () => {
  afterEach(() => aplicarConfiguracion(CONFIGURACION_POR_DEFECTO))

  it('cubre las categorías activas del panel y excluye Otro', () => {
    const resumen = resumirCategorias(servicios, HOY)
    expect(resumen.map((fila) => fila.categoria)).toEqual([
      'salud-mental',
      'educacion',
      'deporte',
      'cultura',
      'empleo',
      'recreacion',
    ])
    expect(resumen.some((fila) => fila.categoria === 'otra')).toBe(false)
    expect(resumen.reduce((suma, fila) => suma + fila.total, 0)).toBe(
      servicios.filter((servicio) => servicio.categoria !== 'otra').length,
    )
  })

  it('cuenta estados, fuentes verificables e incidencias de cada categoría', () => {
    const deporte = resumirCategorias(servicios, HOY).find((fila) => fila.categoria === 'deporte')!
    expect(deporte).toMatchObject({
      total: 2,
      porEstado: { borrador: 1, en_revision: 0, publicado: 1, no_vigente: 0 },
      activos: 2,
      conFuenteVerificable: 1,
      incidencias: 1, // la liga de fútbol no tiene fuente
    })
  })

  it('los indicadores usan la configuración vigente', () => {
    const conAvisoCorto = calcularVigencia(servicios, HOY)
    aplicarConfiguracion({ ...CONFIGURACION_POR_DEFECTO, avisoPorVencerDias: 175 })
    const conAvisoLargo = calcularVigencia(servicios, HOY)
    expect(conAvisoLargo.porVencer).toBeGreaterThan(conAvisoCorto.porVencer)
  })
})
