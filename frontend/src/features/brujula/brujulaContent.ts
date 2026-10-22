import type { IconName } from '../../components/Icon'
import type { ServiceCategory, ServiceModality } from '../../types/catalog'

/*
 * Brújula es orientación INFORMATIVA: relaciona lo que la persona busca con servicios
 * y actividades. No evalúa, no diagnostica y no estima riesgos.
 */

export interface NeedOption {
  id: string
  label: string
  icon: IconName
  categories: ServiceCategory[]
  /** Muestra de forma destacada los canales de ayuda inmediata. */
  showUrgentHelp?: boolean
}

export const needOptions: NeedOption[] = [
  { id: 'hablar', label: 'Quiero hablar con alguien', icon: 'chat', categories: ['salud-mental'] },
  {
    id: 'estres',
    label: 'Me siento estresado(a) o ansioso(a)',
    icon: 'cloud',
    categories: ['salud-mental', 'recreacion'],
  },
  { id: 'estudio', label: 'Necesito apoyo en mi estudio', icon: 'book', categories: ['educacion'] },
  {
    id: 'deporte',
    label: 'Quiero actividades deportivas o recreativas',
    icon: 'ball',
    categories: ['deporte', 'recreacion'],
  },
  {
    id: 'dificil',
    label: 'Estoy pasando por un momento difícil',
    icon: 'heart',
    categories: ['salud-mental'],
    showUrgentHelp: true,
  },
  {
    id: 'cultura',
    label: 'Quiero participar en actividades culturales',
    icon: 'palette',
    categories: ['cultura'],
  },
  {
    id: 'empleo',
    label: 'Busco orientación de empleo o proyectos',
    icon: 'briefcase',
    categories: ['empleo'],
  },
  {
    id: 'otra',
    label: 'Es otra necesidad',
    icon: 'dots',
    categories: ['salud-mental', 'educacion', 'deporte', 'cultura', 'empleo', 'recreacion'],
  },
]

export interface PreferenceOption {
  id: string
  label: string
  description: string
  icon: IconName
  modality: ServiceModality
}

export const preferenceOptions: PreferenceOption[] = [
  {
    id: 'lugar',
    label: 'Ir a un lugar cerca de mí',
    description: 'Servicios presenciales en tu comuna o cerca',
    icon: 'map-pin',
    modality: 'presencial',
  },
  {
    id: 'persona',
    label: 'Hablar con una persona',
    description: 'Orientación y acompañamiento uno a uno',
    icon: 'chat',
    modality: 'acompanamiento',
  },
  {
    id: 'leer',
    label: 'Leer información primero',
    description: 'Conocer opciones a mi ritmo',
    icon: 'book',
    modality: 'informacion',
  },
  {
    id: 'grupo',
    label: 'Participar en algo grupal',
    description: 'Talleres, clubes y actividades',
    icon: 'users',
    modality: 'grupal',
  },
]

export const steps = ['¿Qué buscas?', 'Cómo empezar', 'Elige'] as const
