# Database

> No feature-specific tables exist yet — the problem statement isn't final.
> This document explains how we will manage schema and data once it is.

## Engine

PostgreSQL (local, via Docker or a local install — team to decide and note
here once set up).

## Migrations

- Location: `database/migrations/`
- Each migration is a plain, numbered SQL file: `0001_description.sql`,
  `0002_description.sql`, etc. Numbering makes order and history explicit
  without needing a migration framework yet.
- A migration should be small and reversible where practical. If we outgrow
  plain SQL files (e.g. need rollback tooling), revisit and pick a migration
  tool at that point — not before.
- Run order = filename order. Whoever adds a migration runs it locally and
  confirms it applies cleanly before opening a PR.

## Seeds

- Location: `database/seeds/`
- Seed scripts populate development data only — never run against a
  production database.
- Keep seed data minimal and realistic enough to develop against.

## Schema (fill in once designed)

- Entities:
- Relationships (ERD or description):
- Indexes/constraints of note:

## Local setup (fill in once finalized)

```
# Example — replace with actual commands once decided
createdb hackathon_dev
psql hackathon_dev -f database/migrations/0001_xxx.sql
psql hackathon_dev -f database/seeds/xxx.sql
```
