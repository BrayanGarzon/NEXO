import { describe, expect, it } from 'vitest'
import { breathingStateAt, totalDurationMs } from './breathing'
import { breathingCycles, breathingPhases } from './pausaContent'

const at = (ms: number) => breathingStateAt(ms, breathingPhases, breathingCycles)

describe('breathingStateAt', () => {
  it('empieza inhalando en el ciclo 1 con 4 segundos', () => {
    expect(at(0)).toMatchObject({ done: false, cycle: 1, phaseIndex: 0, secondsLeft: 4 })
    expect(at(0).phase.label).toBe('Inhala')
  })

  it('cuenta los segundos restantes y el avance de la fase', () => {
    const state = at(1500)
    expect(state.secondsLeft).toBe(3)
    expect(state.phaseProgress).toBeCloseTo(0.375)
  })

  it('recorre las fases en orden y pasa al siguiente ciclo', () => {
    expect(at(4000).phase.label).toBe('Sostén')
    expect(at(8000).phase.label).toBe('Exhala')
    expect(at(12000).phase.label).toBe('Pausa')
    expect(at(16000)).toMatchObject({ cycle: 2, phaseIndex: 0 })
  })

  it('termina tras todos los ciclos', () => {
    const total = totalDurationMs(breathingPhases, breathingCycles)
    expect(total).toBe(64000)
    expect(at(total - 1).done).toBe(false)
    expect(at(total)).toMatchObject({ done: true, cycle: 4, secondsLeft: 0 })
  })
})
