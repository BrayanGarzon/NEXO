import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useRevealOnView } from './useRevealOnView'

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void

/** IntersectionObserver controlable desde la prueba. */
class FakeObserver {
  static instances: FakeObserver[] = []
  observed: Element[] = []
  disconnected = false
  callback: Callback
  constructor(callback: Callback) {
    this.callback = callback
    FakeObserver.instances.push(this)
  }
  observe(element: Element) {
    this.observed.push(element)
  }
  disconnect() {
    this.disconnected = true
  }
}

function Probe() {
  const [ref, revealed] = useRevealOnView<HTMLDivElement>()
  return (
    <div ref={ref} data-testid="probe">
      {revealed ? 'visible' : 'pendiente'}
    </div>
  )
}

describe('useRevealOnView', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('con IntersectionObserver', () => {
    beforeEach(() => {
      FakeObserver.instances = []
      vi.stubGlobal('IntersectionObserver', FakeObserver)
    })

    it('se marca como visible al entrar en pantalla y deja de observar', () => {
      render(<Probe />)
      const probe = screen.getByTestId('probe')
      const observer = FakeObserver.instances[0]
      expect(probe).toHaveTextContent('pendiente')
      expect(observer.observed).toEqual([probe])

      act(() => observer.callback([{ target: probe, isIntersecting: false }]))
      expect(probe).toHaveTextContent('pendiente')

      act(() => observer.callback([{ target: probe, isIntersecting: true }]))
      expect(probe).toHaveTextContent('visible')
      expect(observer.disconnected).toBe(true)
    })
  })

  it('sin IntersectionObserver el contenido se muestra desde el inicio', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    render(<Probe />)
    expect(screen.getByTestId('probe')).toHaveTextContent('visible')
  })
})
