-- citext gives us case-insensitive email uniqueness (user@x.com == User@X.com)
-- without doing LOWER(email) everywhere in application queries.
CREATE EXTENSION IF NOT EXISTS citext;
