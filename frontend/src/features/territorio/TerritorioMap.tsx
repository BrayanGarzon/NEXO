import { lazy, Suspense, useRef, useState } from 'react'
import { useRevealOnView } from '../../app/useRevealOnView'
import { Icon } from '../../components/Icon'
import type { DemoService } from '../../types/catalog'
import { MapCanvas } from './MapCanvas'
import type { MapApi } from './map3d/camera'
import { MapErrorBoundary } from './map3d/MapErrorBoundary'
import { isWebGLAvailable } from './map3d/webgl'
import './TerritorioMap.css'

// Three.js y la escena solo se descargan cuando hacen falta (no aumentan la carga inicial).
const CityMap3D = lazy(() => import('./map3d/CityMap3D'))

interface TerritorioMapProps {
  /** Servicios que pasan los filtros. */
  services: DemoService[]
  /** Catálogo completo cargado (fija la distribución de la ciudad 3D). */
  allServices: DemoService[]
  selectedId: string | null
  routeService: DemoService | null
  onSelect: (id: string) => void
}

type View = '3d' | '2d'

/**
 * Mapa de Nexo Territorio: ciudad 3D ilustrativa con la vista simple (2D) como alternativa.
 * Ambas vistas reciben los mismos datos; la lógica de filtros y selección vive en
 * TerritorioSection.
 */
export function TerritorioMap({
  services,
  allServices,
  selectedId,
  routeService,
  onSelect,
}: TerritorioMapProps) {
  const [supports3d] = useState(isWebGLAvailable)
  const [view, setView] = useState<View>(supports3d ? '3d' : '2d')
  const [failed, setFailed] = useState(false)
  const apiRef = useRef<MapApi | null>(null)
  const [containerRef, nearViewport] = useRevealOnView<HTMLDivElement>('400px 0px')

  const can3d = supports3d && !failed
  const show3d = can3d && (view === '3d' || routeService !== null)
  const empty = allServices.length > 0 && services.length === 0

  function fail() {
    apiRef.current = null
    setFailed(true)
  }

  return (
    <div ref={containerRef} className={show3d ? 'map-canvas map-canvas--3d' : 'map-canvas'}>
      {show3d ? (
        <MapErrorBoundary onError={fail}>
          <Suspense fallback={<MapLoading />}>
            {nearViewport ? (
              <CityMap3D
                services={services}
                allServices={allServices}
                selectedId={selectedId}
                routeService={routeService}
                onSelect={onSelect}
                apiRef={apiRef}
                onContextLost={fail}
              />
            ) : (
              <MapLoading />
            )}
          </Suspense>
        </MapErrorBoundary>
      ) : (
        <MapCanvas
          services={services}
          selectedId={selectedId}
          routeService={routeService}
          onSelect={onSelect}
        />
      )}

      <div className="map-toolbar" role="toolbar" aria-label="Controles del mapa">
        {show3d && (
          <>
            <button
              type="button"
              className="map-toolbar__button"
              onClick={() => apiRef.current?.zoomIn()}
            >
              <Icon name="plus" size={18} label="Acercar" />
            </button>
            <button
              type="button"
              className="map-toolbar__button"
              onClick={() => apiRef.current?.zoomOut()}
            >
              <Icon name="minus" size={18} label="Alejar" />
            </button>
            <button
              type="button"
              className="map-toolbar__button"
              onClick={() => apiRef.current?.reset()}
            >
              <Icon name="refresh" size={18} label="Restablecer la vista" />
            </button>
          </>
        )}
        {can3d && !routeService && (
          <button
            type="button"
            className="map-toolbar__button map-toolbar__button--text"
            aria-pressed={view === '2d'}
            onClick={() => setView(view === '3d' ? '2d' : '3d')}
          >
            <span className="map-toolbar__long">
              {view === '3d' ? 'Vista simple 2D' : 'Ver en 3D'}
            </span>
            <span className="map-toolbar__short" aria-hidden="true">
              {view === '3d' ? '2D' : '3D'}
            </span>
          </button>
        )}
      </div>

      {failed && (
        <p className="map-canvas__notice" role="status">
          No pudimos mostrar la ciudad 3D en este dispositivo. Mostramos la vista simple.
        </p>
      )}
      {!supports3d && (
        <p className="map-canvas__notice">
          Este navegador no puede mostrar la ciudad 3D. Usamos la vista simple.
        </p>
      )}
      {empty && (
        <p className="map-canvas__notice map-canvas__notice--center" role="status">
          Ningún servicio coincide con estos filtros.
        </p>
      )}
      {routeService && (
        <p id="detalle-acciones-nota" className="map-canvas__route-notice" role="status">
          Ruta esquemática: desde el punto de inicio referencial hasta {routeService.name}. Sigue la
          línea destacada; no representa calles ni distancias reales.
        </p>
      )}

      <p className="map-canvas__badge">
        <Icon name="info" size={16} />
        <span className="map-canvas__badge-long">
          Ciudad ilustrativa: no es un mapa a escala ni muestra ubicaciones reales
        </span>
        <span className="map-canvas__badge-short" aria-hidden="true">
          Ilustrativa: no a escala ni real
        </span>
      </p>
    </div>
  )
}

function MapLoading() {
  return (
    <div className="map-canvas__loading" role="status">
      <Icon name="compass" size={28} />
      <span>Construyendo la ciudad…</span>
    </div>
  )
}
