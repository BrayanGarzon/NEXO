import { describe, expect, it } from 'vitest'
import { demoServices } from '../../../mocks/demoServices'
import {
  BLOCKS,
  BRIDGES,
  blockAt,
  buildCity,
  CITY_HALF,
  CORRIDOR_HALF,
  HUB_RADIUS,
  nearestOnRiver,
  placeService,
  placeServices,
  RIVER_WIDTH,
  ROAD_LINES,
  toWorld,
  type Vec2,
} from './cityLayout'

/** ¿Está sobre una calle o andén? (Las calles solo existen dentro de la ciudad.) */
const onRoad = (p: Vec2) =>
  Math.abs(p.x) <= CITY_HALF &&
  Math.abs(p.z) <= CITY_HALF &&
  (ROAD_LINES.some((line) => Math.abs(p.x - line) < CORRIDOR_HALF) ||
    ROAD_LINES.some((line) => Math.abs(p.z - line) < CORRIDOR_HALF))

const insideBlock = (p: Vec2, margin = 0) => {
  const block = blockAt(p)
  return (
    p.x >= block.x0 + margin - 1e-9 &&
    p.x <= block.x1 - margin + 1e-9 &&
    p.z >= block.z0 + margin - 1e-9 &&
    p.z <= block.z1 - margin + 1e-9
  )
}

describe('posiciones ilustrativas', () => {
  it('convierte el porcentaje del catálogo a la escena y limita los valores', () => {
    expect(toWorld({ x: 0, y: 0 })).toEqual({ x: -CITY_HALF, z: -CITY_HALF })
    expect(toWorld({ x: 50, y: 50 })).toEqual({ x: 0, z: 0 })
    expect(toWorld({ x: 100, y: 100 })).toEqual({ x: CITY_HALF, z: CITY_HALF })
    expect(toWorld({ x: -20, y: 140 })).toEqual({ x: -CITY_HALF, z: CITY_HALF })
  })

  it('coloca cualquier servicio dentro de una manzana: nunca en calles, río ni zonas reservadas', () => {
    for (let x = 0; x <= 100; x += 2.5) {
      for (let y = 0; y <= 100; y += 2.5) {
        const point = placeService({ x, y })
        const block = blockAt(point)
        expect(insideBlock(point, HUB_RADIUS), `${x},${y}`).toBe(true)
        expect(onRoad(point), `${x},${y}`).toBe(false)
        expect(block.kind, `${x},${y}`).not.toBe('ribera')
        expect(nearestOnRiver(point).distance).toBeGreaterThanOrEqual(RIVER_WIDTH / 2 + HUB_RADIUS)
        if (block.feature) {
          const f = block.feature
          const inFeature = point.x > f.x0 && point.x < f.x1 && point.z > f.z0 && point.z < f.z1
          expect(inFeature, `${x},${y}`).toBe(false)
        }
      }
    }
  })

  it('es estable: la misma entrada da la misma posición', () => {
    expect(placeService({ x: 58, y: 44 })).toEqual(placeService({ x: 58, y: 44 }))
  })

  it('separa las plazoletas de servicios que caerían en el mismo sitio', () => {
    const placed = placeServices([
      { id: 'a', mapPosition: { x: 30, y: 30 } },
      { id: 'b', mapPosition: { x: 30, y: 30 } },
      { id: 'c', mapPosition: { x: 30.5, y: 30.5 } },
    ])
    const points = [...placed.values()]
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const distance = Math.hypot(points[i].x - points[j].x, points[i].z - points[j].z)
        expect(distance).toBeGreaterThanOrEqual(HUB_RADIUS * 2)
      }
    }
  })
})

describe('ciudad ilustrativa', () => {
  const city = buildCity(demoServices)

  it('ubica todos los servicios del catálogo de demostración', () => {
    expect(city.hubs.size).toBe(demoServices.length)
    for (const service of demoServices) expect(city.hubs.has(service.id)).toBe(true)
  })

  it('es determinista y cambia con otra semilla', () => {
    expect(buildCity(demoServices).buildings).toEqual(city.buildings)
    expect(buildCity(demoServices, { seed: 7 }).buildings).not.toEqual(city.buildings)
  })

  it('tiene 49 manzanas con equipamientos, un río con puentes y variedad de alturas', () => {
    expect(BLOCKS).toHaveLength(49)
    const kinds = new Set(BLOCKS.map((block) => block.kind))
    for (const kind of [
      'parque',
      'deportes',
      'cancha-multiple',
      'comunitario',
      'plaza',
      'colegio',
      'pista',
      'ribera',
    ]) {
      expect(kinds.has(kind as never), kind).toBe(true)
    }
    expect(BRIDGES).toHaveLength(ROAD_LINES.length * 2)
    const floors = new Set(city.buildings.map((building) => building.floors))
    expect(floors.size).toBeGreaterThanOrEqual(8)
    expect(city.buildings.length).toBeGreaterThan(200)
    expect(city.trees.length).toBeGreaterThan(400)
    expect(city.hills.length).toBeGreaterThan(10)
    expect(city.flowers.length + city.benches.length).toBeGreaterThan(10)
  })

  it('no construye ni planta sobre calles, el río o las plazoletas de los servicios', () => {
    const hubs = [...city.hubs.values()]
    for (const building of city.buildings) {
      const corners = [-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => ({
          x: building.x + (sx * building.width) / 2,
          z: building.z + (sz * building.depth) / 2,
        })),
      )
      for (const corner of corners) expect(onRoad(corner)).toBe(false)
      for (const hub of hubs) {
        expect(Math.hypot(hub.x - building.x, hub.z - building.z)).toBeGreaterThan(HUB_RADIUS)
      }
    }
    for (const tree of city.trees) {
      expect(onRoad(tree)).toBe(false)
      expect(nearestOnRiver(tree).distance).toBeGreaterThan(RIVER_WIDTH / 2)
      for (const hub of hubs) {
        expect(Math.hypot(hub.x - tree.x, hub.z - tree.z)).toBeGreaterThan(HUB_RADIUS)
      }
    }
  })

  it('alrededor de cada servicio solo hay edificios bajos (no lo tapan)', () => {
    for (const hub of city.hubs.values()) {
      for (const building of city.buildings) {
        if (Math.hypot(hub.x - building.x, hub.z - building.z) < 4) {
          expect(building.floors).toBeLessThanOrEqual(3)
        }
      }
    }
  })

  it('pone colinas y bosque solo en las afueras, nunca dentro de la ciudad', () => {
    for (const hill of city.hills) {
      expect(Math.max(Math.abs(hill.x), Math.abs(hill.z))).toBeGreaterThan(CITY_HALF)
    }
  })

  it('pone carros en los carriles y faroles en los andenes, fuera de cruces y puentes', () => {
    expect(city.cars.length).toBeGreaterThan(5)
    expect(city.lamps.length).toBeGreaterThan(10)
    for (const car of city.cars) {
      const line = car.axis === 'x' ? car.z : car.x
      expect(ROAD_LINES.some((road) => Math.abs(road - line) < 1)).toBe(true)
      for (const bridge of BRIDGES) {
        expect(Math.hypot(bridge.x - car.x, bridge.z - car.z)).toBeGreaterThan(RIVER_WIDTH / 2)
      }
    }
  })

  it('reduce la vegetación en calidad baja', () => {
    expect(buildCity(demoServices, { treeDensity: 0.5 }).trees.length).toBeLessThan(
      city.trees.length,
    )
  })
})
