-- Shared trigger function: every table with an updated_at column attaches
-- a BEFORE UPDATE trigger to this instead of relying on the application
-- to remember to set it on every write.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
