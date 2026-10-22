import { useThree } from '@react-three/fiber'
import { useEffect, useRef, type MutableRefObject } from 'react'
import { OrthographicCamera, TOUCH, Vector3 } from 'three'
import { MapControls } from 'three/examples/jsm/controls/MapControls.js'
import { prefersReducedMotion } from '../../../app/useSectionNavigation'
import {
  CAMERA_OFFSET,
  fitZoom,
  frameFor,
  SCREEN_RIGHT,
  SCREEN_UP,
  controlsInset,
  homeView,
  type MapApi,
} from './camera'
import { CAMERA_TARGET_LIMIT, type Vec2 } from './cityLayout'

const ANIMATION_MS = 650
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const limit = (value: number) => clamp(value, -CAMERA_TARGET_LIMIT, CAMERA_TARGET_LIMIT)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

interface CameraRigProps {
  apiRef: MutableRefObject<MapApi | null>
  /** Servicios que encuadra la vista inicial en pantallas estrechas. */
  home: Vec2[]
  /**
   * Elemento que recibe los gestos: el contenedor del mapa (lienzo + pines HTML), para que
   * arrastrar o pellizcar funcione aunque el gesto empiece sobre un pin.
   */
  getSurface: () => HTMLElement | null
  /** La rueda solo acerca después de interactuar con el mapa (o con Ctrl/⌘). */
  wheelActiveRef: MutableRefObject<boolean>
  onWheelBlocked: () => void
  onInteract: () => void
}

/**
 * Cámara ortográfica con MapControls: arrastrar desplaza; la rueda y el pellizco acercan.
 * Sin rotación y con el centro limitado a la ciudad para que nadie «se pierda».
 * Solo se pide un fotograma cuando la vista cambia.
 */
export function CameraRig({
  apiRef,
  home,
  getSurface,
  wheelActiveRef,
  onWheelBlocked,
  onInteract,
}: CameraRigProps) {
  const get = useThree((state) => state.get)
  const invalidate = useThree((state) => state.invalidate)
  const width = useThree((state) => state.size.width)
  const height = useThree((state) => state.size.height)
  const controlsRef = useRef<MapControls | null>(null)
  const animation = useRef(0)
  const userMoved = useRef(false)

  useEffect(() => {
    const { camera, gl } = get()
    const surface = getSurface() ?? gl.domElement
    const controls = new MapControls(camera, surface)
    controlsRef.current = controls
    controls.enableRotate = false
    controls.enableDamping = false
    controls.screenSpacePanning = false
    controls.zoomToCursor = true
    controls.zoomSpeed = 2
    // Un dedo desplaza la página; dos dedos mueven y acercan el mapa.
    controls.touches = { ONE: -1 as TOUCH, TWO: TOUCH.DOLLY_PAN }
    surface.style.touchAction = 'pan-y'

    // Un clic que llega al final de un arrastre no debe seleccionar un pin.
    let downX = 0
    let downY = 0
    const onPointerDown = (event: PointerEvent) => {
      downX = event.clientX
      downY = event.clientY
    }
    const onClickCapture = (event: MouseEvent) => {
      if (Math.hypot(event.clientX - downX, event.clientY - downY) > 6) {
        event.stopPropagation()
        event.preventDefault()
      }
    }
    surface.addEventListener('pointerdown', onPointerDown, { capture: true })
    surface.addEventListener('click', onClickCapture, { capture: true })

    const onChange = () => {
      const target = controls.target
      const x = limit(target.x)
      const z = limit(target.z)
      if (x !== target.x || z !== target.z) {
        camera.position.x += x - target.x
        camera.position.z += z - target.z
        target.set(x, target.y, z)
        // MapControls ancla el arrastre con un rayo desde la cámara: debe ver la posición nueva.
        camera.updateMatrixWorld()
      }
      invalidate()
    }
    const onStart = () => {
      userMoved.current = true
      cancelAnimationFrame(animation.current)
      onInteract()
    }
    const onWheel = (event: WheelEvent) => {
      controls.enableZoom = wheelActiveRef.current || event.ctrlKey || event.metaKey
      if (!controls.enableZoom) onWheelBlocked()
    }
    controls.addEventListener('change', onChange)
    controls.addEventListener('start', onStart)
    // En captura: decide antes que MapControls si la rueda acerca o desplaza la página.
    surface.addEventListener('wheel', onWheel, { capture: true, passive: true })
    return () => {
      cancelAnimationFrame(animation.current)
      controls.removeEventListener('change', onChange)
      controls.removeEventListener('start', onStart)
      surface.removeEventListener('wheel', onWheel, { capture: true })
      surface.removeEventListener('pointerdown', onPointerDown, { capture: true })
      surface.removeEventListener('click', onClickCapture, { capture: true })
      controls.dispose()
      controlsRef.current = null
    }
  }, [get, invalidate, getSurface, wheelActiveRef, onWheelBlocked, onInteract])

  // Límites de zoom según el tamaño del lienzo; encuadre inicial y al cambiar de tamaño.
  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    const camera = get().camera as OrthographicCamera
    const fit = fitZoom(width, height)
    // Permite alejarse hasta ver la isla completa (ciudad + afueras).
    controls.minZoom = fit * 0.72
    controls.maxZoom = fit * 4.5
    if (userMoved.current) {
      camera.zoom = clamp(camera.zoom, controls.minZoom, controls.maxZoom)
    } else {
      const view = homeView(home, width, height, controlsInset(width))
      camera.zoom = view.zoom
      controls.target.set(limit(view.center.x), 0, limit(view.center.z))
      camera.position.copy(controls.target).add(CAMERA_OFFSET)
    }
    camera.lookAt(controls.target)
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
    controls.update()
    invalidate()
  }, [get, invalidate, width, height, home])

  useEffect(() => {
    function apply(target: Vector3, zoom: number) {
      const controls = controlsRef.current
      if (!controls) return
      const camera = get().camera as OrthographicCamera
      controls.target.copy(target)
      camera.position.copy(target).add(CAMERA_OFFSET)
      camera.zoom = clamp(zoom, controls.minZoom, controls.maxZoom)
      camera.lookAt(target)
      camera.updateProjectionMatrix()
      camera.updateMatrixWorld()
      controls.update()
      invalidate()
    }

    function animateTo(target: Vector3, zoom: number) {
      const controls = controlsRef.current
      if (!controls) return
      cancelAnimationFrame(animation.current)
      if (prefersReducedMotion()) {
        apply(target, zoom)
        return
      }
      const fromTarget = controls.target.clone()
      const fromZoom = (get().camera as OrthographicCamera).zoom
      const start = performance.now()
      const step = () => {
        const t = easeOut(Math.min(1, (performance.now() - start) / ANIMATION_MS))
        apply(fromTarget.clone().lerp(target, t), fromZoom + (zoom - fromZoom) * t)
        if (t < 1) animation.current = requestAnimationFrame(step)
      }
      animation.current = requestAnimationFrame(step)
    }

    const zoomNow = () => (get().camera as OrthographicCamera).zoom
    const targetNow = () => controlsRef.current?.target.clone() ?? new Vector3()

    apiRef.current = {
      zoomIn: () => animateTo(targetNow(), zoomNow() * 1.5),
      zoomOut: () => animateTo(targetNow(), zoomNow() / 1.5),
      reset: () => {
        userMoved.current = false
        const view = homeView(home, width, height, controlsInset(width))
        animateTo(new Vector3(limit(view.center.x), 0, limit(view.center.z)), view.zoom)
      },
      focus: (point) => {
        userMoved.current = true
        animateTo(
          new Vector3(limit(point.x), 0, limit(point.z)),
          Math.max(zoomNow(), fitZoom(width, height) * 2.2),
        )
      },
      panBy: (dx, dy) => {
        userMoved.current = true
        const units = 1 / zoomNow()
        const target = targetNow()
          .addScaledVector(SCREEN_RIGHT, dx * units)
          .addScaledVector(SCREEN_UP, dy * units)
        animateTo(new Vector3(limit(target.x), 0, limit(target.z)), zoomNow())
      },
      fitTo: (points) => {
        if (points.length === 0) return
        userMoved.current = true
        const { center, zoom } = frameFor(points, width, height, controlsInset(width))
        const fit = fitZoom(width, height)
        animateTo(
          new Vector3(limit(center.x), 0, limit(center.z)),
          // Nunca más cerca de lo necesario para que quepan todos (como mucho, ×2,6).
          Math.min(zoom, fit * 2.6),
        )
      },
    }
    return () => {
      apiRef.current = null
    }
  }, [apiRef, get, invalidate, width, height, home])

  return null
}
