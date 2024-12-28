-- Ensure country column exists and has correct properties
DO $$ 
BEGIN
    -- Add country column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'addresses' 
        AND column_name = 'country'
    ) THEN
        ALTER TABLE addresses 
        ADD COLUMN country TEXT NOT NULL DEFAULT 'United Kingdom';
    END IF;

    -- Ensure default value is set
    ALTER TABLE addresses 
    ALTER COLUMN country SET DEFAULT 'United Kingdom';

    -- Ensure NOT NULL constraint
    ALTER TABLE addresses 
    ALTER COLUMN country SET NOT NULL;

    -- Update any NULL values to default
    UPDATE addresses 
    SET country = 'United Kingdom' 
    WHERE country IS NULL;
END $$; 