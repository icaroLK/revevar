# Revê VAR · API contract (front-end view)

Version: draft v0.1 (2026-11-10). Author: Ícaro (front end). To be reviewed with André Kowalski (back end).

This lists **every endpoint the web front end needs**, with the exact shapes it expects. The back end may have more endpoints (the Raspberry upload, device heartbeat, etc.); those are out of scope here. Field names are a proposal: if the back end already uses different names, we agree on one set and update this file.

---

## 0. Conventions

- **Base URL:** `/api/v1` (same domain as the site, so no CORS and cookies work).
- **Format:** JSON, UTF-8. Field names in `camelCase`.
- **IDs:** strings (opaque). The front never builds or parses IDs.
- **Dates/times:** ISO 8601 with offset, e.g. `"2026-11-10T19:43:12-03:00"`. The back end decides the timezone of each club (`timezone` field, default `America/Sao_Paulo`). **Filter params `date` and `hour` are interpreted in the club's timezone.**
- **Pagination (lists):** cursor based.
  - Request: `?limit=20&cursor=<opaque>`
  - Response: `{ "items": [...], "nextCursor": "<opaque>" | null }`
- **Errors:** every non-2xx response has this body:
  ```json
  { "error": { "code": "REPLAY_EXPIRED", "message": "Este replay expirou.", "details": {} } }
  ```
  `message` is in Portuguese and can be shown to the user. `code` is stable and used by the front to branch.
- **Common status codes:** `400` invalid params (`VALIDATION_ERROR`), `401` not logged in, `403` no permission, `404` not found (`NOT_FOUND`), `410` gone (`REPLAY_EXPIRED`), `429` rate limited (`RATE_LIMITED`), `500` (`INTERNAL_ERROR`).
- **Media URLs** (`thumbnailUrl`, `streamUrl`) are absolute or root-relative URLs the browser can load directly in `<img>` / `<video>`. They may be short-lived (signed); the front always uses the URL from the latest response.

---

## 1. Shared types

```ts
type Club = {
  id: string;
  slug: string;          // used in URLs and QR codes, e.g. "tupi"
  name: string;          // "Tupi"
  city: string | null;   // "Curitiba"
  state: string | null;  // "PR"
  timezone: string;      // "America/Sao_Paulo"
};

type Court = {
  id: string;
  clubId: string;
  slug: string;          // "quadra-1"
  name: string;          // "Quadra 1"
  cameraCount: number;   // 2
};

type ClipStatus = "processing" | "ready" | "failed";

type Clip = {
  id: string;
  cameraIndex: number;        // 1, 2, ...
  cameraLabel: string;        // "Câmera 1"
  status: ClipStatus;
  thumbnailUrl: string | null; // null while the JPEG is still being generated
  streamUrl: string | null;    // MP4 (H.264/AAC) playable in <video>; null unless status = "ready"
  durationSec: number | null;  // ~35
  sizeBytes: number | null;
};

type ReplayEvent = {
  id: string;
  clubId: string;
  clubName: string;
  courtId: string;
  courtName: string;
  pressedAt: string;        // when the button was pressed (ISO)
  startedAt: string;        // start of the exported recording (ISO), ~30 s before pressedAt
  durationSec: number;      // ~35
  buttonOffsetSec: number;  // seconds from start of clip to the button press (~30). Used for the marker on the progress bar.
  expiresAt: string;        // when it will be deleted (ISO)
  clips: Clip[];            // one per camera, ordered by cameraIndex. A failed camera still appears with status "failed".
};
```

---

## 2. Public endpoints (sprint 1)

### 2.1 `GET /config`
Public settings so the front doesn't hardcode business data.

Response `200`:
```json
{
  "retentionHours": 24,
  "whatsappNumber": "5541999999999",
  "instagramHandle": "revevar",
  "consentVersion": "2026-11-v1",
  "privacyPolicyUrl": "/privacidade",
  "supportEmail": null
}
```
Used by: footer, WhatsApp buttons, FAQ text ("disponíveis por X horas"), expiry badge, download modal.

### 2.2 `GET /clubs`
List of clubs that have the system.

Response `200`: `{ "items": Club[] }` (no pagination, small list).

Used by: "Clube" filter. If there's only one club, the front hides the select and uses it automatically.

### 2.3 `GET /clubs/{clubId}/courts`
Courts of a club.

Response `200`: `{ "items": Court[] }`.

Used by: "Quadra" filter. Hidden when there's only one court.

### 2.4 `GET /replays`
The main catalog. Returns replay **events** (one per button press), each with all its camera clips, newest first.

Query params (all optional):
| Param | Type | Notes |
|---|---|---|
| `clubId` | string | |
| `courtId` | string | |
| `date` | `YYYY-MM-DD` | In the club's timezone. Omitted = no date filter (latest). |
| `hour` | `0`..`23` | Only with `date`. Returns events whose `pressedAt` is in that hour. |
| `limit` | number | Default 20, max 50. |
| `cursor` | string | From `nextCursor`. |

Response `200`:
```json
{
  "items": [ /* ReplayEvent */ ],
  "nextCursor": null
}
```
Used by: Home ("Último replay", "Mais recentes": `limit=8`, no date), Replays page (with filters), Replay page side list ("Mais lances às 19h").

### 2.5 `GET /replays/availability`
Which hours of a day have replays, so the hour chips only show hours that have something and the front can preselect the right one.

Query: `clubId`, `courtId` (optional), `date` (required, `YYYY-MM-DD`).

Response `200`:
```json
{
  "date": "2026-11-10",
  "hours": [ { "hour": 18, "count": 3 }, { "hour": 19, "count": 6 }, { "hour": 20, "count": 2 } ],
  "total": 11
}
```
Used by: Replays page (hour chips, counts, default hour).

### 2.6 `GET /replays/{eventId}`
One replay event, for the Replay page and shared links.

Response `200`:
```json
{
  "event": { /* ReplayEvent */ },
  "prevEventId": "evt_123" ,
  "nextEventId": null
}
```
`prev`/`next` = the chronologically previous/next event on the **same court** (for "Anterior / Próximo"). `null` at the ends.

Errors: `404 NOT_FOUND` (never existed), `410 REPLAY_EXPIRED` (existed, now deleted). The front shows different messages for each.

### 2.7 `POST /downloads`
Registers who is downloading (lead capture + consent) and returns the download link(s). **The front never downloads from `streamUrl` directly**: the download link comes from here so the back end can log every download.

Request:
```json
{
  "clipIds": ["clip_1"],
  "email": "jogador@email.com",
  "name": "João Silva",
  "consent": true,
  "consentVersion": "2026-11-v1"
}
```
- `clipIds`: one clip, or all clips of an event ("Baixar os 2 ângulos").
- `email`: required, valid email.
- `name`: optional.
- `consent`: must be `true`, otherwise `400 CONSENT_REQUIRED`.
- `consentVersion`: from `/config`.

Response `201`:
```json
{
  "downloads": [
    {
      "clipId": "clip_1",
      "url": "https://.../download/abc?sig=...",
      "fileName": "revevar_tupi_quadra1_2026-11-10_19-43_cam1.mp4",
      "expiresAt": "2026-11-10T19:58:12-03:00"
    }
  ]
}
```
- `url` must respond with `Content-Disposition: attachment; filename="..."` so the browser saves the file.
- Errors: `400 VALIDATION_ERROR` / `CONSENT_REQUIRED`, `410 REPLAY_EXPIRED`, `429 RATE_LIMITED`.

Privacy notes for the back end: store email, name, consent version, timestamp, clip/event, IP (optional). Rate limit per IP. This data powers the admin "who downloaded" view.

---

## 3. Admin endpoints (sprint 2: NOT NOW, listed only so the design accounts for them)

Auth uses an **httpOnly, Secure, SameSite=Lax session cookie** set by the back end (same domain). The front never stores tokens in localStorage.

### 3.1 `POST /auth/login`
Request: `{ "email": "...", "password": "..." }`
Response `200`: `{ "user": User }` + `Set-Cookie`.
Errors: `401 INVALID_CREDENTIALS`, `429 RATE_LIMITED`.

```ts
type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "club_admin";   // admin = Revê VAR team, club_admin = club owner
  clubIds: string[];               // clubs this user manages (all for admin)
};
```

### 3.2 `POST /auth/logout`
Response `204`. Clears the cookie.

### 3.3 `GET /auth/me`
Response `200`: `{ "user": User }`. `401` if not logged in. Used to protect admin routes.

### 3.4 `POST /auth/forgot-password` and `POST /auth/reset-password`
- forgot: `{ "email": "..." }` → always `204` (don't reveal if the email exists).
- reset: `{ "token": "...", "password": "..." }` → `204`, or `400 INVALID_TOKEN`.
(Can be sprint 2b if time is short.)

### 3.5 `GET /admin/summary`
Query: `clubId`, `from`, `to` (ISO dates).
Response `200`:
```json
{
  "replays": 128,
  "downloads": 342,
  "uniqueEmails": 97,
  "byDay": [ { "date": "2026-11-10", "replays": 21, "downloads": 54 } ],
  "topHours": [ { "hour": 19, "replays": 40 } ]
}
```
Used by: admin dashboard cards and simple chart.

### 3.6 `GET /admin/replays`
Same params as `GET /replays` (+ `clubId` required for club_admin). Each item is a `ReplayEvent` plus `"downloadCount": number`.

### 3.7 `DELETE /admin/replays/{eventId}`
Deletes the event and its files. Response `204`. Errors `403`, `404`. The back end logs who deleted it (audit).
Optional: `DELETE /admin/clips/{clipId}` to delete only one angle.

### 3.8 `GET /admin/downloads`
Query: `clubId`, `from`, `to`, `eventId` (optional), `q` (search email/name), `limit`, `cursor`.
Response `200`:
```json
{
  "items": [
    {
      "id": "dl_1",
      "downloadedAt": "2026-11-10T19:50:02-03:00",
      "email": "jogador@email.com",
      "name": "João Silva",
      "eventId": "evt_123",
      "pressedAt": "2026-11-10T19:43:12-03:00",
      "courtName": "Quadra 1",
      "cameraLabel": "Câmera 1"
    }
  ],
  "nextCursor": null
}
```

### 3.9 `GET /admin/downloads/export.csv`
Same filters as 3.8. Returns `text/csv` file. (Nice to have.)

---

## 4. Not needed from the back end (handled by the front)

- **Share link:** the front builds `https://<site>/replays/<eventId>`. WhatsApp share = `https://wa.me/?text=<encoded message + link>`.
- **Contact / "Fale conosco":** `https://wa.me/<whatsappNumber>` from `/config`.
- **Remember the download form:** the front stores the last email/name/consent version in `localStorage` (only after consent) so the user doesn't retype it. Still sent to `POST /downloads` every time.

## 5. Open questions for Kowalski
1. Do these names match what the current API already returns? Let's align before sprint 1 coding.
2. Are media files served by Express from disk or by another URL? Do they need signing?
3. Is `pressedAt` / `startedAt` / `buttonOffsetSec` available from the Raspberry metadata (Rafa)?
4. How is a "ReplayEvent" identified today: one row per clip or one per button press? We need the grouping by event.
5. Timezone: stored in UTC? Club timezone field?
6. Thumbnail generation: when `thumbnailUrl` is null, will it appear after a few seconds (so the front can refetch)?
