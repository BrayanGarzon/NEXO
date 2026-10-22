import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { SearchField } from '../../components/SearchField'
import { StatusMessage } from '../../components/StatusMessage'
import { Chip, DemoTag } from '../../components/Tag'
import { categories, categoryOrder } from '../../content/categories'
import type { ServiceCategory } from '../../types/catalog'
import { FeaturedServices, territorioExplorarId } from './FeaturedServices'
import { filterServices, isServiceCategory } from './filterServices'
import { MapCanvas } from './MapCanvas'
import { ServiceDetail } from './ServiceDetail'
import { useDemoServices } from './useDemoServices'
import './TerritorioSection.css'

export function TerritorioSection() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const rawCategory = params.get('categoria')
  const category = isServiceCategory(rawCategory) ? rawCategory : null
  const selectedId = params.get('servicio')
  const verifiedOnly = params.get('verificados') === '1'
  const [draft, setDraft] = useState(query)
  const [syncedQuery, setSyncedQuery] = useState(query)

  // Si la consulta cambia desde fuera (buscador del inicio), actualiza el campo.
  if (query !== syncedQuery) {
    setSyncedQuery(query)
    setDraft(query)
  }

  // En desarrollo, ?simular=error permite revisar el estado de error.
  const simulate = import.meta.env.DEV && params.get('simular') === 'error' ? 'error' : undefined
  const { state, retry } = useDemoServices(simulate)

  function update(changes: Record<string, string | null>) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        for (const [key, value] of Object.entries(changes)) {
          if (value) next.set(key, value)
          else next.delete(key)
        }
        return next
      },
      { replace: true },
    )
  }

  function selectCategory(value: ServiceCategory | null) {
    update({ categoria: value, servicio: null })
  }

  function clearFilters() {
    setDraft('')
    update({ q: null, categoria: null, verificados: null, servicio: null })
  }

  const results =
    state.status === 'ready'
      ? filterServices(state.services, { query, category, verifiedOnly })
      : []
  const selected =
    state.status === 'ready'
      ? state.services.find((service) => service.id === selectedId)
      : undefined
  const hasFilters = Boolean(query || category || verifiedOnly)

  return (
    <section id="territorio" className="territorio" aria-labelledby="territorio-title">
      <div className="territorio__toolbar container">
        <div className="territorio__heading">
          <p className="section-eyebrow">
            <Icon name="map-pin" size={18} /> Nexo Territorio
          </p>
          <h2 id="territorio-title">Explora servicios en tu ciudad</h2>
          <DemoTag />
        </div>
        <div className="territorio__search">
          <SearchField
            label="Buscar servicios, zonas o palabras clave"
            placeholder="Buscar servicios, zonas o palabras clave…"
            value={draft}
            onChange={setDraft}
            onSubmit={(value) => update({ q: value || null, servicio: null })}
          />
        </div>
        <div className="territorio__filters" role="group" aria-label="Filtrar por categoría">
          <Chip selected={category === null} onClick={() => selectCategory(null)}>
            Todos
          </Chip>
          {categoryOrder.map((value) => (
            <Chip
              key={value}
              icon={categories[value].icon}
              selected={category === value}
              onClick={() => selectCategory(category === value ? null : value)}
            >
              {categories[value].label}
            </Chip>
          ))}
          <Chip
            icon="verified"
            selected={verifiedOnly}
            onClick={() => update({ verificados: verifiedOnly ? null : '1' })}
          >
            Solo verificados
          </Chip>
        </div>
      </div>

      <FeaturedServices />

      <div id={territorioExplorarId} className="territorio__body container">
        <section className="territorio__results" aria-labelledby="resultados-title">
          <h3 id="resultados-title" className="territorio__results-title">
            {state.status === 'ready'
              ? `${results.length} ${results.length === 1 ? 'servicio' : 'servicios'}`
              : 'Servicios'}
          </h3>

          {state.status === 'loading' && (
            <StatusMessage kind="loading" title="Cargando servicios…" />
          )}

          {state.status === 'error' && (
            <StatusMessage
              kind="error"
              title="No pudimos cargar los servicios"
              description="Revisa tu conexión e inténtalo de nuevo."
              action={
                <Button variant="secondary" size="sm" iconStart="refresh" onClick={retry}>
                  Reintentar
                </Button>
              }
            />
          )}

          {state.status === 'ready' && results.length === 0 && (
            <StatusMessage
              kind="empty"
              title="No encontramos servicios"
              description="Prueba con otras palabras o quita algunos filtros."
              action={
                hasFilters && (
                  <Button variant="secondary" size="sm" onClick={clearFilters}>
                    Quitar filtros
                  </Button>
                )
              }
            />
          )}

          {results.length > 0 && (
            <ul className="result-list">
              {results.map((service) => {
                const meta = categories[service.category]
                const active = service.id === selectedId
                return (
                  <li key={service.id}>
                    <button
                      type="button"
                      className={active ? 'result-item result-item--active' : 'result-item'}
                      aria-pressed={active}
                      onClick={() => update({ servicio: service.id })}
                    >
                      <span className={`result-item__dot result-item__dot--${meta.tone}`}>
                        <Icon name={meta.icon} size={18} />
                      </span>
                      <span className="result-item__text">
                        <span className="result-item__name">{service.name}</span>
                        <span className="result-item__meta">
                          {meta.label} · Comuna {service.comuna} ·{' '}
                          {service.distanceKm.toLocaleString('es-CO')} km
                        </span>
                      </span>
                      {service.verified && (
                        <Icon
                          name="verified"
                          size={18}
                          className="result-item__verified"
                          label="Verificado"
                        />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <div className={selected ? 'territorio__map territorio__map--detail' : 'territorio__map'}>
          <MapCanvas
            services={results}
            selectedId={selectedId}
            onSelect={(id) => update({ servicio: id })}
          />
          {selected && (
            <ServiceDetail service={selected} onClose={() => update({ servicio: null })} />
          )}
        </div>
      </div>
    </section>
  )
}
