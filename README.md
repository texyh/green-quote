# GreenQuote

Solar financing pre-qualification: a signed-in user requests a quote for a residential solar system and sees the result.

## Status

| Area     | Done                                                             | Not yet                                             |
| -------- | ---------------------------------------------------------------- | --------------------------------------------------- |
| Frontend | Quote form with client-side validation, sidebar layout           | Quote result page, quotes list, admin view          |
| Backend  | `POST /api/quotes` (validate + save), `GET /api/health`, Swagger | Pricing model, `GET /api/quotes/:id`                |
| Auth     | –                                                                | Registration, login, ownership checks, seeded admin |
| Infra    | Postgres via docker compose, migrations                          | App Dockerfile                                      |

## Stack

- **Frontend:** Next.js 16, React 19, Ant Design 6
- **Backend:** NestJS 12, TypeORM, PostgreSQL 17
- **Tooling:** pnpm, Jest, oxlint, ESLint, Prettier

## Prerequisites

- Docker
- For local development without Docker: Node.js 24 (LTS) and pnpm (`corepack enable pnpm`)

## Getting started

### With Docker (everything)

```bash
docker compose up --build
```

This starts Postgres, the API and the frontend. The API runs migrations (including the admin seed) before it starts, and the frontend waits until the API is healthy. The compose file uses a demo `JWT_SECRET` (`change-me`); a real deployment must use a long random secret.

### Local development

```bash
docker compose up -d db

cd quote-checker-backend
cp .env.example .env
pnpm install
pnpm migration:run
pnpm start:dev

cd ../quote-checker-frontend
pnpm install
pnpm dev
```

| URL                              | What         |
| -------------------------------- | ------------ |
| http://localhost:3000            | Frontend     |
| http://localhost:3001/api        | Backend API  |
| http://localhost:3001/api/docs   | Swagger docs |
| http://localhost:3001/api/health | Health check |

Postgres runs on host port **5433**.

## Scripts (backend)

| Command                                   | What it does                             |
| ----------------------------------------- | ---------------------------------------- |
| `pnpm start:dev`                          | Start the API with reload                |
| `pnpm test`                               | Unit tests                               |
| `pnpm lint`                               | Lint                                     |
| `pnpm migration:generate <Name>`          | Generate a migration from entity changes |
| `pnpm migration:create <Name>`            | Create an empty migration                |
| `pnpm migration:run` / `migration:revert` | Apply / undo migrations                  |

## Project structure

```
docker-compose.yml        Postgres for local dev
quote-checker-frontend/   Next.js app
  app/                    Pages (/, /quotes, /quotes/new, /quotes/[id])
  lib/                    API client (api.ts) and quote calls (quotes.ts)
quote-checker-backend/    NestJS API
  src/quotes/             Quote entity, DTOs, controller, service
  src/health/             Health check (Terminus)
  src/database/           Data source and migrations
```

## Admin

The `AdminSeed` migration creates an admin account when you run `pnpm migration:run`:

| Email | Password |
|---|---|
| `admin@test.com` | `pass@test` |


## Decisions

- **Next.js proxies `/api/*` to the backend.** The browser only talks to its own origin, so there's no CORS setup and auth cookies will work without extra config.
- **The API never returns entities.** Services map to response DTOs, so the database shape can change without changing the API.
- **Validation runs on every request** (`ValidationPipe` with `whitelist`), and unknown fields are stripped.
- **Structured JSON logs** with Nest's built-in logger. Route logs leave out personal data (name, email, address).
- **Schema changes only go through migrations** (`synchronize: false`).
- **A quote belongs to the signed-in user.** Name and email come from the account; the address is entered per quote, since one user may have several properties.

## What's next

1. Pricing model: system price, risk band and the 5/10/15-year offers
2. Quote result page and `GET /api/quotes/:id`
3. Auth with email/password, ownership checks and a seeded admin
4. Quotes list and admin view
5. App Dockerfile, integration tests, API reference
