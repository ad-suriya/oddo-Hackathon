-- Current salary snapshot only — no payroll/payslip history in the MVP.
-- Updating salary overwrites this row. Salary history/payslip generation
-- is listed under "Future Enhancements" in the requirements doc, not MVP.
CREATE TABLE employee_salary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,

    basic_pay NUMERIC(12,2) NOT NULL DEFAULT 0,
    allowances NUMERIC(12,2) NOT NULL DEFAULT 0,
    deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
    currency CHAR(3) NOT NULL DEFAULT 'INR',

    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT employee_salary_non_negative CHECK (
        basic_pay >= 0 AND allowances >= 0 AND deductions >= 0
    )
);

CREATE TRIGGER employee_salary_set_updated_at
    BEFORE UPDATE ON employee_salary
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
