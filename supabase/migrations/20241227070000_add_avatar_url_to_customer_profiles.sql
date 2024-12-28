-- Add avatar_url column to customer_profiles table
ALTER TABLE customer_profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update RLS policy to allow users to update their own avatar_url
CREATE POLICY "Users can update their own avatar_url"
    ON customer_profiles FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid()); 