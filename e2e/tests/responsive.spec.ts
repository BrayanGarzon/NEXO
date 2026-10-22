import { expect, test, type Locator, type Page } from '@playwright/test'

/*
 * Pruebas de diseño adaptable: cada vista debe caber en el ancho de la pantalla, sin
 * desplazamiento horizontal, y sus elementos clave deben verse completos.
 * Se ejecutan en todos los dispositivos de playwright.config.ts (320 px a escritorio).
 */

const TABLET_MAX = 960 // por debajo de 60rem la barra lateral se vuelve cabecera

/** Elementos que se salen de la pantalla (fuera de contenedores con scroll o recorte propios). */
async function elementosDesbordados(page: Page) {
  return page.evaluate(() => {
    const ancho = document.documentElement.clientWidth
    const fuera: string[] = []
    for (const el of Array.from(document.querySelectorAll<HTMLElement>('body *'))) {
      const caja = el.getBoundingClientRect()
      if (caja.width === 0 || caja.height === 0) continue
      let padre = el.parentElement
      let contenido = false
      while (padre && padre !== document.body) {
        if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(padre).overflowX)) {
          contenido = padre.getBoundingClientRect().right <= ancho + 1
          if (contenido) break
        }
        padre = padre.parentElement
      }
      if (contenido) continue
      if (caja.right > ancho + 1 || caja.left < -1) {
        const clase = typeof el.className === 'string' ? el.className.split(' ')[0] : ''
        fuera.push(`${el.tagName.toLowerCase()}${clase ? '.' + clase : ''}`)
      }
    }
    return [...new Set(fuera)]
  })
}

async function comprobarSinDesbordes(page: Page) {
  const { scroll, ancho } = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    ancho: document.documentElement.clientWidth,
  }))
  expect(scroll, 'la página no debe desplazarse a lo ancho').toBeLessThanOrEqual(ancho)
  expect(await elementosDesbordados(page), 'elementos fuera de la pantalla').toEqual([])
}

/**
 * El elemento es visible y cabe completo en el ancho de la pantalla SIN desplazar nada a lo
 * ancho: tras llevarlo a la vista se reinicia todo desplazamiento horizontal, para detectar
 * contenido que solo se vería deslizando una tabla o contenedor de lado.
 */
async function expectCompletoEnPantalla(locator: Locator) {
  await locator.scrollIntoViewIfNeeded()
  await locator.page().evaluate(() => {
    for (const el of Array.from(document.querySelectorAll<HTMLElement>('*'))) el.scrollLeft = 0
    window.scrollTo({ left: 0, top: window.scrollY })
  })
  await expect(locator).toBeVisible()
  const caja = await locator.boundingBox()
  const ancho = locator.page().viewportSize()!.width
  expect(caja, 'el elemento tiene tamaño').not.toBeNull()
  expect(caja!.x).toBeGreaterThanOrEqual(-1)
  expect(caja!.x + caja!.width).toBeLessThanOrEqual(ancho + 1)
}

async function adjuntarCaptura(page: Page, nombre: string) {
  await test.info().attach(nombre, {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  })
}

function esPantallaPequena(page: Page) {
  return page.viewportSize()!.width < TABLET_MAX
}

test.describe('Web pública', () => {
  test('la página de inicio cabe en la pantalla', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await comprobarSinDesbordes(page)
    await adjuntarCaptura(page, 'inicio')
  })
})

test.describe('Panel institucional', () => {
  test('menú del panel adaptado al tamaño', async ({ page }) => {
    await page.goto('/panel/observatorio')
    const menu = page.getByRole('navigation', { name: 'Panel institucional' })
    const principales = ['Dashboard', 'Servicios', 'Verificación']
    const secundarias = ['Categorías', 'Fuentes', 'Usuarios', 'Configuración']
    const mas = menu.getByRole('button', { name: 'Más' })

    for (const nombre of principales) {
      const enlace = menu.getByRole('link', { name: nombre })
      await expectCompletoEnPantalla(enlace)
      if (esPantallaPequena(page)) {
        // Área táctil cómoda (mínimo recomendado 44 px)
        expect((await enlace.boundingBox())!.height).toBeGreaterThanOrEqual(44)
      }
    }

    if (esPantallaPequena(page)) {
      // En celular y tablet las vistas secundarias están dentro de «Más»
      await expectCompletoEnPantalla(mas)
      expect((await mas.boundingBox())!.height).toBeGreaterThanOrEqual(44)
      for (const nombre of secundarias) {
        await expect(menu.getByRole('link', { name: nombre })).toBeHidden()
      }
      await mas.click()
      await expect(mas).toHaveAttribute('aria-expanded', 'true')
    } else {
      await expect(mas).toBeHidden()
    }

    for (const nombre of secundarias) {
      const enlace = menu.getByRole('link', { name: nombre })
      await expectCompletoEnPantalla(enlace)
      if (esPantallaPequena(page)) {
        expect((await enlace.boundingBox())!.height).toBeGreaterThanOrEqual(44)
      }
    }
    await comprobarSinDesbordes(page)

    // Al elegir una vista, el menú se cierra y la vista queda marcada
    await menu.getByRole('link', { name: 'Fuentes' }).click()
    await expect(page).toHaveURL(/\/panel\/fuentes$/)
    if (esPantallaPequena(page)) {
      await expect(mas).toHaveAttribute('aria-expanded', 'false')
      await expect(mas).toHaveClass(/panel-nav__item--active/)
    } else {
      await expect(menu.getByRole('link', { name: 'Fuentes' })).toHaveAttribute(
        'aria-current',
        'page',
      )
    }
    await adjuntarCaptura(page, 'menu')
  })

  test('Observatorio cabe y muestra todos sus bloques', async ({ page }) => {
    await page.goto('/panel/observatorio')
    await expect(page.getByRole('list', { name: 'Resumen del catálogo' })).toBeVisible()
    await comprobarSinDesbordes(page)

    for (const titulo of [
      'Calidad de la información',
      'Servicios por categoría',
      'Actividad reciente',
      'Vigencia de publicados',
      'Necesitan atención',
      'Cobertura de fuentes',
      'Validaciones de calidad',
    ]) {
      await expectCompletoEnPantalla(page.getByRole('heading', { name: titulo }))
    }
    // Antes se cortaban las columnas de la tabla de validaciones
    await expectCompletoEnPantalla(page.getByRole('columnheader', { name: 'Fallidos' }))
    await expectCompletoEnPantalla(
      page.getByRole('columnheader', { name: 'Con fuente oficial' }).first(),
    )
    await adjuntarCaptura(page, 'observatorio')
  })

  test('Fuente Viva: listado con filtros y servicios completos', async ({ page }) => {
    await page.goto('/panel/servicios')
    const primerServicio = page.getByRole('link', { name: 'Semillero de Teatro', exact: true })
    await expect(primerServicio).toBeVisible()
    await comprobarSinDesbordes(page)

    await expectCompletoEnPantalla(page.getByRole('search'))
    await expectCompletoEnPantalla(page.getByRole('link', { name: 'Nuevo servicio' }))

    // Cada servicio muestra nombre, estado, fecha y acciones sin cortarse
    const fila = page.getByRole('row').filter({ has: primerServicio })
    await expectCompletoEnPantalla(primerServicio)
    await expectCompletoEnPantalla(fila.getByText('En revisión'))
    await expectCompletoEnPantalla(fila.getByText('Casa de la cultura (ejemplo)'))
    await expectCompletoEnPantalla(fila.getByRole('link', { name: 'Editar Semillero de Teatro' }))
    await expectCompletoEnPantalla(fila.getByRole('link', { name: 'Revisar Semillero de Teatro' }))

    // Los filtros pueden deslizarse, pero se pueden usar
    const filtros = page.getByRole('group', { name: 'Filtrar por estado' })
    await filtros.getByRole('button', { name: /No vigente/ }).click()
    await expect(
      page.getByRole('link', { name: 'Feria de Primer Empleo', exact: true }),
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Semillero de Teatro', exact: true })).toBeHidden()
    await comprobarSinDesbordes(page)
    await adjuntarCaptura(page, 'fuente-viva')
  })

  test('Fuente Viva: detalle con fuentes, revisión e historial', async ({ page }) => {
    await page.goto('/panel/servicios/sv-linea-escucha')
    await expect(page.getByRole('heading', { name: 'Línea de Escucha Joven' })).toBeVisible()
    await comprobarSinDesbordes(page)

    await expectCompletoEnPantalla(page.getByRole('link', { name: 'Editar' }))
    await expectCompletoEnPantalla(page.getByRole('button', { name: 'Añadir fuente' }))
    await expectCompletoEnPantalla(page.getByRole('button', { name: 'Marcar como no vigente' }))
    await expectCompletoEnPantalla(page.getByRole('heading', { name: 'Historial' }))

    await page.getByRole('button', { name: 'Añadir fuente' }).click()
    await expectCompletoEnPantalla(page.getByLabel('Fecha de consulta *'))
    await expectCompletoEnPantalla(page.getByRole('button', { name: 'Guardar fuente' }))
    await comprobarSinDesbordes(page)
    await adjuntarCaptura(page, 'detalle')
  })

  test('Fuente Viva: formulario de nuevo servicio', async ({ page }) => {
    await page.goto('/panel/servicios/nuevo')
    await expect(page.getByLabel('Nombre *')).toBeVisible()
    await comprobarSinDesbordes(page)
    for (const campo of [
      'Nombre *',
      'Categoría',
      'Institución *',
      'Comuna',
      'Servicios ofrecidos',
    ]) {
      await expectCompletoEnPantalla(page.getByLabel(campo))
    }
    await expectCompletoEnPantalla(page.getByRole('button', { name: 'Crear borrador' }))
    await adjuntarCaptura(page, 'formulario')
  })

  test('Categorías: tarjetas completas y acceso a sus servicios', async ({ page }) => {
    await page.goto('/panel/categorias')
    const lista = page.getByRole('list', { name: 'Categorías del catálogo' })
    await expect(lista).toBeVisible()
    await comprobarSinDesbordes(page)
    for (const nombre of ['Salud mental', 'Recreación']) {
      await expectCompletoEnPantalla(lista.getByRole('heading', { name: nombre }))
    }
    const verCultura = page.getByRole('link', { name: 'Ver servicios de Cultura' })
    await expectCompletoEnPantalla(verCultura)
    await adjuntarCaptura(page, 'categorias')

    await verCultura.click()
    await expect(page).toHaveURL(/categoria=cultura/)
    await expectCompletoEnPantalla(page.getByLabel('Filtrar por categoría'))
    await expect(page.getByRole('link', { name: 'Casa de la Juventud', exact: true })).toBeVisible()
    await comprobarSinDesbordes(page)
  })

  test('Fuentes: listado, filtros y acción completos', async ({ page }) => {
    await page.goto('/panel/fuentes')
    await expect(page.getByRole('list', { name: 'Resumen de fuentes' })).toBeVisible()
    await comprobarSinDesbordes(page)

    const fila = page.getByRole('row').filter({ hasText: 'Boletín de la agencia (ejemplo)' })
    await expectCompletoEnPantalla(fila.getByRole('link', { name: 'Ruta de Empleo Joven' }))
    await expectCompletoEnPantalla(fila.getByText('Antigua'))
    const marcar = fila.getByRole('button', { name: /como consultada hoy/ })
    await expectCompletoEnPantalla(marcar)
    await adjuntarCaptura(page, 'fuentes')

    await marcar.click()
    await expect(page.getByText('quedó consultada hoy.')).toBeVisible()
    await page
      .getByRole('group', { name: 'Filtrar por antigüedad' })
      .getByRole('button', { name: 'Antiguas' })
      .click()
    await expect(page.getByText('No hay fuentes con esos filtros')).toBeVisible()
    await comprobarSinDesbordes(page)
  })

  test('Usuarios: listado, invitación y permisos completos', async ({ page }) => {
    await page.goto('/panel/usuarios')
    await expect(page.getByRole('region', { name: 'Listado de usuarios' })).toBeVisible()
    await comprobarSinDesbordes(page)

    const fila = page.getByRole('row').filter({ hasText: 'Laura Méndez' })
    await expectCompletoEnPantalla(fila.getByText('laura.mendez@example.org'))
    await expectCompletoEnPantalla(fila.getByLabel('Rol de Laura Méndez'))
    await expectCompletoEnPantalla(fila.getByRole('button', { name: 'Desactivar a Laura Méndez' }))
    await expectCompletoEnPantalla(page.getByRole('columnheader', { name: 'Revisión' }))

    await page.getByRole('button', { name: 'Invitar usuario' }).click()
    const formulario = page.getByRole('form', { name: 'Invitar usuario' })
    await expectCompletoEnPantalla(formulario.getByLabel('Correo institucional *'))
    await formulario.getByLabel('Nombre *').fill('Ana Pérez')
    await formulario.getByLabel('Correo institucional *').fill('ana.perez@example.org')
    await formulario.getByLabel('Institución *').fill('Biblioteca (ejemplo)')
    await expectCompletoEnPantalla(formulario.getByRole('button', { name: 'Registrar invitación' }))
    await formulario.getByRole('button', { name: 'Registrar invitación' }).click()
    await expect(page.getByText(/Invitación registrada/)).toBeVisible()
    await comprobarSinDesbordes(page)
    await adjuntarCaptura(page, 'usuarios')
  })

  test('Configuración: formulario completo y guardado', async ({ page }) => {
    await page.goto('/panel/configuracion')
    const aviso = page.getByLabel('Aviso «por vencer» (días)')
    await expect(aviso).toBeVisible()
    await comprobarSinDesbordes(page)
    for (const campo of [
      'Vigencia de un servicio publicado (días)',
      'Antigüedad máxima de una fuente (días)',
      'Aviso «por vencer» (días)',
      'Revisión prolongada (días)',
    ]) {
      await expectCompletoEnPantalla(page.getByLabel(campo))
    }
    await aviso.fill('45')
    const guardar = page.getByRole('button', { name: 'Guardar configuración' })
    await expectCompletoEnPantalla(guardar)
    await guardar.click()
    await expect(page.getByText('Configuración guardada.')).toBeVisible()
    await expectCompletoEnPantalla(
      page.getByRole('button', { name: 'Restablecer datos de demostración' }),
    )
    await comprobarSinDesbordes(page)
    await adjuntarCaptura(page, 'configuracion')
  })
})
