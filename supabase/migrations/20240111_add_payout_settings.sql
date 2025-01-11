-- Add payout settings fields to professionals table
ALTER TABLE professionals
ADD COLUMN payout_schedule text DEFAULT 'instant',
ADD COLUMN minimum_payout integer DEFAULT 50;

-- Add constraint to ensure valid payout schedule
ALTER TABLE professionals
ADD CONSTRAINT valid_payout_schedule 
CHECK (payout_schedule IN ('instant', 'daily', 'weekly'));

-- Add constraint for minimum payout amount
ALTER TABLE professionals
ADD CONSTRAINT valid_minimum_payout
CHECK (minimum_payout >= 0 AND minimum_payout <= 10000); 