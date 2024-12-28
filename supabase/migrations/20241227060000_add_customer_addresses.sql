-- Create addresses table for customer profiles
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_profile_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE UNIQUE,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'United Kingdom',
    is_default BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies for addresses
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own addresses"
    ON addresses FOR SELECT
    USING (
        customer_profile_id IN (
            SELECT id FROM customer_profiles
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own addresses"
    ON addresses FOR INSERT
    WITH CHECK (
        customer_profile_id IN (
            SELECT id FROM customer_profiles
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own addresses"
    ON addresses FOR UPDATE
    USING (
        customer_profile_id IN (
            SELECT id FROM customer_profiles
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        customer_profile_id IN (
            SELECT id FROM customer_profiles
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own addresses"
    ON addresses FOR DELETE
    USING (
        customer_profile_id IN (
            SELECT id FROM customer_profiles
            WHERE user_id = auth.uid()
        )
    );

-- Create function to handle default address logic
CREATE OR REPLACE FUNCTION handle_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default THEN
        -- Set is_default to false for all other addresses of the same customer
        UPDATE addresses
        SET is_default = false
        WHERE customer_profile_id = NEW.customer_profile_id
        AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for default address handling
DROP TRIGGER IF EXISTS set_default_address ON addresses;
CREATE TRIGGER set_default_address
    BEFORE INSERT OR UPDATE ON addresses
    FOR EACH ROW
    EXECUTE FUNCTION handle_default_address();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'update_addresses_updated_at'
    ) THEN
        CREATE TRIGGER update_addresses_updated_at
            BEFORE UPDATE ON addresses
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$; 