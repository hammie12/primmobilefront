-- Add date_of_birth column to customer_profiles table
ALTER TABLE customer_profiles
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Update RLS policy to allow users to update their own date_of_birth
CREATE POLICY "Users can update their own date_of_birth"
    ON customer_profiles FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid()); 