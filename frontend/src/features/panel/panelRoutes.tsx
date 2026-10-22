import { Navigate, type RouteObject } from 'react-router'
import { RouteErrorBoundary } from '../../components/RouteErrorBoundary'
import { CategoriasPage } from './categorias/CategoriasPage'
import { ConfiguracionPage } from './configuracion/ConfiguracionPage'
import { FuentesPage } from './fuentes/FuentesPage'
import { ServicioDetallePage } from './fuente-viva/ServicioDetallePage'
import { ServicioFormPage } from './fuente-viva/ServicioFormPage'
import { ServiciosPage } from './fuente-viva/ServiciosPage'
import { ObservatorioPage } from './observatorio/ObservatorioPage'
import { PanelLayout } from './PanelLayout'
import { UsuariosPage } from './usuarios/UsuariosPage'

/*
 * Punto de entrada del panel institucional (Fuente Viva y Observatorio).
 *
 * Responsable: Persona 3 (Elizabeth). Todo lo que hay dentro de `features/panel/` es suyo;
 * `app/routes.tsx` solo importa `panelRoutes`. Ver docs/PLAN_PERSONA_3.md.
 *
 * Va fuera de la página única pública: no usa MainLayout.
 */
export const panelRoutes: RouteObject = {
  path: '/panel',
  element: <PanelLayout />,
  errorElement: <RouteErrorBoundary />,
  children: [
    { index: true, element: <Navigate to="observatorio" replace /> },
    { path: 'observatorio', element: <ObservatorioPage /> },
    { path: 'servicios', element: <ServiciosPage /> },
    { path: 'servicios/nuevo', element: <ServicioFormPage /> },
    { path: 'servicios/:id', element: <ServicioDetallePage /> },
    { path: 'servicios/:id/editar', element: <ServicioFormPage /> },
    { path: 'categorias', element: <CategoriasPage /> },
    { path: 'fuentes', element: <FuentesPage /> },
    { path: 'usuarios', element: <UsuariosPage /> },
    { path: 'configuracion', element: <ConfiguracionPage /> },
    { path: '*', element: <Navigate to="observatorio" replace /> },
  ],
}
