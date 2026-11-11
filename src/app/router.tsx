import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { ComoFuncionaPage } from '../features/como-funciona/ComoFuncionaPage'
import { DevUiPage } from '../features/dev-ui/DevUiPage'
import { HomePage } from '../features/home/HomePage'
import { ParaClubesPage } from '../features/para-clubes/ParaClubesPage'
import { PrivacyPage } from '../features/privacy/PrivacyPage'
import { ReplaysPage } from '../features/replays/ReplaysPage'
import { Layout } from './Layout'
import { NotFoundPage } from './NotFoundPage'
import { RouteErrorBoundary } from './RouteErrorBoundary'

const routes: RouteObject[] = [
  {
    element: <Layout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'replays', element: <ReplaysPage /> },
      {
        // Code-split (spec §11): the video player + react-hook-form/zod form
        // are the heaviest page in the app and not needed until visited.
        path: 'replays/:eventId',
        lazy: () =>
          import('../features/replay-detail/ReplayDetailPage').then((m) => ({
            Component: m.ReplayDetailPage,
          })),
      },
      { path: 'como-funciona', element: <ComoFuncionaPage /> },
      { path: 'para-clubes', element: <ParaClubesPage /> },
      { path: 'privacidade', element: <PrivacyPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

// UI kit review page — only reachable in dev builds, never shipped to production.
if (import.meta.env.DEV) {
  routes.push({ path: '/dev/ui', element: <DevUiPage /> })
}

export const router = createBrowserRouter(routes)
