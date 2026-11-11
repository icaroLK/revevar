# Revê VAR · Project context

Short background so every session starts with the same picture. The detailed "what to build" is in `frontend-spec.md`; the data is in `api-contract.md`.

## The product
Revê VAR is an instant replay system for sports courts (society soccer, beach tennis, padel...). Cameras record the court nonstop. When a player presses a wireless button at the court, the system saves the last 30 seconds plus 5 seconds after the press, one video per camera (2 cameras per court today). The videos show up on the website, where players watch and download them.

There's no limit of clubs: one club has many courts, one court has many cameras, each button press creates one **replay event** with one clip per camera. Today there's one club running it, but the site must work for many.

## How the pieces connect
1. **Field side (Rafa):** Raspberry Pi 3 at the club, RF receiver for the button, ring buffer of 5 s video segments, compiles the clip on button press, POSTs the video + metadata to the API. Not our code.
2. **Back end (André Kowalski):** Node.js + Express + SQLite on Hostinger. Receives uploads, stores videos and thumbnails, serves the API in `api-contract.md`. Not this repo.
3. **Front end (Ícaro, this repo):** the public website/web app. Talks only to the back end API.

## Current scope: Sprint 1 only
Build the public site from the approved mockups:
- Início, Replays (catalog with filters), Replay (player with both camera angles), Como funciona (with FAQ), Para clubes, Privacidade, 404.
- Download flow with email + consent before downloading (no CPF).
- Copy link and WhatsApp share.
- Fully public, **no login**.

Goal: a professional-looking site live as soon as possible, because the client wants to start selling to other clubs.

## Not now (do not build unless asked)
- **Sprint 2:** club admin area (login, delete replays, see who downloaded). Its endpoints are in `api-contract.md` §3 only so we design with it in mind.
- **Later / maybe:** live streaming, court reservations, player accounts, payments.

## About the ERS document
`docs/private/` may contain the client's ERS (requirements spec). It describes the **long-term vision** of the whole platform (live streaming, reservations, admin, device API...). **It is not the current scope.** When the ERS and `frontend-spec.md` disagree, `frontend-spec.md` wins.

## Constraints
- Hosting is the client's Hostinger plan, which runs JavaScript/Node only. The front end is a static build.
- Mobile first: players open it on the phone right after the game.
- Brand: "Revê VAR" (with the circumflex). Colors red, near-black, white. Logo in `docs/design/logo-white.png` (SVG pending from the client).
- Wording: the venue is called **"Clube"** (not "Arena"), each field is a **"Quadra"**.

## Placeholders still to confirm with the client
Club name (currently "Tupi"), retention time (24 h assumed), WhatsApp number, Instagram handle, privacy policy text, final FAQ list.
