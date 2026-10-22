import type { IconName } from '../../components/Icon'

/** Principios de la plataforma que muestra la sección Información. */
export const principles: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'verified',
    title: 'Información confiable',
    text: 'Los servicios muestran si ya fueron verificados y de qué institución provienen.',
  },
  {
    icon: 'compass',
    title: 'Orientación, no diagnóstico',
    text: 'Brújula te muestra opciones según lo que buscas. No evalúa ni diagnostica.',
  },
  {
    icon: 'users',
    title: 'Hecho para jóvenes',
    text: 'Servicios, actividades y espacios de Villavicencio pensados para ti.',
  },
]
