# Hackathon Project

## 1. Project overview

TODO — problem statement not finalized yet. See `PROJECT_CONTEXT.md`.

## 2. Tech stack

- Frontend: React (Vite)
- Backend: Node.js (Express)
- Database: PostgreSQL

See `docs/ARCHITECTURE.md` for how these fit together.

## 3. Repository structure

```
.
├── README.md
├── PROJECT_CONTEXT.md      # living doc: problem, team, status, decisions
├── .gitignore
├── .env.example            # backend + database config template
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   └── DECISIONS.md
│
├── frontend/               # React (Vite) app
│   └── src/
│       ├── pages/          # top-level routed views
│       ├── components/     # reusable UI pieces
│       ├── api/            # backend communication (fetch wrappers)
│       ├── hooks/          # shared React hooks
│       ├── types/          # shared type/shape definitions
│       └── utils/          # pure helper functions
│
├── backend/                # Express API (modular monolith)
│   └── src/
│       ├── routes/         # URL -> controller mapping
│       ├── controllers/    # request/response handling
│       ├── services/       # business logic
│       ├── repositories/   # database access (only layer that talks to Postgres)
│       ├── middleware/     # cross-cutting concerns (errors, etc.)
│       └── config/         # environment/config loading
│
└── database/
    ├── migrations/         # numbered SQL schema changes
    └── seeds/              # dev-only sample data
```

## 4. Local setup

Requires Node.js and a local PostgreSQL instance.

```bash
# Backend
cd backend
npm install
cp ../.env.example ../.env   # if not already done at repo root
npm run dev                   # starts on http://localhost:4000

# Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env
npm run dev                   # starts on http://localhost:5173
```

## 5. Environment setup

- Root `.env.example` → copy to root `.env`: backend + database config.
- `frontend/.env.example` → copy to `frontend/.env`: frontend-only config
  (Vite requires `VITE_`-prefixed vars to live inside the frontend project).
- Never commit a real `.env` file. Never put secrets directly in source code.

## 6. Database setup

```bash
createdb hackathon_dev
# apply migrations, once they exist:
psql hackathon_dev -f database/migrations/0001_xxx.sql
```

See `docs/DATABASE.md` for the full migration/seed strategy.

## 7. Development commands

| Location | Command | Purpose |
|---|---|---|
| `backend/` | `npm run dev` | Start backend with auto-reload |
| `backend/` | `npm start` | Start backend (no auto-reload) |
| `frontend/` | `npm run dev` | Start frontend dev server |
| `frontend/` | `npm run build` | Production build |

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

| Name | Email/Contact | Role |
|---|---|---|
| | | |
| | | |
| | | |
| | | |

## 10. Contribution guidelines

- Branch off `main`, open a PR, get at least one review before merging.
- Keep controllers thin — business logic belongs in `services/`, database
  queries belong in `repositories/`.
- Validate all external input (`validation/`) before it reaches a service.
- Update `docs/` and `PROJECT_CONTEXT.md` when a decision or feature
  ownership changes — don't let them go stale.
- Do not commit `.env` files or secrets.
