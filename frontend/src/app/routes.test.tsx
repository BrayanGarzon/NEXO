import { screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderRoute } from '../test/renderRoute'
import { sectionIds } from './navigation'

describe('routes', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('muestra la página única con todas las secciones en /', async () => {
    renderRoute('/')
    expect(
      screen.getByRole('heading', { level: 1, name: /Tu bienestar mental también construye una mejor versión/ }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    for (const id of sectionIds) {
      expect(document.getElementById(id)).toBeInTheDocument()
    }
    expect(await screen.findByText('API no disponible')).toBeInTheDocument()
  })

  it.each(sectionIds)('redirige /%s a su sección de la página única', async (id) => {
    const { router } = renderRoute(`/${id}`)
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(router.state.location.hash).toBe(`#${id}`)
  })

  it('conserva los parámetros al redirigir rutas antiguas', async () => {
    const { router } = renderRoute('/territorio?servicio=demo-liga-futbol')
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(router.state.location.search).toBe('?servicio=demo-liga-futbol')
    expect(router.state.location.hash).toBe('#territorio')
  })

  it('el panel institucional tiene su propia entrada fuera de la página pública', () => {
    renderRoute('/panel')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Panel institucional' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Navegación principal' })).toBeNull()
  })

  it('muestra la página 404 en rutas desconocidas, sin sección activa en el menú', () => {
    renderRoute('/ruta-inexistente')
    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
    expect(nav.querySelector('[aria-current]')).toBeNull()
  })
})
