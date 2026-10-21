import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderRoute } from '../test/renderRoute'

describe('MainLayout', () => {
  const scrollIntoView = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')))
    Element.prototype.scrollIntoView = scrollIntoView
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    scrollIntoView.mockReset()
  })

  it('el menú lleva a la sección y se cierra en móvil', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/')
    const toggle = screen.getByRole('button', { name: 'Abrir menú' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await user.click(toggle)
    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
    const link = within(nav).getByRole('link', { name: 'Espacio Pausa' })
    expect(link).toHaveAttribute('href', '/#pausa')
    await user.click(link)

    expect(router.state.location.pathname).toBe('/')
    expect(router.state.location.hash).toBe('#pausa')
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled())
    expect(scrollIntoView.mock.contexts.at(-1)).toBe(document.getElementById('pausa'))
  })

  it('marca Inicio como sección activa al cargar', () => {
    renderRoute('/')
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
    expect(within(nav).getByRole('link', { name: 'Inicio' })).toHaveAttribute(
      'aria-current',
      'location',
    )
  })

  it('ofrece un enlace para saltar al contenido', () => {
    renderRoute('/')
    expect(screen.getByRole('link', { name: 'Saltar al contenido' })).toHaveAttribute(
      'href',
      '#contenido',
    )
  })
})
