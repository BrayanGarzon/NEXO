import { afterEach, describe, expect, it, vi } from 'vitest'
import { revealMatch, searchPage } from './pageText'

function page(html: string) {
  document.body.innerHTML = `<main>${html}</main>`
}

describe('searchPage', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('encuentra palabras del texto sin distinguir tildes y marca la coincidencia', () => {
    page(
      `<section id="pausa"><p>Son herramientas de autocuidado; llama al <a href="tel:123">123</a>.</p></section>`,
    )
    const [match] = searchPage('AUTOCUIDADO')
    expect(match.section).toBe('Espacio Pausa')
    expect(match.match).toBe('autocuidado')
    expect(match.before).toBe('Son herramientas de ')
    // El enlace forma parte del párrafo: no aparece como resultado aparte.
    expect(searchPage('123')).toHaveLength(1)
    expect(searchPage('123')[0].element.tagName).toBe('P')
  })

  it('respeta las tildes del texto original al recortar el fragmento', () => {
    page(`<section id="brujula"><p>No es un diagnóstico: es una guía.</p></section>`)
    expect(searchPage('diagnostico')[0].match).toBe('diagnóstico')
  })

  it('ignora el texto oculto y el que está fuera de las secciones', () => {
    page(`
      <p>fuera de sección</p>
      <section id="inicio"><p hidden>oculto</p><p aria-hidden="true">decorado</p></section>`)
    expect(searchPage('fuera')).toEqual([])
    expect(searchPage('oculto')).toEqual([])
    expect(searchPage('decorado')).toEqual([])
  })

  it('cada palabra debe aparecer en el mismo bloque', () => {
    page(
      `<section id="informacion"><p>Información confiable</p><p>Hecho para jóvenes</p></section>`,
    )
    expect(searchPage('confiable jovenes')).toEqual([])
    expect(searchPage('informacion confiable')).toHaveLength(1)
  })

  it('al elegir un resultado lleva la vista al texto y lo resalta', () => {
    page(`<section id="inicio"><p>Hola</p></section>`)
    const element = document.querySelector('p')!
    element.scrollIntoView = vi.fn()
    revealMatch(element)
    expect(element.scrollIntoView).toHaveBeenCalledWith({ block: 'center' })
    expect(element).toHaveClass('site-search-hit')
  })
})
