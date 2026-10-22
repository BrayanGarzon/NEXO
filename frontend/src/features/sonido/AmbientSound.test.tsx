import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderRoute } from '../../test/renderRoute'
import { AMBIENT_VOLUME_KEY } from './AmbientSound'
import { createAmbientEngine, isAmbientSoundSupported } from './ambientEngine'

vi.mock('./ambientEngine', () => ({
  isAmbientSoundSupported: vi.fn(() => true),
  createAmbientEngine: vi.fn(),
}))

const engine = {
  setVolume: vi.fn(),
  pause: vi.fn(() => Promise.resolve()),
  resume: vi.fn(() => Promise.resolve()),
  stop: vi.fn(),
}

const control = () => screen.getByRole('group', { name: 'Sonido ambiental' })

describe('AmbientSound', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')))
    vi.mocked(isAmbientSoundSupported).mockReturnValue(true)
    vi.mocked(createAmbientEngine).mockReturnValue(engine)
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('empieza apagado y no crea audio sin una acción explícita', () => {
    renderRoute('/')
    expect(
      within(control()).getByRole('button', { name: /Activar brisa suave/ }),
    ).toBeInTheDocument()
    expect(createAmbientEngine).not.toHaveBeenCalled()
  })

  it('se activa, pausa, reanuda y se detiene al instante', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await user.click(within(control()).getByRole('button', { name: /Activar brisa suave/ }))
    expect(createAmbientEngine).toHaveBeenCalledWith(40)
    expect(within(control()).getByRole('status')).toHaveTextContent('Sonando')
    const pause = within(control()).getByRole('button', { name: 'Pausar sonido' })
    expect(pause).toHaveFocus()

    await user.click(pause)
    expect(engine.pause).toHaveBeenCalledOnce()
    expect(within(control()).getByRole('status')).toHaveTextContent('En pausa')

    await user.click(within(control()).getByRole('button', { name: 'Reanudar sonido' }))
    expect(engine.resume).toHaveBeenCalledOnce()
    expect(within(control()).getByRole('status')).toHaveTextContent('Sonando')

    await user.click(within(control()).getByRole('button', { name: 'Detener sonido' }))
    expect(engine.stop).toHaveBeenCalledOnce()
    expect(within(control()).getByRole('button', { name: /Activar brisa suave/ })).toHaveFocus()
  })

  it('ajusta el volumen y lo recuerda, pero no la reproducción', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem(AMBIENT_VOLUME_KEY, '60')
    const { unmount } = renderRoute('/')

    await user.click(within(control()).getByRole('button', { name: /Activar brisa suave/ }))
    expect(createAmbientEngine).toHaveBeenCalledWith(60)

    const slider = within(control()).getByRole('slider', { name: 'Volumen del sonido ambiental' })
    fireEvent.change(slider, { target: { value: '80' } })
    expect(engine.setVolume).toHaveBeenCalledWith(80)
    expect(slider).toHaveAttribute('aria-valuetext', '80 %')
    expect(window.localStorage.getItem(AMBIENT_VOLUME_KEY)).toBe('80')

    // Al salir de la web pública el sonido se detiene; al volver empieza apagado.
    unmount()
    expect(engine.stop).toHaveBeenCalledOnce()
    renderRoute('/')
    expect(
      within(control()).getByRole('button', { name: /Activar brisa suave/ }),
    ).toBeInTheDocument()
    expect(createAmbientEngine).toHaveBeenCalledOnce()
  })

  it('en pantallas estrechas el volumen se abre y se cierra con Escape', async () => {
    const user = userEvent.setup()
    renderRoute('/')
    await user.click(within(control()).getByRole('button', { name: /Activar brisa suave/ }))

    const toggle = within(control()).getByRole('button', { name: 'Volumen' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard('{Escape}')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
  })

  it('no aparece en el panel institucional', () => {
    renderRoute('/panel')
    expect(screen.queryByRole('group', { name: 'Sonido ambiental' })).toBeNull()
  })

  it('no aparece si el navegador no admite Web Audio', () => {
    vi.mocked(isAmbientSoundSupported).mockReturnValue(false)
    renderRoute('/')
    expect(screen.queryByRole('group', { name: 'Sonido ambiental' })).toBeNull()
  })

  it('si el navegador no puede crear el audio, el control sigue apagado', async () => {
    const user = userEvent.setup()
    vi.mocked(createAmbientEngine).mockImplementation(() => {
      throw new Error('sin audio')
    })
    renderRoute('/')
    await act(() =>
      user.click(within(control()).getByRole('button', { name: /Activar brisa suave/ })),
    )
    expect(
      within(control()).getByRole('button', { name: /Activar brisa suave/ }),
    ).toBeInTheDocument()
  })
})
