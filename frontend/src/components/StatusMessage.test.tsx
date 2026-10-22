import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusMessage } from './StatusMessage'

describe('StatusMessage', () => {
  it('carga: anuncia el estado como ocupado', () => {
    render(<StatusMessage kind="loading" title="Cargando servicios…" />)
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-busy', 'true')
    expect(status).toHaveTextContent('Cargando servicios…')
  })

  it('vacío: es un estado informativo con descripción y acción', () => {
    render(
      <StatusMessage
        kind="empty"
        title="No encontramos servicios"
        description="Prueba con otras palabras."
        action={<button type="button">Quitar filtros</button>}
      />,
    )
    const status = screen.getByRole('status')
    expect(status).not.toHaveAttribute('aria-busy')
    expect(status).toHaveTextContent('Prueba con otras palabras.')
    expect(screen.getByRole('button', { name: 'Quitar filtros' })).toBeInTheDocument()
  })

  it('error: se anuncia como alerta', () => {
    render(<StatusMessage kind="error" title="No pudimos cargar los servicios" />)
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar los servicios')
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('no muestra descripción si no se indica', () => {
    const { container } = render(<StatusMessage kind="empty" title="Sin resultados" />)
    expect(container.querySelector('.status-message__description')).toBeNull()
  })
})
