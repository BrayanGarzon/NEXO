import { useId, type FormEvent } from 'react'
import { Icon } from './Icon'
import './SearchField.css'

interface SearchFieldProps {
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onSubmit?: (value: string) => void
  /** Oculta la etiqueta visualmente (sigue disponible para lectores de pantalla). */
  hideLabel?: boolean
  size?: 'md' | 'lg'
}

export function SearchField({
  label,
  placeholder,
  value,
  onChange,
  onSubmit,
  hideLabel = true,
  size = 'md',
}: SearchFieldProps) {
  const id = useId()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit?.(value.trim())
  }

  return (
    <form role="search" className={`search-field search-field--${size}`} onSubmit={handleSubmit}>
      <label htmlFor={id} className={hideLabel ? 'visually-hidden' : 'search-field__label'}>
        {label}
      </label>
      <div className="search-field__control">
        <input
          id={id}
          type="search"
          className="search-field__input"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="off"
        />
        <button type="submit" className="search-field__submit">
          <Icon name="search" size={20} label="Buscar" />
        </button>
      </div>
    </form>
  )
}
