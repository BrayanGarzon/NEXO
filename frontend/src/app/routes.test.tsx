import { screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderRoute } from '../test/renderRoute'

describe('routes', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('muestra la página de inicio en /', async () => {
    renderRoute('/')
    expect(
      screen.getByRole('heading', { level: 1, name: /Tu bienestar también construye/ }),
    ).toBeInTheDocument()
    expect(await screen.findByText('API no disponible')).toBeInTheDocument()
  })

  it.each([
    ['/brujula', /Cuéntanos, ¿qué estás buscando hoy\?/],
    ['/territorio', 'Nexo Territorio'],
    ['/pausa', 'Un momento para ti'],
    ['/mi-siguiente-paso', 'Mi siguiente paso'],
    ['/informacion', 'Información'],
  ])('muestra la página de %s', (path, title) => {
    renderRoute(path)
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
  })

  it('marca el enlace activo de la navegación principal', () => {
    renderRoute('/brujula')
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
    expect(nav.querySelector('a.active')).toHaveTextContent('Brújula')
  })

  it('muestra la página 404 en rutas desconocidas', () => {
    renderRoute('/ruta-inexistente')
    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
  })
})
