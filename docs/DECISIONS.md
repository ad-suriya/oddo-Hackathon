# Decisions Log

Record significant technical decisions here as they're made — what was
decided, why, and what alternatives were considered. Keep entries short.
This is especially useful for a hackathon judge/reviewer trying to
understand your reasoning, and for the team when revisiting a choice later.

## Template

```
## YYYY-MM-DD — <short title>

**Decision:** what we chose
**Why:** the reasoning / constraint that drove it
**Alternatives considered:** what else we looked at, and why not
```

## 2026-08-22 — Initial stack

**Decision:** React (Vite) frontend, Node.js/Express backend, PostgreSQL
database, modular monolith architecture.
**Why:** Team is transitioning from Firebase to a relational database and
has limited relational DB experience — a single deployable backend with
clear internal layers (routes/controllers/services/repositories) is easier
to learn and debug under hackathon time pressure than a multi-service setup.
JS on both ends reduces context-switching for a 4-person team.
**Alternatives considered:** Next.js (more built-in structure, more to
learn up front), Python/FastAPI backend (good option, but splits the team's
language context), MySQL (equally valid, team had no strong preference so
defaulted to Postgres).
