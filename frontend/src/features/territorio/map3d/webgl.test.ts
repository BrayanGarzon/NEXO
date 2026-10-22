import { afterEach, describe, expect, it, vi } from 'vitest'
import { isWebGLAvailable } from './webgl'

describe('isWebGLAvailable', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('es falso cuando el navegador no tiene WebGL (como jsdom)', () => {
    expect(isWebGLAvailable()).toBe(false)
  })

  it('es verdadero si se obtiene un contexto y lo libera enseguida', () => {
    const loseContext = vi.fn()
    vi.stubGlobal('WebGLRenderingContext', function WebGLRenderingContext() {})
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      getExtension: () => ({ loseContext }),
    } as unknown as RenderingContext)
    expect(isWebGLAvailable()).toBe(true)
    expect(loseContext).toHaveBeenCalled()
  })

  it('es falso si el contexto no se puede crear o falla', () => {
    vi.stubGlobal('WebGLRenderingContext', function WebGLRenderingContext() {})
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    expect(isWebGLAvailable()).toBe(false)
    getContext.mockImplementation(() => {
      throw new Error('bloqueado')
    })
    expect(isWebGLAvailable()).toBe(false)
  })
})
