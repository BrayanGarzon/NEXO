/*
 * La web pública es una sola página: cada entrada del menú es una sección de `/`
 * identificada por su `id` (ancla). Ver app/useSectionNavigation.ts.
 */
export interface NavItem {
  id: string
  label: string
}

/** Navegación principal (orden según la referencia aprobada). */
export const mainNav: NavItem[] = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'brujula', label: 'Brújula' },
  { id: 'territorio', label: 'Mapa' },
  { id: 'pausa', label: 'Espacio Pausa' },
  { id: 'mi-siguiente-paso', label: 'Mi siguiente paso' },
  { id: 'informacion', label: 'Información' },
]

export const sectionIds = mainNav.map((item) => item.id)

/** Enlace a una sección de la página única. */
export function sectionHref(id: string) {
  return `/#${id}`
}
