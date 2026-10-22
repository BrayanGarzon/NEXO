/*
 * Sonido ambiental de la web pública: una brisa suave sintetizada en el navegador con la
 * Web Audio API (ruido marrón filtrado con un oleaje lento de volumen). No usa archivos de
 * audio externos: es elaboración propia (ver docs/diseno/RECURSOS.md).
 *
 * Solo se crea tras una acción explícita de la persona (nunca se reproduce solo).
 */

export interface AmbientEngine {
  /** Volumen de 0 a 100. */
  setVolume(volume: number): void
  pause(): Promise<void>
  resume(): Promise<void>
  /** Detiene el sonido de inmediato y libera el contexto de audio. */
  stop(): void
}

type AudioContextClass = typeof AudioContext

function getAudioContextClass(): AudioContextClass | undefined {
  if (typeof window === 'undefined') return undefined
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextClass }).webkitAudioContext
  )
}

export function isAmbientSoundSupported() {
  return getAudioContextClass() !== undefined
}

/** Ganancia máxima: incluso al 100 % el sonido queda en un segundo plano tranquilo. */
const MAX_GAIN = 0.35
const FADE_SECONDS = 1.2
const PAUSE_FADE_SECONDS = 0.25

/** Curva perceptual: los volúmenes bajos se ajustan con más precisión. */
function toGain(volume: number) {
  const level = Math.min(Math.max(volume, 0), 100) / 100
  return level * level * MAX_GAIN
}

/** Ruido marrón en bucle, con los extremos alineados para que el bucle no haga «clic». */
function createBrownNoise(context: AudioContext, seconds: number) {
  const length = Math.floor(context.sampleRate * seconds)
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02
    data[i] = last * 3.5
  }
  const drift = data[length - 1] - data[0]
  for (let i = 0; i < length; i++) {
    data[i] -= (drift * i) / (length - 1)
  }
  return buffer
}

export function createAmbientEngine(initialVolume: number): AmbientEngine {
  const AudioContextClass = getAudioContextClass()
  if (!AudioContextClass) throw new Error('Web Audio no está disponible en este navegador')
  const context = new AudioContextClass()

  const source = context.createBufferSource()
  source.buffer = createBrownNoise(context, 6)
  source.loop = true

  // Filtro paso bajo: deja solo el murmullo grave, como viento entre hojas o un río lejano.
  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 650
  filter.Q.value = 0.5

  // Oleaje muy lento del volumen para que no suene plano.
  const swell = context.createGain()
  swell.gain.value = 0.75
  const wave = context.createOscillator()
  wave.frequency.value = 0.07
  const waveDepth = context.createGain()
  waveDepth.gain.value = 0.25
  wave.connect(waveDepth).connect(swell.gain)

  const master = context.createGain()
  master.gain.value = 0
  source.connect(filter).connect(swell).connect(master).connect(context.destination)

  let volume = initialVolume
  let stopped = false
  // Si se reanuda durante el fundido de la pausa, la pausa pendiente ya no suspende.
  let operation = 0

  function rampTo(gain: number, seconds: number) {
    const now = context.currentTime
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(master.gain.value, now)
    master.gain.linearRampToValueAtTime(gain, now + seconds)
  }

  // Algunos navegadores crean el contexto suspendido aunque venga de un clic.
  if (context.state === 'suspended') void context.resume()
  source.start()
  wave.start()
  rampTo(toGain(volume), FADE_SECONDS)

  return {
    setVolume(next) {
      volume = next
      if (!stopped && context.state === 'running') rampTo(toGain(volume), 0.15)
    },
    async pause() {
      if (stopped) return
      const current = ++operation
      rampTo(0, PAUSE_FADE_SECONDS)
      await new Promise((resolve) => setTimeout(resolve, PAUSE_FADE_SECONDS * 1000))
      if (!stopped && current === operation) await context.suspend()
    },
    async resume() {
      if (stopped) return
      operation++
      await context.resume()
      rampTo(toGain(volume), FADE_SECONDS / 2)
    },
    stop() {
      if (stopped) return
      stopped = true
      master.gain.cancelScheduledValues(context.currentTime)
      master.gain.value = 0
      source.stop()
      wave.stop()
      void context.close()
    },
  }
}
