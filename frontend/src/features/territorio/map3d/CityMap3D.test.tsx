import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { demoServices } from '../../../mocks/demoServices'
import type { MapApi } from './camera'
import { buildCity } from './cityLayout'
import CityMap3D from './CityMap3D'
import { buildRoutePath, ROUTE_START } from './routePath'

// jsdom no puede dibujar WebGL: se sustituye el lienzo y se prueba la lógica que lo rodea.
vi.mock('@react-three/fiber', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@react-three/fiber')>()),
  Canvas: () => <canvas data-testid="lienzo" />,
}))

function setup(props: Partial<Parameters<typeof CityMap3D>[0]> = {}) {
  const apiRef = createRef<MapApi | null>() as { current: MapApi | null }
  const api: MapApi = {
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    reset: vi.fn(),
    focus: vi.fn(),
    panBy: vi.fn(),
    fitTo: vi.fn(),
  }
  apiRef.current = api
  const onSelect = vi.fn()
  const view = render(
    <CityMap3D
      services={demoServices}
      allServices={demoServices}
      selectedId={null}
      routeService={null}
      onSelect={onSelect}
      apiRef={apiRef}
      onContextLost={vi.fn()}
      {...props}
    />,
  )
  return { api, onSelect, view, apiRef }
}

const hubs = buildCity(demoServices).hubs

describe('CityMap3D', () => {
  it('ofrece un pin accesible por servicio filtrado', async () => {
    const user = userEvent.setup()
    const { onSelect } = setup({ services: demoServices.slice(0, 3) })
    const pins = within(screen.getByRole('list', { name: 'Servicios en el mapa' }))
    expect(pins.getAllByRole('button')).toHaveLength(3)
    await user.click(pins.getByRole('button', { name: demoServices[1].name }))
    expect(onSelect).toHaveBeenCalledWith(demoServices[1].id)
  })

  it('construye una ruta 3D desde el inicio hasta el servicio por los ejes de las calles', () => {
    const destination = hubs.get('demo-ruta-empleo')!
    const route = buildRoutePath(destination)

    expect(route[0]).toEqual(ROUTE_START)
    expect(route.at(-1)).toEqual(destination)
    expect(route).toHaveLength(5)
    expect(route[1].z).toBe(ROUTE_START.z)
    expect(route[2].x).toBe(route[1].x)
    expect(route[3].z).toBe(route[2].z)
  })

  it('centra la cámara en el servicio seleccionado (desde la lista, el mapa o la URL)', async () => {
    const { api, view, apiRef } = setup()
    view.rerender(
      <CityMap3D
        services={demoServices}
        allServices={demoServices}
        selectedId="demo-ruta-empleo"
        routeService={null}
        onSelect={vi.fn()}
        apiRef={apiRef}
        onContextLost={vi.fn()}
      />,
    )
    await waitFor(() => expect(api.focus).toHaveBeenCalledWith(hubs.get('demo-ruta-empleo')))
    expect(
      within(screen.getByRole('list', { name: 'Servicios en el mapa' })).getByRole('button', {
        name: 'Ruta de Empleo Joven',
      }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('al filtrar sin selección encuadra los servicios visibles; sin filtros, restablece', () => {
    const { api, view, apiRef } = setup()
    const filtered = demoServices.filter((service) => service.category === 'salud-mental')
    const props = {
      allServices: demoServices,
      selectedId: null,
      routeService: null,
      onSelect: vi.fn(),
      apiRef,
      onContextLost: vi.fn(),
    }
    view.rerender(<CityMap3D services={filtered} {...props} />)
    expect(api.fitTo).toHaveBeenCalledWith(filtered.map((service) => hubs.get(service.id)))
    view.rerender(<CityMap3D services={demoServices} {...props} />)
    expect(api.reset).toHaveBeenCalledOnce()
  })

  it('se maneja con el teclado: flechas, + / − y 0', async () => {
    const user = userEvent.setup()
    const { api } = setup()
    const viewport = screen.getByRole('group', { name: /Ciudad 3D ilustrativa/ })
    viewport.focus()
    await user.keyboard('{ArrowRight}{ArrowUp}+-0')
    expect(api.panBy).toHaveBeenNthCalledWith(1, 80, 0)
    expect(api.panBy).toHaveBeenNthCalledWith(2, 0, 80)
    expect(api.zoomIn).toHaveBeenCalledOnce()
    expect(api.zoomOut).toHaveBeenCalledOnce()
    expect(api.reset).toHaveBeenCalledOnce()
  })
})
