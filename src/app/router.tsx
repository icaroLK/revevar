import { createBrowserRouter } from 'react-router-dom'

// Placeholder route tree. Real pages replace this starting at M4 (app shell) / M5 (Início).
export const router = createBrowserRouter([
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
])
