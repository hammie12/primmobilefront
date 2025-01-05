-- Add new columns for hours and minutes
ALTER TABLE services 
ADD COLUMN duration_hours INTEGER NOT NULL DEFAULT 0,
ADD COLUMN duration_minutes INTEGER NOT NULL DEFAULT 0;

-- Add check constraints to ensure valid time values
ALTER TABLE services 
ADD CONSTRAINT services_duration_hours_check CHECK (duration_hours >= 0 AND duration_hours <= 23),
ADD CONSTRAINT services_duration_minutes_check CHECK (duration_minutes >= 0 AND duration_minutes < 60);

-- Update existing records: Convert duration (total minutes) to hours and minutes
UPDATE services 
SET 
    duration_hours = duration / 60,
    duration_minutes = duration % 60
WHERE duration IS NOT NULL;

-- Optionally, you can rename the old duration column if you want to keep it for reference
ALTER TABLE services 
RENAME COLUMN duration TO duration_total_minutes;

-- Add a check constraint to ensure consistency between total minutes and hours/minutes
ALTER TABLE services 
ADD CONSTRAINT services_duration_consistency_check 
CHECK (duration_total_minutes = (duration_hours * 60) + duration_minutes); 