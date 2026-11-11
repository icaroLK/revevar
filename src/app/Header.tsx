import { Menu, MessageCircle, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { IconButton } from '../components/ui/IconButton'
import { cn } from '../lib/cn'
import { useConfig } from '../lib/api/hooks'

const NAV_ITEMS = [
  { to: '/replays', label: 'Replays' },
  { to: '/como-funciona', label: 'Como funciona' },
  { to: '/para-clubes', label: 'Para clubes' },
]

type HeaderProps = {
  menuOpen: boolean
  onToggleMenu: () => void
}

export function Header({ menuOpen, onToggleMenu }: HeaderProps) {
  const { data: config } = useConfig()
  const whatsappUrl = config?.whatsappNumber
    ? `https://wa.me/${config.whatsappNumber}`
    : null

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/72 backdrop-blur-[14px]">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-7">
        <Link
          to="/"
          aria-label="Revê VAR, página inicial"
          className="flex items-center"
        >
          <img
            src="/logo-white.png"
            alt="Revê VAR"
            className="h-[34px] w-auto md:h-10"
          />
        </Link>

        <nav
          aria-label="Principal"
          className="hidden items-center gap-1.5 text-sm font-medium md:flex"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3.5 py-2.5 transition-colors',
                  isActive
                    ? 'bg-white-tint-strong text-text'
                    : 'text-muted hover:text-text',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          {whatsappUrl && (
            <Button
              as="a"
              href={whatsappUrl}
              variant="secondary"
              icon={<MessageCircle className="h-4 w-4" aria-hidden="true" />}
            >
              Fale conosco
            </Button>
          )}
        </div>

        <div className="flex gap-2 md:hidden">
          {whatsappUrl && (
            <IconButton
              as="a"
              href={whatsappUrl}
              aria-label="Fale conosco no WhatsApp"
            >
              <MessageCircle className="h-[19px] w-[19px]" aria-hidden="true" />
            </IconButton>
          )}
          <IconButton
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            onClick={onToggleMenu}
          >
            {menuOpen ? (
              <X className="h-[19px] w-[19px]" aria-hidden="true" />
            ) : (
              <Menu className="h-[19px] w-[19px]" aria-hidden="true" />
            )}
          </IconButton>
        </div>
      </div>
    </header>
  )
}
