import { Icon, type IconName } from './Icon'
import './ChoiceTile.css'

interface ChoiceTileProps {
  name: string
  value: string
  label: string
  description?: string
  icon: IconName
  checked: boolean
  onChange: (value: string) => void
}

/** Opción de selección única con apariencia de tarjeta (radio nativo accesible). */
export function ChoiceTile({
  name,
  value,
  label,
  description,
  icon,
  checked,
  onChange,
}: ChoiceTileProps) {
  return (
    <label className={checked ? 'choice-tile choice-tile--checked' : 'choice-tile'}>
      <input
        type="radio"
        className="visually-hidden"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
      />
      <span className="choice-tile__icon">
        <Icon name={icon} size={26} />
      </span>
      <span className="choice-tile__label">{label}</span>
      {description && <span className="choice-tile__description">{description}</span>}
      <span className="choice-tile__check" aria-hidden="true">
        <Icon name="verified" size={20} />
      </span>
    </label>
  )
}
