import { Home } from 'lucide-react'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-[1180px] flex-col items-center justify-center gap-4 p-7 text-center">
      <title>Página não encontrada · Revê VAR</title>
      <h1 className="font-display text-5xl uppercase">Página não encontrada</h1>
      <Button
        as="link"
        to="/"
        icon={<Home className="h-4 w-4" aria-hidden="true" />}
      >
        Ir para o início
      </Button>
    </main>
  )
}
