# CLAUDE.md

Instructions for Claude Code working in this repo.

## Project

Reve VAR — instant-replay website for a sports field. See [README.md](README.md) and `docs/` for context. Full background (sprint plan, pricing, open questions) lives in this session's memory, not in this repo.

## Scope discipline

This repo is scoped to Sprint 1 (public catalog site) and later Sprint 2 (accounts). Do not build long-term ERS features (live streaming, reservations, full admin panel, integration API) unless explicitly asked — architecture should stay *compatible* with that future, not implement it.

## Repo hygiene (portfolio repo — public)

- No secrets, ever. Use `.env` (gitignored) + `.env.example`.
- No real client data (videos, user info, DB dumps). Use mock/sample data only.
- `docs/private/` is gitignored — real call notes, pricing, and the ERS spec go there, never committed.
- Conventional commits (`feat:`, `fix:`, `docs:`, ...).
