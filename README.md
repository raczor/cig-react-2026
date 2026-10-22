# Serviclima service orders

Panel for registering, filtering, editing and moving service orders across a status board. React 19, Vite, React Router and TanStack Query on the front end; json-server as the API. The UI is in Spanish.

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
| `npm run api` | json-server on `db.json` (port 3001) |
| `npm run build` | Production build into `dist` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | ESLint |

## Structure

```
api/             Serverless json-server for Vercel
db.json          Seed data
src/
  components/    Reusable UI (Layout, KanbanBoard, KanbanCard, OrderForm, ...)
  pages/         One component per route
  hooks/         TanStack Query hooks (useOrders.js)
  services/      HTTP calls (the only place that uses fetch)
  data/          Departments, category and status labels
  styles/        CSS variables and global styles
```

## Routes

| Path | Page |
|---|---|
| `/` | Kanban board: one column per status, drag a card to change its status; search in the top bar, filters via `?q=&department=&sort=` |
| `/orders/new` | Register an order |
| `/orders/:id` | Order detail |
| `/orders/:id/edit` | Edit an order |

## API

Order fields: `id`, `code`, `client`, `taxId`, `department`, `category`, `technician`, `date`, `hours`, `amount`, `status`.
Status is one of `pending`, `in_progress`, `completed`, `cancelled`. Category is one of `installation`, `preventive_maintenance`, `repair`, `diagnosis`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/orders` | List |
| GET | `/orders/:id` | One order |
| POST | `/orders` | Create |
| PUT | `/orders/:id` | Replace |
| PATCH | `/orders/:id` | Partial update |
| DELETE | `/orders/:id` | Delete |

## Deploy (Vercel)

Import the repository (Vite preset) and set `VITE_API_URL=/api`. `api/index.js` serves `db.json` from memory, so created or edited orders reset when the function restarts. `vercel.json` routes `/api/*` to the function and everything else to `index.html`.
