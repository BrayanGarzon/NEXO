import { Vector3 } from 'three'
import { CITY_HALF, type Vec2 } from './cityLayout'

/** Dirección fija de la cámara (vista isométrica, sin rotación). */
export const CAMERA_OFFSET = new Vector3(1, 1.15, 1).normalize().multiplyScalar(80)
/** Direcciones de pantalla «derecha» y «arriba» proyectadas sobre el suelo. */
export const SCREEN_RIGHT = new Vector3(1, 0, -1).normalize()
export const SCREEN_UP = new Vector3(-1, 0, -1).normalize()

/** Órdenes de cámara que usan la barra de controles, el teclado y la selección. */
export interface MapApi {
  zoomIn: () => void
  zoomOut: () => void
  reset: () => void
  focus: (point: Vec2) => void
  /** Desplaza la vista en píxeles de pantalla. */
  panBy: (dx: number, dy: number) => void
  /** Encuadra un conjunto de puntos (p. ej., los servicios filtrados). */
  fitTo: (points: Vec2[]) => void
}

/** Zoom (píxeles por unidad) que encuadra la ciudad completa en el lienzo. */
export function fitZoom(width: number, height: number) {
  return Math.max(3, Math.min(width / (CITY_HALF * 2.9), height / (CITY_HALF * 2)))
}

/** Seno de la elevación de la cámara: cuánto se acorta en pantalla la profundidad del suelo. */
const ELEVATION_SIN = CAMERA_OFFSET.y / CAMERA_OFFSET.length()
/** Altura en pantalla que ocupan los marcadores sobre su base (unidades de escena). */
const MARKER_SCREEN_HEIGHT = 3.2

/**
 * Centro y zoom para que todos los puntos quepan en un lienzo de `width × height`
 * píxeles, con margen. Puro: no toca la cámara.
 */
export function frameFor(points: Vec2[], width: number, height: number, insetRight = 0) {
  const horizontal = points.map((p) => p.x * SCREEN_RIGHT.x + p.z * SCREEN_RIGHT.z)
  const vertical = points.map((p) => p.x * SCREEN_UP.x + p.z * SCREEN_UP.z)
  const spanX = Math.max(...horizontal) - Math.min(...horizontal)
  const spanY = (Math.max(...vertical) - Math.min(...vertical)) * ELEVATION_SIN
  const padding = 6
  const zoom = Math.min(
    (width - insetRight) / (spanX + padding * 2),
    height / (spanY + MARKER_SCREEN_HEIGHT + padding * 2),
  )
  // Centro de la caja que contiene los puntos (en ejes de pantalla), no su promedio: así
  // ningún extremo queda fuera. Con una franja reservada a la derecha (controles), el
  // centro se desplaza hacia allí para que los puntos queden en el área libre.
  const midX = (Math.max(...horizontal) + Math.min(...horizontal)) / 2 + insetRight / 2 / zoom
  const midY = (Math.max(...vertical) + Math.min(...vertical)) / 2
  return {
    center: {
      x: SCREEN_RIGHT.x * midX + SCREEN_UP.x * midY,
      z: SCREEN_RIGHT.z * midX + SCREEN_UP.z * midY,
    },
    zoom,
  }
}

/** Zoom de la vista inicial: la ciudad completa con sus afueras (río, bosque y montañas). */
export const HOME_ZOOM_FACTOR = 0.8

/** Por debajo de este ancho (px) la vista inicial encuadra los servicios, no la ciudad. */
export const NARROW_WIDTH = 576

/**
 * Vista inicial y de «restablecer».
 * - Pantallas anchas: toda la ciudad con sus afueras, apartada de los controles.
 * - Pantallas estrechas: los servicios (`points`); con la ciudad completa en tan poco
 *   espacio los pines se amontonarían. La ciudad se explora alejando la cámara.
 */
export function homeView(points: Vec2[], width: number, height: number, insetRight = 0) {
  const fit = fitZoom(width - insetRight, height)
  if (width < NARROW_WIDTH && points.length > 0) {
    const { center, zoom } = frameFor(points, width, height, insetRight)
    return { center, zoom: Math.max(zoom, fit) }
  }
  const zoom = fit * HOME_ZOOM_FACTOR
  const shift = insetRight / 2 / zoom
  return { center: { x: SCREEN_RIGHT.x * shift, z: SCREEN_RIGHT.z * shift }, zoom }
}

/** Ancho que ocupan los controles del mapa a la derecha (no deben tapar servicios). */
export function controlsInset(width: number) {
  return width < 576 ? 64 : 140
}
