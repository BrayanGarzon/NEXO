import type { IconName } from '../components/Icon'
import type { ThumbTone } from '../components/illustrations/ServiceThumb'
import type { ServiceCategory } from '../types/catalog'

interface CategoryMeta {
  label: string
  icon: IconName
  tone: ThumbTone
}

export const categories: Record<ServiceCategory, CategoryMeta> = {
  'salud-mental': { label: 'Salud mental', icon: 'heart', tone: 'lila' },
  educacion: { label: 'Educación', icon: 'book', tone: 'menta' },
  deporte: { label: 'Deporte', icon: 'ball', tone: 'amarillo' },
  cultura: { label: 'Cultura', icon: 'palette', tone: 'coral' },
  empleo: { label: 'Empleo', icon: 'briefcase', tone: 'menta' },
  recreacion: { label: 'Recreación', icon: 'sparkle', tone: 'amarillo' },
  otra: { label: 'Otro', icon: 'sparkle', tone: 'coral' },
}

export const categoryOrder = Object.keys(categories) as ServiceCategory[]
