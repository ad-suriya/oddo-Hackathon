CREATE TABLE leave_requests (
    id BIGSERIAL PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,

    leave_type leave_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    remarks TEXT,

    status leave_status NOT NULL DEFAULT 'pending',
    reviewed_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    reviewer_comment TEXT,
    reviewed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT leave_dates_valid CHECK (start_date <= end_date)
);

-- "My leave requests" (employee) and "all/pending requests" (admin/HR).
CREATE INDEX idx_leave_requests_employee_id ON leave_requests (employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests (status);

CREATE TRIGGER leave_requests_set_updated_at
    BEFORE UPDATE ON leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
