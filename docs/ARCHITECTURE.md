# Architecture

> Fill this in once the problem statement and features are decided. This is a
> placeholder describing the *shape* we're committing to, not final feature
> design.

## High-level flow

```
Frontend (React/Vite)
        |
        v
Backend API (Express)
        |
        v
Business logic (services/)
        |
        v
Database access (repositories/)
        |
        v
PostgreSQL
```

The frontend never talks to PostgreSQL directly — all data access goes
through the backend API.

## Why a modular monolith (for now)

- One deployable backend, internally organized by layer (routes →
  controllers → services → repositories), not by microservice.
- Easiest to reason about and debug for a 4-person team on a hackathon
  timeline.
- Nothing here blocks splitting a module out later if there's a strong
  technical reason — there just isn't one yet.

## What lives where

| Layer | Responsibility |
|---|---|
| `routes/` | Maps URLs + HTTP methods to controllers. No logic. |
| `controllers/` | Parses request, calls a service, shapes the response. No business logic, no SQL. |
| `services/` | Business logic. Framework-agnostic — doesn't know about `req`/`res`. |
| `repositories/` | Talks to PostgreSQL. Nothing above this layer writes raw SQL. |
| `middleware/` | Cross-cutting concerns (error handling, auth, logging) applied across routes. |
| `validation/` | Input validation schemas/functions, used by controllers before calling services. |

## Open questions (fill in once the problem statement is chosen)

- What are the core entities/domains?
- Does anything need real-time updates (WebSockets/SSE), or is
  request/response sufficient?
- Authentication approach?
- Deployment target?
