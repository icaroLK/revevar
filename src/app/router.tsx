import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { DevUiPage } from '../features/dev-ui/DevUiPage'
import { HomePage } from '../features/home/HomePage'
import { ReplayDetailPage } from '../features/replay-detail/ReplayDetailPage'
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
      { path: 'replays/:eventId', element: <ReplayDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

// UI kit review page — only reachable in dev builds, never shipped to production.
if (import.meta.env.DEV) {
  routes.push({ path: '/dev/ui', element: <DevUiPage /> })
}

export const router = createBrowserRouter(routes)
