import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as catalog from '../../services/catalog'
import { demoServices } from '../../mocks/demoServices'
import { renderRoute, withinSection } from '../../test/renderRoute'

describe('HomePage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')))
    // El catálogo consume la API real; en los tests servimos los datos de demostración.
    vi.spyOn(catalog, 'listDemoServices').mockResolvedValue(demoServices)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('los accesos principales apuntan a secciones de la misma página', () => {
    renderRoute('/')
    const modules = screen.getByRole('region', { name: 'Explora NEXO JOVEN 360' })
    const expected = {
      Brújula: '/#brujula',
      'Nexo Territorio': '/#territorio',
      'Espacio Pausa': '/#pausa',
      'Mi siguiente paso': '/#mi-siguiente-paso',
    }
    for (const [name, href] of Object.entries(expected)) {
      expect(within(modules).getByRole('link', { name })).toHaveAttribute('href', href)
    }
  })

  it('Inicio incluye los cuatro accesos y no los servicios destacados', () => {
    renderRoute('/')
    const inicio = withinSection('inicio')
    expect(inicio.getByRole('region', { name: 'Explora NEXO JOVEN 360' })).toBeInTheDocument()
    expect(inicio.queryByRole('region', { name: 'Servicios destacados' })).toBeNull()
  })

  it('la búsqueda del inicio filtra Nexo Territorio sin salir de la página', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/')
    await user.type(withinSection('inicio').getByRole('searchbox'), 'fútbol{Enter}')

    expect(router.state.location.pathname).toBe('/')
    expect(router.state.location.search).toBe('?q=f%C3%BAtbol')
    expect(router.state.location.hash).toBe('#territorio')

    const territorio = withinSection('territorio')
    expect(territorio.getByRole('searchbox')).toHaveValue('fútbol')
    expect(await territorio.findByRole('heading', { name: '1 servicio' })).toBeInTheDocument()
  })
})
