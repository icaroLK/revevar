import { Link } from 'react-router-dom'
import { useConfig } from '../lib/api/hooks'

const FOOTER_LINKS = [
  { to: '/replays', label: 'Replays' },
  { to: '/como-funciona', label: 'Como funciona' },
  { to: '/para-clubes', label: 'Para clubes' },
  { to: '/privacidade', label: 'Privacidade' },
]

export function Footer() {
  const { data: config } = useConfig()

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1180px] flex-col flex-wrap items-start justify-between gap-6 px-4 pb-6 pt-8 md:flex-row md:gap-8 md:px-7 md:pb-7 md:pt-12">
        <div className="flex flex-col gap-3">
          <img
            src="/logo-white.png"
            alt="Revê VAR"
            className="h-9 w-auto self-start md:h-11"
          />
          <span className="text-sm text-muted">
            Replay automático para quadras esportivas.
          </span>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm text-muted md:gap-6">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-text">
              {link.label}
            </Link>
          ))}
          {config?.whatsappNumber && (
            <a
              href={`https://wa.me/${config.whatsappNumber}`}
              className="hover:text-text"
            >
              WhatsApp
            </a>
          )}
          {config?.instagramHandle && (
            <a
              href={`https://instagram.com/${config.instagramHandle}`}
              className="hover:text-text"
            >
              Instagram
            </a>
          )}
        </nav>
      </div>
      <div className="mx-auto max-w-[1180px] px-4 pb-8 text-[13px] text-subtle md:px-7">
        © 2026 Revê VAR · Curitiba/PR
      </div>
    </footer>
  )
}
