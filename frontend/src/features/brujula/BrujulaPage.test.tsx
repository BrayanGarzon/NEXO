import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderRoute } from '../../test/renderRoute'

describe('BrujulaPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('recorre los pasos hasta los resultados y permite regresar', async () => {
    const user = userEvent.setup()
    renderRoute('/brujula')

    const continuar = screen.getByRole('button', { name: 'Continuar' })
    expect(continuar).toBeDisabled()

    await user.click(
      screen.getByRole('radio', { name: 'Quiero participar en actividades culturales' }),
    )
    expect(continuar).toBeEnabled()
    await user.click(continuar)

    expect(
      screen.getByRole('heading', { level: 1, name: '¿Cómo te gustaría empezar?' }),
    ).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Regresar' }))
    expect(
      screen.getByRole('radio', { name: 'Quiero participar en actividades culturales' }),
    ).toBeChecked()
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    await user.click(screen.getByRole('radio', { name: /Participar en algo grupal/ }))
    await user.click(screen.getByRole('button', { name: 'Ver mi ruta' }))

    expect(
      screen.getByRole('heading', { level: 1, name: 'Tu ruta para empezar' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Datos de demostración')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Espacios culturales Casa de la Juventud' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Si necesitas ayuda ahora mismo')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Empezar de nuevo' }))
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled()
  })

  it('muestra los canales de ayuda inmediata ante un momento difícil', async () => {
    const user = userEvent.setup()
    renderRoute('/brujula')
    await user.click(screen.getByRole('radio', { name: 'Estoy pasando por un momento difícil' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('radio', { name: /Hablar con una persona/ }))
    await user.click(screen.getByRole('button', { name: 'Ver mi ruta' }))

    expect(
      screen.getByRole('heading', { name: 'Si necesitas ayuda ahora mismo' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '123' })).toHaveAttribute('href', 'tel:123')
  })
})
