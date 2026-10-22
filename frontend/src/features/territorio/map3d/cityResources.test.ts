import { describe, expect, it } from 'vitest'
import { MAX_FLOORS } from './cityLayout'
import { createCityResources } from './cityResources'

describe('recursos de la ciudad', () => {
  it('crea las piezas compartidas y reutiliza un material por color', () => {
    const resources = createCityResources()
    expect(resources.geometries.buildings).toHaveLength(MAX_FLOORS)
    expect(resources.toon('#ff8f70')).toBe(resources.toon('#ff8f70'))
    expect(resources.toon('#ff8f70')).not.toBe(resources.toon('#8876f6'))
    resources.dispose()
  })

  it('libera todas las geometrías, materiales y texturas al desmontar', () => {
    const resources = createCityResources()
    const material = resources.toon('#ffd66b')
    const tracked = [
      ...Object.values(resources.geometries).flat(),
      ...Object.values(resources.materials),
      material,
      resources.materials.building.map!,
      resources.materials.building.gradientMap!,
    ]
    const disposed = new Set<object>()
    for (const item of tracked) item.addEventListener('dispose', () => disposed.add(item))
    resources.dispose()
    expect(disposed.size).toBe(tracked.length)
  })
})
