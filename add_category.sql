ALTER TABLE professionals ADD COLUMN category VARCHAR(50) CHECK (category IN ('Hair', 'Nails', 'Lashes'));
