import { mainNav } from '../../app/navigation'
import { normalize } from '../territorio/filterServices'

/*
 * Búsqueda en el texto visible de la página (como el «buscar» del navegador): recorre las
 * secciones de `main` y devuelve cada bloque de texto que contiene todas las palabras.
 */

export interface PageMatch {
  element: Element
  section: string
  /** Texto completo del bloque. */
  text: string
  /** Fragmento alrededor de la coincidencia, partido para resaltar la palabra. */
  before: string
  match: string
  after: string
}

/** Bloques de texto con estructura propia. */
const STRUCTURAL = 'h1, h2, h3, h4, p, li, dt, dd, th, td, figcaption, blockquote'
/** Elementos en línea que solo cuentan solos si no están dentro de un bloque. */
const INLINE = 'a, button, label'
const BLOCKS = `${STRUCTURAL}, ${INLINE}`
const MAX_MATCHES = 8
const CONTEXT = 40

const sectionLabels = new Map(mainNav.map((item) => [item.id, item.label]))

/** Normaliza carácter a carácter, guardando a qué posición original corresponde cada uno. */
function normalizeWithMap(text: string) {
  let normalized = ''
  const positions: number[] = []
  for (let i = 0; i < text.length; i++) {
    const piece = normalize(text[i])
    normalized += piece
    for (let j = 0; j < piece.length; j++) positions.push(i)
  }
  return { normalized, positions }
}

function isVisible(element: Element) {
  if (element.closest('[hidden], [aria-hidden="true"], dialog')) return false
  return element.checkVisibility?.() ?? true
}

export function searchPage(query: string, root: ParentNode = document): PageMatch[] {
  const words = normalize(query.trim()).split(/\s+/).filter(Boolean)
  if (words.length === 0) return []

  const matches: PageMatch[] = []
  const seen = new Set<string>()
  const blocks = root.querySelectorAll(`main section[id] :is(${BLOCKS})`)

  for (const element of blocks) {
    // Cada texto cuenta una vez: un bloque con otros bloques dentro cede a los internos, y un
    // enlace o botón dentro de un párrafo forma parte de ese párrafo.
    if (element.querySelector(STRUCTURAL)) continue
    if (element.matches(INLINE) && element.parentElement?.closest(STRUCTURAL)) continue
    // innerText separa las partes de una tarjeta como se ven; jsdom (pruebas) no lo tiene.
    const raw = (element as HTMLElement).innerText ?? element.textContent ?? ''
    const text = raw.replace(/\s+/g, ' ').trim()
    if (!text || seen.has(text)) continue
    const { normalized, positions } = normalizeWithMap(text)
    if (!words.every((word) => normalized.includes(word))) continue
    if (!isVisible(element)) continue
    seen.add(text)

    const at = normalized.indexOf(words[0])
    const start = positions[at]
    const end = positions[at + words[0].length - 1] + 1
    const from = Math.max(0, start - CONTEXT)
    const to = Math.min(text.length, end + CONTEXT)
    const sectionId = element.closest('section[id]')?.id ?? ''
    matches.push({
      element,
      section: sectionLabels.get(sectionId) ?? 'Página',
      text,
      before: (from > 0 ? '…' : '') + text.slice(from, start),
      match: text.slice(start, end),
      after: text.slice(end, to) + (to < text.length ? '…' : ''),
    })
    if (matches.length === MAX_MATCHES) break
  }
  return matches
}

/** Lleva la vista al bloque encontrado y lo resalta un momento. */
export function revealMatch(element: Element) {
  element.scrollIntoView({ block: 'center' })
  element.classList.remove('site-search-hit')
  // Fuerza el reinicio de la animación si se elige el mismo resultado dos veces.
  void (element as HTMLElement).offsetWidth
  element.classList.add('site-search-hit')
  window.setTimeout(() => element.classList.remove('site-search-hit'), 2400)
}
