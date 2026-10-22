import type { IconName } from '../../components/Icon'

export interface SuggestedAction {
  id: string
  title: string
  description: string
  to: string
  icon: IconName
}

/** Acciones sugeridas: enlaces a otras secciones de la página única. */
export const suggestedActions: SuggestedAction[] = [
  {
    id: 'brujula',
    title: 'Haz tu ruta en Brújula',
    description: 'Dos preguntas para encontrar opciones según lo que buscas.',
    to: '/#brujula',
    icon: 'compass',
  },
  {
    id: 'territorio',
    title: 'Explora servicios cerca de ti',
    description: 'Busca y filtra en Nexo Territorio y guarda los que te interesen.',
    to: '/#territorio',
    icon: 'map-pin',
  },
  {
    id: 'pausa',
    title: 'Tómate una pausa',
    description: 'Un ejercicio de respiración de un minuto en Espacio Pausa.',
    to: '/#pausa',
    icon: 'feather',
  },
]
