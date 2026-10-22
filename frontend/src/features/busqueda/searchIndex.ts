import type { IconName } from '../../components/Icon'
import { categories } from '../../content/categories'
import { needOptions } from '../brujula/brujulaContent'
import { homeModules } from '../home/homeContent'
import { principles } from '../informacion/informacionContent'
import { suggestedActions } from '../paso/pasoContent'
import { exercises } from '../pausa/pausaContent'
import { getAllDemoServicesSync } from '../../services/catalog'
import { normalize } from '../territorio/filterServices'

/*
 * Índice de la búsqueda general (lupa del encabezado): reúne el contenido de todas las
 * secciones de la página única. Cada resultado es un enlace a su sección; los servicios
 * abren además su detalle en Nexo Territorio.
 */

export interface SearchEntry {
  id: string
  title: string
  description: string
  /** Sección donde aparece, para agrupar los resultados. */
  group: string
  to: string
  icon: IconName
  /** Texto normalizado en el que se busca. */
  haystack: string
}

const MAX_PER_GROUP = 5

function entry(item: Omit<SearchEntry, 'haystack'>, extra: string[] = []): SearchEntry {
  return {
    ...item,
    haystack: normalize([item.title, item.description, item.group, ...extra].join(' ')),
  }
}

function buildIndex(): SearchEntry[] {
  return [
    ...homeModules.map((module) =>
      entry({
        id: `seccion-${module.id}`,
        title: module.title,
        description: module.description,
        group: 'Secciones',
        to: module.to,
        icon: module.icon,
      }),
    ),
    entry({
      id: 'seccion-informacion',
      title: 'Información',
      description: '¿Qué es NEXO JOVEN 360?',
      group: 'Secciones',
      to: '/#informacion',
      icon: 'info',
    }),
    ...needOptions.map((option) =>
      entry(
        {
          id: `brujula-${option.id}`,
          title: option.label,
          description: 'Haz tu ruta en Brújula',
          group: 'Brújula',
          to: '/#brujula',
          icon: option.icon,
        },
        option.categories.map((category) => categories[category].label),
      ),
    ),
    ...getAllDemoServicesSync().map((service) =>
      entry(
        {
          id: `servicio-${service.id}`,
          title: service.name,
          description: `${categories[service.category].label} · Comuna ${service.comuna}`,
          group: 'Servicios',
          to: `/?servicio=${service.id}#territorio`,
          icon: 'map-pin',
        },
        [service.summary, service.institution, ...service.offerings],
      ),
    ),
    ...exercises.map((exercise) =>
      entry(
        {
          id: `pausa-${exercise.id}`,
          title: exercise.title,
          description: exercise.intro,
          group: 'Espacio Pausa',
          to: '/#pausa',
          icon: exercise.icon,
        },
        exercise.kind === 'steps' ? exercise.steps : [],
      ),
    ),
    ...suggestedActions.map((action) =>
      entry({
        id: `paso-${action.id}`,
        title: action.title,
        description: action.description,
        group: 'Mi siguiente paso',
        to: action.to,
        icon: action.icon,
      }),
    ),
    ...principles.map((principle) =>
      entry({
        id: `informacion-${principle.title}`,
        title: principle.title,
        description: principle.text,
        group: 'Información',
        to: '/#informacion',
        icon: principle.icon,
      }),
    ),
  ]
}

let index: SearchEntry[] | undefined

/**
 * Busca sin distinguir mayúsculas ni tildes; cada palabra debe aparecer en el resultado.
 * Devuelve los resultados agrupados por sección, en el orden de la página.
 */
export function searchSite(query: string): { group: string; entries: SearchEntry[] }[] {
  const words = normalize(query.trim()).split(/\s+/).filter(Boolean)
  if (words.length === 0) return []
  index ??= buildIndex()
  const groups = new Map<string, SearchEntry[]>()
  for (const item of index) {
    if (!words.every((word) => item.haystack.includes(word))) continue
    const list = groups.get(item.group) ?? []
    if (list.length < MAX_PER_GROUP) groups.set(item.group, [...list, item])
  }
  return [...groups].map(([group, entries]) => ({ group, entries }))
}
