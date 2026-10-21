import { act, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderRoute } from '../test/renderRoute'

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void

/** IntersectionObserver controlable desde la prueba. */
class FakeObserver {
  static instances: FakeObserver[] = []
  observed: Element[] = []
  callback: Callback
  constructor(callback: Callback) {
    this.callback = callback
    FakeObserver.instances.push(this)
  }
  observe(element: Element) {
    this.observed.push(element)
  }
  disconnect() {
    this.observed = []
  }
}

function crossBand(ids: string[], isIntersecting = true) {
  const observer = FakeObserver.instances.at(-1)!
  act(() =>
    observer.callback(ids.map((id) => ({ target: document.getElementById(id)!, isIntersecting }))),
  )
}

const activeLink = () =>
  within(screen.getByRole('navigation', { name: 'Navegación principal' })).getByRole('link', {
    current: 'location',
  })

describe('useActiveSection', () => {
  beforeEach(() => {
    FakeObserver.instances = []
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')))
    Element.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('resalta la sección que cruza la franja de lectura', () => {
    renderRoute('/')
    crossBand(['territorio'])
    expect(activeLink()).toHaveTextContent('Mapa')
  })

  it('con dos secciones en la misma fila prefiere la del enlace pulsado', () => {
    renderRoute('/#mi-siguiente-paso')
    crossBand(['pausa', 'mi-siguiente-paso'])
    expect(activeLink()).toHaveTextContent('Mi siguiente paso')
  })

  it('mantiene la última sección en los huecos entre secciones', () => {
    renderRoute('/')
    crossBand(['brujula'])
    crossBand(['brujula'], false)
    expect(activeLink()).toHaveTextContent('Brújula')
  })

  it('observa las secciones también tras redirigir una ruta antigua', async () => {
    renderRoute('/pausa')
    await waitFor(() =>
      expect(FakeObserver.instances.at(-1)!.observed.map((element) => element.id)).toContain(
        'pausa',
      ),
    )
    crossBand(['pausa', 'mi-siguiente-paso'])
    expect(activeLink()).toHaveTextContent('Espacio Pausa')
  })
})
