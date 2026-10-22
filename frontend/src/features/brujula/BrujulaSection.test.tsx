import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderRoute, withinSection } from '../../test/renderRoute'

describe('BrujulaSection', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('recorre los pasos hasta los resultados y permite regresar', async () => {
    const user = userEvent.setup()
    renderRoute('/')
    const brujula = withinSection('brujula')

    const continuar = brujula.getByRole('button', { name: 'Continuar' })
    expect(continuar).toBeDisabled()

    await user.click(
      brujula.getByRole('radio', { name: 'Quiero participar en actividades culturales' }),
    )
    expect(continuar).toBeEnabled()
    await user.click(continuar)

    expect(
      brujula.getByRole('heading', { level: 2, name: '¿Cómo te gustaría empezar?' }),
    ).toHaveFocus()
    await user.click(brujula.getByRole('button', { name: 'Regresar' }))
    expect(
      brujula.getByRole('radio', { name: 'Quiero participar en actividades culturales' }),
    ).toBeChecked()
    await user.click(brujula.getByRole('button', { name: 'Continuar' }))

    await user.click(brujula.getByRole('radio', { name: /Participar en algo grupal/ }))
    await user.click(brujula.getByRole('button', { name: 'Ver mi ruta' }))

    expect(
      brujula.getByRole('heading', { level: 2, name: 'Tu ruta para empezar' }),
    ).toBeInTheDocument()
    expect(brujula.getByText('Datos de demostración')).toBeInTheDocument()
    expect(
      brujula.getByRole('heading', { level: 3, name: 'Espacios culturales Casa de la Juventud' }),
    ).toBeInTheDocument()
    expect(brujula.getByRole('link', { name: /Ver en el mapa/ })).toHaveAttribute(
      'href',
      '/?servicio=demo-casa-juventud#territorio',
    )
    expect(brujula.queryByText('Si necesitas ayuda ahora mismo')).not.toBeInTheDocument()

    await user.click(brujula.getByRole('button', { name: 'Empezar de nuevo' }))
    expect(brujula.getByRole('button', { name: 'Continuar' })).toBeDisabled()
  })

  it('muestra los canales de ayuda inmediata ante un momento difícil', async () => {
    const user = userEvent.setup()
    renderRoute('/')
    const brujula = withinSection('brujula')
    await user.click(brujula.getByRole('radio', { name: 'Estoy pasando por un momento difícil' }))
    await user.click(brujula.getByRole('button', { name: 'Continuar' }))
    await user.click(brujula.getByRole('radio', { name: /Hablar con una persona/ }))
    await user.click(brujula.getByRole('button', { name: 'Ver mi ruta' }))

    expect(
      brujula.getByRole('heading', { name: 'Si necesitas ayuda ahora mismo' }),
    ).toBeInTheDocument()
    expect(brujula.getByRole('link', { name: '123' })).toHaveAttribute('href', 'tel:123')
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('las opciones aparecen al entrar Brújula en pantalla, sin perder la selección', async () => {
    type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void
    const instances: { callback: Callback; observed: Element[] }[] = []
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observed: Element[] = []
        callback: Callback
        constructor(callback: Callback) {
          this.callback = callback
          instances.push(this)
        }
        observe(element: Element) {
          this.observed.push(element)
        }
        disconnect() {}
      },
    )
    const user = userEvent.setup()
    renderRoute('/')
    const brujula = withinSection('brujula')
    const grid = brujula.getAllByRole('radio')[0].closest('.brujula__grid')!
    expect(grid).toHaveAttribute('data-reveal', 'pending')

    const observer = instances.find((instance) => instance.observed.includes(grid))!
    act(() => observer.callback([{ target: grid, isIntersecting: true }]))
    expect(grid).toHaveAttribute('data-reveal', 'shown')

    // La selección se distingue sin depender del cursor: radio marcado y clase de estado.
    const option = brujula.getByRole('radio', { name: 'Necesito apoyo en mi estudio' })
    await user.click(option)
    expect(option).toBeChecked()
    expect(option.closest('.choice-tile')).toHaveClass('choice-tile--checked')
    expect(
      brujula.getAllByRole('radio').filter((radio) => (radio as HTMLInputElement).checked),
    ).toHaveLength(1)
  })
})
