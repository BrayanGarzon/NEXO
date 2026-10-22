import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderRoute, withinSection } from '../../test/renderRoute'

const orb = () => document.querySelector<HTMLElement>('#pausa .breathing__orb')!
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms))

describe('PausaSection', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      shouldAdvanceTime: true,
      toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'],
    })
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  const setup = () => {
    const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) })
    renderRoute('/')
    return { user, pausa: withinSection('pausa') }
  }

  it('muestra los cinco ejercicios con la respiración seleccionada y lista para empezar', () => {
    const { pausa } = setup()
    const options = within5(pausa)
    expect(options).toHaveLength(5)
    expect(pausa.getByRole('button', { name: 'Ejercicios de respiración' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(pausa.getByText('Inhala')).toBeInTheDocument()
    expect(pausa.getByText('4 segundos')).toBeInTheDocument()
    expect(pausa.getByText('Ciclo 1 de 4')).toBeInTheDocument()
    expect(pausa.getByRole('button', { name: 'Reiniciar' })).toBeDisabled()
  })

  it('guía las fases, anuncia los cambios y se puede pausar y continuar', async () => {
    const { user, pausa } = setup()
    await user.click(pausa.getByRole('button', { name: 'Comenzar' }))
    advance(1100)
    expect(pausa.getByText('3 segundos')).toBeInTheDocument()

    advance(3000)
    expect(pausa.getByText('Sostén')).toBeInTheDocument()
    expect(pausa.getByText('Sostén, ciclo 1 de 4')).toHaveAttribute('aria-live', 'polite')

    await user.click(pausa.getByRole('button', { name: 'Pausar' }))
    advance(10000)
    expect(pausa.getByText('Sostén')).toBeInTheDocument()

    await user.click(pausa.getByRole('button', { name: 'Continuar' }))
    advance(4000)
    expect(pausa.getByText('Exhala')).toBeInTheDocument()
  })

  it('termina tras cuatro ciclos y permite repetir o reiniciar', async () => {
    const { user, pausa } = setup()
    await user.click(pausa.getByRole('button', { name: 'Comenzar' }))
    advance(64500)
    expect(pausa.getByText('¡Bien hecho!')).toBeInTheDocument()
    expect(pausa.getByText('Ejercicio completado')).toBeInTheDocument()
    expect(pausa.getByRole('button', { name: 'Repetir' })).toBeInTheDocument()

    await user.click(pausa.getByRole('button', { name: 'Reiniciar' }))
    expect(pausa.getByText('Inhala')).toBeInTheDocument()
    expect(pausa.getByRole('button', { name: 'Comenzar' })).toBeInTheDocument()
  })

  it('el círculo crece al inhalar', async () => {
    const { user, pausa } = setup()
    await user.click(pausa.getByRole('button', { name: 'Comenzar' }))
    advance(2000)
    const scale = Number(orb().style.transform.match(/scale\(([\d.]+)\)/)![1])
    expect(scale).toBeGreaterThan(0.75)
    expect(scale).toBeLessThan(0.9)
    expect(document.querySelector('#pausa .breathing__bar')).toBeNull()
    expect(pausa.queryByRole('checkbox', { name: 'Reducir movimiento' })).toBeNull()
  })

  it('con «Reducir movimiento» del sistema el círculo queda quieto y se ve la barra', async () => {
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('reduce') }))
    const { user, pausa } = setup()
    await user.click(pausa.getByRole('button', { name: 'Comenzar' }))
    advance(2000)
    expect(orb().style.transform).toBe('scale(1)')
    expect(document.querySelector('#pausa .breathing__bar')).not.toBeNull()
  })

  it('los demás ejercicios se recorren paso a paso', async () => {
    const { user, pausa } = setup()
    await user.click(pausa.getByRole('button', { name: 'Estiramiento rápido' }))
    expect(
      pausa.getByRole('heading', { level: 3, name: 'Estiramiento rápido' }),
    ).toBeInTheDocument()
    expect(pausa.getByText(/Paso 1 de 5/)).toBeInTheDocument()
    expect(pausa.getByRole('button', { name: 'Paso anterior' })).toBeDisabled()

    await user.click(pausa.getByRole('button', { name: 'Paso siguiente' }))
    expect(pausa.getByText(/Paso 2 de 5/)).toBeInTheDocument()
    for (let i = 0; i < 3; i++)
      await user.click(pausa.getByRole('button', { name: 'Paso siguiente' }))
    expect(pausa.getByText(/Paso 5 de 5/)).toBeInTheDocument()
    expect(pausa.getByRole('button', { name: 'Paso siguiente' })).toBeDisabled()
  })

  it('aclara que es una herramienta educativa y enlaza la línea 123', () => {
    const { pausa } = setup()
    expect(pausa.getByText(/no reemplazan la atención profesional/)).toBeInTheDocument()
    expect(pausa.getByRole('link', { name: '123' })).toHaveAttribute('href', 'tel:123')
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })
})

function within5(pausa: ReturnType<typeof withinSection>) {
  return pausa.getAllByRole('button').filter((button) => button.classList.contains('pausa__option'))
}
