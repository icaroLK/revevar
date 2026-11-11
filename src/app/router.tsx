import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { DevUiPage } from '../features/dev-ui/DevUiPage'

// Placeholder route tree. Real pages replace this starting at M4 (app shell) / M5 (Início).
const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <main className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <h1 className="font-display text-5xl uppercase text-text">
            Revê VAR
          </h1>
          <p className="mt-3 text-muted">
            Scaffold pronto. Páginas reais chegam nos próximos milestones.
          </p>
        </div>
      </main>
    ),
  },
]

// UI kit review page — only reachable in dev builds, never shipped to production.
if (import.meta.env.DEV) {
  routes.push({ path: '/dev/ui', element: <DevUiPage /> })
}

export const router = createBrowserRouter(routes)
