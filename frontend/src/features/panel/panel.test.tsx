import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderRoute } from '../../test/renderRoute'
import { reiniciarDatosPanel } from './services/panelData'

describe('panel institucional', () => {
  beforeEach(() => {
    reiniciarDatosPanel()
    localStorage.removeItem('nexo.panel.servicio-nuevo.borrador')
  })
  afterEach(() => vi.restoreAllMocks())

  it('/panel abre el Observatorio con su resumen', async () => {
    const { router } = renderRoute('/panel')
    expect(await screen.findByRole('heading', { name: 'Resumen general' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/panel/observatorio')
    expect(await screen.findByRole('list', { name: 'Resumen del catálogo' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Servicios por categoría' })).toBeInTheDocument()
    const graficaCategorias = screen.getByRole('region', { name: 'Servicios por categoría' })
    expect(within(graficaCategorias).getByRole('link', { name: 'Salud mental' })).toHaveAttribute(
      'href',
      '/panel/servicios?categoria=salud-mental',
    )
    expect(
      screen.getByRole('heading', { name: 'Distribución de servicios por categoría' }),
    ).toBeInTheDocument()
    const graficaAmplia = screen.getByRole('region', {
      name: 'Gráfica de distribución por categoría',
    })
    expect(within(graficaAmplia).getByRole('link', { name: 'Salud mental' })).toHaveAttribute(
      'href',
      '/panel/servicios?categoria=salud-mental',
    )
    expect(within(graficaAmplia).getAllByText('3 · 20%')).toHaveLength(3)
    expect(
      screen.queryByRole('heading', { name: 'Vigencia de publicados' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Servicios por categoría' }).closest('.panel-card')
        ?.parentElement,
    ).toHaveClass('panel-category-charts')
    expect(
      screen
        .getByRole('heading', { name: 'Distribución de servicios por categoría' })
        .closest('.panel-card')?.parentElement,
    ).toHaveClass('panel-category-charts')
    expect(screen.getByRole('heading', { name: 'Actividad reciente' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Actividad reciente' }).closest('.panel-card')
        ?.parentElement,
    ).toHaveClass('panel-activity-validation')
    expect(
      screen.getByRole('heading', { name: 'Validaciones de calidad' }).closest('.panel-card')
        ?.parentElement,
    ).toHaveClass('panel-activity-validation')
    expect(screen.getByRole('heading', { name: 'Cobertura de fuentes' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Por categoría' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Por comuna' })).toBeInTheDocument()
    const tortaCategoria = screen.getByRole('img', {
      name: /^Distribución de \d+ servicios publicados por categoria$/,
    })
    const tortaComuna = screen.getByRole('img', {
      name: /^Distribución de \d+ servicios publicados por comuna$/,
    })
    expect(tortaCategoria.querySelector('.panel-coverage-chart__depth')).toBeInTheDocument()
    expect(tortaComuna.querySelector('.panel-coverage-chart__depth')).toBeInTheDocument()
    expect(
      [...(tortaCategoria.querySelectorAll('.panel-coverage-chart__percentage') ?? [])].every(
        (etiqueta) => etiqueta.textContent?.endsWith('%'),
      ),
    ).toBe(true)
    expect(
      [...(tortaComuna.querySelectorAll('.panel-coverage-chart__percentage') ?? [])].every(
        (etiqueta) => etiqueta.textContent?.endsWith('%'),
      ),
    ).toBe(true)
    const detalleCategoria = screen.getByRole('list', {
      name: 'Detalle de servicios publicados por categoria',
    })
    expect(getComputedStyle(detalleCategoria).overflowY).toBe('visible')
    expect(getComputedStyle(detalleCategoria).maxHeight).toBe('none')
    expect(
      within(
        screen.getByRole('list', { name: 'Detalle de servicios publicados por categoria' }),
      ).queryByText('Otro'),
    ).not.toBeInTheDocument()
    expect(within(graficaCategorias).queryByRole('link', { name: 'Otro' })).not.toBeInTheDocument()
    expect(within(graficaAmplia).queryByRole('link', { name: 'Otro' })).not.toBeInTheDocument()
    expect(
      screen.getByRole('list', { name: 'Detalle de servicios publicados por comuna' }),
    ).toBeInTheDocument()
  })

  it('el horario se elige en un desplegable de días y horas', async () => {
    const user = userEvent.setup()
    renderRoute('/panel/servicios/nuevo')
    const campo = await screen.findByLabelText('Horario')
    await user.click(screen.getByRole('button', { name: 'Elegir' }))
    const ventana = screen.getByRole('dialog', { name: 'Elegir horario' })

    await user.click(within(ventana).getByRole('button', { name: 'Vie' }))
    await user.selectOptions(within(ventana).getByLabelText('Hasta'), '12:00 m.')
    expect(within(ventana).getByText('Lun – Jue · 8:00 a. m. – 12:00 m.')).toBeVisible()

    await user.click(within(ventana).getByRole('button', { name: 'Aplicar' }))
    expect(campo).toHaveValue('Lun – Jue · 8:00 a. m. – 12:00 m.')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('abre el calendario sin desplazar la página al enfocar la ventana', async () => {
    const user = userEvent.setup()
    const enfocar = vi.spyOn(HTMLElement.prototype, 'focus').mockImplementation(() => {})
    renderRoute('/panel/servicios/nuevo')

    await user.click(await screen.findByRole('button', { name: 'Elegir' }))

    expect(screen.getByRole('dialog', { name: 'Elegir horario' })).toBeInTheDocument()
    expect(enfocar).toHaveBeenCalledWith({ preventScroll: true })
  })

  it('muestra el aviso amarillo junto a Revisar en todas las pestañas de incidencias', async () => {
    const user = userEvent.setup()
    renderRoute('/panel/observatorio')
    await screen.findByRole('heading', { name: 'Necesitan atención' })

    const filtros = screen.getByRole('group', { name: 'Filtrar incidencias' })
    for (const filtro of [
      'Todas',
      'Sin fuente',
      'Fuente antigua',
      'Vencido',
      'Campos incompletos',
      'Revisión prolongada',
    ]) {
      await user.click(within(filtros).getByRole('button', { name: new RegExp(filtro) }))
      const filas = screen.getAllByRole('link', { name: /^Revisar / })
      expect(filas.length).toBeGreaterThan(0)
      for (const boton of filas) {
        const contenedor = boton.closest('.panel-issues__review')
        expect(contenedor?.querySelector('.tag--warning')).toBeInTheDocument()
      }
    }
  })

  it('abre el selector de horario hacia arriba si no cabe debajo del campo', async () => {
    const user = userEvent.setup()
    const alturaOriginal = window.innerHeight
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 400 })
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.classList.contains('panel-horario__abrir')) {
        return { top: 330, bottom: 370, height: 40 } as DOMRect
      }
      if (this.classList.contains('panel-horario__ventana')) {
        return { top: 378, bottom: 710, height: 332 } as DOMRect
      }
      return { top: 0, bottom: 0, height: 0 } as DOMRect
    })

    try {
      renderRoute('/panel/servicios/nuevo')
      await user.click(await screen.findByRole('button', { name: 'Elegir' }))
      const ventana = screen.getByRole('dialog', { name: 'Elegir horario' })
      await waitFor(() => expect(ventana).toHaveClass('panel-horario__ventana--arriba'))
    } finally {
      Object.defineProperty(window, 'innerHeight', {
        configurable: true,
        value: alturaOriginal,
      })
    }
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

  it('permite reactivar un servicio no vigente para enviarlo a revisión', async () => {
    const user = userEvent.setup()
    renderRoute('/panel/servicios/sv-taller-programacion')
    await screen.findByRole('heading', { name: 'Taller de Programación Básica' })
    expect(screen.getByRole('button', { name: 'Eliminar servicio' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reactivar y revisar' }))
    expect(await screen.findByText('El servicio ahora está «En revisión».')).toBeInTheDocument()
  })

  it('pide confirmación antes de eliminar un servicio no vigente', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/panel/servicios/sv-taller-programacion')
    await screen.findByRole('heading', { name: 'Taller de Programación Básica' })
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(true)
    await user.click(screen.getByRole('button', { name: 'Eliminar servicio' }))
    expect(confirmar).toHaveBeenCalledWith(
      '¿Eliminar «Taller de Programación Básica»? Esta acción no se puede deshacer.',
    )
    expect(await screen.findByRole('heading', { name: 'Servicios' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/panel/servicios')
  })

  it('crea un servicio nuevo como borrador', async () => {
    const user = userEvent.setup()
    renderRoute('/panel/servicios/nuevo')
    await user.type(await screen.findByLabelText('Nombre *'), 'Club de Lectura')
    await user.type(screen.getByLabelText('Institución *'), 'Biblioteca de ejemplo')
    await user.type(
      screen.getByLabelText('Motivo de creación *'),
      'Atender la falta de espacios de lectura.',
    )
    await user.click(screen.getByRole('button', { name: 'Crear borrador' }))
    expect(await screen.findByRole('heading', { name: 'Club de Lectura' })).toBeInTheDocument()
    expect(screen.getAllByText('Borrador').length).toBeGreaterThan(0)
    expect(screen.getByText('Atender la falta de espacios de lectura.')).toBeInTheDocument()
  })

  it('restaura el borrador del servicio después de volver a cargar la página', async () => {
    const user = userEvent.setup()
    const primeraVista = renderRoute('/panel/servicios/nuevo')
    await user.type(await screen.findByLabelText('Nombre *'), 'Club de Lectura')
    await user.type(screen.getByLabelText('Institución *'), 'Biblioteca juvenil')
    await user.type(screen.getByLabelText('Resumen'), 'Encuentros semanales')
    await user.type(screen.getByLabelText('Servicios ofrecidos'), 'Lectura en grupo')

    primeraVista.unmount()
    renderRoute('/panel/servicios/nuevo')

    expect(await screen.findByLabelText('Nombre *')).toHaveValue('Club de Lectura')
    expect(screen.getByLabelText('Institución *')).toHaveValue('Biblioteca juvenil')
    expect(screen.getByLabelText('Resumen')).toHaveValue('Encuentros semanales')
    expect(screen.getByLabelText('Servicios ofrecidos')).toHaveValue('Lectura en grupo')
  })

  it('no ofrece la categoría Otro al crear un servicio', async () => {
    renderRoute('/panel/servicios/nuevo')
    await screen.findByLabelText('Categoría')
    expect(screen.queryByRole('option', { name: 'Otro' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('¿Cuál es la categoría? *')).not.toBeInTheDocument()
  })
})
