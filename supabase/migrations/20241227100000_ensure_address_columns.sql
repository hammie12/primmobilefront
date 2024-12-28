-- Ensure all address columns exist with correct properties
DO $$ 
BEGIN
    -- Add address_line1 column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'addresses' 
        AND column_name = 'address_line1'
    ) THEN
        ALTER TABLE addresses 
        ADD COLUMN address_line1 TEXT NOT NULL DEFAULT '';
    END IF;

    -- Add address_line2 column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'addresses' 
        AND column_name = 'address_line2'
    ) THEN
        ALTER TABLE addresses 
        ADD COLUMN address_line2 TEXT;
    END IF;

    -- Add city column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'addresses' 
        AND column_name = 'city'
    ) THEN
        ALTER TABLE addresses 
        ADD COLUMN city TEXT NOT NULL DEFAULT '';
    END IF;

    -- Add county column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'addresses' 
        AND column_name = 'county'
    ) THEN
        ALTER TABLE addresses 
        ADD COLUMN county TEXT NOT NULL DEFAULT '';
    END IF;

    -- Add postcode column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'addresses' 
        AND column_name = 'postcode'
    ) THEN
        ALTER TABLE addresses 
        ADD COLUMN postcode TEXT NOT NULL DEFAULT '';
    END IF;

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

    -- Add is_default column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'addresses' 
        AND column_name = 'is_default'
    ) THEN
        ALTER TABLE addresses 
        ADD COLUMN is_default BOOLEAN NOT NULL DEFAULT true;
    END IF;

    -- Ensure NOT NULL constraints and default values
    ALTER TABLE addresses 
    ALTER COLUMN address_line1 SET NOT NULL,
    ALTER COLUMN address_line1 SET DEFAULT '',
    ALTER COLUMN city SET NOT NULL,
    ALTER COLUMN city SET DEFAULT '',
    ALTER COLUMN county SET NOT NULL,
    ALTER COLUMN county SET DEFAULT '',
    ALTER COLUMN postcode SET NOT NULL,
    ALTER COLUMN postcode SET DEFAULT '',
    ALTER COLUMN country SET NOT NULL,
    ALTER COLUMN country SET DEFAULT 'United Kingdom',
    ALTER COLUMN is_default SET NOT NULL,
    ALTER COLUMN is_default SET DEFAULT true;

    -- Update any NULL values to defaults
    UPDATE addresses 
    SET 
        address_line1 = COALESCE(address_line1, ''),
        city = COALESCE(city, ''),
        county = COALESCE(county, ''),
        postcode = COALESCE(postcode, ''),
        country = COALESCE(country, 'United Kingdom'),
        is_default = COALESCE(is_default, true);
END $$; 