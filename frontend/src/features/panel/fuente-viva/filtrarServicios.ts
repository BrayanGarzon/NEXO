import { categories } from '../../../content/categories'
import type { ServiceCategory } from '../../../types/catalog'
import type { EstadoServicio, ServicioAdmin } from '../types'

/** Minúsculas y sin tildes, para buscar sin distinguir «Educación» de «educacion». */
export function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

export interface FiltrosServicios {
  estado?: EstadoServicio | null
  categoria?: ServiceCategory | null
  consulta?: string
}

export function filtrarServicios(
  servicios: ServicioAdmin[],
  { estado = null, categoria = null, consulta = '' }: FiltrosServicios,
) {
  const q = normalizar(consulta.trim())
  return servicios.filter(
    (servicio) =>
      (!estado || servicio.estado === estado) &&
      (!categoria || servicio.categoria === categoria) &&
      (!q ||
        normalizar(
          `${servicio.nombre} ${servicio.institucion} ${categories[servicio.categoria].label} ${servicio.categoriaPersonalizada ?? ''}`,
        ).includes(q)),
  )
}
