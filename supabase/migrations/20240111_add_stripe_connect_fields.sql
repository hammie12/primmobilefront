-- Add Stripe Connect fields to professionals table
ALTER TABLE professionals
ADD COLUMN stripe_connect_id text,
ADD COLUMN stripe_connect_status text DEFAULT 'not_connected',
ADD COLUMN stripe_connect_created_at timestamp with time zone DEFAULT now();

-- Add indexes for better query performance
CREATE INDEX idx_professionals_stripe_connect_id ON professionals(stripe_connect_id);
CREATE INDEX idx_professionals_user_id ON professionals(user_id);

-- Add constraint to ensure status is valid
ALTER TABLE professionals
ADD CONSTRAINT valid_stripe_connect_status 
CHECK (stripe_connect_status IN ('not_connected', 'pending', 'connected')); 