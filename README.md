# Dayflow

Dayflow is a Human Resource Management System (HRMS) that centralizes
employee information, attendance, leave management, and payroll/salary
information in a single platform, with separate access levels for Employees
and Admin/HR users.

See `PROJECT_CONTEXT.md` for the full problem statement, target users, and
feature list, and `docs/ARCHITECTURE.md` for how the system fits together.

## 1. Tech stack

- Frontend: React 18 (Vite) + React Router
- Backend: Node.js (Express)
- Database: PostgreSQL

## 2. Repository structure

```
.
├── README.md
├── PROJECT_CONTEXT.md      # living doc: problem, team, status, decisions
├── DESIGN.md               # visual design system
├── .gitignore
├── .env.example             # backend + database config template
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── FRONTEND_HANDOFF.md
│   └── DECISIONS.md
│
├── frontend/                # React (Vite) app
│   └── src/
│       ├── pages/           # top-level routed views
│       ├── components/      # reusable UI pieces
│       ├── context/         # React context providers (auth, toasts)
│       ├── api/             # backend communication (fetch wrappers)
│       ├── services/        # feature-level API + mock switching
│       ├── mocks/            # in-memory mock API (VITE_USE_MOCK_API=true)
│       ├── hooks/            # shared React hooks
│       ├── types/            # shared type/shape definitions
│       ├── utils/            # pure helper functions
│       └── styles/           # design tokens + base styles
│
├── backend/                 # Express API
│   ├── src/
│   │   ├── routes/          # URL -> controller mapping
│   │   ├── controllers/     # request/response handling
│   │   ├── services/        # business logic
│   │   ├── repositories/    # database access (only layer that talks to Postgres)
│   │   ├── serializers/     # DB row -> API response shaping
│   │   ├── validation/      # request input validation
│   │   ├── middleware/      # auth, error handling, rate limiting
│   │   ├── utils/           # shared helpers (sessions, passwords, errors, ...)
│   │   └── config/          # environment/config loading
│   ├── scripts/             # migrate, seed, mock-data, local dev DB
│   └── tests/                # backend test suite (node --test)
│
└── database/
    ├── migrations/           # numbered SQL schema changes
    ├── seeds/                 # dev-only sample data
    └── queries/                # reference/common SQL queries
```

## 3. Local setup

Requires Node.js. PostgreSQL is optional locally — `npm run dev:db` spins up
a throwaway embedded PostgreSQL instance if you don't have one installed.

```bash
# 1. Database (only if you don't already have PostgreSQL running locally)
cd backend
npm install
npm run dev:db                # starts embedded PostgreSQL, keep running

# 2. Backend (separate terminal)
cd backend
cp ../.env.example ../.env    # if not already done at repo root
npm run migrate               # apply database/migrations/*.sql
npm run seed                  # optional: load dev sample data
npm run dev                   # starts on http://localhost:4000

# 3. Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env
npm run dev                   # starts on http://localhost:5173
```

By default the frontend runs against an in-memory mock API
(`VITE_USE_MOCK_API=true` in `frontend/.env.example`), so it works without
the backend or database running. Set `VITE_USE_MOCK_API=false` once you want
it talking to the real backend.

## 4. Environment setup

- Root `.env.example` → copy to root `.env`: backend + database config.
- `frontend/.env.example` → copy to `frontend/.env`: frontend-only config
  (Vite requires `VITE_`-prefixed vars to live inside the frontend project).
- Never commit a real `.env` file. Never put secrets directly in source code.

## 5. Database setup

Migrations are plain, numbered SQL files in `database/migrations/`, applied
in filename order. `backend/scripts/migrate.js` (`npm run migrate`) applies
any not-yet-applied migrations against the database configured in `.env`.

```bash
cd backend
npm run migrate               # apply pending migrations
npm run seed                  # load database/seeds/0001_seed_dev_data.sql
```

See `database/migrations/README.md`, `database/seeds/README.md`, and
`docs/DATABASE.md` for schema details and the full migration/seed strategy.

## 6. API

The backend exposes a REST API under `/api` (health check, auth, employees,
attendance, leave requests, payroll). See `docs/API.md` for the endpoint
list and `docs/FRONTEND_HANDOFF.md` for request/response shapes, the error
format, and the role/permission matrix.

## 7. Development commands

| Location | Command | Purpose |
|---|---|---|
| `backend/` | `npm run dev` | Start backend with auto-reload |
| `backend/` | `npm start` | Start backend (no auto-reload) |
| `backend/` | `npm run dev:db` | Start local embedded PostgreSQL |
| `backend/` | `npm run migrate` | Apply pending database migrations |
| `backend/` | `npm run seed` | Load dev sample data |
| `backend/` | `npm run mock-data` | Generate mock data |
| `backend/` | `npm test` | Run backend test suite |
| `frontend/` | `npm run dev` | Start frontend dev server |
| `frontend/` | `npm run build` | Production build |
| `frontend/` | `npm run preview` | Preview production build |

## 8. Git workflow

```
main
  └── feature branches (feature/<short-description>)
        └── pull request
              └── at least one teammate reviews
                    └── merge into main
```

- Never commit directly to `main`.
- Keep feature branches small and short-lived.
- Pull `main` and rebase/merge before opening a PR to reduce conflicts.

### Commit conventions

Use a short prefix + imperative description:

```
feat: add user login endpoint
fix: correct null check in order service
docs: update API.md with new endpoint
chore: update dependencies
refactor: extract validation into its own module
```

## 9. Team members

| Name | Contact | Primary Role |
|---|---|---|
| A. D. Suriya | TODO | Database + Backend |
| Pratyush | TODO | Full Stack |
| Vikass | TODO | Presenter, Error Finder |
| Gokul | TODO | Frontend |

## 10. Contribution guidelines

- Branch off `main`, open a PR, get at least one review before merging.
- Keep controllers thin — business logic belongs in `services/`, database
  queries belong in `repositories/`.
- Validate all external input (`validation/`) before it reaches a service.
- Update `docs/` and `PROJECT_CONTEXT.md` when a decision or feature
  ownership changes — don't let them go stale.
- Do not commit `.env` files or secrets.
