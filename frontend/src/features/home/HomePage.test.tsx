import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderRoute } from '../../test/renderRoute'

describe('HomePage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('muestra los cuatro accesos principales', () => {
    renderRoute('/')
    const modules = screen.getByRole('region', { name: 'Explora NEXO JOVEN 360' })
    for (const name of ['Brújula', 'Nexo Territorio', 'Espacio Pausa', 'Mi siguiente paso']) {
      expect(within(modules).getByRole('link', { name })).toBeInTheDocument()
    }
  })

  it('identifica los servicios destacados como datos de demostración', () => {
    renderRoute('/')
    const featured = screen.getByRole('region', { name: 'Servicios destacados en Villavicencio' })
    expect(within(featured).getByText('Datos de demostración')).toBeInTheDocument()
    expect(within(featured).getAllByRole('listitem')).toHaveLength(3)
  })

  it('la búsqueda lleva a Nexo Territorio con la consulta', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/')
    await user.type(screen.getByRole('searchbox'), 'fútbol{Enter}')
    expect(router.state.location.pathname).toBe('/territorio')
    expect(router.state.location.search).toBe('?q=f%C3%BAtbol')
  })
})
