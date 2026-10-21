import type { RouteObject } from 'react-router'
import { PanelPlaceholder } from './PanelPlaceholder'

/*
 * Punto de entrada del panel institucional (Fuente Viva y Observatorio).
 *
 * Responsable: Persona 3 (Elizabeth). Todo lo que hay dentro de `features/panel/` es suyo;
 * puede cambiar libremente este archivo (layout, rutas hijas, etc.) sin tocar
 * `app/routes.tsx`, que solo importa `panelRoutes`. Ver docs/PLAN_PERSONA_3.md.
 *
 * Va fuera de la página única pública: no usa MainLayout.
 */
export const panelRoutes: RouteObject = {
  path: '/panel/*',
  element: <PanelPlaceholder />,
}
