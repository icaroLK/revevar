import { Link2, MessageCircle } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'

type ShareActionsProps = {
  eventId: string
  size?: 'md' | 'lg'
}

/** Copy link + WhatsApp share (spec §7.4). */
export function ShareActions({ eventId, size = 'lg' }: ShareActionsProps) {
  const { show } = useToast()

  async function copyLink() {
    const url = `${window.location.origin}/replays/${eventId}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const input = document.createElement('input')
      input.value = url
      input.style.position = 'fixed'
      input.style.opacity = '0'
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    show('Link copiado')
  }

  function shareWhatsApp() {
    const url = `${window.location.origin}/replays/${eventId}`
    const text = `Olha esse lance no Revê VAR: ${url}`
    if (navigator.share) {
      navigator.share({ title: 'Revê VAR', url, text }).catch(() => {})
    } else {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(text)}`,
        '_blank',
        'noopener,noreferrer',
      )
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        size={size}
        icon={<Link2 className="h-[18px] w-[18px]" aria-hidden="true" />}
        onClick={copyLink}
      >
        Copiar link
      </Button>
      <Button
        variant="secondary"
        size={size}
        icon={
          <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
        }
        onClick={shareWhatsApp}
      >
        Enviar no WhatsApp
      </Button>
    </>
  )
}
