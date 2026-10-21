import type { RouteObject } from 'react-router'
import { RouteErrorBoundary } from '../components/RouteErrorBoundary'
import { HomePage } from '../features/home/HomePage'
import { NotFoundPage } from '../features/not-found/NotFoundPage'
import { panelRoutes } from '../features/panel/panelRoutes'
import { MainLayout } from '../layouts/MainLayout'
import { sectionIds } from './navigation'
import { RedirectToSection } from './RedirectToSection'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      // Rutas antiguas: llevan a la sección correspondiente de la página única.
      ...sectionIds
        .filter((id) => id !== 'inicio')
        .map((id) => ({ path: id, element: <RedirectToSection id={id} /> })),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  // Panel institucional (Persona 3): rutas y layout propios en features/panel/.
  panelRoutes,
]
