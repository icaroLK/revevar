import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react'
import { cn } from '../../lib/cn'

type IconButtonVariant = 'secondary' | 'ghost'

type BaseProps = {
  'aria-label': string
  variant?: IconButtonVariant
  className?: string
  children: ReactNode
}

type IconButtonAsButton = BaseProps & { as?: 'button' } & Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'aria-label'
  >
type IconButtonAsAnchor = BaseProps & { as: 'a' } & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    'aria-label'
  >

export type IconButtonProps = IconButtonAsButton | IconButtonAsAnchor

const variantClasses: Record<IconButtonVariant, string> = {
  secondary:
    'border border-border-strong bg-white-tint text-text hover:bg-white-tint-strong',
  ghost: 'text-muted hover:bg-white-tint hover:text-text',
}

export function IconButton(props: IconButtonProps) {
  const { variant = 'secondary', className, children } = props

  const classes = cn(
    'inline-flex h-11 w-11 flex-none items-center justify-center rounded-md transition active:scale-[0.94]',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-tint',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
    variantClasses[variant],
    className,
  )

  if (props.as === 'a') {
    const {
      as: _as,
      variant: _v,
      className: _cl,
      children: _c,
      ...anchorProps
    } = props
    return (
      <a className={classes} {...anchorProps}>
        {children}
      </a>
    )
  }

  const {
    as: _as,
    variant: _v,
    className: _cl,
    children: _c,
    ...buttonProps
  } = props
  return (
    <button type="button" className={classes} {...buttonProps}>
      {children}
    </button>
  )
}
