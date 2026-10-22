import { useEffect, useState, type CSSProperties } from 'react'
import { prefersReducedMotion } from '../../app/useSectionNavigation'
import { Annotation } from '../../components/Annotation'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { LlanoScene } from '../../components/illustrations/LlanoScene'
import { breathingStateAt, totalDurationMs } from './breathing'
import { breathingCycles, breathingPhases, exercises, type StepsExercise } from './pausaContent'
import './PausaSection.css'

const TICK_MS = 100

export function PausaSection() {
  const [exerciseId, setExerciseId] = useState(exercises[0].id)
  const exercise = exercises.find((item) => item.id === exerciseId) ?? exercises[0]

  return (
    <section id="pausa" className="pausa" aria-labelledby="pausa-title">
      <div className="pausa__inner container">
        <div className="pausa__intro">
          <p className="section-eyebrow">
            <Icon name="feather" size={18} /> Espacio Pausa
          </p>
          <h2 id="pausa-title" className="pausa__title hand">
            Un momento <span className="marker">para ti</span>
          </h2>
          <p className="pausa__lead">
            Respira, relájate y reconéctate. Aquí encontrarás herramientas para tu bienestar.
          </p>

          <ul className="pausa__menu" aria-label="Ejercicios">
            {exercises.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={
                    item.id === exercise.id
                      ? 'pausa__option pausa__option--active'
                      : 'pausa__option'
                  }
                  aria-pressed={item.id === exercise.id}
                  onClick={() => setExerciseId(item.id)}
                >
                  <Icon name={item.icon} size={18} />
                  {item.title}
                </button>
              </li>
            ))}
          </ul>

          <p className="pausa__disclaimer">
            Son herramientas educativas de autocuidado; no reemplazan la atención profesional. Si
            necesitas apoyo, usa Brújula o llama al <a href="tel:123">123</a> en una emergencia.
          </p>
        </div>

        <div className="pausa__stage">
          <div className="pausa__backdrop" aria-hidden="true">
            <LlanoScene />
          </div>
          <Annotation tone="lila" tilt={6} className="pausa__note">
            Un respiro también es avance
          </Annotation>
          <div className="pausa__panel">
            <h3 className="pausa__exercise-title">{exercise.title}</h3>
            <p className="pausa__exercise-intro">{exercise.intro}</p>
            {exercise.kind === 'breathing' ? (
              <BreathingPlayer />
            ) : (
              <StepsPlayer key={exercise.id} exercise={exercise} />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function BreathingPlayer() {
  // Respeta la opción «Reducir movimiento» del sistema operativo.
  const [reduceMotion] = useState(prefersReducedMotion)
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const state = breathingStateAt(elapsed, breathingPhases, breathingCycles)
  const active = running && !state.done
  const started = elapsed > 0
  const total = totalDurationMs(breathingPhases, breathingCycles)

  useEffect(() => {
    if (!active) return
    let last = Date.now()
    const timer = setInterval(() => {
      // El intervalo se calcula antes: el actualizador de estado puede ejecutarse más tarde.
      const now = Date.now()
      const delta = now - last
      last = now
      setElapsed((value) => Math.min(value + delta, total))
    }, TICK_MS)
    return () => clearInterval(timer)
  }, [active, total])

  // El círculo crece al inhalar y se encoge al exhalar (si no se reduce el movimiento).
  const scale = reduceMotion
    ? 1
    : state.phase.id === 'inhala'
      ? 0.62 + 0.38 * (started ? state.phaseProgress : 0)
      : state.phase.id === 'sosten'
        ? 1
        : state.phase.id === 'exhala'
          ? 1 - 0.38 * state.phaseProgress
          : 0.62

  function restart() {
    setRunning(false)
    setElapsed(0)
  }

  const primaryLabel = state.done
    ? 'Repetir'
    : running
      ? 'Pausar'
      : started
        ? 'Continuar'
        : 'Comenzar'

  return (
    <div className="breathing">
      <div
        className={reduceMotion ? 'breathing__ring breathing__ring--static' : 'breathing__ring'}
        style={{ '--progress': `${(elapsed / total) * 360}deg` } as CSSProperties}
      >
        <div className="breathing__orb" style={{ transform: `scale(${scale})` }} />
        <div className="breathing__text">
          {state.done ? (
            <>
              <span className="breathing__phase">¡Bien hecho!</span>
              <span className="breathing__count">Completaste {breathingCycles} ciclos</span>
            </>
          ) : (
            <>
              <span className="breathing__phase">{state.phase.label}</span>
              <span className="breathing__count">
                {state.secondsLeft} {state.secondsLeft === 1 ? 'segundo' : 'segundos'}
              </span>
            </>
          )}
        </div>
      </div>

      {reduceMotion && !state.done && (
        <div className="breathing__bar" aria-hidden="true">
          <span style={{ width: `${(started ? state.phaseProgress : 0) * 100}%` }} />
        </div>
      )}

      {/* Anuncia solo los cambios de fase, no cada segundo. */}
      <p className="visually-hidden" aria-live="polite">
        {state.done
          ? 'Ejercicio completado'
          : started
            ? `${state.phase.label}, ciclo ${state.cycle} de ${breathingCycles}`
            : ''}
      </p>

      <div className="pausa__controls">
        <Button variant="ghost" size="sm" iconStart="refresh" onClick={restart} disabled={!started}>
          Reiniciar
        </Button>
        <span className="pausa__counter">
          Ciclo {state.cycle} de {breathingCycles}
        </span>
        <Button
          size="sm"
          onClick={() => {
            if (state.done) {
              setElapsed(0)
              setRunning(true)
            } else setRunning((value) => !value)
          }}
        >
          {primaryLabel}
        </Button>
      </div>
    </div>
  )
}

function StepsPlayer({ exercise }: { exercise: StepsExercise }) {
  const [index, setIndex] = useState(0)
  const last = exercise.steps.length - 1

  return (
    <div className="steps-player">
      <p className="steps-player__step" aria-live="polite">
        <span className="visually-hidden">
          Paso {index + 1} de {exercise.steps.length}:{' '}
        </span>
        {exercise.steps[index]}
      </p>
      <div className="pausa__controls">
        <button
          type="button"
          className="pausa__arrow"
          onClick={() => setIndex(index - 1)}
          disabled={index === 0}
        >
          <Icon name="arrow-left" label="Paso anterior" />
        </button>
        <span className="pausa__counter" aria-hidden="true">
          {index + 1} / {exercise.steps.length}
        </span>
        <button
          type="button"
          className="pausa__arrow"
          onClick={() => setIndex(index + 1)}
          disabled={index === last}
        >
          <Icon name="arrow-right" label="Paso siguiente" />
        </button>
      </div>
    </div>
  )
}
