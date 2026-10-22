/*
 * Lógica del ejercicio de respiración guiada (pura, sin React), para poder probarla.
 */

export type PhaseId = 'inhala' | 'sosten' | 'exhala' | 'pausa'

export interface BreathPhase {
  id: PhaseId
  label: string
  seconds: number
}

export interface BreathingState {
  done: boolean
  /** Ciclo actual, empezando en 1. */
  cycle: number
  phaseIndex: number
  phase: BreathPhase
  /** Segundos que faltan de la fase (redondeado hacia arriba, mínimo 1 mientras dura). */
  secondsLeft: number
  /** Avance de la fase actual, de 0 a 1. */
  phaseProgress: number
}

export function cycleDurationMs(phases: BreathPhase[]) {
  return phases.reduce((total, phase) => total + phase.seconds * 1000, 0)
}

export function totalDurationMs(phases: BreathPhase[], cycles: number) {
  return cycleDurationMs(phases) * cycles
}

/** Estado del ejercicio tras `elapsedMs` milisegundos de práctica. */
export function breathingStateAt(
  elapsedMs: number,
  phases: BreathPhase[],
  cycles: number,
): BreathingState {
  const total = totalDurationMs(phases, cycles)
  if (elapsedMs >= total) {
    const last = phases.length - 1
    return {
      done: true,
      cycle: cycles,
      phaseIndex: last,
      phase: phases[last],
      secondsLeft: 0,
      phaseProgress: 1,
    }
  }

  const elapsed = Math.max(0, elapsedMs)
  const cycleMs = cycleDurationMs(phases)
  const cycle = Math.floor(elapsed / cycleMs) + 1
  let withinCycle = elapsed % cycleMs
  let phaseIndex = 0
  while (withinCycle >= phases[phaseIndex].seconds * 1000) {
    withinCycle -= phases[phaseIndex].seconds * 1000
    phaseIndex++
  }
  const phase = phases[phaseIndex]
  const phaseMs = phase.seconds * 1000
  return {
    done: false,
    cycle,
    phaseIndex,
    phase,
    secondsLeft: Math.ceil((phaseMs - withinCycle) / 1000),
    phaseProgress: withinCycle / phaseMs,
  }
}
