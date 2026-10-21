import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as catalog from '../../services/catalog'
import { renderRoute } from '../../test/renderRoute'
import { demoServices } from '../../mocks/demoServices'

describe('TerritorioPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('muestra la carga y luego los servicios', async () => {
    renderRoute('/territorio')
    expect(screen.getByText('Cargando servicios…')).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: `${demoServices.length} servicios` }),
    ).toBeInTheDocument()
  })

  it('filtra por categoría y muestra el detalle al seleccionar', async () => {
    const user = userEvent.setup()
    renderRoute('/territorio')
    await screen.findByRole('heading', { name: /servicios$/ })

    const filters = screen.getByRole('group', { name: 'Filtrar por categoría' })
    await user.click(within(filters).getByRole('button', { name: 'Cultura' }))
    expect(within(filters).getByRole('button', { name: 'Cultura' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('heading', { name: '1 servicio' })).toBeInTheDocument()

    const list = screen.getByRole('region', { name: '1 servicio' })
    await user.click(within(list).getByRole('button', { name: /Espacios culturales/ }))
    const detail = screen.getByRole('complementary', {
      name: 'Espacios culturales Casa de la Juventud',
    })
    expect(within(detail).getByText('Casa de la Juventud (ejemplo)')).toBeInTheDocument()

    await user.click(within(detail).getByRole('button', { name: 'Cerrar detalle' }))
    expect(screen.queryByRole('complementary', { name: /Espacios culturales/ })).toBeNull()
  })

  it('abre el detalle indicado en la URL', async () => {
    renderRoute('/territorio?servicio=demo-liga-futbol')
    expect(
      await screen.findByRole('complementary', { name: 'Liga Juvenil de Fútbol' }),
    ).toBeInTheDocument()
  })

  it('muestra el estado vacío y permite quitar filtros', async () => {
    const user = userEvent.setup()
    renderRoute('/territorio?q=zzzz')
    expect(await screen.findByText('No encontramos servicios')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Quitar filtros' }))
    expect(
      screen.getByRole('heading', { name: `${demoServices.length} servicios` }),
    ).toBeInTheDocument()
  })

  it('muestra el error y permite reintentar', async () => {
    const user = userEvent.setup()
    const spy = vi
      .spyOn(catalog, 'listDemoServices')
      .mockRejectedValueOnce(new Error('fallo'))
      .mockResolvedValue(demoServices)

    renderRoute('/territorio')
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar los servicios')

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(
      await screen.findByRole('heading', { name: `${demoServices.length} servicios` }),
    ).toBeInTheDocument()
    expect(spy).toHaveBeenCalledTimes(2)
  })
})
