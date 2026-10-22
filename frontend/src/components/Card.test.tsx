import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Card } from './Card'

describe('Card', () => {
  it('por defecto es un div con tono surface', () => {
    render(<Card data-testid="card">Contenido</Card>)
    const card = screen.getByTestId('card')
    expect(card.tagName).toBe('DIV')
    expect(card).toHaveClass('card', 'card--surface')
    expect(card).not.toHaveClass('card--interactive')
  })

  it('renderiza el elemento semántico indicado con su tono', () => {
    render(
      <ul>
        <Card as="li" tone="lila" interactive className="extra">
          Brújula
        </Card>
      </ul>,
    )
    const item = screen.getByRole('listitem')
    expect(item).toHaveClass('card--lila', 'card--interactive', 'extra')
  })

  it('pasa atributos HTML como aria-labelledby', () => {
    render(
      <Card as="section" aria-labelledby="titulo">
        <h2 id="titulo">Resumen</h2>
      </Card>,
    )
    expect(screen.getByRole('region', { name: 'Resumen' })).toBeInTheDocument()
  })
})
