-- Authentication account. One row per login identity.
--
-- Role is NOT selectable via public signup even though the requirements
-- doc lists "Role (Employee/HR)" on the signup form: the backend must
-- always insert role='employee' for public self-registration. Admin/HR
-- accounts are created out-of-band (seed data or an internal invite flow),
-- never chosen by the registering user. See docs/DECISIONS.md.
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'employee',

    email_verification_token_hash TEXT,
    email_verification_expires_at TIMESTAMPTZ,
    email_verified_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER users_set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
