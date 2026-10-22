import { categories } from '../../content/categories'
import type { DemoService, ServiceCategory } from '../../types/catalog'

export interface ServiceFilters {
  query: string
  category: ServiceCategory | null
  verifiedOnly: boolean
}

/** Normaliza para buscar sin distinguir mayúsculas ni tildes. */
export function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

export function filterServices(services: DemoService[], filters: ServiceFilters) {
  const query = normalize(filters.query.trim())
  return services.filter((service) => {
    if (filters.category && service.category !== filters.category) return false
    if (filters.verifiedOnly && !service.verified) return false
    if (!query) return true
    const haystack = normalize(
      [
        service.name,
        service.summary,
        service.institution,
        categories[service.category].label,
        `comuna ${service.comuna}`,
        ...service.offerings,
      ].join(' '),
    )
    return haystack.includes(query)
  })
}

export function isServiceCategory(value: string | null): value is ServiceCategory {
  return value !== null && value in categories
}
