export interface NavItem {
  to: string
  label: string
}

/** Navegación pública principal (orden según la referencia aprobada). */
export const mainNav: NavItem[] = [
  { to: '/', label: 'Inicio' },
  { to: '/brujula', label: 'Brújula' },
  { to: '/territorio', label: 'Mapa' },
  { to: '/pausa', label: 'Espacio Pausa' },
  { to: '/mi-siguiente-paso', label: 'Mi siguiente paso' },
  { to: '/informacion', label: 'Información' },
]
