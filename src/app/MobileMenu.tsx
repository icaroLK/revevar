import { MessageCircle } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { cn } from '../lib/cn'
import { useFocusTrap } from '../lib/useFocusTrap'
import { useConfig } from '../lib/api/hooks'

const NAV_ITEMS = [
  { to: '/', label: 'Início', end: true },
  { to: '/replays', label: 'Replays', end: false },
  { to: '/como-funciona', label: 'Como funciona', end: false },
  { to: '/para-clubes', label: 'Para clubes', end: false },
]

type MobileMenuProps = {
  open: boolean
  onClose: () => void
}

/** Full-screen dark overlay below the header (spec §3.2), mobile only. */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const containerRef = useFocusTrap<HTMLDivElement>(open, onClose)
  const { data: config } = useConfig()

  if (!open) return null

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-x-0 bottom-0 top-14 z-10 flex flex-col overflow-y-auto bg-bg md:hidden"
    >
      <nav aria-label="Principal" className="flex flex-col px-4 py-6">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'border-b border-border py-[18px] font-display text-[32px] uppercase',
                isActive ? 'text-red' : 'text-text',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-3 px-4 pb-8 pt-4">
        {config?.whatsappNumber && (
          <Button
            as="a"
            href={`https://wa.me/${config.whatsappNumber}`}
            size="lg"
            icon={
              <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
            }
          >
            Fale conosco
          </Button>
        )}
        {config?.instagramHandle && (
          <Button
            as="a"
            href={`https://instagram.com/${config.instagramHandle}`}
            variant="secondary"
            size="lg"
          >
            Instagram
          </Button>
        )}
      </div>
    </div>
  )
}
