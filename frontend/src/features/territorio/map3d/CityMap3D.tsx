import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MutableRefObject,
} from 'react'
import { Vector3 } from 'three'
import { prefersReducedMotion } from '../../../app/useSectionNavigation'
import { Icon } from '../../../components/Icon'
import { categories } from '../../../content/categories'
import type { DemoService } from '../../../types/catalog'
import { CAMERA_OFFSET, type MapApi } from './camera'
import { CameraRig } from './CameraRig'
import { buildCity, CITY_HALF, CITY_RIM, type Vec2 } from './cityLayout'
import { CityModel } from './CityModel'
import { createCityResources } from './cityResources'
import { chooseQuality, readDeviceHints } from './quality'
import { MARKER_HEIGHT, ServiceMarkers } from './ServiceMarkers'
import './CityMap3D.css'

export interface CityMap3DProps {
  /** Servicios que pasan los filtros (los que tienen marcador). */
  services: DemoService[]
  /** Todo el catálogo cargado: fija la distribución de la ciudad. */
  allServices: DemoService[]
  selectedId: string | null
  onSelect: (id: string) => void
  apiRef: MutableRefObject<MapApi | null>
  onContextLost: () => void
}

const HINT_MS = 2200
/** Avisos ya mostrados en esta visita: cada uno aparece una sola vez. */
const shownHints = new Set<string>()

/** Sitúa cada pin HTML sobre su mástil 3D, solo en los fotogramas que se dibujan. */
function PinProjector({
  hubs,
  getPins,
  ids,
}: {
  hubs: Map<string, Vec2>
  getPins: () => Map<string, HTMLLIElement>
  ids: string
}) {
  const invalidate = useThree((state) => state.invalidate)
  const point = useMemo(() => new Vector3(), [])
  // Los pines nuevos (al cambiar filtros) necesitan un fotograma para colocarse.
  useEffect(() => invalidate(), [ids, invalidate])
  useFrame(({ camera, size }) => {
    for (const [id, element] of getPins()) {
      const hub = hubs.get(id)
      if (!hub) continue
      point.set(hub.x, MARKER_HEIGHT, hub.z).project(camera)
      const x = ((point.x + 1) / 2) * size.width
      const y = ((1 - point.y) / 2) * size.height
      const inside = x > -24 && x < size.width + 24 && y > 0 && y < size.height + 48
      element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      element.style.visibility = inside ? 'visible' : 'hidden'
    }
  })
  return null
}

/**
 * Ciudad 3D ilustrativa de Nexo Territorio (carga diferida). No contiene lógica de negocio:
 * recibe los servicios ya filtrados y la selección desde TerritorioSection.
 */
export default function CityMap3D({
  services,
  allServices,
  selectedId,
  onSelect,
  apiRef,
  onContextLost,
}: CityMap3DProps) {
  const quality = useMemo(() => chooseQuality(readDeviceHints()), [])
  const [reduceMotion] = useState(prefersReducedMotion)
  const layout = useMemo(
    () => buildCity(allServices, { treeDensity: quality.treeDensity }),
    [allServices, quality.treeDensity],
  )
  const resources = useMemo(() => createCityResources(), [])
  useEffect(() => () => resources.dispose(), [resources])

  // Al desmontar, R3F fuerza la pérdida del contexto WebGL: eso no es un fallo.
  const mounted = useRef(true)
  useLayoutEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const home = useMemo(() => [...layout.hubs.values()], [layout])
  const visibleIds = useMemo(() => new Set(services.map((service) => service.id)), [services])
  // Contenedor de gestos (lienzo + pines). Se guarda en el estado para montar el lienzo
  // solo cuando existe: R3F conecta sus eventos a él al crearse.
  const [surface, setSurface] = useState<HTMLDivElement | null>(null)
  const getSurface = useCallback(() => surface, [surface])
  const pinListRef = useRef<HTMLUListElement>(null)

  // Con ratón, el clic en un pin es para seleccionar: no debe llegar a MapControls, que
  // capturaría el puntero y desviaría el clic. Los gestos táctiles sí pasan (pellizco).
  useEffect(() => {
    const list = pinListRef.current
    if (!list) return
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && (event.target as Element).closest('button')) {
        event.stopPropagation()
      }
    }
    list.addEventListener('pointerdown', onPointerDown)
    return () => list.removeEventListener('pointerdown', onPointerDown)
  }, [])
  const pins = useRef(new Map<string, HTMLLIElement>())
  const getPins = useCallback(() => pins.current, [])
  const wheelActive = useRef(false)
  const [hint, setHint] = useState<string | null>(null)
  const hintTimer = useRef(0)

  const showHint = useCallback((text: string) => {
    if (shownHints.has(text)) return
    shownHints.add(text)
    setHint(text)
    window.clearTimeout(hintTimer.current)
    hintTimer.current = window.setTimeout(() => setHint(null), HINT_MS)
  }, [])
  useEffect(() => () => window.clearTimeout(hintTimer.current), [])

  const onWheelBlocked = useCallback(
    () => showHint('Haz clic en el mapa o mantén Ctrl para acercar con la rueda'),
    [showHint],
  )
  const onInteract = useCallback(() => {
    wheelActive.current = true
  }, [])

  // Al seleccionar un servicio (en el mapa, la lista o la URL), la cámara lo centra.
  useEffect(() => {
    const hub = selectedId ? layout.hubs.get(selectedId) : undefined
    if (!hub) return
    // Espera a que la cámara esté lista en el primer montaje.
    const frame = requestAnimationFrame(() => apiRef.current?.focus(hub))
    return () => cancelAnimationFrame(frame)
  }, [selectedId, layout, apiRef])

  // Al cambiar los filtros (sin selección), la cámara encuadra los servicios que quedan.
  const visibleKey = [...visibleIds].sort().join()
  const lastVisibleKey = useRef(visibleKey)
  useEffect(() => {
    if (lastVisibleKey.current === visibleKey) return
    lastVisibleKey.current = visibleKey
    if (selectedId) return
    const points = services
      .map((service) => layout.hubs.get(service.id))
      .filter((point): point is Vec2 => point !== undefined)
    if (points.length === 0 || points.length === layout.hubs.size) apiRef.current?.reset()
    else apiRef.current?.fitTo(points)
  }, [visibleKey, selectedId, services, layout, apiRef])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return
    const api = apiRef.current
    if (!api) return
    const step = 80
    const actions: Record<string, () => void> = {
      ArrowLeft: () => api.panBy(-step, 0),
      ArrowRight: () => api.panBy(step, 0),
      ArrowUp: () => api.panBy(0, step),
      ArrowDown: () => api.panBy(0, -step),
      '+': api.zoomIn,
      '=': api.zoomIn,
      '-': api.zoomOut,
      '0': api.reset,
    }
    const action = actions[event.key]
    if (!action) return
    event.preventDefault()
    action()
  }

  return (
    <div
      ref={setSurface}
      className="map3d"
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') wheelActive.current = false
      }}
      onPointerDown={() => (wheelActive.current = true)}
      onTouchMove={(event) => {
        if (event.touches.length === 1) showHint('Usa dos dedos para mover y acercar el mapa')
      }}
    >
      <div
        className="map3d__viewport"
        tabIndex={0}
        role="group"
        aria-roledescription="mapa"
        aria-label="Ciudad 3D ilustrativa. Flechas para desplazarte, + y − para acercar o alejar, 0 para restablecer."
        onKeyDown={handleKeyDown}
      >
        {surface && (
          <Canvas
            className="map3d__canvas"
            // Los eventos 3D se escuchan en el contenedor: MapControls captura ahí el puntero.
            eventSource={surface}

            orthographic
            flat
            frameloop="demand"
            dpr={quality.dpr}
            shadows={quality.shadows ? 'percentage' : false}
            camera={{ position: CAMERA_OFFSET.toArray(), zoom: 10, near: 1, far: 400 }}
            gl={{ antialias: quality.antialias, alpha: true, powerPreference: 'high-performance' }}
            onCreated={({ gl, setEvents }) => {
              // Coordenadas del puntero relativas al contenedor de gestos (no al elemento
              // que recibe el evento, que puede ser el propio contenedor por la captura).
              setEvents({
                compute: (event, state) => {
                  const rect = surface.getBoundingClientRect()
                  state.pointer.set(
                    ((event.clientX - rect.left) / rect.width) * 2 - 1,
                    -((event.clientY - rect.top) / rect.height) * 2 + 1,
                  )
                  state.raycaster.setFromCamera(state.pointer, state.camera)
                },
              })
              gl.domElement.addEventListener('webglcontextlost', (event) => {
                if (!mounted.current) return
                event.preventDefault()
                onContextLost()
              })
            }}
          >
            <hemisphereLight args={['#fff8ea', '#9fd2bb', 1.6]} />
            <directionalLight
              position={[24, 44, 14]}
              intensity={2.4}
              color="#fff1d6"
              castShadow={quality.shadows}
              shadow-mapSize={[2048, 2048]}
              shadow-bias={-0.0004}
              shadow-normalBias={0.02}
              shadow-camera-left={-CITY_HALF - CITY_RIM}
              shadow-camera-right={CITY_HALF + CITY_RIM}
              shadow-camera-top={CITY_HALF + CITY_RIM}
              shadow-camera-bottom={-CITY_HALF - CITY_RIM}
              shadow-camera-near={1}
              shadow-camera-far={140}
            />
            <CityModel layout={layout} resources={resources} shadows={quality.shadows} />
            <ServiceMarkers
              services={allServices}
              hubs={layout.hubs}
              visibleIds={visibleIds}
              selectedId={selectedId}
              onSelect={onSelect}
              resources={resources}
              shadows={quality.shadows}
              reduceMotion={reduceMotion}
            />
            <CameraRig
              apiRef={apiRef}
              home={home}
              getSurface={getSurface}
              wheelActiveRef={wheelActive}
              onWheelBlocked={onWheelBlocked}
              onInteract={onInteract}
            />
            <PinProjector hubs={layout.hubs} getPins={getPins} ids={[...visibleIds].join()} />
          </Canvas>
        )}
      </div>

      <ul ref={pinListRef} className="map3d__pins" aria-label="Servicios en el mapa">
        {services.map((service) => {
          const category = categories[service.category]
          const selected = service.id === selectedId
          return (
            <li
              key={service.id}
              className={selected ? 'map3d__pin map3d__pin--selected' : 'map3d__pin'}
              ref={(element) => {
                if (element) pins.current.set(service.id, element)
                else pins.current.delete(service.id)
              }}
            >
              <button
                type="button"
                className={['map-pin', `map-pin--${category.tone}`, selected && 'map-pin--selected']
                  .filter(Boolean)
                  .join(' ')}
                aria-pressed={selected}
                onClick={() => onSelect(service.id)}
              >
                <Icon name={category.icon} size={18} />
                <span className="visually-hidden">{service.name}</span>
              </button>
              {selected && (
                <span className="map3d__pin-name" aria-hidden="true">
                  {service.name}
                </span>
              )}
            </li>
          )
        })}
      </ul>

      <p className="map3d__hint" role="status">
        {hint}
      </p>
    </div>
  )
}
