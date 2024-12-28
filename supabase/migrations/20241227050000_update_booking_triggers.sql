-- Drop the old function that's causing issues
DROP FUNCTION IF EXISTS check_booking_overlap(timestamp with time zone, timestamp with time zone, uuid);

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS tr_check_booking_conflict ON bookings;

CREATE TRIGGER tr_check_booking_conflict
    BEFORE INSERT OR UPDATE ON bookings
    FOR EACH ROW
    WHEN (NEW.status IN ('CONFIRMED', 'PENDING'))
    EXECUTE FUNCTION check_booking_conflict(); 