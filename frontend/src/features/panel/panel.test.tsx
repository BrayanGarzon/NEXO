import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderRoute } from '../../test/renderRoute'
import { reiniciarDatosPanel } from './services/panelData'

describe('panel institucional', () => {
  beforeEach(() => reiniciarDatosPanel())

  it('/panel abre el Observatorio con su resumen', async () => {
    const { router } = renderRoute('/panel')
    expect(await screen.findByRole('heading', { name: 'Resumen general' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/panel/observatorio')
    expect(await screen.findByRole('list', { name: 'Resumen del catálogo' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Calidad de la información' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Servicios por categoría' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Actividad reciente' })).toBeInTheDocument()
  })

  it('la casa del encabezado lleva a la página principal', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/panel/observatorio')
    await user.click(await screen.findByRole('link', { name: 'Ir a la página principal' }))
    expect(router.state.location.pathname).toBe('/')
  })

  it('el botón Admin abre el perfil y permite cerrar sesión', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/panel/observatorio')
    await user.click(await screen.findByRole('button', { name: 'Admin, ver perfil' }))
    const perfil = screen.getByRole('dialog', { name: 'María González' })
    expect(within(perfil).getByText('maria.gonzalez@example.org')).toBeInTheDocument()
    expect(within(perfil).getByText('Administración')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Admin, ver perfil' }))
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(router.state.location.pathname).toBe('/')
  })

  it('Fuente Viva muestra la tabla y filtra por estado', async () => {
    const user = userEvent.setup()
    renderRoute('/panel/servicios')
    const tabla = await screen.findByRole('table')
    expect(within(tabla).getByRole('columnheader', { name: 'Institución' })).toBeInTheDocument()
    expect(within(tabla).getByRole('link', { name: 'Liga Juvenil de Fútbol' })).toBeInTheDocument()

    const filtros = screen.getByRole('group', { name: 'Filtrar por estado' })
    await user.click(within(filtros).getByRole('button', { name: /Publicado/ }))
    expect(within(filtros).getByRole('button', { name: /Publicado/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.queryByRole('link', { name: 'Liga Juvenil de Fútbol' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Casa de la Juventud' })).toBeInTheDocument()
  })

  it('no deja publicar sin fuente y publica al añadir una', async () => {
    const user = userEvent.setup()
    renderRoute('/panel/servicios/sv-liga-futbol')
    await screen.findByRole('heading', { name: 'Liga Juvenil de Fútbol' })

    await user.click(screen.getByRole('button', { name: 'Enviar a revisión' }))
    expect(await screen.findByText('El servicio ahora está «En revisión».')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Publicar' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Añadir fuente' }))
    await user.type(screen.getByLabelText('Título *'), 'Convocatoria de ejemplo')
    await user.click(screen.getByRole('button', { name: 'Guardar fuente' }))
    await screen.findByText('Convocatoria de ejemplo')

    await user.click(screen.getByRole('button', { name: 'Publicar' }))
    expect(await screen.findByText('El servicio ahora está «Publicado».')).toBeInTheDocument()
    const historial = screen.getByRole('region', { name: 'Historial' })
    expect(within(historial).getByText('Se publicó')).toBeInTheDocument()
  })

  it('crea un servicio nuevo como borrador', async () => {
    const user = userEvent.setup()
    renderRoute('/panel/servicios/nuevo')
    await user.type(await screen.findByLabelText('Nombre *'), 'Club de Lectura')
    await user.type(screen.getByLabelText('Institución *'), 'Biblioteca de ejemplo')
    await user.click(screen.getByRole('button', { name: 'Crear borrador' }))
    expect(await screen.findByRole('heading', { name: 'Club de Lectura' })).toBeInTheDocument()
    expect(screen.getAllByText('Borrador').length).toBeGreaterThan(0)
  })
})
