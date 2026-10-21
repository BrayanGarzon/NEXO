import type { DemoService } from '../../types/catalog'
import type { NeedOption, PreferenceOption } from './brujulaContent'

export interface RouteResult {
  services: DemoService[]
  showUrgentHelp: boolean
}

const MAX_RESULTS = 3

/**
 * Ordena los servicios que coinciden con la necesidad: primero los que ofrecen la
 * modalidad preferida, luego los verificados y por último los más cercanos.
 */
export function buildRoute(
  need: NeedOption,
  preference: PreferenceOption,
  services: DemoService[],
): RouteResult {
  const matching = services.filter((service) => need.categories.includes(service.category))
  const score = (service: DemoService) =>
    (service.modalities.includes(preference.modality) ? 2 : 0) + (service.verified ? 1 : 0)

  const ranked = [...matching].sort((a, b) => score(b) - score(a) || a.distanceKm - b.distanceKm)

  return {
    services: ranked.slice(0, MAX_RESULTS),
    showUrgentHelp: need.showUrgentHelp ?? false,
  }
}
