# API

> No feature endpoints exist yet. This documents the API conventions we'll
> follow once real endpoints are added, plus the one endpoint that exists
> today (health check).

## Base URL

`http://localhost:4000/api` (local dev — see `frontend/.env.example`)

## Conventions (to follow once real endpoints are added)

- Prefix all routes with `/api`.
- Use plural nouns for resources (`/api/widgets`, not `/api/widget`).
- Standard verbs: `GET` (read), `POST` (create), `PUT`/`PATCH` (update),
  `DELETE` (remove).
- Return JSON. On error, return `{ "error": "message" }` with an appropriate
  HTTP status code — not a 200 with an error field buried inside.
- Validate all input in `validation/` before it reaches a controller/service.

## Existing endpoints

### `GET /api/health`

Returns backend liveness and, if reachable, confirms the database
connection. Used to verify the frontend → backend → database chain works
end to end before any real feature is built.

Response:
```json
{ "status": "ok", "database": "connected" }
```

## Endpoints (fill in as features are added)

| Method | Path | Description | Auth required |
|---|---|---|---|
| | | | |
