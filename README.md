# GreenQuote

Solar financing pre-qualification. A signed-in user requests a quote for a residential solar system and immediately sees the system price, a risk band and three financing offers. Admins can see and search all quotes.

## Features

- **Auth:** sign up and sign in with email and password, or with Keycloak; either way the session is a JWT in an httpOnly cookie
- **Quote form:** name and email are filled from the account; address, monthly consumption, system size and an optional down payment, with client- and server-side validation
- **Quote result:** system price, risk band with its APR, and 5, 10 and 15-year offers with the monthly payment and a month-by-month repayment schedule
- **My quotes:** a paginated table of only the signed-in user's quotes
- **Admin view:** all quotes, searchable by customer name or email; authorization is enforced on the server
- **Ops:** Docker Compose for the whole stack, structured logs, health check, Swagger docs

## Stack

- **Frontend:** Next.js 16 (App Router), React 19, Ant Design 6
- **Backend:** NestJS 12, TypeORM, PostgreSQL 17
- **Tooling:** pnpm, Jest, oxlint, ESLint, Prettier, Winston

## Prerequisites

- Docker
- For local development without Docker: Node.js 24 (LTS) and pnpm (`corepack enable pnpm`)

## Getting started

### With Docker (everything)

```bash
docker compose up --build
```

This starts Postgres, Keycloak, the API and the frontend. The API runs the migrations and the admin seed before it starts, and the frontend waits until the API is healthy. Keycloak takes about a minute on its first start, while it creates its tables and imports the realm; until then, **Sign in with Keycloak** shows Keycloak's error page. The `JWT_SECRET` in `docker-compose.yml` is for local demos only; a real deployment must use its own long random secret.

To start from scratch (empty databases, Keycloak realm imported again):

```bash
docker compose down -v
docker compose up --build
```

### Local development

```bash
docker compose up -d db keycloak

cd green-quote-backend
cp .env.example .env
pnpm install
pnpm migration:run
pnpm seed:admin
pnpm start:dev

cd ../green-quote-frontend
pnpm install
pnpm dev
```

| URL                              | What                                       |
| -------------------------------- | ------------------------------------------ |
| http://localhost:3000            | Frontend                                   |
| http://localhost:3001/api/docs   | Swagger docs                               |
| http://localhost:3001/api/health | Health check                               |
| http://localhost:8080/admin      | Keycloak admin console (`admin` / `admin`) |

Postgres runs on host port **5433**.

## Admin account

`pnpm seed:admin` creates the admin from `ADMIN_EMAIL` and `ADMIN_PASSWORD`, or resets its password and role if the email already exists. Docker runs it after the migrations, and `.env.example` and `docker-compose.yml` set demo values:

| Email            | Password    |
| ---------------- | ----------- |
| `admin@test.com` | `pass@test` |

Signing in with it opens the admin view at `/admin/quotes`. These are demo values only: a real deployment sets its own from a secret store, or promotes a real user to admin instead of seeding a password.

## Configuration (backend)

Read with Nest's `ConfigService` (`.env` locally, `docker-compose.yml` in Docker). `src/config/env.validation.ts` checks them at startup with class-validator, so a missing or invalid value (for example `PRICE_PER_KW_EUR=abc`) stops the API with a clear error.

| Variable                 | Required     | What                                             |
| ------------------------ | ------------ | ------------------------------------------------ |
| `DATABASE_URL`           | Yes          | Postgres connection string                       |
| `JWT_SECRET`             | Yes          | Secret that signs the session token              |
| `SESSION_TTL_SECONDS`    | Yes          | Session length, for both the token and cookie    |
| `PRICE_PER_KW_EUR`       | Yes          | System price per kW for new quotes               |
| `PORT`                   | No (`3001`)  | API port                                         |
| `LOG_LEVEL`              | No (`info`)  | Winston log level                                |
| `ADMIN_EMAIL`            | For the seed | Admin account for `pnpm seed:admin`              |
| `ADMIN_PASSWORD`         | For the seed | Admin password for `pnpm seed:admin`             |
| `APP_URL`                | Yes          | Frontend URL, for the Keycloak redirect URI      |
| `KEYCLOAK_URL`           | Yes          | Realm URL as the browser sees it (token issuer)  |
| `KEYCLOAK_INTERNAL_URL`  | No           | Realm URL the API uses, if different (in Docker) |
| `KEYCLOAK_CLIENT_ID`     | Yes          | Keycloak client                                  |
| `KEYCLOAK_CLIENT_SECRET` | Yes          | Keycloak client secret                           |

Changing the price only affects new quotes, since each quote stores its own price and offers.

## Keycloak sign-in

`docker compose up` starts Keycloak on http://localhost:8080 and imports the realm from `keycloak/green-quote-realm.json`. **Sign in with Keycloak** on the sign-in page uses these demo users:

| Email                  | Password        | Role  |
| ---------------------- | --------------- | ----- |
| `kc-user@example.com`  | `kc-user-pass`  | user  |
| `kc-admin@example.com` | `kc-admin-pass` | admin |

New users can also register on the Keycloak page. In the admin console (http://localhost:8080/admin, `admin` / `admin`), switch to the `green-quote` realm to manage users and roles: give a user the `admin` realm role and they become an app admin at their next sign-in.

Keycloak keeps its data in its own `keycloak` database on the same Postgres. `postgres/init.sql` creates it the first time the Postgres volume is created. If your volume is older than that, create it once:

```bash
docker compose exec db psql -U postgres -c 'CREATE DATABASE keycloak'
```

The realm file is imported only when the realm doesn't exist yet, so later edits to `keycloak/green-quote-realm.json` are not applied to a running setup. To apply them, delete the realm in the admin console and restart Keycloak, or start from scratch with `docker compose down -v`.

To test with a different Keycloak user, sign out of the app and also out of Keycloak at http://localhost:8080/realms/green-quote/protocol/openid-connect/logout; otherwise Keycloak signs you straight back in as the previous user.

How it works: the API runs the OpenID Connect authorization code flow with PKCE (`GET /api/auth/keycloak/login` and `/callback`). It checks the `state`, exchanges the code, verifies the ID token's signature with the realm's public key, then finds or creates the local user and sets the same session cookie as a password sign-in. Keycloak's `admin` realm role becomes the app's admin role on every sign-in. A Keycloak user is matched by Keycloak id, or linked to an existing account by email only if Keycloak has verified that email.

## Tests and checks

| Where    | Command                  | What                                                              |
| -------- | ------------------------ | ----------------------------------------------------------------- |
| Backend  | `pnpm test`              | Unit tests (78): pricing, auth, guards, validation, logging, DTOs |
| Backend  | `pnpm test:e2e`          | Integration tests (13) against a real Postgres                    |
| Backend  | `pnpm lint`              | oxlint with type-aware rules                                      |
| Backend  | `pnpm format`            | Prettier                                                          |
| Frontend | `pnpm lint`              | ESLint                                                            |
| Frontend | `pnpm format:check`      | Prettier                                                          |
| Frontend | `pnpm exec tsc --noEmit` | Type check                                                        |

The integration tests start the real app and call it over HTTP: signup and signin, quote creation with the full pricing in the response, ownership (`404` for other users), `401` without a session, `403` for non-admins, and admin search. They use a separate `green_quote_test` database on the compose Postgres, which they create and migrate themselves, so they never touch your dev data. Start it with `docker compose up -d db` first; set `TEST_DATABASE_URL` to use another database.

GitHub Actions runs these checks on every pull request: `.github/workflows/backend.yml` (lint, format, build, unit and integration tests against a Postgres service) and `.github/workflows/frontend.yml` (lint, format, build). Each only runs when its folder changes.

## Database migrations (backend)

| Command                                   | What it does                             |
| ----------------------------------------- | ---------------------------------------- |
| `pnpm migration:generate <Name>`          | Generate a migration from entity changes |
| `pnpm migration:create <Name>`            | Create an empty migration                |
| `pnpm migration:run` / `migration:revert` | Apply / undo migrations                  |
| `pnpm migration:show`                     | List which migrations have run           |
| `pnpm seed:admin`                         | Create or update the admin account       |

## API reference

All routes are under `/api` and require a signed-in session unless marked public. Full schemas are in Swagger at `/api/docs`.

| Method | Path                                     | Access | Description                                                                    |
| ------ | ---------------------------------------- | ------ | ------------------------------------------------------------------------------ |
| POST   | `/auth/signup`                           | Public | Create an account and start a session (`409` if the email is taken)            |
| POST   | `/auth/signin`                           | Public | Start a session (`401` for a wrong email or password)                          |
| POST   | `/auth/signout`                          | Public | Clear the session cookie (`204`)                                               |
| GET    | `/auth/me`                               | User   | The signed-in user                                                             |
| POST   | `/quotes`                                | User   | Validate, price and save a quote (`400` if the down payment exceeds the price) |
| GET    | `/quotes`                                | User   | The user's quotes, newest first (`page`, `limit` up to 100)                    |
| GET    | `/quotes/:id`                            | User   | One quote; `404` unless you own it or are an admin                             |
| GET    | `/quotes/:id/offers/:termYears/schedule` | User   | The offer's monthly repayment schedule; same access as `/quotes/:id`           |
| GET    | `/admin/quotes`                          | Admin  | All quotes, paginated, `search` by owner name or email                         |
| GET    | `/health`                                | Public | Database and memory check                                                      |

## Pricing model

- **System price:** `systemSizeKw × €1,200` (`PRICE_PER_KW_EUR`)
- **Principal:** system price − down payment (a down payment above the price is rejected)
- **Risk band:** A if monthly consumption ≥ 400 kWh and system size ≤ 6 kW; otherwise B if consumption ≥ 250 kWh; otherwise C
- **APR:** A 6.9%, B 8.9%, C 11.9%
- **Offers:** 5, 10 and 15 years, monthly payment by standard amortization `P·r / (1 − (1 + r)^−n)` with `r = APR / 12` and `n = years × 12`, rounded to cents
- **Schedule:** each month, interest is the balance × `r` and the rest of the payment repays principal, rounded to cents; the last payment clears the remaining balance, so it can differ by a few cents

The rules live in `src/pricing/pricing.constants.ts`.

## Project structure

```
docker-compose.yml           Postgres, Keycloak, API and frontend
keycloak/                    Keycloak realm import (client, roles, demo users)
green-quote-backend/       NestJS API
  src/auth/                  Signup/signin, Keycloak sign-in, JWT cookie, guards and decorators
  src/users/                 User entity and service
  src/quotes/                Quote entity, DTOs, user and admin controllers, service
  src/pricing/               Pricing and offer calculation
  src/common/                Logger and global exception filter
  src/health/                Health check (Terminus)
  src/config/                Env validation
  src/database/              Data source, migrations and admin seed
green-quote-frontend/      Next.js app
  app/(public)/              Landing, sign in, sign up
  app/(app)/                 Signed-in pages: quotes, quote form and result, admin
  lib/                       API client, auth, quote calls, formatting
  proxy.ts                   Route guard (redirects by session)
```

## Decisions and trade-offs

- **Next.js proxies `/api/*` to the backend.** The browser only talks to its own origin, so there's no CORS and the session cookie works without extra config. The trade-off is that the proxy target is fixed at build time (`API_URL`).
- **Session as a JWT in an httpOnly, SameSite=Lax cookie.** Page scripts can't read it (XSS), and other sites can't send it (most CSRF). Because the JWT is stateless, sign-out only clears the cookie: a copied token stays valid until it expires (one hour). Revoking tokens would need a denylist or server-side sessions.
- **The role is stored in the token,** so a role change takes effect at the next sign-in.
- **Protected by default.** A global guard requires a session on every route; public routes opt out with `@AllowAnonymous()`, and admin routes add `@Roles('admin')`. The frontend route guard only improves the experience; the backend enforces access.
- **Pricing results are stored with the quote,** as the spec asks, so old quotes keep what the user was offered even if prices or APRs change. Offers are `jsonb`, since there are always three, never queried on their own.
- **Money is `numeric(12,2)`,** which is exact. Payments are rounded to cents with floating point, which is fine for estimates; a production system would use integer cents or a decimal library.
- **Pricing methods take every value they use as parameters** (price per kW, APR table, terms), so they're easy to test and reason about.
- **The API never returns entities;** services map to response DTOs. Validation runs on every request with unknown fields stripped.
- **Structured logs with Winston:** coloured lines in development, JSON in production. Every error response is logged with its reason, and logs leave out personal data (names, emails, addresses, search terms).
- **Schema changes only go through migrations** (`synchronize: false`); the Docker API runs them on start.

## Assumptions

- A quote always belongs to the signed-in user: name and email come from the account and can't be changed on the form. The address is entered per quote, since one user may have several properties.
- Email and password auth stays alongside Keycloak, since the spec asks for it as the baseline. A real product would likely move all sign-in to Keycloak.
- Signing out clears the app session only; the Keycloak session stays, so the next Keycloak sign-in doesn't ask for the password again.
- **Sign in with Keycloak** still asks for a username and password, on Keycloak's own page: that is the Keycloak sign-in, for a Keycloak account with its own password, and the app never sees it. It's skipped while a Keycloak session exists (single sign-on), and could be replaced by Google or GitHub sign-in or passkeys through realm configuration alone. Two password forms on one page can look confusing; a real product would usually keep only the Keycloak one.
- Keycloak stores its data in its own `keycloak` database on the same Postgres server, kept apart from the app's `green_quote` tables. A production setup would give it a dedicated database user, or its own Postgres instance.
