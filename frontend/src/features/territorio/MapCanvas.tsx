import { useState, type CSSProperties } from 'react'
import { categories } from '../../content/categories'
import { Icon } from '../../components/Icon'
import type { DemoService } from '../../types/catalog'

interface MapCanvasProps {
  services: DemoService[]
  selectedId: string | null
  onSelect: (id: string) => void
}

const comunaLabels = [
  { label: 'Comuna 1', x: 12, y: 46 },
  { label: 'Comuna 2', x: 50, y: 14 },
  { label: 'Comuna 3', x: 60, y: 54 },
  { label: 'Comuna 4', x: 70, y: 80 },
  { label: 'Comuna 5', x: 22, y: 20 },
  { label: 'Comuna 7', x: 80, y: 26 },
]

/** Manzanas del esquema (x, y, ancho, alto en %). */
const manzanas = [
  [6, 8, 28, 22],
  [40, 6, 22, 18],
  [68, 10, 26, 20],
  [8, 36, 22, 26],
  [62, 38, 30, 22],
  [12, 70, 26, 22],
  [70, 66, 24, 28],
]

const tonos = ['arena', 'marfil', 'arena', 'lila', 'marfil', 'menta', 'arena', 'coral']

/** Edificios generados de forma determinista dentro de cada manzana. */
const edificios = manzanas.flatMap(([mx, my, mw, mh], m) => {
  const columnas = mw > 24 ? 3 : 2
  const filas = mh > 21 ? 2 : 1
  const hueco = 1.6
  const ancho = (mw - hueco * (columnas + 1)) / columnas
  const fondo = (mh - hueco * (filas + 1)) / filas
  return Array.from({ length: columnas * filas }, (_, i) => {
    const n = m * 7 + i * 3
    return {
      id: `${m}-${i}`,
      x: mx + hueco + (i % columnas) * (ancho + hueco),
      y: my + hueco + Math.floor(i / columnas) * (fondo + hueco),
      ancho,
      fondo,
      altura: 16 + ((n * 37) % 6) * 9,
      tono: tonos[n % tonos.length],
    }
  })
})

const arboles = [
  [41, 39],
  [45, 37],
  [55, 38],
  [59, 45],
  [57, 55],
  [44, 56],
  [39, 48],
  [3, 34],
  [97, 64],
  [36, 96],
  [64, 4],
  [3, 66],
]

const VISTA_3D = { inclinacion: 52, giro: -22 }
const ZOOM_MIN = 0.8
const ZOOM_MAX = 1.8

/*
 * Mapa ILUSTRADO en 3D (CSS 3D, sin dependencias). Es un esquema, no cartografía real:
 * la cartografía de Villavicencio y su proveedor siguen en la decisión pendiente 7
 * (docs/ARQUITECTURA.md). Marcadores y etiquetas se giran al revés que la cámara para
 * quedar siempre de frente; los marcadores siguen siendo botones accesibles.
 */
export function MapCanvas({ services, selectedId, onSelect }: MapCanvasProps) {
  const [en3d, setEn3d] = useState(true)
  const [giro, setGiro] = useState(VISTA_3D.giro)
  const [zoom, setZoom] = useState(1)

  const seleccionado = services.find((service) => service.id === selectedId)
  const centro = seleccionado?.mapPosition ?? { x: 50, y: 50 }

  const camara = {
    '--tilt': `${en3d ? VISTA_3D.inclinacion : 0}deg`,
    '--rot': `${en3d ? giro : 0}deg`,
    '--zoom': en3d ? zoom * 1.12 : zoom,
    '--cx': `${50 - centro.x}%`,
    '--cy': `${50 - centro.y}%`,
  } as CSSProperties

  function recentrar() {
    setGiro(VISTA_3D.giro)
    setZoom(1)
  }

  return (
    <div className="map-canvas">
      <div
        className={en3d ? 'map-canvas__camera map-canvas__camera--3d' : 'map-canvas__camera'}
        style={camara}
      >
        <div className="map-canvas__ground" aria-hidden="true" />
        <svg
          className="map-canvas__art"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            className="map-canvas__road-edge"
            d="M0 30.8h100M0 35.2h100M33.8 0v100M38.2 0v100M0 61.8h100M0 66.2h100M63.8 0v100M68.2 0v100"
          />
          <path className="map-canvas__road" d="M0 33h100M36 0v100M0 64h100M66 0v100" />
          <path className="map-canvas__road-marking" d="M0 33h100M36 0v100M0 64h100M66 0v100" />
          <path
            className="map-canvas__river-bank"
            d="M-4 90C14 80 28 86 40 74s20-26 36-30 22-14 30-26"
          />
          <path
            className="map-canvas__river"
            d="M-4 90C14 80 28 86 40 74s20-26 36-30 22-14 30-26"
          />
          <path
            className="map-canvas__river-highlight"
            d="M-4 90C14 80 28 86 40 74s20-26 36-30 22-14 30-26"
          />
          <path className="map-canvas__park" d="M42 40c6-4 14-2 16 4s-2 12-10 12-12-10-6-16z" />
          <path className="map-canvas__park-path" d="M43 48c4-8 10-8 15-2M46 54c3-4 6-5 10-5" />
        </svg>

        {edificios.map((edificio) => (
          <div
            key={edificio.id}
            className={`map-building map-building--${edificio.tono}`}
            style={
              {
                left: `${edificio.x}%`,
                top: `${edificio.y}%`,
                width: `${edificio.ancho}%`,
                height: `${edificio.fondo}%`,
                '--h': `${edificio.altura}px`,
              } as CSSProperties
            }
            aria-hidden="true"
          >
            <span className="map-building__face map-building__face--n" />
            <span className="map-building__face map-building__face--s" />
            <span className="map-building__face map-building__face--e" />
            <span className="map-building__face map-building__face--o" />
            <span className="map-building__roof" />
          </div>
        ))}

        {arboles.map(([x, y]) => (
          <span
            key={`${x}-${y}`}
            className="map-anchor"
            style={{ left: `${x}%`, top: `${y}%` }}
            aria-hidden="true"
          >
            <span className="map-billboard map-tree" />
          </span>
        ))}

        {comunaLabels.map((comuna) => (
          <span
            key={comuna.label}
            className="map-anchor map-anchor--alto"
            style={{ left: `${comuna.x}%`, top: `${comuna.y}%` }}
            aria-hidden="true"
          >
            <span className="map-billboard map-canvas__label">{comuna.label}</span>
          </span>
        ))}

        <ul className="map-canvas__pins" aria-label="Servicios en el mapa">
          {services.map((service) => {
            const category = categories[service.category]
            const selected = service.id === selectedId
            return (
              <li
                key={service.id}
                className="map-anchor map-anchor--pin"
                style={{ left: `${service.mapPosition.x}%`, top: `${service.mapPosition.y}%` }}
              >
                <span className="map-pole" aria-hidden="true" />
                <span className="map-billboard map-billboard--pin">
                  <button
                    type="button"
                    className={[
                      'map-pin',
                      `map-pin--${category.tone}`,
                      selected && 'map-pin--selected',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-pressed={selected}
                    onClick={() => onSelect(service.id)}
                  >
                    <Icon name={category.icon} size={selected ? 22 : 18} />
                    <span className="visually-hidden">{service.name}</span>
                  </button>
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="map-controls" role="group" aria-label="Controles del mapa">
        <button type="button" className="map-controls__btn" onClick={recentrar}>
          <Icon name="locate" size={18} label="Recentrar el mapa" />
        </button>
        <button
          type="button"
          className="map-controls__btn map-controls__btn--text"
          aria-pressed={en3d}
          aria-label="Vista en 3D"
          onClick={() => setEn3d((valor) => !valor)}
        >
          3D
        </button>
        {en3d && (
          <button
            type="button"
            className="map-controls__btn"
            onClick={() => setGiro((valor) => valor - 45)}
          >
            <Icon name="refresh" size={18} label="Girar el mapa" />
          </button>
        )}
        <button
          type="button"
          className="map-controls__btn"
          disabled={zoom >= ZOOM_MAX}
          onClick={() => setZoom((valor) => Math.min(ZOOM_MAX, valor + 0.2))}
        >
          <Icon name="plus" size={18} label="Acercar" />
        </button>
        <button
          type="button"
          className="map-controls__btn"
          disabled={zoom <= ZOOM_MIN}
          onClick={() => setZoom((valor) => Math.max(ZOOM_MIN, valor - 0.2))}
        >
          <Icon name="minus" size={18} label="Alejar" />
        </button>
      </div>

      <p className="map-canvas__badge">
        <Icon name="info" size={16} /> Vista ilustrada · no es un mapa a escala
      </p>
    </div>
  )
}
