/*
 * Distribución de la ciudad ILUSTRATIVA de Nexo Territorio (lógica pura, sin Three.js).
 *
 * No es cartografía: manzanas, calles, río y edificios se generan de forma determinista
 * para dar contexto visual. Las posiciones de los servicios salen de su `mapPosition`
 * (porcentaje del catálogo de demostración) y se ajustan para caer dentro de una manzana;
 * no representan ubicaciones, distancias ni rutas reales de Villavicencio.
 */

export interface Vec2 {
  x: number
  z: number
}

export interface Rect {
  x0: number
  x1: number
  z0: number
  z1: number
}

/** Mitad del lado de la ciudad: ocupa [-CITY_HALF, CITY_HALF] en x y en z. */
export const CITY_HALF = 32
/** Ejes de las calles, iguales en x y en z (cuadrícula de 7 × 7 manzanas). */
export const ROAD_LINES = [-25, -15, -5, 5, 15, 25] as const
/** Franja de campo alrededor de la ciudad (bosque, colinas y montañas). */
export const CITY_RIM = 9
export const ROAD_WIDTH = 1.6
export const SIDEWALK_WIDTH = 0.45
/** Media anchura del corredor de calle + andén a cada lado del eje. */
export const CORRIDOR_HALF = ROAD_WIDTH / 2 + SIDEWALK_WIDTH
/** Margen entre las manzanas del borde y el límite de la ciudad. */
const EDGE_MARGIN = 0.6
export const RIVER_WIDTH = 3
/** Radio de la plazoleta donde se apoya cada servicio. */
export const HUB_RADIUS = 0.8
/** Altura de un piso de edificio. */
export const FLOOR_HEIGHT = 0.68

const BOUNDS = [-CITY_HALF, ...ROAD_LINES, CITY_HALF]
const LAST = BOUNDS.length - 2

export type BlockKind =
  | 'urbano'
  | 'parque'
  | 'deportes'
  | 'cancha-multiple'
  | 'comunitario'
  | 'plaza'
  | 'colegio'
  | 'pista'
  | 'ribera'

export interface Block extends Rect {
  col: number
  row: number
  kind: BlockKind
  /** Zona central reservada (cancha, estanque, plaza) en las manzanas especiales. */
  feature?: Rect
}

/** Manzanas con equipamientos (columna, fila). El resto son manzanas urbanas. */
const SPECIAL_BLOCKS: Record<string, BlockKind> = {
  '3,3': 'parque',
  '1,5': 'parque',
  '5,1': 'parque',
  '4,4': 'deportes',
  '2,4': 'cancha-multiple',
  '2,3': 'comunitario',
  '4,2': 'plaza',
  '3,1': 'colegio',
  '1,2': 'pista',
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/** Convierte la posición ilustrativa del catálogo (0–100 %) a coordenadas de escena. */
export function toWorld(position: { x: number; y: number }): Vec2 {
  return {
    x: (clamp(position.x, 0, 100) / 100 - 0.5) * 2 * CITY_HALF,
    z: (clamp(position.y, 0, 100) / 100 - 0.5) * 2 * CITY_HALF,
  }
}

/** Índice de la franja (columna o fila) que contiene la coordenada. */
export function cellIndex(value: number) {
  for (let i = 0; i <= LAST; i++) if (value < BOUNDS[i + 1]) return i
  return LAST
}

/** Área edificable de una manzana (sin calles ni andenes). */
export function blockRect(col: number, row: number): Rect {
  const inner = (i: number): [number, number] => [
    BOUNDS[i] + (i === 0 ? EDGE_MARGIN : CORRIDOR_HALF),
    BOUNDS[i + 1] - (i === LAST ? EDGE_MARGIN : CORRIDOR_HALF),
  ]
  const [x0, x1] = inner(col)
  const [z0, z1] = inner(row)
  return { x0, x1, z0, z1 }
}

function blockKind(col: number, row: number): BlockKind {
  if (col === LAST || row === LAST) return 'ribera'
  return SPECIAL_BLOCKS[`${col},${row}`] ?? 'urbano'
}

function centeredRect(rect: Rect, width: number, depth: number): Rect {
  const cx = (rect.x0 + rect.x1) / 2
  const cz = (rect.z0 + rect.z1) / 2
  return { x0: cx - width / 2, x1: cx + width / 2, z0: cz - depth / 2, z1: cz + depth / 2 }
}

export const BLOCKS: Block[] = BOUNDS.slice(0, -1).flatMap((_, row) =>
  BOUNDS.slice(0, -1).map((__, col) => {
    const rect = blockRect(col, row)
    const kind = blockKind(col, row)
    const special = kind !== 'urbano' && kind !== 'ribera'
    return { ...rect, col, row, kind, feature: special ? centeredRect(rect, 4.4, 3.6) : undefined }
  }),
)

export function blockAt(point: Vec2) {
  return BLOCKS.find(
    (block) => block.col === cellIndex(point.x) && block.row === cellIndex(point.z),
  )!
}

// ---------------------------------------------------------------- Río

/** Eje del río: cruza la franja sur de oeste a este y gira hacia el norte por la franja este. */
export const RIVER_PATH: Vec2[] = (() => {
  const lane = (blockRect(0, LAST).z0 + blockRect(0, LAST).z1) / 2
  const radius = 6.8
  const corner = lane - radius
  const edge = CITY_HALF + CITY_RIM
  const points: Vec2[] = [
    { x: -edge, z: lane },
    { x: corner, z: lane },
  ]
  for (let i = 1; i <= 8; i++) {
    const angle = Math.PI / 2 - (i / 8) * (Math.PI / 2)
    points.push({ x: corner + radius * Math.cos(angle), z: corner + radius * Math.sin(angle) })
  }
  points.push({ x: lane, z: -edge })
  return points
})()

/** Punto más cercano del río y distancia a él. */
export function nearestOnRiver(point: Vec2) {
  let best = { point: RIVER_PATH[0], distance: Infinity }
  for (let i = 0; i < RIVER_PATH.length - 1; i++) {
    const a = RIVER_PATH[i]
    const b = RIVER_PATH[i + 1]
    const dx = b.x - a.x
    const dz = b.z - a.z
    const t = clamp(((point.x - a.x) * dx + (point.z - a.z) * dz) / (dx * dx + dz * dz), 0, 1)
    const candidate = { x: a.x + t * dx, z: a.z + t * dz }
    const distance = Math.hypot(point.x - candidate.x, point.z - candidate.z)
    if (distance < best.distance) best = { point: candidate, distance }
  }
  return best
}

export interface Bridge extends Vec2 {
  /** 'x' si la calle va de oeste a este; 'z' si va de norte a sur. */
  axis: 'x' | 'z'
}

/** Puentes: cruces de cada calle con el río. */
export const BRIDGES: Bridge[] = ROAD_LINES.flatMap((line) => {
  const found: Bridge[] = []
  for (let i = 0; i < RIVER_PATH.length - 1; i++) {
    const a = RIVER_PATH[i]
    const b = RIVER_PATH[i + 1]
    // Calle norte–sur (x = line)
    if ((a.x - line) * (b.x - line) <= 0 && a.x !== b.x) {
      const t = (line - a.x) / (b.x - a.x)
      found.push({ x: line, z: a.z + t * (b.z - a.z), axis: 'z' })
    }
    // Calle oeste–este (z = line)
    if ((a.z - line) * (b.z - line) <= 0 && a.z !== b.z) {
      const t = (line - a.z) / (b.z - a.z)
      found.push({ x: a.x + t * (b.x - a.x), z: line, axis: 'x' })
    }
  }
  return found
})

// ---------------------------------------------------------------- Servicios

function clampToRect(point: Vec2, rect: Rect, margin: number): Vec2 {
  return {
    x: clamp(point.x, rect.x0 + margin, rect.x1 - margin),
    z: clamp(point.z, rect.z0 + margin, rect.z1 - margin),
  }
}

/** Saca el punto de la zona reservada hacia su borde más cercano. */
function pushOutOfRect(point: Vec2, rect: Rect, margin: number): Vec2 {
  const inside =
    point.x > rect.x0 - margin &&
    point.x < rect.x1 + margin &&
    point.z > rect.z0 - margin &&
    point.z < rect.z1 + margin
  if (!inside) return point
  const options = [
    { x: rect.x0 - margin, z: point.z, d: point.x - (rect.x0 - margin) },
    { x: rect.x1 + margin, z: point.z, d: rect.x1 + margin - point.x },
    { x: point.x, z: rect.z0 - margin, d: point.z - (rect.z0 - margin) },
    { x: point.x, z: rect.z1 + margin, d: rect.z1 + margin - point.z },
  ]
  const best = options.reduce((a, b) => (b.d < a.d ? b : a))
  return { x: best.x, z: best.z }
}

/**
 * Posición ilustrativa de un servicio en la escena: dentro de su manzana, fuera de calles,
 * del río y de las zonas reservadas. Siempre la misma para la misma entrada.
 */
export function placeService(position: { x: number; y: number }): Vec2 {
  const world = toWorld(position)
  let block = blockAt(world)
  // Las manzanas de ribera son estrechas: el servicio pasa a la manzana vecina, al otro lado
  // de la calle, en lugar de quedar junto al agua.
  if (block.kind === 'ribera') {
    const col = Math.min(block.col, LAST - 1)
    const row = Math.min(block.row, LAST - 1)
    block = BLOCKS.find((candidate) => candidate.col === col && candidate.row === row)!
  }
  let point = clampToRect(world, block, HUB_RADIUS)
  if (block.feature) point = pushOutOfRect(point, block.feature, HUB_RADIUS + 0.1)
  return clampToRect(point, block, HUB_RADIUS)
}

/**
 * Coloca varios servicios evitando que sus plazoletas se superpongan
 * (si coinciden, el siguiente se desplaza dentro de su manzana).
 */
export function placeServices<T extends { id: string; mapPosition: { x: number; y: number } }>(
  services: T[],
): Map<string, Vec2> {
  const placed = new Map<string, Vec2>()
  const minimum = HUB_RADIUS * 2 + 0.3
  for (const service of [...services].sort((a, b) => a.id.localeCompare(b.id))) {
    let point = placeService(service.mapPosition)
    const block = blockAt(point)
    for (let attempt = 0; attempt < 12; attempt++) {
      const clash = [...placed.values()].find(
        (other) => Math.hypot(other.x - point.x, other.z - point.z) < minimum,
      )
      if (!clash) break
      const angle = attempt * 2.4
      point = clampToRect(
        { x: clash.x + Math.cos(angle) * minimum, z: clash.z + Math.sin(angle) * minimum },
        block,
        HUB_RADIUS,
      )
    }
    placed.set(service.id, point)
  }
  return placed
}

// ---------------------------------------------------------------- Edificios y vegetación

/** Generador pseudoaleatorio determinista (mulberry32). */
export function createRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface Building extends Vec2 {
  width: number
  depth: number
  floors: number
  /** Índices en las paletas de fachada y de techo. */
  facade: number
  roof: number
  /** Valla publicitaria de colores en la azotea. */
  billboard: boolean
}

export interface Tree extends Vec2 {
  scale: number
  tone: number
}

export interface Car extends Vec2 {
  /** 'x' si circula de oeste a este; 'z' si circula de norte a sur. */
  axis: 'x' | 'z'
  color: number
}

/** Colina o montaña de las afueras (cono de pocas caras). */
export interface Hill extends Vec2 {
  radius: number
  height: number
  tone: number
}

/** Flor o banca de parques y plazas. */
export interface Detail extends Vec2 {
  tone: number
  /** Giro en radianes. */
  rotation: number
}

export interface CityLayout {
  blocks: Block[]
  buildings: Building[]
  trees: Tree[]
  cars: Car[]
  /** Faroles sobre los andenes. */
  lamps: Vec2[]
  /** Colinas (delante) y cordillera decorativa (al fondo). */
  hills: Hill[]
  flowers: Detail[]
  benches: Detail[]
  hubs: Map<string, Vec2>
}

const CAR_COLORS = 5

/** ¿El punto está sobre un cruce o un puente (ahí no se ponen carros ni faroles)? */
function onCrossingOrBridge(point: Vec2) {
  const nearCross =
    ROAD_LINES.some((line) => Math.abs(point.x - line) < CORRIDOR_HALF + 0.3) &&
    ROAD_LINES.some((line) => Math.abs(point.z - line) < CORRIDOR_HALF + 0.3)
  const nearBridge = BRIDGES.some(
    (bridge) => Math.hypot(bridge.x - point.x, bridge.z - point.z) < RIVER_WIDTH / 2 + 1.2,
  )
  return nearCross || nearBridge
}

/** Carros quietos en sus carriles y faroles en los andenes, de forma determinista. */
function streetProps(random: () => number) {
  const cars: Car[] = []
  const lamps: Vec2[] = []
  const lane = ROAD_WIDTH / 4
  for (const line of ROAD_LINES) {
    for (let t = -CITY_HALF + 1; t < CITY_HALF - 1; t += 2.3) {
      for (const axis of ['x', 'z'] as const) {
        const side = random() < 0.5 ? -1 : 1
        const point =
          axis === 'x' ? { x: t, z: line + side * lane } : { x: line + side * lane, z: t }
        if (random() < 0.2 && !onCrossingOrBridge(point)) {
          cars.push({ ...point, axis, color: Math.floor(random() * CAR_COLORS) })
        }
      }
    }
    for (let t = -CITY_HALF + 2; t < CITY_HALF - 1; t += 4.6) {
      const offset = ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2
      for (const point of [
        { x: t, z: line - offset },
        { x: line + offset, z: t },
      ]) {
        if (!onCrossingOrBridge(point)) lamps.push(point)
      }
    }
  }
  return { cars, lamps }
}

export const MAX_FLOORS = 12
const FACADE_COUNT = 7
const ROOF_COUNT = 5
const TREE_TONES = 4

function nearHub(point: Vec2, hubs: Vec2[], distance: number) {
  return hubs.some((hub) => Math.hypot(hub.x - point.x, hub.z - point.z) < distance)
}

/**
 * Genera edificios y árboles de forma determinista. Los servicios reservan su plazoleta
 * (ningún edificio ni árbol la ocupa).
 */
export function buildCity(
  services: { id: string; mapPosition: { x: number; y: number } }[],
  { seed = 360, treeDensity = 1 }: { seed?: number; treeDensity?: number } = {},
): CityLayout {
  const random = createRandom(seed)
  const hubs = placeServices(services)
  const hubPoints = [...hubs.values()]
  const buildings: Building[] = []
  const trees: Tree[] = []
  const flowers: Detail[] = []
  const benches: Detail[] = []
  const addTree = (point: Vec2, scale = 0.8 + random() * 0.5) => {
    if (random() > treeDensity) return
    if (nearHub(point, hubPoints, HUB_RADIUS + 0.6)) return
    trees.push({ ...point, scale, tone: Math.floor(random() * TREE_TONES) })
  }

  for (const block of BLOCKS) {
    const width = block.x1 - block.x0
    const depth = block.z1 - block.z0

    if (block.kind === 'urbano') {
      const nx = Math.max(1, Math.round(width / 2.6))
      const nz = Math.max(1, Math.round(depth / 2.6))
      const gap = 0.45
      const lotW = (width - gap * (nx - 1)) / nx
      const lotD = (depth - gap * (nz - 1)) / nz
      for (let i = 0; i < nx; i++) {
        for (let j = 0; j < nz; j++) {
          const center = {
            x: block.x0 + lotW / 2 + i * (lotW + gap),
            z: block.z0 + lotD / 2 + j * (lotD + gap),
          }
          if (nearHub(center, hubPoints, HUB_RADIUS + Math.max(lotW, lotD) / 2)) {
            addTree({ x: center.x + lotW / 3, z: center.z + lotD / 3 }, 0.7)
            continue
          }
          const roll = random()
          if (roll < 0.14) {
            // Lote verde con árboles.
            addTree({ x: center.x - lotW / 4, z: center.z - lotD / 4 })
            addTree({ x: center.x + lotW / 4, z: center.z + lotD / 5 })
            continue
          }
          const downtown = 1 - Math.min(1, Math.hypot(center.x, center.z) / (CITY_HALF * 1.05))
          if (roll < 0.36) {
            // Dos casas bajas.
            const half = lotW / 2 - 0.15
            for (const side of [-1, 1]) {
              buildings.push({
                x: center.x + (side * lotW) / 4,
                z: center.z,
                width: half * 0.86,
                depth: lotD * 0.7,
                floors: 1 + Math.floor(random() * 2),
                facade: Math.floor(random() * FACADE_COUNT),
                roof: Math.floor(random() * ROOF_COUNT),
                billboard: false,
              })
            }
            continue
          }
          let floors = clamp(Math.round(1.5 + downtown * 10 + (random() - 0.35) * 4), 1, MAX_FLOORS)
          // Cerca de un servicio solo hay edificios bajos: nunca lo tapan.
          if (nearHub(center, hubPoints, 4.5)) floors = Math.min(floors, 3)
          buildings.push({
            ...center,
            width: lotW * (0.72 + random() * 0.18),
            depth: lotD * (0.72 + random() * 0.18),
            floors,
            facade: Math.floor(random() * FACADE_COUNT),
            roof: Math.floor(random() * ROOF_COUNT),
            billboard: floors >= 4 && floors <= 8 && random() < 0.2,
          })
        }
      }
      continue
    }

    if (block.kind === 'ribera') {
      // Arboleda a ambas orillas, sin entrar en el agua.
      for (let x = block.x0 + 0.5; x < block.x1; x += 1.4) {
        for (let z = block.z0 + 0.5; z < block.z1; z += 1.4) {
          const point = clampToRect(
            { x: x + (random() - 0.5) * 0.7, z: z + (random() - 0.5) * 0.7 },
            block,
            0.3,
          )
          if (nearestOnRiver(point).distance < RIVER_WIDTH / 2 + 0.55) continue
          if (random() < 0.8) addTree(point)
        }
      }
      continue
    }

    // Manzanas especiales: árboles en el anillo alrededor de la zona reservada.
    const feature = block.feature!
    const treeChance = block.kind === 'parque' ? 0.8 : block.kind === 'plaza' ? 0.3 : 0.45
    for (let x = block.x0 + 0.5; x < block.x1; x += 1.4) {
      for (let z = block.z0 + 0.5; z < block.z1; z += 1.4) {
        const inFeature =
          x > feature.x0 - 0.5 &&
          x < feature.x1 + 0.5 &&
          z > feature.z0 - 0.5 &&
          z < feature.z1 + 0.5
        if (inFeature) continue
        if (random() < treeChance) addTree({ x, z })
      }
    }

    // Flores y bancas alrededor de parques y plazas.
    if (block.kind === 'parque' || block.kind === 'plaza') {
      const along = (t: number, side: 'x0' | 'x1' | 'z0' | 'z1') =>
        side === 'z0' || side === 'z1'
          ? {
              x: feature.x0 + t * (feature.x1 - feature.x0),
              z: feature[side] + (side === 'z0' ? -0.4 : 0.4),
              rotation: 0,
            }
          : {
              x: feature[side] + (side === 'x0' ? -0.4 : 0.4),
              z: feature.z0 + t * (feature.z1 - feature.z0),
              rotation: Math.PI / 2,
            }
      const spots = [
        ...[0.2, 0.5, 0.8].flatMap((t) => [along(t, 'z0'), along(t, 'z1')]),
        ...[0.3, 0.7].flatMap((t) => [along(t, 'x0'), along(t, 'x1')]),
      ]
      spots.forEach((spot, i) => {
        if (nearHub(spot, hubPoints, HUB_RADIUS + 0.5)) return
        if (i % 2 === 0) benches.push({ ...spot, tone: 0 })
        else flowers.push({ ...spot, tone: Math.floor(random() * 3) })
      })
    }
  }

  const outskirts = buildOutskirts(createRandom(seed + 2), treeDensity)
  return {
    blocks: BLOCKS,
    buildings,
    trees: [...trees, ...outskirts.trees],
    hills: outskirts.hills,
    flowers,
    benches,
    hubs,
    ...streetProps(createRandom(seed + 1)),
  }
}

/**
 * Afueras: bosque en la franja de campo, colinas delante y una cordillera decorativa al
 * fondo (norte y oeste, el lado opuesto a la cámara). No representan el relieve real.
 */
function buildOutskirts(random: () => number, treeDensity: number) {
  const trees: Tree[] = []
  const hills: Hill[] = []
  const inner = CITY_HALF + 0.8
  const outer = CITY_HALF + CITY_RIM - 0.8

  for (let t = -outer; t < outer; t += 5.5) {
    for (const [x, z] of [
      [t, -outer + 2.4],
      [-outer + 2.4, t],
    ]) {
      if (nearestOnRiver({ x, z }).distance < RIVER_WIDTH / 2 + 5) continue
      hills.push({
        x,
        z,
        radius: 3.6 + random() * 1.6,
        height: 4 + random() * 4.5,
        tone: Math.floor(random() * 3),
      })
    }
  }
  for (const [x, z] of [
    [-outer + 7, outer - 2.2],
    [-8, outer - 2],
    [outer - 2.2, -10],
    [outer - 2, 6],
  ]) {
    if (nearestOnRiver({ x, z }).distance < RIVER_WIDTH / 2 + 3.5) continue
    hills.push({ x, z, radius: 3 + random(), height: 1.4 + random(), tone: 2 })
  }

  for (let x = -outer; x <= outer; x += 1.5) {
    for (let z = -outer; z <= outer; z += 1.5) {
      const point = { x: x + (random() - 0.5) * 0.9, z: z + (random() - 0.5) * 0.9 }
      if (Math.abs(point.x) < inner && Math.abs(point.z) < inner) continue
      if (nearestOnRiver(point).distance < RIVER_WIDTH / 2 + 0.6) continue
      if (hills.some((hill) => Math.hypot(hill.x - point.x, hill.z - point.z) < hill.radius)) {
        continue
      }
      if (random() > 0.55 * treeDensity) continue
      trees.push({ ...point, scale: 0.8 + random() * 0.7, tone: Math.floor(random() * 3) })
    }
  }
  return { trees, hills }
}

/** Límites para el centro de la cámara: el usuario no puede alejarse de la ciudad. */
export const CAMERA_TARGET_LIMIT = CITY_HALF - 6
