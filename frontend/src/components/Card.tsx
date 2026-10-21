import type { HTMLAttributes, ReactNode } from 'react'
import './Card.css'

export type CardTone = 'surface' | 'lila' | 'menta' | 'amarillo' | 'coral' | 'petroleo'

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'article' | 'section' | 'li' | 'aside'
  tone?: CardTone
  interactive?: boolean
  children: ReactNode
}

export function Card({
  as: Element = 'div',
  tone = 'surface',
  interactive = false,
  className,
  children,
  ...rest
}: CardProps) {
  const classes = ['card', `card--${tone}`, interactive && 'card--interactive', className]
    .filter(Boolean)
    .join(' ')
  return (
    <Element className={classes} {...rest}>
      {children}
    </Element>
  )
}
