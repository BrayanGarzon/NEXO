import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiStatus } from './ApiStatus'

describe('ApiStatus', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('indica que la API está disponible cuando /health responde', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ status: 'ok', service: 'x', version: '0', environment: 'test' }),
          { status: 200 },
        ),
      )
    vi.stubGlobal('fetch', fetchMock)

    render(<ApiStatus />)

    expect(await screen.findByText('API disponible')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/health$/),
      expect.objectContaining({ headers: { Accept: 'application/json' } }),
    )
  })

  it('indica error cuando /health falla', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })))

    render(<ApiStatus />)

    expect(await screen.findByText('API no disponible')).toBeInTheDocument()
  })
})
