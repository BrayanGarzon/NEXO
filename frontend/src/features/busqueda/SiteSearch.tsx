import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Icon } from '../../components/Icon'
import { revealMatch, searchPage, type PageMatch } from './pageText'
import { normalize } from '../territorio/filterServices'
import { searchSite } from './searchIndex'
import './SiteSearch.css'

/** Lupa del encabezado: abre una búsqueda por todo el contenido de la página. */
export function SiteSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [pageMatches, setPageMatches] = useState<PageMatch[]>([])
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const results = searchSite(query)
  const trimmed = query.trim()
  const empty = pageMatches.length === 0 && results.length === 0

  function handleQuery(value: string) {
    setQuery(value)
    // Una tarjeta que ya sale en otro grupo (empieza por el título de un servicio o de una
    // opción de Brújula) no se repite en «En la página».
    const titles = searchSite(value).flatMap(({ entries }) =>
      entries.map((item) => normalize(item.title)),
    )
    setPageMatches(
      searchPage(value).filter((match) => {
        const text = normalize(match.text)
        return !titles.some((title) => text.startsWith(title))
      }),
    )
  }

  function goToMatch(match: PageMatch) {
    close()
    // Tras cerrar la ventana, para que el desplazamiento no lo deshaga el foco devuelto.
    requestAnimationFrame(() => revealMatch(match.element))
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !open) return
    // jsdom (pruebas) no implementa showModal: se abre sin modo modal.
    if (typeof dialog.showModal === 'function') dialog.showModal()
    else dialog.setAttribute('open', '')
  }, [open])

  function close() {
    dialogRef.current?.close?.()
    setOpen(false)
    setQuery('')
    setPageMatches([])
  }

  return (
    <>
      <button
        type="button"
        className="site-header__icon-link"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <Icon name="search" label="Buscar en la página" />
      </button>

      {open && (
        <dialog
          ref={dialogRef}
          className="site-search"
          aria-labelledby={titleId}
          onClose={close}
          onClick={(event) => {
            // Un clic fuera de la barra y de los resultados cierra la búsqueda.
            const target = event.target as Element
            if (!target.closest('.site-search__bar, .site-search__body')) close()
          }}
        >
          <div className="site-search__panel">
            <div className="site-search__bar">
              <h2 id={titleId} className="visually-hidden">
                Buscar en NEXO JOVEN 360
              </h2>
              <input
                type="search"
                className="site-search__input"
                placeholder="Buscar en toda la página…"
                aria-label="Buscar en la página"
                value={query}
                onChange={(event) => handleQuery(event.target.value)}
                onKeyDown={(event) => {
                  // En un campo de búsqueda el navegador usa Escape para borrar: aquí cierra.
                  if (event.key === 'Escape') {
                    event.preventDefault()
                    close()
                  }
                }}
                autoComplete="off"
                autoFocus
              />
              <span className="site-search__icon">
                <Icon name="search" size={20} />
              </span>
            </div>

            {/* Los resultados solo aparecen al escribir; Escape o un clic fuera cierran. */}
            <div className="site-search__body" aria-live="polite" hidden={!trimmed}>
              {trimmed && empty && (
                <p className="site-search__hint">
                  No encontramos resultados para «{trimmed}». Prueba con otra palabra.
                </p>
              )}
              {pageMatches.length > 0 && (
                <section className="site-search__group" aria-label="En la página">
                  <h3 className="site-search__group-title">En la página</h3>
                  <ul className="site-search__list">
                    {pageMatches.map((match, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          className="site-search__result"
                          onClick={() => goToMatch(match)}
                        >
                          <span className="site-search__result-icon">
                            <Icon name="search" size={18} />
                          </span>
                          <span className="site-search__result-text">
                            <span className="site-search__result-title">{match.section}</span>
                            <span className="site-search__result-desc">
                              {match.before}
                              <mark>{match.match}</mark>
                              {match.after}
                            </span>
                          </span>
                          <Icon name="chevron-right" size={18} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {results.map(({ group, entries }) => (
                <section key={group} className="site-search__group" aria-label={group}>
                  <h3 className="site-search__group-title">{group}</h3>
                  <ul className="site-search__list">
                    {entries.map((item) => (
                      <li key={item.id}>
                        <Link to={item.to} className="site-search__result" onClick={close}>
                          <span className="site-search__result-icon">
                            <Icon name={item.icon} size={18} />
                          </span>
                          <span className="site-search__result-text">
                            <span className="site-search__result-title">{item.title}</span>
                            <span className="site-search__result-desc">{item.description}</span>
                          </span>
                          <Icon name="chevron-right" size={18} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
              {trimmed && (
                <Link
                  to={`/?q=${encodeURIComponent(trimmed)}#territorio`}
                  className="site-search__all"
                  onClick={close}
                >
                  Buscar «{trimmed}» en el mapa de servicios
                  <Icon name="arrow-right" size={18} />
                </Link>
              )}
            </div>
          </div>
        </dialog>
      )}
    </>
  )
}
