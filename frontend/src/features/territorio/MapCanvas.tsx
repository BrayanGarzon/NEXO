import type { CSSProperties } from 'react'
import { categories } from '../../content/categories'
import { Icon } from '../../components/Icon'
import type { DemoService } from '../../types/catalog'

interface MapCanvasProps {
  services: DemoService[]
  selectedId: string | null
  onSelect: (id: string) => void
}

/*
 * Posiciones de las etiquetas (en %), calculadas para no solaparse con los marcadores:
 * `desktop` para el mapa ancho y `mobile` para el mapa de 22rem de alto (< 56rem).
 * Cada etiqueta queda junto a un marcador de su comuna. Si cambian los marcadores
 * (mocks/demoServices.ts), hay que revisarlas.
 */
const comunaLabels = [
  { label: 'Comuna 1', desktop: { x: 22, y: 62 }, mobile: { x: 22, y: 64 } },
  { label: 'Comuna 2', desktop: { x: 51, y: 26 }, mobile: { x: 54, y: 28 } },
  { label: 'Comuna 3', desktop: { x: 58, y: 48 }, mobile: { x: 58, y: 50 } },
  { label: 'Comuna 4', desktop: { x: 66, y: 74 }, mobile: { x: 66, y: 76 } },
  { label: 'Comuna 5', desktop: { x: 34, y: 34 }, mobile: { x: 42, y: 72 } },
  { label: 'Comuna 7', desktop: { x: 76, y: 38 }, mobile: { x: 78, y: 40 } },
]

/*
 * Contenedor PROVISIONAL del mapa. Es un esquema ilustrado, no cartografía real:
 * el mapa urbano 3D de Villavicencio y su proveedor se definirán en una tarea posterior
 * (docs/ARQUITECTURA.md, decisión pendiente 7). Los marcadores sí son interactivos para
 * validar el flujo de selección → detalle.
 */
export function MapCanvas({ services, selectedId, onSelect }: MapCanvasProps) {
  return (
    <div className="map-canvas">
      <svg
        className="map-canvas__art"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path className="map-canvas__block" d="M6 8h28v22H6zM40 6h22v18H40zM68 10h26v20H68z" />
        <path
          className="map-canvas__block"
          d="M8 36h22v26H8zM62 38h30v22H62zM12 70h26v22H12zM70 66h24v28H70z"
        />
        <path className="map-canvas__road" d="M0 33h100M36 0v100M0 64h100M66 0v100" />
        <path className="map-canvas__river" d="M-4 90C14 80 28 86 40 74s20-26 36-30 22-14 30-26" />
        <path className="map-canvas__park" d="M42 40c6-4 14-2 16 4s-2 12-10 12-12-10-6-16z" />
      </svg>

      {comunaLabels.map((comuna) => (
        <span
          key={comuna.label}
          className="map-canvas__label"
          style={
            {
              '--label-x': `${comuna.desktop.x}%`,
              '--label-y': `${comuna.desktop.y}%`,
              '--label-x-mobile': `${comuna.mobile.x}%`,
              '--label-y-mobile': `${comuna.mobile.y}%`,
            } as CSSProperties
          }
          aria-hidden="true"
        >
          {comuna.label}
        </span>
      ))}

      <ul className="map-canvas__pins" aria-label="Servicios en el mapa">
        {services.map((service) => {
          const category = categories[service.category]
          const selected = service.id === selectedId
          return (
            <li
              key={service.id}
              className="map-canvas__pin-item"
              style={{ left: `${service.mapPosition.x}%`, top: `${service.mapPosition.y}%` }}
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
            </li>
          )
        })}
      </ul>

      <p className="map-canvas__badge">
        <Icon name="info" size={16} /> Vista provisional · el mapa 3D llegará en una próxima fase
      </p>
    </div>
  )
}
