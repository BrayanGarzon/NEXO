import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAmbientEngine, isAmbientSoundSupported } from './ambientEngine'

/** AudioParam mínimo que registra las rampas de volumen. */
function fakeParam(value = 0) {
  return {
    value,
    cancelScheduledValues: vi.fn(),
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
  }
}

function fakeNode<T extends object>(extra: T) {
  return { ...extra, connect: vi.fn((target: unknown) => target) }
}

class FakeAudioContext {
  static last: FakeAudioContext
  state: AudioContextState = 'running'
  sampleRate = 8000
  currentTime = 0
  destination = {}
  master = fakeParam()
  source = fakeNode({ buffer: null, loop: false, start: vi.fn(), stop: vi.fn() })
  wave = fakeNode({ frequency: fakeParam(), start: vi.fn(), stop: vi.fn() })
  gains: ReturnType<typeof fakeParam>[] = []
  suspend = vi.fn(async () => {
    this.state = 'suspended'
  })
  resume = vi.fn(async () => {
    this.state = 'running'
  })
  close = vi.fn(async () => {
    this.state = 'closed'
  })
  constructor() {
    FakeAudioContext.last = this
  }
  createBuffer(_channels: number, length: number) {
    const data = new Float32Array(length)
    return { getChannelData: () => data }
  }
  createBufferSource() {
    return this.source
  }
  createBiquadFilter() {
    return fakeNode({ type: '', frequency: fakeParam(), Q: fakeParam() })
  }
  createOscillator() {
    return this.wave
  }
  createGain() {
    // La última ganancia creada es la general (master).
    const gain = this.gains.length === 2 ? this.master : fakeParam()
    this.gains.push(gain)
    return fakeNode({ gain })
  }
}

const lastRamp = () => FakeAudioContext.last.master.linearRampToValueAtTime.mock.calls.at(-1)

describe('ambientEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('AudioContext', FakeAudioContext)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('detecta si Web Audio está disponible', () => {
    expect(isAmbientSoundSupported()).toBe(true)
    vi.stubGlobal('AudioContext', undefined)
    expect(isAmbientSoundSupported()).toBe(false)
  })

  it('arranca con un fundido suave hasta el volumen elegido', () => {
    createAmbientEngine(100)
    const context = FakeAudioContext.last
    expect(context.source.loop).toBe(true)
    expect(context.source.start).toHaveBeenCalledOnce()
    expect(lastRamp()?.[0]).toBeCloseTo(0.35)

    createAmbientEngine(50)
    expect(lastRamp()?.[0]).toBeCloseTo(0.0875)
  })

  it('una reanudación durante el fundido de pausa cancela la suspensión', async () => {
    const engine = createAmbientEngine(40)
    const context = FakeAudioContext.last

    const pausing = engine.pause()
    await engine.resume()
    await vi.runAllTimersAsync()
    await pausing
    expect(context.suspend).not.toHaveBeenCalled()

    const pausingAgain = engine.pause()
    await vi.runAllTimersAsync()
    await pausingAgain
    expect(context.suspend).toHaveBeenCalledOnce()
  })

  it('detener silencia al instante y libera el contexto', () => {
    const engine = createAmbientEngine(40)
    const context = FakeAudioContext.last
    engine.stop()
    expect(context.master.value).toBe(0)
    expect(context.source.stop).toHaveBeenCalledOnce()
    expect(context.close).toHaveBeenCalledOnce()

    engine.setVolume(90)
    engine.stop()
    expect(context.close).toHaveBeenCalledOnce()
  })
})
