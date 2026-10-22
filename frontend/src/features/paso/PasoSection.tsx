import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router'
import { Annotation } from '../../components/Annotation'
import { ButtonLink } from '../../components/Button'
import { Doodle } from '../../components/Doodle'
import { Icon } from '../../components/Icon'
import { ServiceThumb } from '../../components/illustrations/ServiceThumb'
import { StatusMessage } from '../../components/StatusMessage'
import { DemoTag } from '../../components/Tag'
import { categories } from '../../content/categories'
import { getAllDemoServicesSync } from '../../services/catalog'
import type { DemoService } from '../../types/catalog'
import { suggestedActions } from './pasoContent'
import { useSavedServices } from './useSavedServices'
import './PasoSection.css'

type Tab = 'opciones' | 'acciones'

export function PasoSection() {
  const { saved, remove } = useSavedServices()
  const [tab, setTab] = useState<Tab>('opciones')
  const [announcement, setAnnouncement] = useState('')
  const listRef = useRef<HTMLUListElement>(null)
  const tabsId = useId()

  // Solo servicios que existen en el catálogo actual (los datos de demostración pueden cambiar).
  const catalog = getAllDemoServicesSync()
  const services = saved
    .map((item) => catalog.find((service) => service.id === item.id))
    .filter((service): service is DemoService => service !== undefined)

  function handleRemove(service: DemoService, index: number) {
    remove(service.id)
    setAnnouncement(`Se quitó ${service.name} de tus opciones.`)
    // Mueve el foco al siguiente elemento (o al anterior) para no perderlo.
    requestAnimationFrame(() => {
      const buttons = listRef.current?.querySelectorAll<HTMLAnchorElement>('.paso-item__view')
      const next = buttons?.[Math.min(index, buttons.length - 1)]
      next?.focus()
    })
  }

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    const next: Tab = tab === 'opciones' ? 'acciones' : 'opciones'
    setTab(next)
    document.getElementById(`${tabsId}-${next}`)?.focus()
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'opciones', label: `Mis opciones (${services.length})` },
    { id: 'acciones', label: 'Acciones sugeridas' },
  ]

  return (
    <section id="mi-siguiente-paso" className="paso container" aria-labelledby="paso-title">
      <header className="paso__header">
        <p className="section-eyebrow">
          <Icon name="steps" size={18} /> Mi siguiente paso
        </p>
        <h2 id="paso-title" className="paso__title hand">
          Tus opciones guardadas
        </h2>
        <p className="paso__lead">A un clic de tu siguiente paso.</p>
        <div className="paso__note" aria-hidden="true">
          <Annotation tone="plain" tilt={-6}>
            Organiza tu propio camino
          </Annotation>
          <Doodle name="leaf" tone="menta" className="paso__leaf" />
        </div>
      </header>

      <div className="paso__card">
        <div className="paso__tabs" role="tablist" aria-label="Mi siguiente paso">
          {tabs.map((item) => (
            <button
              key={item.id}
              id={`${tabsId}-${item.id}`}
              type="button"
              role="tab"
              className="paso__tab"
              aria-selected={tab === item.id}
              aria-controls={`${tabsId}-${item.id}-panel`}
              tabIndex={tab === item.id ? 0 : -1}
              onClick={() => setTab(item.id)}
              onKeyDown={handleTabKey}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          id={`${tabsId}-opciones-panel`}
          role="tabpanel"
          aria-labelledby={`${tabsId}-opciones`}
          hidden={tab !== 'opciones'}
          className="paso__panel"
        >
          {services.length === 0 ? (
            <StatusMessage
              kind="empty"
              title="Aún no has guardado opciones"
              description="En Nexo Territorio, abre un servicio y pulsa «Guardar» para tenerlo a mano aquí."
              action={
                <ButtonLink to="/#territorio" variant="accent" size="sm" iconEnd="arrow-right">
                  Explorar servicios
                </ButtonLink>
              }
            />
          ) : (
            <>
              <div className="paso__meta">
                <DemoTag />
                <span>Se guardan solo en este navegador.</span>
              </div>
              <ul className="paso__list" ref={listRef}>
                {services.map((service, index) => {
                  const category = categories[service.category]
                  return (
                    <li key={service.id} className="paso-item">
                      <ServiceThumb icon={category.icon} tone={category.tone} />
                      <div className="paso-item__body">
                        <h3 className="paso-item__name">{service.name}</h3>
                        <p className="paso-item__summary">{service.summary}</p>
                        <p className="paso-item__meta">
                          <Icon name="map-pin" size={14} /> Comuna {service.comuna} ·{' '}
                          {service.distanceKm.toLocaleString('es-CO')} km
                        </p>
                      </div>
                      <div className="paso-item__actions">
                        <ButtonLink
                          to={`/?servicio=${service.id}#territorio`}
                          variant="accent"
                          size="sm"
                          className="paso-item__view"
                          aria-label={`Ver ${service.name}`}
                        >
                          Ver
                        </ButtonLink>
                        <button
                          type="button"
                          className="paso-item__remove"
                          onClick={() => handleRemove(service, index)}
                        >
                          <Icon name="trash" size={18} label={`Quitar ${service.name}`} />
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
          <p className="visually-hidden" role="status">
            {announcement}
          </p>
          <div className="paso__add">
            <ButtonLink to="/#territorio" variant="accent" iconStart="plus">
              Agregar más opciones
            </ButtonLink>
          </div>
        </div>

        <div
          id={`${tabsId}-acciones-panel`}
          role="tabpanel"
          aria-labelledby={`${tabsId}-acciones`}
          hidden={tab !== 'acciones'}
          className="paso__panel"
        >
          <ul className="paso__actions-list">
            {suggestedActions.map((action) => (
              <li key={action.id}>
                <Link to={action.to} className="paso-action">
                  <span className="paso-action__icon" aria-hidden="true">
                    <Icon name={action.icon} size={20} />
                  </span>
                  <span className="paso-action__text">
                    <span className="paso-action__title">{action.title}</span>
                    <span className="paso-action__description">{action.description}</span>
                  </span>
                  <Icon name="chevron-right" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
