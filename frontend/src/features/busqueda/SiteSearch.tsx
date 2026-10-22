import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Icon } from '../../components/Icon'
import { searchSite } from './searchIndex'
import './SiteSearch.css'

/** Lupa del encabezado: abre una búsqueda por todo el contenido de la página. */
export function SiteSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const results = searchSite(query)
  const trimmed = query.trim()

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
            // Un clic en el fondo (fuera del panel) cierra la búsqueda.
            if (event.target === event.currentTarget) close()
          }}
        >
          <div className="site-search__panel">
            <div className="site-search__bar">
              <Icon name="search" size={20} />
              <h2 id={titleId} className="visually-hidden">
                Buscar en NEXO JOVEN 360
              </h2>
              <input
                type="search"
                className="site-search__input"
                placeholder="Busca servicios, ejercicios, secciones…"
                aria-label="Buscar en la página"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoComplete="off"
                autoFocus
              />
              <button type="button" className="site-search__close" onClick={close}>
                <Icon name="close" size={20} label="Cerrar búsqueda" />
              </button>
            </div>

            <div className="site-search__body" aria-live="polite">
              {!trimmed && (
                <p className="site-search__hint">
                  Escribe lo que buscas: un servicio, un barrio, «respiración», «empleo»…
                </p>
              )}
              {trimmed && results.length === 0 && (
                <p className="site-search__hint">
                  No encontramos resultados para «{trimmed}». Prueba con otra palabra.
                </p>
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
