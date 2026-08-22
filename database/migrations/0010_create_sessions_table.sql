-- Cookie-backed server-side sessions. The cookie holds a random opaque
-- token; only its SHA-256 hash is stored here, matching the existing
-- "hashed, not the raw value" convention used by
-- users.email_verification_token_hash.
CREATE TABLE sessions (
    token_hash TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Logout-everywhere / account-deletion cleanup queries by user.
CREATE INDEX idx_sessions_user_id ON sessions (user_id);

-- Expired-session sweep.
CREATE INDEX idx_sessions_expires_at ON sessions (expires_at);
