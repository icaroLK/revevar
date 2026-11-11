import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { DevUiPage } from '../features/dev-ui/DevUiPage'
import { Layout } from './Layout'
import { NotFoundPage } from './NotFoundPage'
import { RouteErrorBoundary } from './RouteErrorBoundary'

const routes: RouteObject[] = [
  {
    element: <Layout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        // Placeholder index route. Real Início page arrives at M5.
        index: true,
        element: (
          <main className="mx-auto flex min-h-[60vh] max-w-[1180px] flex-col items-center justify-center gap-3 p-7 text-center">
            <title>Revê VAR</title>
            <h1 className="font-display text-5xl uppercase text-text">
              Revê VAR
            </h1>
            <p className="text-muted">
              Scaffold pronto. Páginas reais chegam nos próximos milestones.
            </p>
          </main>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

// UI kit review page — only reachable in dev builds, never shipped to production.
if (import.meta.env.DEV) {
  routes.push({ path: '/dev/ui', element: <DevUiPage /> })
}

export const router = createBrowserRouter(routes)
