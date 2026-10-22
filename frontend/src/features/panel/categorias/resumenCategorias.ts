import { categoryOrder } from '../../../content/categories'
import type { ServiceCategory } from '../../../types/catalog'
import { detectarIncidencias } from '../observatorio/indicadores'
import { estados, tieneFuenteVerificable } from '../reglas'
import type { EstadoServicio, FechaIso, ServicioAdmin } from '../types'

export interface ResumenCategoria {
  categoria: ServiceCategory
  total: number
  porEstado: Record<EstadoServicio, number>
  /** Servicios activos (no vigentes excluidos) con al menos una fuente verificable. */
  conFuenteVerificable: number
  activos: number
  incidencias: number
}

/** Indicadores por categoría para la vista Categorías. */
export function resumirCategorias(servicios: ServicioAdmin[], hoy: FechaIso): ResumenCategoria[] {
  const incidencias = detectarIncidencias(servicios, hoy)
  return categoryOrder
    .filter((categoria) => categoria !== 'otra')
    .map((categoria) => {
      const lista = servicios.filter((servicio) => servicio.categoria === categoria)
      const activos = lista.filter((servicio) => servicio.estado !== 'no_vigente')
      const ids = new Set(lista.map((servicio) => servicio.id))
      return {
        categoria,
        total: lista.length,
        porEstado: Object.fromEntries(
          estados.map((estado) => [estado, lista.filter((s) => s.estado === estado).length]),
        ) as Record<EstadoServicio, number>,
        conFuenteVerificable: activos.filter((servicio) => tieneFuenteVerificable(servicio, hoy))
          .length,
        activos: activos.length,
        incidencias: incidencias.filter((incidencia) => ids.has(incidencia.servicioId)).length,
      }
    })
}
