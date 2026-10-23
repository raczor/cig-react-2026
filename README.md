# Serviclima service orders

Panel for registering, filtering, editing and moving service orders across a status board. React 19, Vite, Tailwind CSS 4, React Router and TanStack Query on the front end; a Fastify API backed by Postgres (Drizzle ORM). The UI is in Spanish.

## Getting started

```bash
cp .env.example .env
npm install
npm run api   # terminal 1: API on http://localhost:3001
npm run dev   # terminal 2: app on http://localhost:5173
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server (port 5173) |
| `npm run api` | Fastify API on http://127.0.0.1:3001 (in-memory Postgres with seed data) |
| `npm run build` | Production build into `dist` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | ESLint |
| `npm test` | Vitest, run once (`npm run test:watch` to keep watching) |

## Structure

```
api/             Vercel function that serves the Fastify app
server/          Fastify app, Drizzle schema, database setup and seed data
shared/          Catalog lists and Zod schemas used by both the API and the form (React Hook Form)
src/
  components/    App components (Layout, KanbanBoard, KanbanCard, OrderForm, ...)
  components/ui/ Shared look: Button, Card, Alert, class helpers (buttonClass, controlClass)
  pages/         One component per route
  hooks/         TanStack Query hooks (useOrders.js)
  services/      HTTP calls (the only place that uses fetch)
  lib/           Pure logic: board filtering and sorting
  data/          Departments, category and status labels
  test/          Test setup, fixtures and the render helper
  styles/        Tailwind entry and design tokens (index.css)
```

## Routes

| Path | Page |
|---|---|
| `/` | Kanban board: one column per status, drag a card to change its status; search in the top bar, filters via `?q=&department=&sort=` |
| `/orders/new` | Register an order |
| `/orders/:id` | Order detail |
| `/orders/:id/edit` | Edit an order |

## API

Served under `/api`. Order fields: `id`, `code`, `client`, `taxId`, `department`, `category`, `technician`, `date`, `hours`, `amount`, `status`.
Status is one of `pending`, `in_progress`, `completed`, `cancelled`. Category is one of `installation`, `preventive_maintenance`, `repair`, `diagnosis`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/orders` | List |
| GET | `/api/orders/:id` | One order |
| POST | `/api/orders` | Create. The server sets `id`, `code` (`OS-<year>-<id>`) and `status: pending`; those fields in the body are ignored |
| PUT | `/api/orders/:id` | Replace the editable fields; `status` is changed only if sent (`id` and `code` never change) |
| PATCH | `/api/orders/:id` | Change `status` only |
| DELETE | `/api/orders/:id` | Delete (204, no body) |
| GET | `/api/health` | Health check |

Bodies are validated with the Zod schemas in `shared/order-schema.js`; errors come back as `400 { message, issues }` with the Spanish messages the UI shows. A missing order is `404 { message }`.

## Authentication

Login uses Neon Auth (managed Better Auth). The browser signs in with `@neondatabase/neon-js`, gets a short-lived JWT, and sends it as `Authorization: Bearer <jwt>`. The API verifies it with `jose` against Neon's public keys. Everything under `/api/orders` needs a valid token; `/api/health` stays public.

| Variable | Where | Meaning |
|---|---|---|
| `VITE_NEON_AUTH_URL` | front end (build time) | Neon Auth URL. Without it the app has no login page. |
| `NEON_AUTH_BASE_URL` | API | Same URL; the token issuer is its origin. Required on Vercel: the API refuses to start without it instead of running open. |
| `NEON_AUTH_JWKS_URL` | API, optional | Overrides where the public keys are fetched from. |
| `NEON_AUTH_ISSUER` | API, optional | Overrides the expected token issuer (default: the origin of `NEON_AUTH_BASE_URL`). A rejected token is logged with its reason. |
| `AUTH_ALLOWED_EMAILS` | API, optional | Comma-separated emails. When set, only those users get in (403 for everyone else). |

Locally none of these are set, so there is no login and the API is open: `npm run dev` and `npm run api` work without a Neon account.

Neon Auth lets anyone create an account. If only some people should use the app, set `AUTH_ALLOWED_EMAILS`, or turn sign-up off in the Neon Auth settings. The allowlist compares the email in the token, so it is only as strong as the email check at sign-up: require email verification in Neon Auth before relying on it.

## Database

The API uses Drizzle on Postgres.

- **No `DATABASE_URL` (local development, tests):** PGlite, a Postgres that runs inside the Node process. It starts from `server/seed.json` and lives in memory, so data resets when the API restarts. Set `PGLITE_DIR=.data` to keep it on disk.
- **`DATABASE_URL` set (production):** any Postgres through `pg`. The table is created on first start and filled with the demo orders when it is empty.

## Deploy (Vercel)

Import the repository (Vite preset) and set `VITE_API_URL=/api`. `api/index.js` runs the Fastify app as a Vercel function, and `vercel.json` routes `/api/*` to it and everything else to `index.html`.

Add a Postgres database (for example Neon from the Vercel Marketplace) so orders persist: it sets `DATABASE_URL` for the project. Without it the API falls back to the in-memory database, which resets whenever the function restarts.
