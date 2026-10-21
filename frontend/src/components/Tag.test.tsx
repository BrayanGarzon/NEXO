import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Chip, DemoTag } from './Tag'

describe('Tag', () => {
  it('DemoTag identifica los datos de demostración', () => {
    render(<DemoTag />)
    expect(screen.getByText('Datos de demostración')).toBeInTheDocument()
  })

  it('Chip expone su estado con aria-pressed', async () => {
    const onClick = vi.fn()
    render(
      <Chip selected onClick={onClick}>
        Cultura
      </Chip>,
    )
    const chip = screen.getByRole('button', { name: 'Cultura' })
    expect(chip).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(chip)
    expect(onClick).toHaveBeenCalledOnce()
  })
})
