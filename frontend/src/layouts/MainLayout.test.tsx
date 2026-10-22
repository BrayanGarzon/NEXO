import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderRoute } from '../test/renderRoute'

describe('MainLayout', () => {
  const scrollIntoView = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')))
    Element.prototype.scrollIntoView = scrollIntoView
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    scrollIntoView.mockReset()
  })

  it('no muestra el acceso al panel institucional en el encabezado', () => {
    renderRoute('/')
    expect(screen.queryByRole('link', { name: 'Panel institucional' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Panel institucional' })).not.toBeInTheDocument()
  })

  it('la lupa busca en toda la página y lleva al resultado', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/')
    await user.click(screen.getByRole('button', { name: 'Buscar en la página' }))

    const dialog = screen.getByRole('dialog', { name: 'Buscar en NEXO JOVEN 360' })
    await user.type(within(dialog).getByRole('searchbox'), 'liga')
    const servicios = within(dialog).getByRole('region', { name: 'Servicios' })
    await user.click(within(servicios).getByRole('link', { name: /Liga Juvenil de Fútbol/ }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(router.state.location.search).toBe('?servicio=demo-liga-futbol')
    expect(router.state.location.hash).toBe('#territorio')
  })

  it('la lupa encuentra palabras del texto de la página', async () => {
    const user = userEvent.setup()
    renderRoute('/')
    await user.click(screen.getByRole('button', { name: 'Buscar en la página' }))
    const dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByRole('searchbox'), 'autocuidado')

    const enPagina = within(dialog).getByRole('region', { name: 'En la página' })
    await user.click(within(enPagina).getByRole('button', { name: /Espacio Pausa/ }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByText(/herramientas educativas de autocuidado/)).toHaveClass(
        'site-search-hit',
      ),
    )
  })

  it('Escape cierra la búsqueda aunque haya texto escrito', async () => {
    const user = userEvent.setup()
    renderRoute('/')
    await user.click(screen.getByRole('button', { name: 'Buscar en la página' }))
    await user.type(within(screen.getByRole('dialog')).getByRole('searchbox'), 'hola{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('la búsqueda avisa cuando no hay resultados', async () => {
    const user = userEvent.setup()
    renderRoute('/')
    await user.click(screen.getByRole('button', { name: 'Buscar en la página' }))
    const dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByRole('searchbox'), 'xyzzy')
    expect(within(dialog).getByText(/No encontramos resultados para «xyzzy»/)).toBeInTheDocument()
  })

  it('el menú lleva a la sección y se cierra en móvil', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/')
    const toggle = screen.getByRole('button', { name: 'Abrir menú' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await user.click(toggle)
    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
    const link = within(nav).getByRole('link', { name: 'Espacio Pausa' })
    expect(link).toHaveAttribute('href', '/#pausa')
    await user.click(link)

    expect(router.state.location.pathname).toBe('/')
    expect(router.state.location.hash).toBe('#pausa')
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled())
    expect(scrollIntoView.mock.contexts.at(-1)).toBe(document.getElementById('pausa'))
  })

  it('Escape cierra el menú móvil, actualiza aria-expanded y devuelve el foco', async () => {
    const user = userEvent.setup()
    renderRoute('/')
    await user.click(screen.getByRole('button', { name: 'Abrir menú' }))
    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    await user.keyboard('{Escape}')

    const toggle = screen.getByRole('button', { name: 'Abrir menú' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).not.toHaveClass(
      'site-nav--open',
    )
  })

  it('Escape no hace nada si el menú está cerrado', async () => {
    const user = userEvent.setup()
    renderRoute('/')
    const search = within(document.getElementById('inicio')!).getByRole('searchbox')
    await user.click(search)
    await user.keyboard('{Escape}')
    expect(search).toHaveFocus()
  })

  it('marca Inicio como sección activa al cargar', () => {
    renderRoute('/')
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
    expect(within(nav).getByRole('link', { name: 'Inicio' })).toHaveAttribute(
      'aria-current',
      'location',
    )
  })

  it('ofrece un enlace para saltar al contenido', () => {
    renderRoute('/')
    expect(screen.getByRole('link', { name: 'Saltar al contenido' })).toHaveAttribute(
      'href',
      '#contenido',
    )
  })

  it('Información cierra la página justo antes del pie', () => {
    renderRoute('/')
    const footer = screen.getByRole('contentinfo')

    const main = screen.getByRole('main')
    expect(main.lastElementChild).toHaveAttribute('id', 'informacion')
    expect(main.nextElementSibling).toBe(footer)

    const informacion = screen.getByRole('region', { name: '¿Qué es NEXO JOVEN 360?' })
    expect(within(informacion).getByRole('link', { name: '123' })).toHaveAttribute(
      'href',
      'tel:123',
    )
    const links = within(
      within(footer).getByRole('navigation', { name: 'Secciones' }),
    ).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/#inicio',
      '/#brujula',
      '/#territorio',
      '/#pausa',
      '/#mi-siguiente-paso',
      '/#informacion',
    ])
  })
})
