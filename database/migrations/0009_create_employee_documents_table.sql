-- Files live on the backend's local filesystem (e.g. backend/uploads/);
-- only metadata + relative path is stored here. Profile picture is a
-- separate single-value field on employees, not a row in this table.
CREATE TABLE employee_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,

    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    storage_path TEXT NOT NULL,

    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_employee_documents_employee_id ON employee_documents (employee_id);
