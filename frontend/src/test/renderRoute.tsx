import { render, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '../app/routes'

/** Renderiza la aplicación completa en una ruta concreta. */
export function renderRoute(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return { router, ...render(<RouterProvider router={router} />) }
}

/** Consultas limitadas a una sección de la página única. */
export function withinSection(id: string) {
  const section = document.getElementById(id)
  if (!section) throw new Error(`No existe la sección #${id}`)
  return within(section)
}
