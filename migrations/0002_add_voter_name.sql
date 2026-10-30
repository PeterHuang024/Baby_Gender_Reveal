-- Execute exactly once on your existing D1 database (Production).
-- Keeps previous votes; existing rows will have a NULL name.
ALTER TABLE votes ADD COLUMN voter_name TEXT;
