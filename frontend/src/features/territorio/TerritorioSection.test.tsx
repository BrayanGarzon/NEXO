import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as catalog from '../../services/catalog'
import { renderRoute, withinSection } from '../../test/renderRoute'
import { demoServices } from '../../mocks/demoServices'

describe('TerritorioSection', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('muestra la carga y luego los servicios', async () => {
    renderRoute('/')
    expect(screen.getByText('Cargando servicios…')).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: `${demoServices.length} servicios` }),
    ).toBeInTheDocument()
  })

  it('filtra por categoría y muestra el detalle al seleccionar', async () => {
    const user = userEvent.setup()
    renderRoute('/')
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

  it('incluye los servicios destacados como datos de demostración', () => {
    renderRoute('/')
    const featured = withinSection('territorio').getByRole('region', {
      name: 'Servicios destacados en Villavicencio',
    })
    expect(within(featured).getByText('Datos de demostración')).toBeInTheDocument()
    expect(within(featured).getAllByRole('listitem')).toHaveLength(3)
    expect(
      screen.getAllByRole('region', { name: 'Servicios destacados en Villavicencio' }),
    ).toHaveLength(1)
  })

  it('«Ver todos» muestra el listado completo y cada destacado abre su detalle', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/?categoria=cultura#territorio')
    const featured = screen.getByRole('region', { name: 'Servicios destacados en Villavicencio' })
    expect(
      within(featured).getByRole('link', { name: 'Centro de Orientación Juvenil' }),
    ).toHaveAttribute('href', '/?servicio=demo-orientacion-juvenil#territorio-explorar')

    await user.click(within(featured).getByRole('link', { name: /Ver todos/ }))
    expect(router.state.location.search).toBe('')
    expect(router.state.location.hash).toBe('#territorio-explorar')
    expect(
      await screen.findByRole('heading', { name: `${demoServices.length} servicios` }),
    ).toBeInTheDocument()
  })

  it('abre el detalle indicado en la URL', async () => {
    renderRoute('/?servicio=demo-liga-futbol#territorio')
    expect(
      await screen.findByRole('complementary', { name: 'Liga Juvenil de Fútbol' }),
    ).toBeInTheDocument()
  })

  it('muestra el estado vacío y permite quitar filtros', async () => {
    const user = userEvent.setup()
    renderRoute('/?q=zzzz#territorio')
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

    renderRoute('/')
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar los servicios')

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(
      await screen.findByRole('heading', { name: `${demoServices.length} servicios` }),
    ).toBeInTheDocument()
    expect(spy).toHaveBeenCalledTimes(2)
  })
})
