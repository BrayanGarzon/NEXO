import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { SearchField } from './SearchField'

function Controlled({ onSubmit }: { onSubmit: (value: string) => void }) {
  const [value, setValue] = useState('')
  return (
    <SearchField label="Buscar servicios" value={value} onChange={setValue} onSubmit={onSubmit} />
  )
}

describe('SearchField', () => {
  it('expone un formulario de búsqueda con etiqueta accesible', () => {
    render(<SearchField label="Buscar servicios" value="" onChange={() => {}} />)
    expect(screen.getByRole('search')).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Buscar servicios' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Buscar' })).toHaveAttribute('type', 'submit')
  })

  it('oculta la etiqueta visualmente por defecto y la muestra con hideLabel={false}', () => {
    const { rerender } = render(<SearchField label="Buscar" value="" onChange={() => {}} />)
    expect(screen.getByText('Buscar', { selector: 'label' })).toHaveClass('visually-hidden')
    rerender(<SearchField label="Buscar" value="" onChange={() => {}} hideLabel={false} />)
    expect(screen.getByText('Buscar', { selector: 'label' })).toHaveClass('search-field__label')
  })

  it('notifica cada cambio y envía el valor sin espacios al pulsar Enter', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Controlled onSubmit={onSubmit} />)
    await user.type(screen.getByRole('searchbox'), '  fútbol  {Enter}')
    expect(screen.getByRole('searchbox')).toHaveValue('  fútbol  ')
    expect(onSubmit).toHaveBeenCalledWith('fútbol')
  })

  it('envía también con el botón de buscar', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Controlled onSubmit={onSubmit} />)
    await user.type(screen.getByRole('searchbox'), 'cultura')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    expect(onSubmit).toHaveBeenCalledWith('cultura')
  })
})
