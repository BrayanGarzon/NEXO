import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { Group } from 'three'
import { categories } from '../../../content/categories'
import type { DemoService } from '../../../types/catalog'
import { HUB_RADIUS, type Vec2 } from './cityLayout'
import type { CityResources } from './cityResources'
import { BLOCK_TOP } from './CityModel'
import { cityColors, markerColors } from './palette3d'

/** Altura del punto donde se ancla el marcador (el pin HTML se dibuja encima). */
export const MARKER_HEIGHT = 2.7
const PAVILION_HEIGHT = 0.75
const PULSE_MS = 2400

interface ServiceMarkersProps {
  services: DemoService[]
  hubs: Map<string, Vec2>
  visibleIds: Set<string>
  selectedId: string | null
  onSelect: (id: string) => void
  resources: CityResources
  shadows: boolean
  reduceMotion: boolean
}

/**
 * Plazoletas, pabellones y mástiles de los servicios. Los que no pasan los filtros
 * conservan su pabellón en gris arena y pierden el mástil.
 */
export function ServiceMarkers({
  services,
  hubs,
  visibleIds,
  selectedId,
  onSelect,
  resources,
  shadows,
  reduceMotion,
}: ServiceMarkersProps) {
  const { geometries: g, materials: m, toon } = resources
  const invalidate = useThree((state) => state.invalidate)
  const pulseRef = useRef<Group>(null)
  const pulseStart = useRef(0)

  // Pulso breve del anillo al seleccionar (no hay animación continua).
  useEffect(() => {
    pulseStart.current = performance.now()
    invalidate()
  }, [selectedId, invalidate])

  useFrame(() => {
    const ring = pulseRef.current
    if (!ring) return
    const elapsed = performance.now() - pulseStart.current
    if (reduceMotion || elapsed > PULSE_MS) {
      ring.scale.setScalar(1)
      return
    }
    const wave = Math.sin((elapsed / 600) * Math.PI * 2) * 0.5 + 0.5
    ring.scale.setScalar(1 + wave * 0.25 * (1 - elapsed / PULSE_MS))
    invalidate()
  })

  function select(event: ThreeEvent<MouseEvent>, id: string) {
    // Un arrastre para mover el mapa no cuenta como clic.
    if (event.delta > 6) return
    // El clic sobre un pin HTML ya lo atiende el propio botón.
    if ((event.nativeEvent.target as Element | null)?.closest?.('.map3d__pins')) return
    event.stopPropagation()
    onSelect(id)
  }

  return (
    <group>
      {services.map((service) => {
        const hub = hubs.get(service.id)
        if (!hub) return null
        const visible = visibleIds.has(service.id)
        const selected = service.id === selectedId
        const tone = categories[service.category].tone
        const markerColor = markerColors[tone]
        return (
          <group key={service.id} position={[hub.x, BLOCK_TOP, hub.z]}>
            <mesh
              geometry={g.pad}
              material={toon(cityColors.hubPad)}
              scale={[HUB_RADIUS, 0.06, HUB_RADIUS]}
              receiveShadow
            />
            <group
              onClick={visible ? (event) => select(event, service.id) : undefined}
              onPointerOver={visible ? () => (document.body.style.cursor = 'pointer') : undefined}
              onPointerOut={visible ? () => (document.body.style.cursor = '') : undefined}
            >
              <mesh
                geometry={g.box}
                material={toon(visible ? cityColors.sidewalk : cityColors.lot)}
                position={[0, 0.06, 0]}
                scale={[0.95, PAVILION_HEIGHT, 0.95]}
                castShadow={shadows}
                receiveShadow
              />
              <mesh
                geometry={g.cone}
                material={toon(visible ? markerColor : cityColors.lot)}
                position={[0, 0.06 + PAVILION_HEIGHT, 0]}
                scale={[0.78, 0.45, 0.78]}
                castShadow={shadows}
              />
            </group>
            {visible && (
              <mesh
                geometry={g.stem}
                material={toon(markerColor)}
                position={[0, 0.06 + PAVILION_HEIGHT + 0.45, 0]}
                scale={[0.05, MARKER_HEIGHT - PAVILION_HEIGHT - 0.6 - BLOCK_TOP, 0.05]}
              />
            )}
            {visible && selected && (
              <>
                <group ref={pulseRef} position={[0, 0.1, 0]}>
                  <mesh geometry={g.ring} material={toon('#6b57e8')} scale={[1.15, 1.6, 1.15]} />
                </group>
                <mesh
                  geometry={g.stem}
                  material={m.beam}
                  position={[0, 0.06, 0]}
                  scale={[0.55, MARKER_HEIGHT + 0.6, 0.55]}
                />
              </>
            )}
          </group>
        )
      })}
    </group>
  )
}
