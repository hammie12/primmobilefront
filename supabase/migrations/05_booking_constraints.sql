-- Create a function to check for booking conflicts
CREATE OR REPLACE FUNCTION check_booking_conflict()
RETURNS TRIGGER AS $$
DECLARE
    existing_count INTEGER;
BEGIN
    -- Check for any overlapping bookings
    SELECT COUNT(*)
    INTO existing_count
    FROM bookings
    WHERE 
        professional_id = NEW.professional_id
        AND id != NEW.id  -- Exclude current booking for updates
        AND status IN ('CONFIRMED', 'PENDING')
        AND (
            (NEW.start_time, NEW.end_time) OVERLAPS (start_time, end_time)
            OR
            (start_time <= NEW.start_time AND end_time > NEW.start_time)
            OR
            (start_time < NEW.end_time AND end_time >= NEW.end_time)
            OR
            (start_time >= NEW.start_time AND end_time <= NEW.end_time)
        );

    IF existing_count > 0 THEN
        RAISE EXCEPTION 'Booking conflict: The selected time slot is already booked'
            USING 
                ERRCODE = 'P0001',
                DETAIL = format(
                    'Attempted booking: Professional ID: %s, Start: %s, End: %s',
                    NEW.professional_id,
                    NEW.start_time,
                    NEW.end_time
                );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql; 