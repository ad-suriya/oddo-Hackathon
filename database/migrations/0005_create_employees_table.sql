-- HR profile for an account. 1:1 with users — every authenticated user
-- (employee, hr, admin) is staff and gets exactly one employees row.
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    employee_code TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    job_title TEXT,
    department TEXT,
    date_joined DATE,
    profile_picture_url TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER employees_set_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
