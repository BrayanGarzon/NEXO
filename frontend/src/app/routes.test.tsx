import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { routes } from './routes'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('routes', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('muestra la página base en /', async () => {
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1, name: 'NEXO JOVEN 360' })).toBeInTheDocument()
    expect(screen.getByText(/Estructura base/)).toBeInTheDocument()
    expect(await screen.findByText('API no disponible')).toBeInTheDocument()
  })

  it('muestra la página 404 en rutas desconocidas', () => {
    renderAt('/ruta-inexistente')
    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
  })
})
