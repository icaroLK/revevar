# Revê VAR · Front-end spec

Version: v0.1 (2026-11-10). Visual source of truth: the approved mockups in `docs/design/` (markup for exact values, `screens/` PNGs for the look). Data source of truth: `docs/api-contract.md`.

Sprint 1 = public site (sections 1 to 12). Sprint 2 = club admin (section 13).

---

## 1. Sitemap and routes

| Route | Page | Notes |
|---|---|---|
| `/` | Início | Hero + latest replays |
| `/replays` | Replays (catálogo) | Filters in the query string, see §6.2 |
| `/replays/:eventId` | Replay | Player with camera angles, download, share. Also the share link. |
| `/como-funciona` | Como funciona | 3 steps + FAQ |
| `/para-clubes` | Para clubes | B2B pitch + WhatsApp CTA |
| `/privacidade` | Política de privacidade | Required because we collect email. Text supplied by the client (placeholder until then). |
| `*` | 404 | "Página não encontrada" + button to Início |

Navigation between routes is client-side (no full reload). Scroll to top on route change (except when going "back", restore scroll position, which React Router's `ScrollRestoration` does).

Each route sets the page `<title>`: `"Replays · Revê VAR"`, etc.

---

## 2. Design tokens (from the approved mockups)

Put these in the Tailwind theme. Don't use other colors.

### Colors
| Token | Value | Use |
|---|---|---|
| `bg` | `#08090A` | Page background |
| `surface` | `#111214` | Inputs, segmented controls, list rows |
| `card-from` / `card-to` | `#141518` → `#0F1012` | Card background (top-to-bottom gradient, very subtle) |
| `thumb` | `#1A1C20` | Video thumbnail placeholder |
| `border` | `rgba(255,255,255,0.08)` | Default borders |
| `border-strong` | `rgba(255,255,255,0.14)` | Secondary buttons, hover |
| `text` | `#FAFAFA` | Primary text |
| `muted` | `#A1A1AA` | Secondary text, inactive nav |
| `subtle` | `#71717A` | Labels, meta info (only ≥ 12 px) |
| `red` | `#E10613` | Brand red: primary buttons, active hour chip border, highlights |
| `red-tint` | `rgba(225,6,19,0.14)` | Active chip background, step number background |
| `white-tint` | `rgba(255,255,255,0.04)` / `0.07` | Ghost button bg / active nav item bg |

### Typography
- **Display:** Anton, uppercase, line-height ~0.95–1.0. Sizes: hero 84 px desktop / 52 px mobile; page title 64 / 44; section title 40 / 30.
- **Body/UI:** Inter 400/500/600/700. Body 15–18 px, labels 12–13 px (uppercase + letter-spacing 0.08em for eyebrow labels), buttons 14–16 px semibold.
- Numbers (times like 19:43): `font-variant-numeric: tabular-nums`.

### Shape and depth
- Radius: inputs/buttons 10–12 px, chips full (999 px), cards 18–20 px, hero card 22 px, video player 16–18 px.
- Card: gradient bg + 1 px `border` + inset top highlight `0 1px 0 rgba(255,255,255,0.04) inset` + soft shadow `0 16px 40px rgba(0,0,0,0.35)`.
- Primary button: `red` bg, white text, inset highlight `0 1px 0 rgba(255,255,255,0.25) inset`, glow `0 10px 30px rgba(225,6,19,0.35)`.
- Header and sticky filter bar: translucent bg `rgba(8,9,10,0.72–0.9)` + `backdrop-filter: blur(14px)` + bottom border.
- Hero background: faint field-line drawing (SVG, stroke `rgba(255,255,255,0.045)`).

### Layout
- Max content width 1180 px, side padding 28 px (desktop) / 16 px (mobile).
- Breakpoints: `md` 768 px, `lg` 1024 px. Mobile layout below `md`.
- Min touch target 44 × 44 px.

### Icons
lucide-react, stroke 2, 16–20 px: Play, Download, Link, MessageCircle (WhatsApp), Menu, X, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Calendar, Clock, Maximize, Plus.

---

## 3. App shell

### 3.1 Header (all pages)
- **Desktop (≥ md):** sticky, height ~68 px. Left: logo (links to `/`). Center: nav `Replays`, `Como funciona`, `Para clubes` (pill links; active = `white-tint 0.07` bg + `text` color; inactive = `muted`). Right: `Fale conosco` ghost button with WhatsApp icon → `https://wa.me/<whatsappNumber>`.
- **Mobile (< md):** sticky. Left: logo. Right: two 44 px square icon buttons: WhatsApp (link) and Menu (toggles menu).
- On the **Replay page on mobile**, the header changes: back button (to `/replays` keeping the previous filters if we came from there, else to `/replays`) + title "Hoje, 19:43" + subtitle "Tupi · Quadra 1 · 35s".

### 3.2 Mobile menu
- Opens as a **full-screen dark overlay below the header** (not a light sheet). Menu icon turns into X.
- Items (Anton, 32 px, uppercase, separated by thin borders): Início, Replays, Como funciona, Para clubes. Current page in `red`.
- Bottom: `Fale conosco` (primary, WhatsApp) and `Instagram` (secondary).
- Closes on: item click, X, Escape key, route change. Lock body scroll while open. Focus trapped inside while open; focus returns to the menu button on close.

### 3.3 Footer
- Desktop: logo + "Replay automático para quadras esportivas." | links (Replays, Como funciona, Para clubes, Privacidade, WhatsApp, Instagram) | bottom line "© 2026 Revê VAR · Curitiba/PR".
- Mobile: stacked, smaller.
- On the Replays page also show "Replays disponíveis por {retentionHours} horas".

### 3.4 No floating WhatsApp button
Decision: WhatsApp lives in the header, never as a floating bubble (it covers buttons on mobile, a problem we saw on the reference site).

---

## 4. UI components (src/components/ui)

| Component | Spec |
|---|---|
| `Button` | Variants: `primary` (red), `secondary` (outline `border-strong` + `white-tint 0.04`), `ghost`, `light` (white bg, dark text, used on "Para clubes" CTA). Sizes `md` (44 px) and `lg` (50–54 px). Optional left icon. Can render as `<a>` or router `<Link>`. Disabled + loading (spinner) states. |
| `IconButton` | 44 × 44, requires `aria-label`. |
| `SegmentedControl` | Group of options in a `surface` pill container with 4 px padding; selected = `#FAFAFA` bg + dark text. `role="group"` + `aria-pressed` per option (or radio semantics). Used for Dia and Câmera. |
| `Chip` | Pill 44 px tall. Inactive: transparent, `border`, `muted` text. Active: `red` border + `red-tint` bg + white text. Optional count badge. Used for hours. |
| `SelectField` | Label (uppercase 11 px `subtle`) above value (15 px semibold) in a `surface` box; native `<select>` for mobile friendliness. Hidden automatically when it has ≤ 1 option. |
| `Card` | Gradient card surface (tokens §2). |
| `Thumbnail` | 16:9 box with `thumb` bg. Shows `<img>` when `thumbnailUrl` exists (`loading="lazy"`, `object-fit: cover`). Fallback when null: field-line SVG placeholder. Overlays: camera label pill top-left ("Câmera 1"), duration bottom-right ("0:35"), optional centered play circle (glass style). Status overlays: `processing` = shimmer + "Processando…"; `failed` = dimmed + "Câmera indisponível". |
| `ReplayCard` | See §6.3. |
| `ReplayRow` | Compact horizontal row: small thumbnail (104 px wide) + time + meta + chevron. Used in "Mais recentes" and side lists. |
| `VideoPlayer` | See §7.3. |
| `Modal` / `Sheet` | Desktop: centered modal (max 440 px). Mobile: bottom sheet. Overlay click, Escape and X close it. Focus trap. |
| `Accordion` | FAQ. Native `<details>/<summary>` styled; plus icon rotates to X when open. Only one open at a time is NOT required. |
| `Badge` | Small pill with icon, e.g. expiry "Disponível até 19:43 de amanhã". |
| `Skeleton` | Shimmer blocks matching each card/row shape. |
| `EmptyState` / `ErrorState` | Icon + short text + optional action button ("Tentar de novo"). |
| `Toast` | Bottom-center (mobile) / bottom-right (desktop), 3 s. Used for "Link copiado", "Download iniciado", errors. |

---

## 5. Page: Início (`/`)

Reference: `docs/design/Home.dc.html` (desktop), `MobileHome.dc.html` (mobile).

### Sections
1. **Hero** (field-line background):
   - Chip with red dot: "{clubName} · {courtName}" when there's one club/court; when several: "Replay automático".
   - Title (Anton): "Replays" / "da quadra" (second line red).
   - Text: "Os lances salvos pelo botão ficam disponíveis aqui, gravados por duas câmeras. Escolha o dia e o horário do seu jogo para assistir e baixar."
   - Buttons: `Ver replays` (primary, play icon) → `/replays`; `Como funciona` (secondary) → `/como-funciona`. Mobile: full-width stacked.
   - Desktop right side: **"Último replay" card** = the newest event: big thumbnail (camera 1) with glass play button, "Último replay · Hoje, 19:58", and two mini thumbnails showing it has 2 angles. Click → `/replays/:id`.
2. **Últimos replays**: title + "Atualizado a cada novo lance" + `Ver todos` → `/replays`. Grid of 8 latest events (desktop: auto-fill columns min 250 px; mobile: list of `ReplayRow`, 4 items + "Ver todos").
3. **Para clubes teaser** (mobile only on Home; desktop has it in the nav): card "Quer o Revê VAR no seu clube? Saiba mais →" → `/para-clubes`.
4. Footer.

### Data
- `GET /config`, `GET /clubs` (+ courts if one club), `GET /replays?limit=8`.
- Refetch latest replays every 60 s while the tab is visible.

### States
- Loading: hero renders immediately (static text); last-replay card and grid show skeletons.
- Empty (no replays yet): last-replay card replaced by an empty card "Nenhum replay ainda hoje. Aperte o botão na quadra depois de um lance!"; grid hidden.
- Error: hero still shows; replay area shows `ErrorState` with retry.

---

## 6. Page: Replays (`/replays`)

Reference: `Replays.dc.html` (desktop), `MobileReplays.dc.html` (mobile), `MobilePrototype.dc.html` (behavior).

### 6.1 Layout
1. Title "Replays" (Anton) + "Escolha o clube, a quadra, o dia e o horário do seu jogo. Cada lance vem com os dois ângulos." (mobile: shorter "Escolha onde e quando você jogou.").
2. **Filter bar, sticky** under the header (translucent + blur):
   - Desktop, one row (wraps if narrow): `Clube` select · `Quadra` select · divider · `Dia` segmented (Hoje / Ontem / Data) · divider · hour chips · spacer · `Câmera` segmented (Ambas / Câm 1 / Câm 2).
   - Mobile, stacked: row 1 Clube + Quadra (2 columns, hidden if single option); row 2 Dia segmented (3 equal parts: Hoje / Ontem / Outra data); row 3 hour chips in a **horizontal scroll row with hidden scrollbar**. No camera filter on mobile (both angles always shown in cards).
3. Results header: "{Dia}, {hora}" (e.g. "Hoje, 19h") + count ("6 replays").
4. **Results grid**: desktop 2 columns (auto-fill min 500 px), mobile 1 column.
5. "Carregar mais" button when `nextCursor` exists (no infinite scroll: simpler and footer stays reachable).
6. Footer with retention note.

### 6.2 Filters and URL
Query params (Portuguese, human-readable, so QR codes and shared links are clean):

| Param | Values | Default |
|---|---|---|
| `clube` | club `slug` | the only club, or the first |
| `quadra` | court `slug` | the only court; if several and none chosen = all courts of the club |
| `dia` | `hoje` \| `ontem` \| `YYYY-MM-DD` | `hoje` |
| `hora` | `0`–`23` \| `todas` | see below |
| `camera` | `ambas` \| `1` \| `2` | `ambas` (desktop only) |

Rules:
- Changing a filter updates the URL with `replace` (doesn't spam history) and refetches.
- **Default hour:** after loading `GET /replays/availability`, if `hora` isn't in the URL: pick the current hour if it has replays, else the most recent hour that has replays, else `todas`.
- **Hour chips** show only hours that have replays (from availability) plus `Todas`, each with its count as a small badge. If availability fails, show 06h–23h.
- "Outra data": opens a native date input limited to the retention window (today minus `retentionHours`, rounded to days). If retention is 24 h, Ontem may be partly empty; that's fine.
- Changing club resets court and hour. Changing day resets hour to the default rule.
- Example QR link printed at the court: `/replays?clube=tupi&quadra=quadra-1` → opens today, default hour.

### 6.3 Replay card
- Top: clip thumbnails side by side (2 columns) when `camera=ambas`; one big thumbnail when a single camera is selected. Each thumbnail with camera label; first one has the glass play circle. Clicking the thumbnails opens `/replays/:id` (with `?camera=` if a single camera is filtered).
- Bottom row: time (bold, tabular, 18–19 px) + meta ("Hoje · Tupi · Quadra 1" desktop / "35s · 2 ângulos" mobile) on the left; on the right `Assistir`/`Ver` primary button (→ replay page) and a Download icon button (→ download flow §8 for all clips of the event, or the selected camera).
- Processing/failed clips use the `Thumbnail` status overlays. If all clips failed, hide the download button.

### 6.4 Data
- `GET /clubs`, `GET /clubs/:id/courts`, `GET /replays/availability`, `GET /replays` with filters.
- When `dia=hoje`: refetch availability + list every 30 s while visible. If new events appear and the user scrolled down, show a small pill at the top "Novos replays · Ver" instead of jumping the list.

### 6.5 States
- Loading: filter bar shows skeleton chips; grid shows 4 card skeletons.
- Empty: "Nenhum replay nesse horário." + "Tente outro horário ou dia." + if today and no replays at all: "Ainda não teve replay hoje."
- Error: `ErrorState` "Não foi possível carregar os replays." + `Tentar de novo`.

---

## 7. Page: Replay (`/replays/:eventId`)

Reference: `Replay.dc.html` (desktop), `MobileReplay.dc.html` (mobile).

### 7.1 Layout desktop
- `Voltar aos replays` link (keeps previous filters via router state; fallback `/replays?clube=..&quadra=..&dia=..&hora=..` built from the event).
- Title (Anton): "Hoje, 19:43" (relative day: Hoje / Ontem / "10 de nov.") + subtitle "Tupi · Quadra 1 · 35 segundos". Right: expiry badge "Disponível até 19:43 de amanhã".
- Two columns (main flexible + aside 300 px; aside stacks below on narrow screens):
  - **Main:** angle tabs `Câmera 1` / `Câmera 2` / `Lado a lado` (segmented). Player. Actions row: `Baixar câmera N` (primary), `Baixar câmera M` (secondary, only in single view), `Copiar link`, `Enviar no WhatsApp`. In "Lado a lado": two players side by side, one shared play button "Os dois ângulos tocam sincronizados", primary action becomes `Baixar os 2 ângulos`.
  - **Aside:** "Mais lances às {hora}h": up to 5 `ReplayRow`s of the same court and hour (current one highlighted, not clickable), then `Anterior` / `Próximo` buttons using `prevEventId` / `nextEventId` (disabled when null).

### 7.2 Layout mobile
- Header in "replay mode" (§3.1). Angle tabs (Câmera 1 / Câmera 2, no side-by-side on mobile). Player. Hint text: "A marca vermelha na barra é o momento em que o botão foi apertado." Full-width `Baixar câmera N` (primary, 54 px). Two buttons in a row: `WhatsApp`, `Copiar link`. Expiry badge. "Mais lances às {hora}h" list.

### 7.3 VideoPlayer
- Native `<video>` with `playsInline`, `preload="metadata"`, `poster={thumbnailUrl}`, `src={streamUrl}`. No autoplay with sound.
- **Custom control bar** (glass panel at the bottom of the video): play/pause (red circle, 44 px), time "0:12 / 0:35" (tabular), progress bar (seekable by click/drag/keyboard), **red marker at `buttonOffsetSec`** with a small "Botão" label above it, fullscreen button.
  - Fullscreen: `requestFullscreen` on the wrapper; on iOS Safari use `video.webkitEnterFullscreen()`.
  - Keyboard: Space/K play-pause, ←/→ seek 5 s, F fullscreen.
- Switching camera tab keeps the current time (seek the new video to the same `currentTime`) and keeps playing state.
- "Lado a lado" (desktop only): two `<video>` elements; one play button controls both; keep them in sync (on play/seek set both `currentTime`; if drift > 0.3 s, resync).
- Clip `processing`: show thumbnail/placeholder with "Processando o vídeo…" and refetch the event every 5 s until ready. Clip `failed`: "Este ângulo não está disponível" and auto-select the other camera.
- Optional nice touch: a "Ver o lance" button that seeks to `buttonOffsetSec - 5`.

### 7.4 Share
- `Copiar link`: copies `https://<site>/replays/<eventId>` (use `navigator.clipboard`; fallback: select a hidden input). Toast "Link copiado".
- `Enviar no WhatsApp`: on mobile, if `navigator.share` exists, use it (title + url); otherwise open `https://wa.me/?text=` with "Olha esse lance no Revê VAR: <url>".

### 7.5 Data
- `GET /replays/:eventId`. Aside: `GET /replays?courtId=..&date=..&hour=..&limit=6`.
- `?camera=1|2|lado` query param sets the initial tab.

### 7.6 States
- Loading: title skeleton + 16:9 skeleton + button skeletons.
- `404`: "Replay não encontrado." + `Ver replays`.
- `410`: "Este replay expirou. Os vídeos ficam disponíveis por {retentionHours} horas." + `Ver replays de hoje`.
- Network error: `ErrorState` with retry.

---

## 8. Download flow (all download buttons)

1. User clicks a download button (card icon, `Baixar câmera N`, or `Baixar os 2 ângulos`).
2. If `localStorage["revevar.lead"]` exists **and** its `consentVersion` equals `/config.consentVersion` → skip to step 4 with the stored data.
3. Else open the **download modal** (bottom sheet on mobile):
   - Title: "Baixar replay". Text: "Informe seu e-mail para baixar o vídeo."
   - `E-mail` (required, type email, autocomplete email).
   - `Nome` (optional, autocomplete name).
   - Checkbox (required, unchecked by default): "Autorizo o Revê VAR a registrar meu nome e e-mail para controle de downloads, conforme a [Política de Privacidade](/privacidade)."
   - Checkbox (checked by default): "Lembrar neste aparelho".
   - Buttons: `Baixar` (primary, disabled until valid), `Cancelar`.
   - Validation with zod + react-hook-form; inline error messages in Portuguese.
   - **No CPF.** (Decision for privacy/LGPD; only add if the client insists and the legal text covers it.)
4. `POST /downloads` with the clip id(s). Button shows loading.
5. On success: for each returned `url`, trigger the download (create an `<a href download>` and click it; for 2 files, trigger them ~400 ms apart). Close the modal. Toast "Download iniciado". If "Lembrar" was checked, save `{ email, name, consentVersion }` to localStorage.
   - iOS Safari note: the file opens the iOS download prompt; that's expected.
6. Errors: `410` → toast "Este replay expirou"; `429` → "Muitas tentativas, tente em alguns minutos"; others → "Não foi possível baixar. Tente de novo."
7. A small "Não é você? Trocar e-mail" link appears in the modal next time if data is stored (the modal is skipped, so put this link as a tiny text under the download button on the Replay page: "Baixando como joao@... · trocar").

---

## 9. Page: Como funciona (`/como-funciona`)

Reference: `ComoFunciona.dc.html`, `MobileComoFunciona.dc.html`.

- Eyebrow "Ajuda", title "Como funciona", intro text.
- 3 step cards (number in a red-tint square): 1 "O jogo é gravado" / 2 "Alguém aperta o botão" (30 s antes + 5 s depois) / 3 "O replay aparece aqui".
- "Dúvidas comuns" accordion. Initial questions (client will send the final list; keep them in a `faq.ts` data file):
  1. Preciso de cadastro para ver meu replay? → Não...
  2. Quanto tempo o vídeo fica disponível? → uses `retentionHours` from config.
  3. Por que aparecem dois vídeos do mesmo lance?
  4. O vídeo não apareceu. O que faço?
  5. Posso compartilhar o vídeo?
  6. Por que pedem meu e-mail para baixar? → controle de downloads / direito de imagem.
- Bottom card "Não achou sua resposta?" + `Falar no WhatsApp`.

---

## 10. Page: Para clubes (`/para-clubes`)

Reference: `Clubes.dc.html`, `MobileClubes.dc.html`.

- Hero (field lines): eyebrow "Para clubes", title "Replay automático" / "no seu clube" (red), text, `Falar no WhatsApp` (primary, prefilled message "Olá! Tenho um clube e quero saber mais sobre o Revê VAR."), `Ver replays de exemplo` (secondary).
- "O que está incluso": 4 cards (Câmeras e botão, Replay automático, Seu clube nos vídeos [confirm with client], Suporte).
- Final CTA card with light button.
- Later: add "Transmissão ao vivo (em breve)" only if the client confirms.

---

## 11. Cross-cutting requirements

- **Performance:** Lighthouse mobile ≥ 90. Lazy-load images. Never load videos in lists (thumbnails only). Route-level code splitting (`lazy()` for Replay page and admin). Fonts self-hosted with `font-display: swap`.
- **SEO/meta:** title + description per page, Open Graph tags (static, using the logo) so WhatsApp link previews look good.
- **Accessibility:** WCAG AA contrast (tokens already pass), keyboard navigable, visible focus ring (2 px red-tint outline), `prefers-reduced-motion` disables shimmer/transitions.
- **Dates:** show in the club's timezone; relative words "Hoje"/"Ontem", else "10 de nov.". Times "19:43". Use date-fns `ptBR`.
- **Errors:** global error boundary page "Algo deu errado" + reload button.
- **Empty config fallback:** if `/config` fails, use safe defaults (retention 24 h, no WhatsApp button rather than a broken one).
- **Analytics:** none for now (privacy). Leave a `track()` no-op helper for later.

---

## 12. Copy deck (pt-BR, sprint 1)

Keep all user-facing strings in `src/content/` files so the client can review them in one place.

- Nav: Replays · Como funciona · Para clubes · Fale conosco
- Buttons: Ver replays · Ver todos · Assistir · Ver · Baixar · Baixar câmera 1 · Baixar os 2 ângulos · Copiar link · Enviar no WhatsApp · Carregar mais · Tentar de novo · Voltar aos replays · Anterior · Próximo
- Filters: Clube · Quadra · Dia · Hoje · Ontem · Outra data · Horário · Todas · Câmera · Ambas · Câm 1 · Câm 2
- Placeholders still to confirm with the client: club name ("Tupi"), retention (24 h vs other), WhatsApp number, Instagram handle, privacy policy text, FAQ list.

---

## 13. Sprint 2: Club admin (NOT NOW, do not build until asked)

Reference: no mockup yet (to be designed in the same visual style before coding).

### Routes
| Route | Page |
|---|---|
| `/admin/login` | Login (email + password, "Esqueci minha senha") |
| `/admin/recuperar-senha`, `/admin/nova-senha?token=` | Password reset |
| `/admin` | Painel: summary cards (Replays, Downloads, E-mails únicos) for a period (Hoje / 7 dias / 30 dias) + simple bar chart by day + top hours |
| `/admin/replays` | Same filters as public catalog, table/list with time, court, angles, download count, actions: Ver, Excluir |
| `/admin/downloads` | Table: data/hora, e-mail, nome, lance (link), quadra, câmera. Search by email/name, period filter, `Exportar CSV` |

### Behavior
- Protected routes: on load call `GET /auth/me`; `401` → redirect to `/admin/login?next=...`.
- Club selector in the admin header if the user manages more than one club.
- **Delete replay:** confirmation dialog "Excluir este replay? Os vídeos serão apagados para todos e não dá para desfazer." → `DELETE`, optimistic remove + toast with no undo.
- Admin layout: desktop sidebar (Painel, Replays, Downloads, Sair); mobile top bar + menu. Tables become cards on mobile.
- Logout button → `POST /auth/logout` → `/admin/login`.

---

## 14. Acceptance checklist (sprint 1 done when...)

- [ ] All routes in §1 work with real back end and with MSW mocks.
- [ ] Filters work and are reflected in the URL; a QR-style link opens pre-filtered.
- [ ] Hour chips only show hours with replays; default hour rule works.
- [ ] Replay page plays both angles, switches camera keeping time, shows the button marker, fullscreen works on iPhone and Android.
- [ ] Download flow with email + consent works; second download skips the form; files save with good names.
- [ ] Copy link + WhatsApp share work on mobile and desktop.
- [ ] 404, 410 (expired), empty and error states all render.
- [ ] Looks like the mockups at 390 px and 1440 px.
- [ ] Lighthouse mobile ≥ 90, no console errors, lint + tests + build pass.
- [ ] Deployed on Hostinger, deep links (refresh on `/replays/abc`) work.
