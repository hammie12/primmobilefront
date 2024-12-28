-- Enable RLS
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "Business owners can view their bookings"
ON bookings FOR SELECT
TO authenticated
USING (
    business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
);

CREATE POLICY "Business owners can create bookings"
ON bookings FOR INSERT
TO authenticated
WITH CHECK (
    business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
);

CREATE POLICY "Business owners can update their bookings"
ON bookings FOR UPDATE
TO authenticated
USING (
    business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
)
WITH CHECK (
    business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
);

CREATE POLICY "Business owners can delete their bookings"
ON bookings FOR DELETE
TO authenticated
USING (
    business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
);

-- Professionals policies
CREATE POLICY "Professionals can read their own profile"
ON professionals FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Professionals can update their own profile"
ON professionals FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Professionals can insert their own profile"
ON professionals FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Professionals can delete their own profile"
ON professionals FOR DELETE
TO authenticated
USING (user_id = auth.uid()); 