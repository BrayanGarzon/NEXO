import { categoryOrder } from '../../../content/categories'
import type { ServiceCategory } from '../../../types/catalog'
import { diasEntre } from '../fechas'
import { configuracionActual, estados, fuenteVigente, tieneFuenteVerificable } from '../reglas'
import type { EstadoServicio, FechaIso, ServicioAdmin } from '../types'

/*
 * Indicadores del Observatorio, calculados sobre el catálogo (nunca sobre personas).
 * Funciones puras: reciben `hoy` para que los resultados sean reproducibles en pruebas.
 * Equivalen a lo que devolverían los endpoints de docs/API_CONTRACTS.md §4.3.
 */

export const COMUNAS = [1, 2, 3, 4, 5, 6, 7, 8]

export interface Resumen {
  total: number
  porEstado: Record<EstadoServicio, number>
}

export function calcularResumen(servicios: ServicioAdmin[]): Resumen {
  const porEstado = Object.fromEntries(estados.map((estado) => [estado, 0])) as Resumen['porEstado']
  servicios.forEach((servicio) => (porEstado[servicio.estado] += 1))
  return { total: servicios.length, porEstado }
}

export interface Calidad {
  conFuenteVerificable: number
  pendienteRevision: number
  sinFuente: number
}

/**
 * Calidad de la información de los servicios activos (todos menos los no vigentes):
 * - con fuente verificable: al menos una fuente consultada dentro del plazo;
 * - pendiente de revisión: tiene fuentes, pero todas superan el plazo;
 * - sin fuente: no tiene ninguna.
 */
export function calcularCalidad(servicios: ServicioAdmin[], hoy: FechaIso): Calidad {
  const calidad: Calidad = { conFuenteVerificable: 0, pendienteRevision: 0, sinFuente: 0 }
  activos(servicios).forEach((servicio) => {
    if (servicio.fuentes.length === 0) calidad.sinFuente += 1
    else if (tieneFuenteVerificable(servicio, hoy)) calidad.conFuenteVerificable += 1
    else calidad.pendienteRevision += 1
  })
  return calidad
}

/** Porcentaje entero; los redondeos de una serie pueden no sumar exactamente 100. */
export function porcentaje(parte: number, total: number): number {
  return total === 0 ? 0 : Math.round((parte / total) * 100)
}

export function calcularPorCategoria(
  servicios: ServicioAdmin[],
): { categoria: ServiceCategory; total: number }[] {
  return categoryOrder.map((categoria) => ({
    categoria,
    total: servicios.filter((servicio) => servicio.categoria === categoria).length,
  }))
}

export interface Vigencia {
  vigentes: number
  porVencer: number
  vencidos: number
}

/** Vigencia de los servicios publicados según `vigenteHasta`. */
export function calcularVigencia(servicios: ServicioAdmin[], hoy: FechaIso): Vigencia {
  const vigencia: Vigencia = { vigentes: 0, porVencer: 0, vencidos: 0 }
  publicados(servicios).forEach((servicio) => {
    const restantes = servicio.vigenteHasta ? diasEntre(hoy, servicio.vigenteHasta) : -1
    if (restantes < 0) vigencia.vencidos += 1
    else if (restantes <= configuracionActual().avisoPorVencerDias) vigencia.porVencer += 1
    else vigencia.vigentes += 1
  })
  return vigencia
}

export interface FilaCobertura {
  publicados: number
  conFuenteOficial: number
}

export function calcularCobertura(servicios: ServicioAdmin[]) {
  const fila = (lista: ServicioAdmin[]): FilaCobertura => ({
    publicados: lista.length,
    conFuenteOficial: lista.filter((servicio) =>
      servicio.fuentes.some((fuente) => fuente.tipo === 'oficial'),
    ).length,
  })
  const lista = publicados(servicios)
  return {
    porCategoria: categoryOrder.map((categoria) => ({
      categoria,
      ...fila(lista.filter((servicio) => servicio.categoria === categoria)),
    })),
    porComuna: COMUNAS.map((comuna) => ({
      comuna,
      ...fila(lista.filter((servicio) => servicio.comuna === comuna)),
    })),
  }
}

export type TipoIncidencia =
  'sin_fuente' | 'fuente_antigua' | 'vencido' | 'campos_incompletos' | 'en_revision_prolongada'

export const incidenciaLabels: Record<TipoIncidencia, string> = {
  sin_fuente: 'Sin fuente',
  fuente_antigua: 'Fuente antigua',
  vencido: 'Vencido',
  campos_incompletos: 'Campos incompletos',
  en_revision_prolongada: 'Revisión prolongada',
}

export interface Incidencia {
  servicioId: string
  nombre: string
  tipo: TipoIncidencia
}

function camposIncompletos(servicio: ServicioAdmin) {
  return (
    !servicio.resumen.trim() ||
    !servicio.direccion.trim() ||
    !servicio.horario.trim() ||
    servicio.serviciosOfrecidos.length === 0
  )
}

const detectores: Record<TipoIncidencia, (servicio: ServicioAdmin, hoy: FechaIso) => boolean> = {
  sin_fuente: (servicio) => servicio.fuentes.length === 0,
  fuente_antigua: (servicio, hoy) =>
    servicio.fuentes.length > 0 && !tieneFuenteVerificable(servicio, hoy),
  vencido: (servicio, hoy) =>
    servicio.estado === 'publicado' &&
    (!servicio.vigenteHasta || diasEntre(hoy, servicio.vigenteHasta) < 0),
  campos_incompletos: camposIncompletos,
  en_revision_prolongada: (servicio, hoy) =>
    servicio.estado === 'en_revision' &&
    diasEntre(servicio.actualizadoEn, hoy) > configuracionActual().revisionProlongadaDias,
}

/** Incidencias de los servicios activos (los no vigentes ya están fuera del catálogo). */
export function detectarIncidencias(servicios: ServicioAdmin[], hoy: FechaIso): Incidencia[] {
  return activos(servicios).flatMap((servicio) =>
    (Object.keys(detectores) as TipoIncidencia[])
      .filter((tipo) => detectores[tipo](servicio, hoy))
      .map((tipo) => ({ servicioId: servicio.id, nombre: servicio.nombre, tipo })),
  )
}

export interface ResultadoRegla {
  nombre: string
  aprobados: number
  fallidos: number
}

/** Reglas de calidad ejecutadas sobre el conjunto (sintético mientras no haya datos reales). */
export function ejecutarValidaciones(servicios: ServicioAdmin[], hoy: FechaIso): ResultadoRegla[] {
  const reglas: {
    nombre: string
    aplica: ServicioAdmin[]
    cumple: (s: ServicioAdmin) => boolean
  }[] = [
    {
      nombre: 'Tiene al menos una fuente',
      aplica: activos(servicios),
      cumple: (servicio) => servicio.fuentes.length > 0,
    },
    {
      nombre: 'Alguna fuente consultada en el último año',
      aplica: activos(servicios).filter((servicio) => servicio.fuentes.length > 0),
      cumple: (servicio) =>
        servicio.fuentes.some((fuente) => fuenteVigente(fuente.fechaConsulta, hoy)),
    },
    {
      nombre: 'Datos básicos completos',
      aplica: activos(servicios),
      cumple: (servicio) => !camposIncompletos(servicio),
    },
    {
      nombre: 'Publicado dentro de su vigencia',
      aplica: publicados(servicios),
      cumple: (servicio) => !detectores.vencido(servicio, hoy),
    },
  ]
  return reglas.map(({ nombre, aplica, cumple }) => {
    const aprobados = aplica.filter(cumple).length
    return { nombre, aprobados, fallidos: aplica.length - aprobados }
  })
}

function activos(servicios: ServicioAdmin[]) {
  return servicios.filter((servicio) => servicio.estado !== 'no_vigente')
}

function publicados(servicios: ServicioAdmin[]) {
  return servicios.filter((servicio) => servicio.estado === 'publicado')
}
