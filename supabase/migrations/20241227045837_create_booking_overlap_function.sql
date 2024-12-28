-- Drop existing function if it exists
DROP FUNCTION IF EXISTS check_booking_overlap(timestamp with time zone, timestamp with time zone, uuid);

-- Create the function to check for booking overlaps
CREATE OR REPLACE FUNCTION check_booking_overlap(
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_professional_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    conflict_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM bookings
        WHERE 
            professional_id = p_professional_id
            AND status IN ('CONFIRMED', 'PENDING')
            AND (
                (p_start_time, p_end_time) OVERLAPS (start_time, end_time)
                OR
                (start_time <= p_start_time AND end_time > p_start_time)
                OR
                (start_time < p_end_time AND end_time >= p_end_time)
                OR
                (start_time >= p_start_time AND end_time <= p_end_time)
            )
    ) INTO conflict_exists;
    
    RETURN conflict_exists;
END;
$$ LANGUAGE plpgsql;
