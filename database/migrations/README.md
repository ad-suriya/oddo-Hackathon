# Migrations

Plain, numbered SQL files applied in filename order:

```
0001_enable_extensions.sql
0002_create_updated_at_function.sql
0003_create_enum_types.sql
0004_create_users_table.sql
0005_create_employees_table.sql
0006_create_attendance_table.sql
0007_create_leave_requests_table.sql
0008_create_employee_salary_table.sql
0009_create_employee_documents_table.sql
```

Apply in order against a fresh database:

```
for f in database/migrations/*.sql; do psql "$DATABASE_URL" -f "$f"; done
```

See `docs/DATABASE.md` for the full schema and `docs/DECISIONS.md` for why
the schema is shaped this way.

Rule of thumb: one migration per logical schema change, and never edit a
migration that's already been applied by teammates — write a new one.
