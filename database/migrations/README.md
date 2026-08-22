# Migrations

Plain, numbered SQL files applied in filename order:

```
0001_create_users_table.sql
0002_add_email_index.sql
```

No tables exist yet — the schema depends on the (not yet finalized) problem
statement. See `docs/DATABASE.md` for the full strategy.

Rule of thumb: one migration per logical schema change, and never edit a
migration that's already been applied by teammates — write a new one.
