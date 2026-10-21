import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { Icon, type IconName } from './Icon'
import './Button.css'

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost'
export type ButtonSize = 'md' | 'sm'

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  iconStart?: IconName
  iconEnd?: IconName
  children: ReactNode
}

function classes(variant: ButtonVariant, size: ButtonSize, extra?: string) {
  return ['button', `button--${variant}`, `button--${size}`, extra].filter(Boolean).join(' ')
}

function Content({ iconStart, iconEnd, children }: Omit<CommonProps, 'variant' | 'size'>) {
  return (
    <>
      {iconStart && <Icon name={iconStart} size={18} />}
      <span>{children}</span>
      {iconEnd && <Icon name={iconEnd} size={18} />}
    </>
  )
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  variant = 'primary',
  size = 'md',
  iconStart,
  iconEnd,
  children,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={classes(variant, size, className)} {...rest}>
      <Content iconStart={iconStart} iconEnd={iconEnd}>
        {children}
      </Content>
    </button>
  )
}

type ButtonLinkProps = CommonProps & LinkProps

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  iconStart,
  iconEnd,
  children,
  className,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={classes(variant, size, className)} {...rest}>
      <Content iconStart={iconStart} iconEnd={iconEnd}>
        {children}
      </Content>
    </Link>
  )
}
