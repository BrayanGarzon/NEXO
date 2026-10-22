import { memo, useLayoutEffect, useMemo, useRef } from 'react'
import {
  Color,
  Euler,
  InstancedMesh,
  Matrix4,
  Quaternion,
  Vector3,
  type BufferGeometry,
  type Material,
} from 'three'
import {
  BRIDGES,
  CITY_HALF,
  CITY_RIM,
  CORRIDOR_HALF,
  FLOOR_HEIGHT,
  RIVER_WIDTH,
  ROAD_LINES,
  ROAD_WIDTH,
  SIDEWALK_WIDTH,
  type Block,
  type CityLayout,
  type Rect,
} from './cityLayout'
import type { CityResources } from './cityResources'
import {
  benchColor,
  carColors,
  cityColors,
  facadeColors,
  flowerColors,
  hillColors,
  roofColors,
  treeColors,
} from './palette3d'

/** Altura de la superficie de las manzanas (sobre el asfalto). */
export const BLOCK_TOP = 0.15
const SIDEWALK_TOP = 0.11

interface Instance {
  position: [number, number, number]
  scale: [number, number, number]
  rotationY?: number
  color?: string
}

interface InstancedGroupProps {
  geometry: BufferGeometry
  material: Material
  items: Instance[]
  castShadow?: boolean
  receiveShadow?: boolean
}

const matrix = new Matrix4()
const quaternion = new Quaternion()
const euler = new Euler()
const position = new Vector3()
const scale = new Vector3()
const color = new Color()

/** Muchas copias de una misma pieza en una sola llamada de dibujo. */
function InstancedGroup({
  geometry,
  material,
  items,
  castShadow,
  receiveShadow = true,
}: InstancedGroupProps) {
  const ref = useRef<InstancedMesh>(null)
  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    items.forEach((item, i) => {
      quaternion.setFromEuler(euler.set(0, item.rotationY ?? 0, 0))
      matrix.compose(position.set(...item.position), quaternion, scale.set(...item.scale))
      mesh.setMatrixAt(i, matrix)
      if (item.color) mesh.setColorAt(i, color.set(item.color))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [items])
  if (items.length === 0) return null
  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, items.length]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    />
  )
}

const slab = (rect: Rect, y0: number, y1: number, tint: string, grow = 0): Instance => ({
  position: [(rect.x0 + rect.x1) / 2, y0, (rect.z0 + rect.z1) / 2],
  scale: [rect.x1 - rect.x0 + grow * 2, y1 - y0, rect.z1 - rect.z0 + grow * 2],
  color: tint,
})

const surfaceColor: Record<Block['kind'], string> = {
  urbano: cityColors.lot,
  parque: cityColors.park,
  deportes: cityColors.park,
  'cancha-multiple': cityColors.lot,
  comunitario: cityColors.lot,
  plaza: cityColors.lot,
  colegio: cityColors.lot,
  pista: cityColors.lot,
  ribera: cityColors.park,
}

/** Rayas amarillas del eje de las calles, sin invadir cruces ni puentes. */
function laneDashes(): Instance[] {
  const dashes: Instance[] = []
  const clear = (value: number, cross: number) =>
    ROAD_LINES.every((line) => Math.abs(value - line) > CORRIDOR_HALF + 0.4) &&
    BRIDGES.every((bridge) => Math.hypot(bridge.x - value, bridge.z - cross) > 2.6) &&
    BRIDGES.every((bridge) => Math.hypot(bridge.x - cross, bridge.z - value) > 2.6)
  for (const line of ROAD_LINES) {
    for (let t = -CITY_HALF + 0.8; t < CITY_HALF; t += 1.2) {
      if (clear(t, line)) {
        dashes.push({
          position: [t, 0.045, line],
          scale: [0.55, 0.01, 0.09],
          color: cityColors.roadLine,
        })
        dashes.push({
          position: [line, 0.045, t],
          scale: [0.09, 0.01, 0.55],
          color: cityColors.roadLine,
        })
      }
    }
  }
  return dashes
}

/** Pasos de cebra a los cuatro lados de cada cruce. */
function crosswalks(): Instance[] {
  const stripes: Instance[] = []
  const offset = CORRIDOR_HALF - SIDEWALK_WIDTH / 2 + 0.15
  for (const x of ROAD_LINES) {
    for (const z of ROAD_LINES) {
      for (let k = -2; k <= 2; k++) {
        const s = k * 0.3
        stripes.push({ position: [x + s, 0.045, z - offset - 0.35], scale: [0.16, 0.01, 0.6] })
        stripes.push({ position: [x + s, 0.045, z + offset + 0.35], scale: [0.16, 0.01, 0.6] })
        stripes.push({ position: [x - offset - 0.35, 0.045, z + s], scale: [0.6, 0.01, 0.16] })
        stripes.push({ position: [x + offset + 0.35, 0.045, z + s], scale: [0.6, 0.01, 0.16] })
      }
    }
  }
  return stripes
}

interface CityModelProps {
  layout: CityLayout
  resources: CityResources
  shadows: boolean
}

/** Ciudad estática (no cambia con filtros ni selección): se dibuja una sola vez. */
export const CityModel = memo(function CityModel({ layout, resources, shadows }: CityModelProps) {
  const { geometries: g, materials: m, toon } = resources

  const pieces = useMemo(() => {
    const curbs = layout.blocks.map((block) =>
      slab(block, 0, SIDEWALK_TOP, cityColors.sidewalk, SIDEWALK_WIDTH),
    )
    const surfaces = layout.blocks.map((block) =>
      slab(block, SIDEWALK_TOP, BLOCK_TOP, surfaceColor[block.kind]),
    )

    const byFloors = new Map<number, Instance[]>()
    const roofs: Instance[] = []
    const tanks: Instance[] = []
    const roofPlants: Instance[] = []
    for (const b of layout.buildings) {
      const height = b.floors * FLOOR_HEIGHT
      const list = byFloors.get(b.floors) ?? []
      list.push({
        position: [b.x, BLOCK_TOP, b.z],
        scale: [b.width, height, b.depth],
        color: facadeColors[b.facade],
      })
      byFloors.set(b.floors, list)
      roofs.push({
        position: [b.x, BLOCK_TOP + height, b.z],
        scale: [b.width * 1.04, 0.12, b.depth * 1.04],
        color: roofColors[b.roof],
      })
      // Techos verdes en algunas construcciones bajas.
      if (b.floors <= 2 && b.roof === 4) {
        for (const side of [-1, 1]) {
          roofPlants.push({
            position: [b.x + side * b.width * 0.22, BLOCK_TOP + height + 0.2, b.z],
            scale: [0.22, 0.18, 0.22],
            color: treeColors[side < 0 ? 2 : 1],
          })
        }
      }
      if (b.floors >= 4) {
        tanks.push({
          position: [b.x + b.width * 0.2, BLOCK_TOP + height + 0.12, b.z - b.depth * 0.18],
          scale: [0.45, 0.35, 0.45],
          color: cityColors.sidewalk,
        })
      }
    }

    const trunks = layout.trees.map<Instance>((tree) => ({
      position: [tree.x, BLOCK_TOP, tree.z],
      scale: [tree.scale, 0.55 * tree.scale, tree.scale],
    }))
    const crowns = layout.trees.map<Instance>((tree) => ({
      position: [tree.x, BLOCK_TOP + 0.55 * tree.scale + 0.42 * tree.scale, tree.z],
      scale: [0.5 * tree.scale, 0.62 * tree.scale, 0.5 * tree.scale],
      rotationY: tree.x * 3.1,
      color: treeColors[tree.tone],
    }))

    const bridgeDecks: Instance[] = []
    const bridgeRails: Instance[] = []
    for (const bridge of BRIDGES) {
      const along = RIVER_WIDTH + 1.6
      const across = ROAD_WIDTH + 0.5
      const rotationY = bridge.axis === 'x' ? 0 : Math.PI / 2
      bridgeDecks.push({
        position: [bridge.x, 0.2, bridge.z],
        scale: [along, 0.14, across],
        rotationY,
        color: cityColors.bridge,
      })
      for (const side of [-1, 1]) {
        const ox = bridge.axis === 'x' ? 0 : (side * across) / 2
        const oz = bridge.axis === 'x' ? (side * across) / 2 : 0
        bridgeRails.push({
          position: [bridge.x + ox, 0.34, bridge.z + oz],
          scale: [along, 0.22, 0.1],
          rotationY,
          color: cityColors.bridgeRail,
        })
      }
    }

    const carBodies: Instance[] = []
    const carCabins: Instance[] = []
    for (const car of layout.cars) {
      const rotationY = car.axis === 'x' ? 0 : Math.PI / 2
      carBodies.push({
        position: [car.x, 0.05, car.z],
        scale: [0.62, 0.2, 0.32],
        rotationY,
        color: carColors[car.color],
      })
      carCabins.push({
        position: [car.x, 0.25, car.z],
        scale: [0.32, 0.16, 0.28],
        rotationY,
        color: '#e8f1f6',
      })
    }
    const billboardBoards: Instance[] = []
    const billboardPosts: Instance[] = []
    layout.buildings.forEach((b, i) => {
      if (!b.billboard) return
      const top = BLOCK_TOP + b.floors * FLOOR_HEIGHT + 0.12
      billboardPosts.push({ position: [b.x, top, b.z], scale: [0.05, 0.45, 0.05] })
      billboardBoards.push({
        position: [b.x, top + 0.45, b.z],
        scale: [b.width * 0.75, 0.5, 0.07],
        rotationY: i % 2 === 0 ? 0 : Math.PI / 2,
        color: i % 3 === 0 ? roofColors[1] : i % 3 === 1 ? roofColors[3] : roofColors[2],
      })
    })
    const hills: Instance[] = []
    const peaks: Instance[] = []
    for (const hill of layout.hills) {
      hills.push({
        position: [hill.x, 0, hill.z],
        scale: [hill.radius, hill.height, hill.radius],
        rotationY: hill.x,
        color: hillColors[hill.tone],
      })
      if (hill.height > 6) {
        peaks.push({
          position: [hill.x, hill.height * 0.7, hill.z],
          scale: [hill.radius * 0.3, hill.height * 0.3, hill.radius * 0.3],
          rotationY: hill.x,
          color: cityColors.sidewalk,
        })
      }
    }
    const flowers = layout.flowers.map<Instance>((flower) => ({
      position: [flower.x, BLOCK_TOP, flower.z],
      scale: [0.3, 0.14, 0.3],
      color: flowerColors[flower.tone],
    }))
    const benches = layout.benches.map<Instance>((bench) => ({
      position: [bench.x, BLOCK_TOP, bench.z],
      scale: [0.62, 0.14, 0.22],
      rotationY: bench.rotation,
    }))
    const lampPoles = layout.lamps.map<Instance>((lamp) => ({
      position: [lamp.x, SIDEWALK_TOP, lamp.z],
      scale: [0.035, 0.85, 0.035],
    }))
    const lampHeads = layout.lamps.map<Instance>((lamp) => ({
      position: [lamp.x, SIDEWALK_TOP + 0.85, lamp.z],
      scale: [0.16, 0.08, 0.16],
    }))

    return {
      billboardBoards,
      billboardPosts,
      hills,
      peaks,
      flowers,
      benches,
      carBodies,
      carCabins,
      lampPoles,
      lampHeads,
      curbs,
      surfaces,
      byFloors: [...byFloors.entries()],
      roofs,
      tanks,
      roofPlants,
      trunks,
      crowns,
      dashes: laneDashes(),
      crosswalks: crosswalks(),
      bridgeDecks,
      bridgeRails,
    }
  }, [layout])

  const size = CITY_HALF * 2
  const island = size + CITY_RIM * 2
  return (
    <group>
      {/* Isla base (campo alrededor de la ciudad) y asfalto */}
      <mesh
        geometry={g.box}
        material={toon(cityColors.island)}
        position={[0, -1.6, 0]}
        scale={[island, 1.6, island]}
        receiveShadow
      />
      <InstancedGroup
        geometry={g.cone}
        material={m.instanced}
        items={pieces.hills}
        castShadow={shadows}
      />
      <InstancedGroup geometry={g.cone} material={m.instanced} items={pieces.peaks} />
      <mesh
        geometry={g.box}
        material={toon(cityColors.road)}
        position={[0, 0, 0]}
        scale={[size + 0.4, 0.04, size + 0.4]}
        receiveShadow
      />

      <InstancedGroup geometry={g.box} material={m.instanced} items={pieces.curbs} />
      <InstancedGroup geometry={g.box} material={m.instanced} items={pieces.surfaces} />
      <InstancedGroup geometry={g.box} material={m.instanced} items={pieces.dashes} />
      <InstancedGroup
        geometry={g.box}
        material={toon(cityColors.crosswalk)}
        items={pieces.crosswalks}
      />

      {/* Río y puentes */}
      <mesh
        geometry={g.riverBank}
        material={toon(cityColors.waterEdge)}
        position={[0, 0.165, 0]}
        receiveShadow
      />
      <mesh
        geometry={g.river}
        material={toon(cityColors.water)}
        position={[0, 0.172, 0]}
        receiveShadow
      />
      <InstancedGroup
        geometry={g.box}
        material={m.instanced}
        items={pieces.bridgeDecks}
        castShadow={shadows}
      />
      <InstancedGroup
        geometry={g.box}
        material={m.instanced}
        items={pieces.bridgeRails}
        castShadow={shadows}
      />

      {/* Edificios: una malla instanciada por número de pisos (ventanas proporcionadas) */}
      {pieces.byFloors.map(([floors, items]) => (
        <InstancedGroup
          key={floors}
          geometry={g.buildings[floors - 1]}
          material={m.building}
          items={items}
          castShadow={shadows}
        />
      ))}
      <InstancedGroup
        geometry={g.box}
        material={m.instanced}
        items={pieces.roofs}
        castShadow={shadows}
      />
      <InstancedGroup
        geometry={g.pad}
        material={m.instanced}
        items={pieces.tanks}
        castShadow={shadows}
      />
      <InstancedGroup geometry={g.crown} material={m.instanced} items={pieces.roofPlants} />

      {/* Mobiliario: vallas, flores y bancas */}
      <InstancedGroup
        geometry={g.stem}
        material={toon(cityColors.road)}
        items={pieces.billboardPosts}
      />
      <InstancedGroup
        geometry={g.box}
        material={m.instanced}
        items={pieces.billboardBoards}
        castShadow={shadows}
      />
      <InstancedGroup geometry={g.pad} material={m.instanced} items={pieces.flowers} />
      <InstancedGroup geometry={g.box} material={toon(benchColor)} items={pieces.benches} />

      {/* Vida en la calle */}
      <InstancedGroup
        geometry={g.box}
        material={m.instanced}
        items={pieces.carBodies}
        castShadow={shadows}
      />
      <InstancedGroup
        geometry={g.box}
        material={m.instanced}
        items={pieces.carCabins}
        castShadow={shadows}
      />
      <InstancedGroup geometry={g.stem} material={toon(cityColors.road)} items={pieces.lampPoles} />
      <InstancedGroup
        geometry={g.box}
        material={toon(cityColors.roadLine)}
        items={pieces.lampHeads}
      />

      {/* Vegetación */}
      <InstancedGroup
        geometry={g.trunk}
        material={toon(cityColors.trunk)}
        items={pieces.trunks}
        castShadow={shadows}
      />
      <InstancedGroup
        geometry={g.crown}
        material={m.instanced}
        items={pieces.crowns}
        castShadow={shadows}
      />

      {layout.blocks.map((block) => (
        <BlockFeature
          key={`${block.col}-${block.row}`}
          block={block}
          resources={resources}
          shadows={shadows}
        />
      ))}
    </group>
  )
})

interface BlockFeatureProps {
  block: Block
  resources: CityResources
  shadows: boolean
}

/** Elementos únicos de las manzanas especiales: estanque, canchas y centro cultural. */
function BlockFeature({ block, resources, shadows }: BlockFeatureProps) {
  const { geometries: g, toon } = resources
  const f = block.feature
  if (!f) return null
  const cx = (f.x0 + f.x1) / 2
  const cz = (f.z0 + f.z1) / 2
  const w = f.x1 - f.x0
  const d = f.z1 - f.z0
  const top = BLOCK_TOP

  if (block.kind === 'parque') {
    return (
      <group>
        <mesh
          geometry={g.pad}
          material={toon(cityColors.sidewalk)}
          position={[cx, top, cz]}
          scale={[2.1, 0.03, 1.7]}
        />
        <mesh
          geometry={g.pad}
          material={toon(cityColors.water)}
          position={[cx, top, cz]}
          scale={[1.6, 0.05, 1.2]}
        />
        <mesh
          geometry={g.kiosk}
          material={toon(cityColors.sidewalk)}
          position={[cx + 1.9, top, cz - 1.2]}
          scale={[0.5, 0.5, 0.5]}
          castShadow={shadows}
        />
        <mesh
          geometry={g.cone}
          material={toon(cityColors.court)}
          position={[cx + 1.9, top + 0.5, cz - 1.2]}
          scale={[0.65, 0.4, 0.65]}
          castShadow={shadows}
        />
      </group>
    )
  }

  if (block.kind === 'deportes') {
    const line = toon(cityColors.fieldLine)
    const y = top + 0.035
    return (
      <group>
        <mesh
          geometry={g.box}
          material={toon(cityColors.field)}
          position={[cx, top, cz]}
          scale={[w, 0.03, d]}
          receiveShadow
        />
        {[
          [cx, y, f.z0 + 0.15, w - 0.3, 0.06],
          [cx, y, f.z1 - 0.15, w - 0.3, 0.06],
          [cx, y, cz, 0.06, d - 0.3],
          [f.x0 + 0.15, y, cz, 0.06, d - 0.3],
          [f.x1 - 0.15, y, cz, 0.06, d - 0.3],
        ].map(([x, yy, z, sx, sz], i) => (
          <mesh
            key={i}
            geometry={g.box}
            material={line}
            position={[x, yy, z]}
            scale={[sx, 0.01, sz]}
          />
        ))}
        <mesh
          geometry={g.ring}
          material={line}
          position={[cx, y + 0.01, cz]}
          scale={[0.55, 0.3, 0.55]}
        />
        {[f.x0 + 0.15, f.x1 - 0.15].map((x) => (
          <mesh
            key={x}
            geometry={g.box}
            material={line}
            position={[x, top, cz]}
            scale={[0.12, 0.4, 0.9]}
            castShadow={shadows}
          />
        ))}
        {/* Graderías */}
        {[0, 1, 2].map((step) => (
          <mesh
            key={step}
            geometry={g.box}
            material={toon(roofColors[2])}
            position={[cx, top, f.z0 - 0.45 - step * 0.28]}
            scale={[w * 0.7, 0.16 + step * 0.16, 0.28]}
            castShadow={shadows}
          />
        ))}
      </group>
    )
  }

  if (block.kind === 'cancha-multiple') {
    const line = toon(cityColors.fieldLine)
    const y = top + 0.035
    return (
      <group>
        <mesh
          geometry={g.box}
          material={toon(cityColors.court)}
          position={[cx, top, cz]}
          scale={[w * 0.9, 0.03, d * 0.9]}
          receiveShadow
        />
        <mesh
          geometry={g.box}
          material={line}
          position={[cx, y, cz]}
          scale={[0.05, 0.01, d * 0.85]}
        />
        <mesh
          geometry={g.ring}
          material={line}
          position={[cx, y + 0.01, cz]}
          scale={[0.45, 0.3, 0.45]}
        />
        {[-1, 1].map((side) => (
          <group key={side} position={[cx + side * (w * 0.42), top, cz]}>
            <mesh
              geometry={g.stem}
              material={toon(roofColors[0])}
              scale={[0.05, 1.3, 0.05]}
              castShadow={shadows}
            />
            <mesh
              geometry={g.box}
              material={line}
              position={[-side * 0.08, 1.15, 0]}
              scale={[0.05, 0.4, 0.6]}
              castShadow={shadows}
            />
          </group>
        ))}
      </group>
    )
  }

  if (block.kind === 'plaza') {
    return (
      <group>
        <mesh
          geometry={g.box}
          material={toon(cityColors.plaza)}
          position={[cx, top, cz]}
          scale={[w, 0.03, d]}
          receiveShadow
        />
        <mesh
          geometry={g.pad}
          material={toon(roofColors[2])}
          position={[cx, top, cz]}
          scale={[1.5, 0.22, 1.5]}
          castShadow={shadows}
        />
        <mesh
          geometry={g.pad}
          material={toon(cityColors.water)}
          position={[cx, top + 0.22, cz]}
          scale={[1.3, 0.02, 1.3]}
        />
        <mesh
          geometry={g.stem}
          material={toon(cityColors.sidewalk)}
          position={[cx, top, cz]}
          scale={[0.18, 0.95, 0.18]}
          castShadow={shadows}
        />
        <mesh
          geometry={g.pad}
          material={toon(cityColors.water)}
          position={[cx, top + 0.95, cz]}
          scale={[0.45, 0.12, 0.45]}
        />
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            geometry={g.kiosk}
            material={toon(cityColors.court)}
            position={[cx + side * (w * 0.36), top, cz - d * 0.3]}
            scale={[0.45, 0.6, 0.45]}
            castShadow={shadows}
          />
        ))}
      </group>
    )
  }

  if (block.kind === 'colegio') {
    const school = toon('#fff3cf')
    const y = top
    return (
      <group>
        <mesh
          geometry={g.box}
          material={toon(cityColors.plaza)}
          position={[cx, top, cz]}
          scale={[w, 0.03, d]}
          receiveShadow
        />
        <mesh
          geometry={g.buildings[1]}
          material={resources.materials.building}
          position={[cx, y, f.z0 + 0.5]}
          scale={[w, 2 * FLOOR_HEIGHT, 1]}
          castShadow={shadows}
          receiveShadow
        />
        {[f.x0 + 0.45, f.x1 - 0.45].map((x) => (
          <mesh
            key={x}
            geometry={g.buildings[1]}
            material={resources.materials.building}
            position={[x, y, cz + 0.4]}
            scale={[0.9, 2 * FLOOR_HEIGHT, d - 1.2]}
            castShadow={shadows}
            receiveShadow
          />
        ))}
        <mesh
          geometry={g.box}
          material={toon(roofColors[1])}
          position={[cx, y + 2 * FLOOR_HEIGHT, f.z0 + 0.5]}
          scale={[w * 1.04, 0.14, 1.1]}
          castShadow={shadows}
        />
        <mesh
          geometry={g.box}
          material={school}
          position={[cx, top + 0.01, cz + 0.6]}
          scale={[w * 0.5, 0.02, d * 0.42]}
        />
        <mesh
          geometry={g.stem}
          material={toon(cityColors.road)}
          position={[cx + w * 0.18, top, cz + 0.6]}
          scale={[0.03, 1.8, 0.03]}
        />
        <mesh
          geometry={g.box}
          material={toon(roofColors[3])}
          position={[cx + w * 0.18 + 0.22, top + 1.55, cz + 0.6]}
          scale={[0.42, 0.26, 0.03]}
        />
      </group>
    )
  }

  if (block.kind === 'pista') {
    const concrete = toon('#d9d4ca')
    return (
      <group>
        <mesh
          geometry={g.box}
          material={concrete}
          position={[cx, top, cz]}
          scale={[w, 0.04, d]}
          receiveShadow
        />
        {[
          [f.x0 + 0.7, 0.35],
          [f.x1 - 0.7, -0.35],
        ].map(([x, tilt], i) => (
          <mesh
            key={i}
            geometry={g.box}
            material={toon(i === 0 ? roofColors[2] : roofColors[1])}
            position={[x, top, cz]}
            rotation={[0, 0, tilt]}
            scale={[1.2, 0.5, d * 0.7]}
            castShadow={shadows}
          />
        ))}
        <mesh
          geometry={g.box}
          material={toon(roofColors[3])}
          position={[cx, top, cz]}
          scale={[1.2, 0.22, 0.5]}
          castShadow={shadows}
        />
        <mesh
          geometry={g.ring}
          material={toon(cityColors.road)}
          position={[cx, top + 0.05, cz + d * 0.28]}
          scale={[0.7, 0.4, 0.5]}
        />
      </group>
    )
  }

  // Comunitario: plaza con centro cultural.
  return (
    <group>
      <mesh
        geometry={g.box}
        material={toon(cityColors.plaza)}
        position={[cx, top, cz]}
        scale={[w, 0.03, d]}
        receiveShadow
      />
      <mesh
        geometry={g.buildings[1]}
        position={[cx, top, cz]}
        scale={[w * 0.62, 2 * FLOOR_HEIGHT * 1.15, d * 0.55]}
        castShadow={shadows}
        receiveShadow
      >
        <meshToonMaterial
          attach="material"
          color="#e6e1fe"
          map={resources.materials.building.map}
          gradientMap={resources.materials.building.gradientMap}
        />
      </mesh>
      <mesh
        geometry={g.box}
        material={toon(cityColors.roadLine)}
        position={[cx, top + 2 * FLOOR_HEIGHT * 1.15, cz]}
        scale={[w * 0.68, 0.16, d * 0.62]}
        castShadow={shadows}
      />
      {[-1, 0, 1].map((k) => (
        <mesh
          key={k}
          geometry={g.stem}
          material={toon(cityColors.sidewalk)}
          position={[cx + k * w * 0.22, top, cz + d * 0.36]}
          scale={[0.08, 1.2, 0.08]}
          castShadow={shadows}
        />
      ))}
    </group>
  )
}
