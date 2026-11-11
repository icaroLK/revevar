# Revê VAR · Web

Instant-replay web app for sports courts, built in Curitiba, Brazil. Cameras record the court nonstop; when a player presses a wireless button, the system saves the last 30 seconds plus 5 seconds after the press, from two camera angles. This is the site where players find, watch and download their replays.

**Status:** early build. Sprint 1 in progress: new public, mobile-first catalog with filters, a player with both camera angles, and download.

## What this is
A freelance rebuild of the front end of an existing, very basic replay site (no filters, no structure). This project replaces it with a clean, mobile-first web app, designed so a club admin area and other features can be added later without a rewrite.

I'm responsible for the **front end**. The back end (Node.js + Express) and the on-site hardware (Raspberry Pi, cameras, button) are built by other developers on the team.

## Highlights
- Filters by club, court, day and hour, kept in the URL (ready for a QR code at each court).
- Both camera angles of each play shown together; player with a marker at the exact moment the button was pressed.
- Download flow with email + LGPD consent.
- Built against a typed API contract with mock data, so front and back are developed in parallel.

## Stack
Vite · React · TypeScript · React Router · TanStack Query · Tailwind CSS · zod · react-hook-form · MSW · Vitest

## Getting started
```bash
cp .env.example .env
npm install
npm run dev
```
By default the app runs with mock data (`VITE_USE_MOCKS=true`).

## Docs
- `docs/project-context.md`: product and scope
- `docs/frontend-spec.md`: screens and behavior
- `docs/api-contract.md`: API the front end consumes
- `docs/build-plan.md`: milestones

---

Code shown for portfolio purposes. All rights reserved by Revê VAR.
