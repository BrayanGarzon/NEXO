import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { Button, ButtonLink } from './Button'

describe('Button', () => {
  it('es de tipo button por defecto y aplica la variante', () => {
    render(<Button variant="secondary">Guardar</Button>)
    const button = screen.getByRole('button', { name: 'Guardar' })
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass('button--secondary')
  })

  it('ButtonLink renderiza un enlace con el nombre accesible del texto', () => {
    render(
      <MemoryRouter>
        <ButtonLink to="/brujula" iconEnd="arrow-right">
          Abrir Brújula
        </ButtonLink>
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Abrir Brújula' })).toHaveAttribute('href', '/brujula')
  })
})
