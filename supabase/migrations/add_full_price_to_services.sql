-- First add the column without constraints
ALTER TABLE services 
ADD COLUMN full_price DECIMAL(10,2);

-- Update existing rows to set full_price equal to price if it's null
UPDATE services 
SET full_price = price 
WHERE full_price IS NULL;

-- Now make the column NOT NULL with default
ALTER TABLE services 
ALTER COLUMN full_price SET NOT NULL,
ALTER COLUMN full_price SET DEFAULT 0.00;

-- Add check constraint to ensure full_price is not negative
ALTER TABLE services 
ADD CONSTRAINT services_full_price_check CHECK (full_price >= 0);

-- Add check constraint to ensure deposit price (price) is not greater than full price
ALTER TABLE services 
ADD CONSTRAINT services_deposit_price_check CHECK (price <= full_price); 