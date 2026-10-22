import { describe, expect, it } from 'vitest'
import { fitZoom, frameFor, HOME_ZOOM_FACTOR, homeView, NARROW_WIDTH } from './camera'
import { CITY_HALF } from './cityLayout'

describe('cámara', () => {
  it('encuadra la ciudad según el lado más limitante del lienzo', () => {
    expect(fitZoom(CITY_HALF * 2.9 * 10, 4000)).toBeCloseTo(10)
    expect(fitZoom(4000, CITY_HALF * 2 * 10)).toBeCloseTo(10)
    // Nunca por debajo del mínimo legible.
    expect(fitZoom(100, 100)).toBe(3)
  })

  it('en pantallas anchas la vista inicial muestra la ciudad completa, apartada de los controles', () => {
    const services = [
      { x: -10, z: -8 },
      { x: 12, z: 6 },
    ]
    const plain = homeView(services, 800, 600)
    expect(plain.center.x).toBeCloseTo(0)
    expect(plain.center.z).toBeCloseTo(0)
    expect(plain.zoom).toBeCloseTo(fitZoom(800, 600) * HOME_ZOOM_FACTOR)
    const withControls = homeView(services, 800, 600, 140)
    expect(withControls.zoom).toBeLessThan(plain.zoom)
    expect(withControls.center).not.toEqual(plain.center)
  })

  it('en pantallas estrechas encuadra los servicios para que no se amontonen', () => {
    const services = [
      { x: -10, z: -8 },
      { x: 12, z: 6 },
    ]
    const narrow = homeView(services, NARROW_WIDTH - 1, 350)
    expect(narrow.zoom).toBeGreaterThanOrEqual(fitZoom(NARROW_WIDTH - 1, 350))
    expect(narrow).toEqual(
      expect.objectContaining({
        zoom: Math.max(
          frameFor(services, NARROW_WIDTH - 1, 350).zoom,
          fitZoom(NARROW_WIDTH - 1, 350),
        ),
      }),
    )
  })

  it('el encuadre de varios puntos usa el centro de su caja, no su promedio', () => {
    // Tres puntos amontonados a un lado y uno lejos: el promedio cortaría el lejano.
    const points = [
      { x: -10, z: 0 },
      { x: -9, z: 0 },
      { x: -8, z: 0 },
      { x: 10, z: 0 },
    ]
    const { center } = frameFor(points, 800, 600)
    expect(center.x).toBeCloseTo(0)
    expect(center.z).toBeCloseTo(0)
  })

  it('centra el encuadre en los puntos y aleja más cuanto más separados están', () => {
    const near = frameFor(
      [
        { x: 2, z: 2 },
        { x: 4, z: 4 },
      ],
      800,
      600,
    )
    const far = frameFor(
      [
        { x: -15, z: -15 },
        { x: 15, z: 15 },
      ],
      800,
      600,
    )
    expect(near.center.x).toBeCloseTo(3)
    expect(near.center.z).toBeCloseTo(3)
    expect(far.center.x).toBeCloseTo(0)
    expect(far.center.z).toBeCloseTo(0)
    expect(far.zoom).toBeLessThan(near.zoom)
  })
})
