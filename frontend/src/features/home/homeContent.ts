import type { DoodleName, DoodleTone } from '../../components/Doodle'
import type { IconName } from '../../components/Icon'

export type ModuleTone = 'lila' | 'menta' | 'amarillo' | 'coral'

export interface HomeModule {
  id: string
  title: string
  description: string
  to: string
  icon: IconName
  tone: ModuleTone
  doodle: DoodleName
  doodleTone: DoodleTone
}

export const homeModules: HomeModule[] = [
  {
    id: 'brujula',
    title: 'Brújula',
    description: 'Encuentra rutas según lo que necesitas',
    to: '/brujula',
    icon: 'compass',
    tone: 'lila',
    doodle: 'sparkle',
    doodleTone: 'lila',
  },
  {
    id: 'territorio',
    title: 'Nexo Territorio',
    description: 'Explora servicios en un mapa de tu ciudad',
    to: '/territorio',
    icon: 'leaf',
    tone: 'menta',
    doodle: 'squiggle',
    doodleTone: 'menta',
  },
  {
    id: 'pausa',
    title: 'Espacio Pausa',
    description: 'Un momento para ti',
    to: '/pausa',
    icon: 'feather',
    tone: 'amarillo',
    doodle: 'leaf',
    doodleTone: 'menta',
  },
  {
    id: 'paso',
    title: 'Mi siguiente paso',
    description: 'Organiza tus opciones',
    to: '/mi-siguiente-paso',
    icon: 'steps',
    tone: 'coral',
    doodle: 'arrow',
    doodleTone: 'coral',
  },
]

export interface QuickLink {
  label: string
  to: string
}

export const quickLinks: QuickLink[] = [
  { label: 'Servicios', to: '/territorio' },
  { label: 'Actividades', to: '/territorio?categoria=recreacion' },
  { label: 'Orientación', to: '/brujula' },
  { label: 'Espacios juveniles', to: '/territorio?categoria=cultura' },
]
