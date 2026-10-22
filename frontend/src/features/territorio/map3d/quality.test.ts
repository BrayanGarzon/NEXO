import { describe, expect, it } from 'vitest'
import { chooseQuality } from './quality'

describe('calidad gráfica', () => {
  it('usa calidad alta en escritorio', () => {
    const quality = chooseQuality({ coarsePointer: false, width: 1440, deviceMemory: 8, cores: 8 })
    expect(quality).toMatchObject({ level: 'alta', shadows: true, dpr: [1, 2], treeDensity: 1 })
  })

  it.each([
    ['pantalla táctil', { coarsePointer: true, width: 1200 }],
    ['ventana estrecha', { coarsePointer: false, width: 390 }],
    ['poca memoria', { coarsePointer: false, width: 1440, deviceMemory: 4 }],
    ['pocos núcleos', { coarsePointer: false, width: 1440, cores: 4 }],
  ])('reduce sombras y resolución con %s', (_, hints) => {
    const quality = chooseQuality(hints)
    expect(quality.level).toBe('baja')
    expect(quality.shadows).toBe(false)
    expect(quality.dpr[1]).toBeLessThanOrEqual(1.5)
    expect(quality.treeDensity).toBeLessThan(1)
  })
})
