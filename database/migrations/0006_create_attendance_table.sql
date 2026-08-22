-- One attendance record per employee per calendar day (no multi-session
-- check-in/out within a day for the MVP).
CREATE TABLE attendance (
    id BIGSERIAL PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,

    attendance_date DATE NOT NULL,
    check_in_at TIMESTAMPTZ,
    check_out_at TIMESTAMPTZ,
    status attendance_status NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT attendance_employee_date_unique UNIQUE (employee_id, attendance_date),
    CONSTRAINT attendance_checkout_after_checkin CHECK (
        check_in_at IS NULL OR check_out_at IS NULL OR check_out_at > check_in_at
    )
);

-- The unique constraint above already indexes (employee_id, attendance_date),
-- which covers "this employee's attendance" lookups. This index covers the
-- admin dashboard's "everyone's attendance for a given day" query.
CREATE INDEX idx_attendance_date ON attendance (attendance_date);

CREATE TRIGGER attendance_set_updated_at
    BEFORE UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
