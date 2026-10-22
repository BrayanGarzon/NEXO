import { Tag, type TagTone } from '../../components/Tag'
import { estadoLabels } from './reglas'
import type { EstadoServicio } from './types'

const tonos: Record<Exclude<EstadoServicio, 'no_vigente'>, TagTone> = {
  borrador: 'accent',
  en_revision: 'warning',
  publicado: 'success',
}

/** Etiqueta de estado con los colores del moodboard (panel 06). */
export function EstadoTag({ estado }: { estado: EstadoServicio }) {
  // `Tag` aún no tiene tono de peligro: «No vigente» usa una variante propia del panel.
  if (estado === 'no_vigente') {
    return <span className="tag panel-tag--danger">{estadoLabels[estado]}</span>
  }
  return <Tag tone={tonos[estado]}>{estadoLabels[estado]}</Tag>
}
