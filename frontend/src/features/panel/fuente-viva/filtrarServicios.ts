import { categories } from '../../../content/categories'
import type { EstadoServicio, ServicioAdmin } from '../types'

function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

export function filtrarServicios(
  servicios: ServicioAdmin[],
  estado: EstadoServicio | null,
  consulta: string,
) {
  const q = normalizar(consulta.trim())
  return servicios.filter(
    (servicio) =>
      (!estado || servicio.estado === estado) &&
      (!q ||
        normalizar(
          `${servicio.nombre} ${servicio.institucion} ${categories[servicio.categoria].label}`,
        ).includes(q)),
  )
}
