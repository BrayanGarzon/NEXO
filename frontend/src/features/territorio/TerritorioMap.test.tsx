import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect, useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as catalog from '../../services/catalog'
import { demoServices } from '../../mocks/demoServices'
import { renderRoute, withinSection } from '../../test/renderRoute'
import type { CityMap3DProps } from './map3d/CityMap3D'

const mocks = vi.hoisted(() => ({
  webgl: true,
  api: {
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    reset: vi.fn(),
    focus: vi.fn(),
    panBy: vi.fn(),
    fitTo: vi.fn(),
  },
  unmounts: 0,
}))

vi.mock('./map3d/webgl', () => ({ isWebGLAvailable: () => mocks.webgl }))

// Escena 3D sustituta: jsdom no tiene WebGL. Expone las mismas props que la real.
vi.mock('./map3d/CityMap3D', () => ({
  default: function FakeCityMap3D({
    services,
    selectedId,
    routeService,
    onSelect,
    apiRef,
    onContextLost,
  }: CityMap3DProps) {
    const [broken, setBroken] = useState(false)
    if (broken) throw new Error('fallo de la escena')
    useEffect(() => {
      apiRef.current = mocks.api
      return () => {
        apiRef.current = null
        mocks.unmounts++
      }
    }, [apiRef])
    return (
      <div
        data-testid="escena-3d"
        data-selected={selectedId ?? ''}
        data-route={routeService?.id ?? ''}
      >
        <ul aria-label="Servicios en el mapa">
          {services.map((service) => (
            <li key={service.id}>
              <button type="button" onClick={() => onSelect(service.id)}>
                {service.name}
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={onContextLost}>
          Perder contexto
        </button>
        <button type="button" onClick={() => setBroken(true)}>
          Romper escena
        </button>
      </div>
    )
  },
}))

const mapPins = () => within(screen.getByRole('list', { name: 'Servicios en el mapa' }))
const toolbar = () => within(screen.getByRole('toolbar', { name: 'Controles del mapa' }))

describe('TerritorioMap', () => {
  beforeEach(() => {
    mocks.webgl = true
    mocks.unmounts = 0
    Object.values(mocks.api).forEach((fn) => fn.mockClear())
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')))
    // El catálogo consume la API real; en los tests servimos los datos de demostración.
    vi.spyOn(catalog, 'listDemoServices').mockResolvedValue(demoServices)
    Element.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('muestra la ciudad 3D con un marcador por servicio y el aviso de ciudad ilustrativa', async () => {
    renderRoute('/#territorio')
    expect(await screen.findByTestId('escena-3d')).toBeInTheDocument()
    await waitFor(() => expect(mapPins().getAllByRole('button')).toHaveLength(demoServices.length))
    expect(
      screen.getByText('Ciudad ilustrativa: no es un mapa a escala ni muestra ubicaciones reales'),
    ).toBeInTheDocument()
  })

  it('seleccionar en el mapa actualiza la URL, la lista y la tarjeta de detalle', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/#territorio')
    await screen.findByTestId('escena-3d')
    await user.click(await mapPins().findByRole('button', { name: 'Liga Juvenil de Fútbol' }))

    expect(router.state.location.search).toBe('?servicio=demo-liga-futbol')
    expect(
      screen.getByRole('complementary', { name: 'Liga Juvenil de Fútbol' }),
    ).toBeInTheDocument()
    const list = withinSection('territorio').getByRole('region', { name: /servicios$/ })
    expect(within(list).getByRole('button', { name: /Liga Juvenil de Fútbol/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByTestId('escena-3d')).toHaveAttribute('data-selected', 'demo-liga-futbol')
  })

  it('mantiene la ruta en la escena 3D al pulsar Cómo llegar', async () => {
    const user = userEvent.setup()
    renderRoute('/?servicio=demo-liga-futbol#territorio')
    const detail = await screen.findByRole('complementary', { name: 'Liga Juvenil de Fútbol' })
    await user.click(within(detail).getByRole('button', { name: 'Cómo llegar' }))

    expect(screen.getByTestId('escena-3d')).toHaveAttribute('data-route', 'demo-liga-futbol')
    expect(screen.getByTestId('escena-3d')).toHaveAttribute('data-selected', 'demo-liga-futbol')
    expect(
      screen.getByText(/Ruta esquemática: desde el punto de inicio referencial/),
    ).toHaveTextContent('hasta Liga Juvenil de Fútbol')
    expect(toolbar().queryByRole('button', { name: /Vista simple 2D/ })).toBeNull()
  })

  it('seleccionar en la lista llega a la escena (que centra la cámara)', async () => {
    const user = userEvent.setup()
    renderRoute('/#territorio')
    await screen.findByTestId('escena-3d')
    const list = await withinSection('territorio').findByRole('region', { name: /\d+ servicios$/ })
    await user.click(await within(list).findByRole('button', { name: /Ruta de Empleo Joven/ }))
    expect(screen.getByTestId('escena-3d')).toHaveAttribute('data-selected', 'demo-ruta-empleo')
  })

  it('los filtros cambian a la vez la lista y los marcadores; sin resultados avisa', async () => {
    const user = userEvent.setup()
    renderRoute('/#territorio')
    await screen.findByTestId('escena-3d')
    await waitFor(() => expect(mapPins().getAllByRole('button')).toHaveLength(demoServices.length))

    const filters = screen.getByRole('group', { name: 'Filtrar por categoría' })
    await user.click(within(filters).getByRole('button', { name: 'Salud mental' }))
    const expected = demoServices.filter((service) => service.category === 'salud-mental').length
    expect(mapPins().getAllByRole('button')).toHaveLength(expected)
    expect(screen.getByRole('heading', { name: `${expected} servicios` })).toBeInTheDocument()

    const search = withinSection('territorio').getByRole('searchbox')
    await user.clear(search)
    await user.type(search, 'zzzz{Enter}')
    expect(mapPins().queryAllByRole('button')).toHaveLength(0)
    expect(screen.getByText('Ningún servicio coincide con estos filtros.')).toBeInTheDocument()
  })

  it('los controles visibles acercan, alejan y restablecen la vista', async () => {
    const user = userEvent.setup()
    renderRoute('/#territorio')
    await screen.findByTestId('escena-3d')
    await user.click(toolbar().getByRole('button', { name: 'Acercar' }))
    await user.click(toolbar().getByRole('button', { name: 'Alejar' }))
    await user.click(toolbar().getByRole('button', { name: 'Restablecer la vista' }))
    expect(mocks.api.zoomIn).toHaveBeenCalledOnce()
    expect(mocks.api.zoomOut).toHaveBeenCalledOnce()
    expect(mocks.api.reset).toHaveBeenCalledOnce()
  })

  it('cambia a la vista simple 2D y vuelve, liberando la escena y conservando la selección', async () => {
    const user = userEvent.setup()
    renderRoute('/?servicio=demo-casa-juventud#territorio')
    await screen.findByTestId('escena-3d')
    await screen.findByRole('heading', { name: `${demoServices.length} servicios` })

    const toggle = toolbar().getByRole('button', { name: /Vista simple 2D/ })
    await user.click(toggle)
    expect(screen.queryByTestId('escena-3d')).toBeNull()
    expect(mocks.unmounts).toBe(1)
    expect(toolbar().queryByRole('button', { name: 'Acercar' })).toBeNull()
    expect(toolbar().getByRole('button', { name: /Ver en 3D/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(
      mapPins().getByRole('button', { name: 'Espacios culturales Casa de la Juventud' }),
    ).toHaveAttribute('aria-pressed', 'true')

    await user.click(toolbar().getByRole('button', { name: /Ver en 3D/ }))
    expect(await screen.findByTestId('escena-3d')).toHaveAttribute(
      'data-selected',
      'demo-casa-juventud',
    )
  })

  it('si se pierde el contexto WebGL pasa a 2D con aviso y sin opción de volver', async () => {
    const user = userEvent.setup()
    renderRoute('/#territorio')
    await user.click(await screen.findByRole('button', { name: 'Perder contexto' }))
    expect(screen.queryByTestId('escena-3d')).toBeNull()
    expect(
      screen.getByText(
        'No pudimos mostrar la ciudad 3D en este dispositivo. Mostramos la vista simple.',
      ),
    ).toBeInTheDocument()
    expect(toolbar().queryByRole('button', { name: /Ver en 3D/ })).toBeNull()
    expect(await mapPins().findAllByRole('button')).toHaveLength(demoServices.length)
  })

  it('si la escena falla al dibujar, el límite de errores muestra la vista 2D', async () => {
    const user = userEvent.setup()
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    renderRoute('/#territorio')
    await user.click(await screen.findByRole('button', { name: 'Romper escena' }))
    expect(screen.queryByTestId('escena-3d')).toBeNull()
    expect(
      screen.getByText(
        'No pudimos mostrar la ciudad 3D en este dispositivo. Mostramos la vista simple.',
      ),
    ).toBeInTheDocument()
    error.mockRestore()
  })

  it('sin WebGL usa la vista 2D con todas sus funciones', async () => {
    mocks.webgl = false
    const user = userEvent.setup()
    const { router } = renderRoute('/#territorio')
    expect(
      screen.getByText('Este navegador no puede mostrar la ciudad 3D. Usamos la vista simple.'),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('escena-3d')).toBeNull()
    expect(toolbar().queryAllByRole('button')).toHaveLength(0)
    await user.click(
      await mapPins().findByRole('button', { name: 'Centro de Orientación Juvenil' }),
    )
    expect(router.state.location.search).toBe('?servicio=demo-orientacion-juvenil')
    expect(
      screen.getByRole('complementary', { name: 'Centro de Orientación Juvenil' }),
    ).toBeInTheDocument()
  })

  it('al salir de la página se desmonta la escena', async () => {
    const { unmount } = renderRoute('/#territorio')
    await screen.findByTestId('escena-3d')
    unmount()
    expect(mocks.unmounts).toBe(1)
  })
})
