import { useEffect } from 'react'
import { useRouteError } from 'react-router-dom'
import { Button } from '../components/ui/Button'

/** Global error boundary (spec §11): any uncaught render/loader error in the app replaces the page with this. */
export function RouteErrorBoundary() {
  const error = useRouteError()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-screen max-w-[1180px] flex-col items-center justify-center gap-4 p-7 text-center">
      <title>Algo deu errado · Revê VAR</title>
      <h1 className="font-display text-4xl uppercase">Algo deu errado</h1>
      <Button onClick={() => window.location.reload()}>Recarregar</Button>
    </main>
  )
}
