# Revê VAR · Build plan (front end)

How we build the front end with Claude Code, milestone by milestone. Each milestone has a ready-to-paste prompt.

## How to work with Claude Code (for Ícaro)

1. **One milestone per session.** Start each one with the prompt below. Don't ask for everything at once.
2. **Plan first.** Press `Shift+Tab` to enter plan mode (or say "plan first, don't code yet"). Read the plan, correct it, then let it code.
3. **Point at the docs.** Every prompt says which spec section to follow. CLAUDE.md is loaded automatically.
4. **Look at the result.** Run `npm run dev`, open it at 390 px (DevTools device mode) and at desktop size. Compare side by side with the mockup screenshots in `docs/design/screens/`. Send screenshots back to Claude Code when something is off ("the card padding is bigger than the mockup").
5. **Commit after each milestone** (`feat: replays page with filters`). Tag `v0.1.0` at the end of sprint 1.
6. If Claude Code wants to change the stack or the contract, it should ask you first (CLAUDE.md says so).

Rough time: sprint 1 ≈ 1–2 weeks part-time.

---

## M0 · Repo setup (you, 15 min)
- Create the GitHub repo (e.g. `revevar-web`), clone it locally **outside Google Drive**.
- Copy this kit in: `CLAUDE.md`, `docs/`, `.gitignore`, `.env.example`.
- Put client documents (ERS, meeting notes) in `docs/private/` (gitignored).
- Export each screen from the design canvas as PNG into `docs/design/screens/` (same names as the .dc.html files).
- Open the folder in Claude Code.

## M1 · Scaffold
> Read CLAUDE.md and docs/frontend-spec.md §2. Scaffold the project with Vite + React + TypeScript (strict), React Router, TanStack Query, Tailwind CSS, zod, react-hook-form, MSW, lucide-react, date-fns, @fontsource/anton and @fontsource/inter, Vitest + Testing Library, ESLint + Prettier. Configure the Tailwind theme with exactly the design tokens from §2 (colors, fonts, radii, shadows). Set up the folder structure (src/app, src/components/ui, src/features, src/lib/api, src/mocks, src/content). Add a Vite dev proxy from /api to VITE_API_PROXY_TARGET. Add .env.example. Plan first, then implement. At the end run lint, test and build.

## M2 · API layer + mocks
> Read docs/api-contract.md fully. Create TypeScript types and zod schemas for every type in §1 and every response in §2 (sprint 1 only). Create a small fetch client (base URL from env, JSON, parses the error format from §0 into a typed ApiError) and TanStack Query hooks: useConfig, useClubs, useCourts, useReplays (infinite, cursor), useAvailability, useReplay, useCreateDownload. Create MSW handlers that follow the contract exactly, with realistic fake data: 1 club "Tupi", 1 court "Quadra 1" (make it easy to add a 2nd court), ~40 events over today and yesterday spread between 17h and 22h, 2 clips per event, a few with status "processing" and one "failed", one expired event that returns 410. Mocks on when VITE_USE_MOCKS=true. Add unit tests for the client error handling.

## M3 · UI kit
> Read docs/frontend-spec.md §2 and §4 and open docs/design/Replays.dc.html and MobileReplays.dc.html for the look. Build the components in §4 (Button, IconButton, SegmentedControl, Chip, SelectField, Card, Thumbnail with status overlays, ReplayRow, Modal/Sheet, Accordion, Badge, Skeleton, EmptyState, ErrorState, Toast). Accessible, keyboard friendly, matching the mockups. Add a /dev/ui route (only in dev) that shows every component and state so I can review them.

## M4 · App shell
> Implement §3 of docs/frontend-spec.md: sticky translucent header (desktop nav + mobile icons), full-screen dark mobile menu with focus trap and scroll lock, footer, page titles, scroll restoration, 404 page, global error boundary. Compare with docs/design/Home.dc.html and MobileMenu.dc.html.

## M5 · Início
> Implement the Início page exactly as §5 of docs/frontend-spec.md, using the hooks from M2. Match docs/design/Home.dc.html (desktop) and MobileHome.dc.html (mobile). Include loading, empty and error states.

## M6 · Replays (catalog + filters)
> Implement §6 of docs/frontend-spec.md: sticky filter bar (desktop row / mobile stacked), filters synced with the URL query params in §6.2 including the default-hour rule and hiding single-option selects, hour chips from availability with counts, ReplayCard (§6.3), results header, "Carregar mais", 30 s refetch on "hoje" with the "Novos replays" pill, all states. Match Replays.dc.html and MobileReplays.dc.html. Write tests for the URL ↔ filter logic.

## M7 · Replay page + player
> Implement §7 of docs/frontend-spec.md: replay page layout desktop and mobile, VideoPlayer with custom controls and the red button marker at buttonOffsetSec, camera tabs keeping currentTime, side-by-side sync on desktop, processing/failed clip handling, prev/next, 404 and 410 states, share actions (§7.4). Match Replay.dc.html and MobileReplay.dc.html. Test on mobile Safari behavior notes (playsInline, webkitEnterFullscreen).

## M8 · Download flow
> Implement §8 of docs/frontend-spec.md: download modal/bottom sheet with email, optional name, required consent checkbox and "Lembrar neste aparelho", zod validation, POST /downloads, triggering one or two file downloads, localStorage reuse keyed by consentVersion, "Baixando como ... · trocar" link, error toasts. Wire every download button in the app to it.

## M9 · Static pages
> Implement §9 Como funciona, §10 Para clubes and the /privacidade page (placeholder text in src/content/privacy.ts, clearly marked as pending client text). Match the mockups. FAQ and texts in src/content.

## M10 · Polish pass
> Go through §11 and §14 of docs/frontend-spec.md. Check every page at 390 px, 768 px and 1440 px against the mockups, fix spacing and font sizes, add Open Graph meta, reduced motion, focus rings, run Lighthouse mobile and fix anything under 90. List anything you could not fix.

## M11 · Deploy to Hostinger
> Prepare production deploy. The site is a static SPA, so deep links must fall back to index.html. Produce both options and a short DEPLOY.md:
> (a) If the files are uploaded to Hostinger's public_html: add public/.htaccess with SPA fallback rules (and don't rewrite /api).
> (b) If the back end's Express app serves the front: document how Kowalski should serve dist/ with express.static and a catch-all to index.html after the /api routes.
> Then build with the production API base URL.

(Decide a vs b with Kowalski. b is simpler if everything runs as one Node app.)

Example `.htaccess` for option (a):
```
RewriteEngine On
RewriteBase /
RewriteRule ^api/ - [L]
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^ index.html [L]
```

---

## Sprint 2 (after sprint 1 is live)
- **M12** Design the admin screens in the same style (canvas first, then code).
- **M13** Auth: login, logout, me, protected routes, password reset (§13 + api-contract §3).
- **M14** Admin painel, replays (with delete), downloads (search, export CSV).

---

## Before starting M2: align with Kowalski
Send him `docs/api-contract.md` and agree on:
1. Field names (or adapt the front to his current `/docs`).
2. Grouping by event (one button press = one event with 2 clips).
3. `buttonOffsetSec`, timezone, thumbnail timing.
4. Who serves the front (option a or b above).
Until he confirms, build against the MSW mocks: the front won't be blocked.
