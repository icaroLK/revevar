# Revê VAR · Web (front end)

Public web app where players find, watch and download the instant replays recorded at sports courts. **Current scope: sprint 1 (public site, no login).** A club admin area comes later in sprint 2; don't build it until asked.

I'm Ícaro, the front-end developer. The back end (Node.js + Express + SQLite) is built by André Kowalski in a separate repo. The Raspberry Pi / cameras / button side is built by Rafa. This repo is **front end only**.

## Read these before doing anything
- `docs/project-context.md`: what the product is, who builds what, **current scope (sprint 1 only)** and what not to build.
- `docs/frontend-spec.md`: what to build, screen by screen, with every behavior and state. **Source of truth for the UI.**
- `docs/api-contract.md`: every endpoint the front end calls, with request/response shapes. **Source of truth for data.**
- `docs/build-plan.md`: the milestone order we follow.
- `docs/design/`: the approved mockups. `*.dc.html` files contain the exact values (inline styles, copy, structure) but only render inside the design canvas, so read them as markup; `docs/design/screens/*.png` are screenshots of how they look. Use both as the **visual reference**; do not copy their code structure.
- `docs/private/`: client notes (gitignored). Read for context, never quote in code or commits.

## Stack (decided, do not change without asking)
- **Vite + React + TypeScript** (strict mode). Output is a static build (`dist/`).
- **React Router** (data router, `createBrowserRouter`).
- **TanStack Query** for all server data (caching, loading/error states, refetch).
- **Tailwind CSS** with the design tokens from `docs/frontend-spec.md` (section 2) set in the theme.
- **zod** to validate API responses and forms; **react-hook-form** for forms.
- **MSW (Mock Service Worker)** for API mocks, so the UI works before the real back end is ready. Mocks must follow `docs/api-contract.md` exactly.
- **lucide-react** for icons. **date-fns** (pt-BR locale) for dates.
- Fonts self-hosted with **@fontsource** (Anton, Inter). No Google Fonts requests.
- **Vitest + Testing Library** for tests. ESLint + Prettier.

Constraint: production runs on the client's **Hostinger plan, which only supports JavaScript/Node apps**. Nothing that needs Python, Docker or a custom server. A static build is the safest output.

## Repo hygiene (public portfolio repo)
- This repo is public on GitHub as a portfolio piece. **No secrets, ever.** Use `.env` (gitignored) + `.env.example`.
- **No real client data** (videos, user emails, DB dumps). Mocks and sample data only.
- `docs/private/` is gitignored: client notes, pricing and the ERS live there and are never committed. Never copy their contents into code, comments, commits or public docs.
- Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
- Keep `README.md` up to date (it's the portfolio page of the project).

## Rules
- **Mobile first.** Most users open the site on a phone at the court. Design at 390 px wide first, then scale up. Touch targets at least 44 px.
- **All UI text in Brazilian Portuguese.** Code, comments, commits in English.
- **Every data screen has 4 states:** loading (skeletons), empty, error (with retry), success.
- **Filters live in the URL** (query params) so links and QR codes can open a pre-filtered page.
- Accessibility: real `<button>`/`<a>`, labels on inputs, `aria-label` on icon-only buttons, visible focus ring, color contrast AA.
- Never hardcode the API base URL: use `import.meta.env.VITE_API_BASE_URL` (default `/api/v1`).
- Don't add new dependencies without saying why.
- Keep components small. Shared UI in `src/components/ui`, feature code in `src/features/<feature>`.

## Commands
- `npm run dev`: dev server (MSW mocks on by default in dev, toggle with `VITE_USE_MOCKS`).
- `npm run build`: production build to `dist/`.
- `npm run preview`: serve the build locally.
- `npm run test` / `npm run lint`.

## How we work
- One milestone from `docs/build-plan.md` at a time. Plan first, then implement.
- After each milestone: run lint, tests and build; check the page at 390 px and 1440 px; commit with a conventional message (`feat: ...`, `fix: ...`).
- If something in the spec or contract is unclear or conflicts, **stop and ask me** instead of guessing.
