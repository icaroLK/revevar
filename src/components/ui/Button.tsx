import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '../../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'light'
type ButtonSize = 'md' | 'lg'

type BaseProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  loading?: boolean
  className?: string
  children: ReactNode
}

type ButtonAsButton = BaseProps & {
  as?: 'button'
} & ButtonHTMLAttributes<HTMLButtonElement>
type ButtonAsAnchor = BaseProps & {
  as: 'a'
} & AnchorHTMLAttributes<HTMLAnchorElement>
type ButtonAsLink = BaseProps & { as: 'link' } & LinkProps

export type ButtonProps = ButtonAsButton | ButtonAsAnchor | ButtonAsLink

const sizeClasses: Record<ButtonSize, string> = {
  md: 'h-11 px-4 text-sm',
  lg: 'h-[50px] px-[18px] text-sm',
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-red text-white shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_10px_30px_rgba(225,6,19,0.35)] hover:brightness-110',
  secondary:
    'border border-border-strong bg-white-tint text-text hover:bg-white-tint-strong',
  ghost: 'text-muted hover:bg-white-tint hover:text-text',
  light: 'bg-text text-bg hover:bg-white',
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

export function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    icon,
    loading = false,
    children,
    className,
  } = props

  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-tint',
    'disabled:cursor-not-allowed disabled:opacity-50',
    sizeClasses[size],
    variantClasses[variant],
    className,
  )

  const content = (
    <>
      {loading ? <Spinner /> : icon}
      {children}
    </>
  )

  if (props.as === 'a') {
    const {
      as: _as,
      variant: _v,
      size: _s,
      icon: _i,
      loading: _l,
      children: _c,
      className: _cl,
      ...anchorProps
    } = props
    return (
      <a className={classes} {...anchorProps}>
        {content}
      </a>
    )
  }

  if (props.as === 'link') {
    const {
      as: _as,
      variant: _v,
      size: _s,
      icon: _i,
      loading: _l,
      children: _c,
      className: _cl,
      ...linkProps
    } = props
    return (
      <Link className={classes} {...linkProps}>
        {content}
      </Link>
    )
  }

  const {
    as: _as,
    variant: _v,
    size: _s,
    icon: _i,
    loading: _l,
    children: _c,
    className: _cl,
    ...buttonProps
  } = props
  return (
    <button
      className={classes}
      disabled={loading || buttonProps.disabled}
      {...buttonProps}
    >
      {content}
    </button>
  )
}
