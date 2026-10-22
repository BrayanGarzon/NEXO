import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SAVED_SERVICES_KEY, reloadSavedServices } from '../../services/savedServices'
import { renderRoute, withinSection } from '../../test/renderRoute'

const storedIds = () =>
  (JSON.parse(localStorage.getItem(SAVED_SERVICES_KEY) ?? '[]') as { id: string }[]).map(
    (item) => item.id,
  )

describe('PasoSection', () => {
  beforeEach(() => {
    localStorage.clear()
    reloadSavedServices()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sin opciones guardadas muestra el estado vacío y cómo agregarlas', () => {
    renderRoute('/')
    const paso = withinSection('mi-siguiente-paso')
    expect(paso.getByRole('tab', { name: 'Mis opciones (0)' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(paso.getByText('Aún no has guardado opciones')).toBeInTheDocument()
    expect(paso.getByRole('link', { name: /Explorar servicios/ })).toHaveAttribute(
      'href',
      '/#territorio',
    )
    expect(paso.getByRole('link', { name: /Agregar más opciones/ })).toHaveAttribute(
      'href',
      '/#territorio',
    )
  })

  it('guarda desde el detalle de Territorio y aparece en la lista', async () => {
    const user = userEvent.setup()
    renderRoute('/?servicio=demo-liga-futbol#territorio')
    const detail = await screen.findByRole('complementary', { name: 'Liga Juvenil de Fútbol' })

    await user.click(within(detail).getByRole('button', { name: 'Guardar' }))
    expect(within(detail).getByRole('button', { name: 'Guardado' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(within(detail).getByRole('link', { name: 'Mi siguiente paso' })).toHaveAttribute(
      'href',
      '/#mi-siguiente-paso',
    )
    expect(storedIds()).toEqual(['demo-liga-futbol'])

    const paso = withinSection('mi-siguiente-paso')
    expect(paso.getByRole('tab', { name: 'Mis opciones (1)' })).toBeInTheDocument()
    expect(
      paso.getByRole('heading', { level: 3, name: 'Liga Juvenil de Fútbol' }),
    ).toBeInTheDocument()
    expect(paso.getByRole('link', { name: 'Ver Liga Juvenil de Fútbol' })).toHaveAttribute(
      'href',
      '/?servicio=demo-liga-futbol#territorio',
    )

    // Volver a pulsar lo quita.
    await user.click(within(detail).getByRole('button', { name: 'Guardado' }))
    expect(storedIds()).toEqual([])
    expect(paso.getByText('Aún no has guardado opciones')).toBeInTheDocument()
  })

  it('recupera las opciones guardadas en el navegador y permite quitarlas', async () => {
    localStorage.setItem(
      SAVED_SERVICES_KEY,
      JSON.stringify([
        { id: 'demo-casa-juventud', savedAt: '2026-10-21T11:00:00.000Z' },
        { id: 'demo-orientacion-juvenil', savedAt: '2026-10-21T10:00:00.000Z' },
        { id: 'servicio-que-ya-no-existe', savedAt: '2026-10-21T09:00:00.000Z' },
      ]),
    )
    reloadSavedServices()
    const user = userEvent.setup()
    renderRoute('/')
    const paso = withinSection('mi-siguiente-paso')

    const names = paso.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)
    expect(names).toEqual([
      'Espacios culturales Casa de la Juventud',
      'Centro de Orientación Juvenil',
    ])
    expect(paso.getByRole('tab', { name: 'Mis opciones (2)' })).toBeInTheDocument()
    expect(paso.getByText('Datos de demostración')).toBeInTheDocument()

    await user.click(
      paso.getByRole('button', { name: 'Quitar Espacios culturales Casa de la Juventud' }),
    )
    expect(
      paso.getByText('Se quitó Espacios culturales Casa de la Juventud de tus opciones.'),
    ).toBeInTheDocument()
    expect(paso.getAllByRole('heading', { level: 3 })).toHaveLength(1)
    expect(storedIds()).toEqual(['demo-orientacion-juvenil', 'servicio-que-ya-no-existe'])
  })

  it('las pestañas cambian con clic y con las flechas del teclado', async () => {
    const user = userEvent.setup()
    renderRoute('/')
    const paso = withinSection('mi-siguiente-paso')
    const opciones = paso.getByRole('tab', { name: /Mis opciones/ })

    await user.click(paso.getByRole('tab', { name: 'Acciones sugeridas' }))
    expect(paso.getByRole('tab', { name: 'Acciones sugeridas' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    const panel = paso.getByRole('tabpanel', { name: 'Acciones sugeridas' })
    expect(within(panel).getByRole('link', { name: /Haz tu ruta en Brújula/ })).toHaveAttribute(
      'href',
      '/#brujula',
    )
    expect(within(panel).getByRole('link', { name: /Tómate una pausa/ })).toHaveAttribute(
      'href',
      '/#pausa',
    )

    await user.keyboard('{ArrowLeft}')
    expect(opciones).toHaveAttribute('aria-selected', 'true')
    expect(opciones).toHaveFocus()
  })
})
