# Seeds

Development-only sample data, as SQL files, run after migrations:

```
0001_seed_dev_data.sql
```

Seeds 2 admin/HR accounts, 3 employee accounts, their salary records, a few
days of attendance, and leave requests in each status. Password hashes in
this file are placeholders, not real bcrypt/argon2 hashes — no seeded
account can actually log in until auth is implemented and the seed is
regenerated with real hashes.

Never run seed scripts against a production database.
