import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderRoute } from '../../test/renderRoute'
import { reiniciarDatosPanel } from './services/panelData'

/* Vistas Categorías, Fuentes, Usuarios y Configuración del panel institucional. */

describe('vistas complementarias del panel', () => {
  beforeEach(() => reiniciarDatosPanel())
  afterEach(() => vi.restoreAllMocks())

  it('el menú enlaza todas las vistas del panel', async () => {
    renderRoute('/panel/categorias')
    const menu = screen.getByRole('navigation', { name: 'Panel institucional' })
    for (const nombre of ['Categorías', 'Fuentes', 'Usuarios', 'Configuración']) {
      expect(within(menu).getByRole('link', { name: nombre })).toBeInTheDocument()
    }
    expect(within(menu).getByRole('link', { name: 'Categorías' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    const mas = within(menu).getByRole('button', { name: 'Más' })
    expect(mas).toHaveAttribute('aria-expanded', 'false')
    await userEvent.setup().click(mas)
    expect(mas).toHaveAttribute('aria-expanded', 'true')
  })

  it('Categorías resume cada categoría y lleva a sus servicios', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/panel/categorias')
    const lista = await screen.findByRole('list', { name: 'Categorías del catálogo' })
    expect(within(lista).getAllByRole('heading', { level: 3 })).toHaveLength(6)

    await user.click(screen.getByRole('link', { name: 'Ver servicios de Cultura' }))
    expect(router.state.location.search).toBe('?categoria=cultura')
    const tabla = await screen.findByRole('table')
    expect(within(tabla).getByRole('link', { name: 'Casa de la Juventud' })).toBeInTheDocument()
    expect(
      within(tabla).queryByRole('link', { name: 'Liga Juvenil de Fútbol' }),
    ).not.toBeInTheDocument()
    expect(screen.getByLabelText('Filtrar por categoría')).toHaveValue('cultura')
  })

  it('Fuentes filtra las antiguas y las marca como consultadas', async () => {
    const user = userEvent.setup()
    renderRoute('/panel/fuentes')
    await screen.findByRole('list', { name: 'Resumen de fuentes' })

    await user.click(
      within(screen.getByRole('group', { name: 'Filtrar por antigüedad' })).getByRole('button', {
        name: 'Antiguas',
      }),
    )
    const tabla = screen.getByRole('table')
    expect(within(tabla).getByText('Boletín de la agencia (ejemplo)')).toBeInTheDocument()
    expect(within(tabla).getAllByRole('row')).toHaveLength(2) // cabecera + 1 fuente

    await user.click(
      screen.getByRole('button', {
        name: 'Marcar «Boletín de la agencia (ejemplo)» como consultada hoy',
      }),
    )
    expect(
      await screen.findByText('«Boletín de la agencia (ejemplo)» quedó consultada hoy.'),
    ).toBeInTheDocument()
    expect(screen.getByText('No hay fuentes con esos filtros')).toBeInTheDocument()
  })

  it('Usuarios invita, cambia rol y protege al último administrador', async () => {
    const user = userEvent.setup()
    renderRoute('/panel/usuarios')
    await screen.findByRole('region', { name: 'Listado de usuarios' })

    await user.click(screen.getByRole('button', { name: 'Invitar usuario' }))
    const formulario = screen.getByRole('form', { name: 'Invitar usuario' })
    await user.type(within(formulario).getByLabelText('Nombre *'), 'Ana Pérez')
    await user.type(
      within(formulario).getByLabelText('Correo institucional *'),
      'ana.perez@example.org',
    )
    await user.type(within(formulario).getByLabelText('Institución *'), 'Biblioteca (ejemplo)')
    await user.click(within(formulario).getByRole('button', { name: 'Registrar invitación' }))
    expect(
      await screen.findByText(/Invitación registrada para ana.perez@example.org/),
    ).toBeVisible()
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Rol de Laura Méndez'), 'editor')
    expect(await screen.findByText('Rol de Laura Méndez: Edición.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Desactivar a María González' }))
    expect(
      await screen.findByText('Debe quedar al menos un administrador activo.'),
    ).toBeInTheDocument()

    expect(screen.getByRole('region', { name: 'Permisos' })).toBeInTheDocument()
  })

  it('Configuración guarda plazos, valida y el Observatorio los usa', async () => {
    const user = userEvent.setup()
    renderRoute('/panel/configuracion')
    const aviso = await screen.findByLabelText('Aviso «por vencer» (días)')

    await user.clear(aviso)
    await user.type(aviso, '200')
    await user.click(screen.getByRole('button', { name: 'Guardar configuración' }))
    expect(await screen.findByText(/deben ser días enteros entre 1 y 90/)).toBeInTheDocument()

    await user.clear(aviso)
    await user.type(aviso, '45')
    await user.click(screen.getByRole('button', { name: 'Guardar configuración' }))
    expect(await screen.findByText('Configuración guardada.')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Dashboard' }))
    expect(await screen.findByText(/Por vencer \(45 días\)/)).toBeInTheDocument()
  })

  it('Configuración restablece los datos de demostración', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    renderRoute('/panel/configuracion')
    const vigencia = await screen.findByLabelText('Vigencia de un servicio publicado (días)')
    await user.clear(vigencia)
    await user.type(vigencia, '90')
    await user.click(screen.getByRole('button', { name: 'Guardar configuración' }))
    await screen.findByText('Configuración guardada.')

    await user.click(screen.getByRole('button', { name: 'Restablecer datos de demostración' }))
    expect(await screen.findByText('Datos y configuración restablecidos.')).toBeInTheDocument()
    expect(await screen.findByLabelText('Vigencia de un servicio publicado (días)')).toHaveValue(
      180,
    )
  })
})
