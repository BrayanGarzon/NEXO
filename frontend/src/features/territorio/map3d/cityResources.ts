import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DataTexture,
  IcosahedronGeometry,
  LinearMipmapLinearFilter,
  MeshBasicMaterial,
  MeshToonMaterial,
  NearestFilter,
  RedFormat,
  RepeatWrapping,
  RGBAFormat,
  SRGBColorSpace,
  TorusGeometry,
  type Material,
  type Texture,
} from 'three'
import { MAX_FLOORS, RIVER_PATH, RIVER_WIDTH } from './cityLayout'

/*
 * Geometrías, materiales y texturas compartidos por toda la ciudad. Se crean una vez por
 * escena y se liberan juntos al desmontarla (disposeCityResources). Las texturas se generan
 * por código: no hay imágenes ni modelos externos.
 */

/** Degradado de 3 tonos para el sombreado «toon» (aspecto de videojuego ilustrado). */
function createToonGradient() {
  const texture = new DataTexture(new Uint8Array([150, 205, 255]), 3, 1, RedFormat)
  texture.minFilter = NearestFilter
  texture.magFilter = NearestFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}

/** Celda de fachada: muro claro con una ventana (se repite por piso y por columna). */
function createWindowTexture() {
  const size = 32
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      const isWindow = x >= 9 && x <= 22 && y >= 9 && y <= 23
      const isSill = x >= 8 && x <= 23 && y === 8
      const isFloorLine = y <= 1
      const [r, g, b] = isWindow
        ? [92, 130, 140]
        : isSill
          ? [210, 214, 212]
          : isFloorLine
            ? [228, 226, 220]
            : [255, 255, 255]
      data.set([r, g, b, 255], i)
    }
  }
  const texture = new DataTexture(data, size, size, RGBAFormat)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.magFilter = NearestFilter
  texture.minFilter = LinearMipmapLinearFilter
  texture.generateMipmaps = true
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

/** Caja unitaria con la base en y = 0 (se escala por instancia). */
function baseBox() {
  return new BoxGeometry(1, 1, 1).translate(0, 0.5, 0)
}

/**
 * Edificio de `floors` pisos: caja unitaria cuyas caras laterales repiten la ventana
 * 3 veces a lo ancho y una vez por piso; techo y base usan el color liso del muro.
 */
function buildingGeometry(floors: number) {
  const geometry = baseBox()
  const uv = geometry.getAttribute('uv') as BufferAttribute
  for (let face = 0; face < 6; face++) {
    for (let v = 0; v < 4; v++) {
      const index = face * 4 + v
      if (face === 2 || face === 3) uv.setXY(index, 0.05, 0.6)
      else uv.setXY(index, uv.getX(index) * 3, uv.getY(index) * floors)
    }
  }
  uv.needsUpdate = true
  return geometry
}

/** Cinta plana que sigue el eje del río. */
function riverGeometry(width: number) {
  const positions: number[] = []
  const indices: number[] = []
  RIVER_PATH.forEach((point, i) => {
    const prev = RIVER_PATH[Math.max(0, i - 1)]
    const next = RIVER_PATH[Math.min(RIVER_PATH.length - 1, i + 1)]
    const dx = next.x - prev.x
    const dz = next.z - prev.z
    const length = Math.hypot(dx, dz) || 1
    const nx = (-dz / length) * (width / 2)
    const nz = (dx / length) * (width / 2)
    positions.push(point.x + nx, 0, point.z + nz, point.x - nx, 0, point.z - nz)
    if (i > 0) {
      const a = (i - 1) * 2
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
    }
  })
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  // Las normales deben apuntar hacia arriba sea cual sea el sentido de los triángulos.
  const normals = geometry.getAttribute('normal') as BufferAttribute
  for (let i = 0; i < normals.count; i++) normals.setXYZ(i, 0, 1, 0)
  return geometry
}

export function createCityResources() {
  const gradientMap = createToonGradient()
  const windows = createWindowTexture()

  const geometries = {
    box: baseBox(),
    buildings: Array.from({ length: MAX_FLOORS }, (_, i) => buildingGeometry(i + 1)),
    crown: new IcosahedronGeometry(1, 0),
    trunk: new CylinderGeometry(0.08, 0.12, 1, 6).translate(0, 0.5, 0),
    pad: new CylinderGeometry(1, 1, 1, 24).translate(0, 0.5, 0),
    kiosk: new CylinderGeometry(1, 1, 1, 6).translate(0, 0.5, 0),
    cone: new CylinderGeometry(0, 1, 1, 6).translate(0, 0.5, 0),
    stem: new CylinderGeometry(1, 1, 1, 10).translate(0, 0.5, 0),
    ring: new TorusGeometry(1, 0.07, 8, 40).rotateX(-Math.PI / 2),
    disc: new CircleGeometry(1, 40).rotateX(-Math.PI / 2),
    river: riverGeometry(RIVER_WIDTH),
    riverBank: riverGeometry(RIVER_WIDTH + 0.6),
  }

  const toonCache = new Map<string, MeshToonMaterial>()
  /** Material «toon» de un color (se comparte entre todas las piezas de ese color). */
  function toon(color: string) {
    let material = toonCache.get(color)
    if (!material) {
      material = new MeshToonMaterial({ color: new Color(color), gradientMap })
      toonCache.set(color, material)
    }
    return material
  }

  const materials = {
    /** Blanco: el color lo da cada instancia (instanceColor). */
    instanced: new MeshToonMaterial({ color: '#ffffff', gradientMap }),
    building: new MeshToonMaterial({ color: '#ffffff', map: windows, gradientMap }),
    beam: new MeshBasicMaterial({
      color: '#8876f6',
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    }),
  }

  return {
    geometries,
    materials,
    toon,
    dispose() {
      Object.values(geometries)
        .flat()
        .forEach((geometry) => geometry.dispose())
      const all: Material[] = [...Object.values(materials), ...toonCache.values()]
      all.forEach((material) => material.dispose())
      const textures: Texture[] = [gradientMap, windows]
      textures.forEach((texture) => texture.dispose())
      toonCache.clear()
    },
  }
}

export type CityResources = ReturnType<typeof createCityResources>
