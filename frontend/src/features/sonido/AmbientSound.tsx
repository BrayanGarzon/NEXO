import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { Icon } from '../../components/Icon'
import { createAmbientEngine, isAmbientSoundSupported, type AmbientEngine } from './ambientEngine'
import './AmbientSound.css'

type Status = 'off' | 'playing' | 'paused'

/** Solo se recuerda el volumen elegido: el sonido siempre empieza apagado. */
export const AMBIENT_VOLUME_KEY = 'nexo:sonido-ambiental:volumen:v1'
const DEFAULT_VOLUME = 40

function readVolume() {
  try {
    const raw = window.localStorage.getItem(AMBIENT_VOLUME_KEY)
    const value = Number(raw)
    return raw !== null && Number.isFinite(value) && value >= 0 && value <= 100
      ? value
      : DEFAULT_VOLUME
  } catch {
    return DEFAULT_VOLUME
  }
}

function saveVolume(volume: number) {
  try {
    window.localStorage.setItem(AMBIENT_VOLUME_KEY, String(volume))
  } catch {
    // Sin almacenamiento disponible: el volumen dura solo esta visita.
  }
}

/**
 * Control flotante del sonido ambiental de la web pública (no se usa en el panel).
 * Apagado por defecto; solo suena tras pulsar «Sonido». Permite pausar, reanudar,
 * ajustar el volumen y detenerlo de inmediato.
 */
export function AmbientSound() {
  const [status, setStatus] = useState<Status>('off')
  const [volume, setVolume] = useState(readVolume)
  // En pantallas estrechas el volumen se abre en una pequeña ventana sobre el control.
  const [volumeOpen, setVolumeOpen] = useState(false)
  const engineRef = useRef<AmbientEngine | null>(null)
  const startRef = useRef<HTMLButtonElement>(null)
  const playPauseRef = useRef<HTMLButtonElement>(null)
  const volumeToggleRef = useRef<HTMLButtonElement>(null)
  const volumeId = useId()
  const previousStatus = useRef(status)

  // Al abrir o cerrar el control, el foco pasa al botón que queda visible.
  useEffect(() => {
    const previous = previousStatus.current
    previousStatus.current = status
    if (previous === 'off' && status !== 'off') playPauseRef.current?.focus()
    if (previous !== 'off' && status === 'off') startRef.current?.focus()
  }, [status])

  // Al salir de la web pública (desmontar el layout) el sonido se detiene.
  useEffect(() => () => engineRef.current?.stop(), [])

  if (!isAmbientSoundSupported()) return null

  function start() {
    try {
      engineRef.current = createAmbientEngine(volume)
      setStatus('playing')
    } catch {
      engineRef.current = null
    }
  }

  function togglePause() {
    const engine = engineRef.current
    if (!engine) return
    if (status === 'playing') {
      void engine.pause()
      setStatus('paused')
    } else {
      void engine.resume()
      setStatus('playing')
    }
  }

  function stop() {
    engineRef.current?.stop()
    engineRef.current = null
    setVolumeOpen(false)
    setStatus('off')
  }

  function closeVolumeOnEscape(event: KeyboardEvent) {
    if (event.key !== 'Escape' || !volumeOpen) return
    setVolumeOpen(false)
    volumeToggleRef.current?.focus()
  }

  function changeVolume(next: number) {
    setVolume(next)
    saveVolume(next)
    engineRef.current?.setVolume(next)
  }

  return (
    <div
      className={`ambient ambient--${status}`}
      role="group"
      aria-label="Sonido ambiental"
      onKeyDown={closeVolumeOnEscape}
    >
      {status === 'off' ? (
        <button ref={startRef} type="button" className="ambient__start" onClick={start}>
          <Icon name="volume-off" size={20} />
          <span className="ambient__start-text">Sonido</span>
          <span className="visually-hidden"> ambiental apagado. Activar brisa suave</span>
        </button>
      ) : (
        <>
          <span className="ambient__bars" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="ambient__status" role="status">
            {status === 'playing' ? 'Sonando' : 'En pausa'}
          </span>
          <button
            ref={playPauseRef}
            type="button"
            className="ambient__button"
            onClick={togglePause}
          >
            <Icon
              name={status === 'playing' ? 'pause' : 'play'}
              size={18}
              label={status === 'playing' ? 'Pausar sonido' : 'Reanudar sonido'}
            />
          </button>
          <button
            ref={volumeToggleRef}
            type="button"
            className="ambient__button ambient__volume-toggle"
            aria-expanded={volumeOpen}
            aria-controls={volumeId}
            onClick={() => setVolumeOpen((open) => !open)}
          >
            <Icon name="volume" size={18} label="Volumen" />
          </button>
          <label
            id={volumeId}
            className={volumeOpen ? 'ambient__volume ambient__volume--open' : 'ambient__volume'}
          >
            <Icon name="volume" size={18} />
            <span className="visually-hidden">Volumen del sonido ambiental</span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={volume}
              aria-valuetext={`${volume} %`}
              onChange={(event) => changeVolume(Number(event.target.value))}
            />
          </label>
          <button type="button" className="ambient__button" onClick={stop}>
            <Icon name="close" size={18} label="Detener sonido" />
          </button>
        </>
      )}
    </div>
  )
}
