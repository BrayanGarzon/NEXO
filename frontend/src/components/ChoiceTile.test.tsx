import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ChoiceTile } from './ChoiceTile'

function Group({ onChange }: { onChange?: (value: string) => void }) {
  const [value, setValue] = useState<string | null>(null)
  const select = (next: string) => {
    setValue(next)
    onChange?.(next)
  }
  return (
    <fieldset>
      <legend>¿Qué buscas?</legend>
      <ChoiceTile
        name="n"
        value="a"
        label="Hablar con alguien"
        icon="chat"
        checked={value === 'a'}
        onChange={select}
      />
      <ChoiceTile
        name="n"
        value="b"
        label="Actividades culturales"
        description="Talleres y grupos"
        icon="palette"
        checked={value === 'b'}
        onChange={select}
      />
    </fieldset>
  )
}

describe('ChoiceTile', () => {
  it('es un radio nativo con nombre accesible a partir de su texto', () => {
    render(<Group />)
    expect(screen.getAllByRole('radio')).toHaveLength(2)
    expect(screen.getByRole('radio', { name: 'Hablar con alguien' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: /Actividades culturales/ })).toBeInTheDocument()
    expect(screen.getByText('Talleres y grupos')).toBeInTheDocument()
  })

  it('selecciona con clic y marca visualmente la opción elegida', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Group onChange={onChange} />)
    await user.click(screen.getByText('Hablar con alguien'))
    const radio = screen.getByRole('radio', { name: 'Hablar con alguien' })
    expect(radio).toBeChecked()
    expect(radio.closest('label')).toHaveClass('choice-tile--checked')
    expect(onChange).toHaveBeenCalledWith('a')
  })

  it('se puede elegir con el teclado (flechas del grupo de radios)', async () => {
    const user = userEvent.setup()
    render(<Group />)
    await user.click(screen.getByRole('radio', { name: 'Hablar con alguien' }))
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('radio', { name: /Actividades culturales/ })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Hablar con alguien' })).not.toBeChecked()
  })
})
