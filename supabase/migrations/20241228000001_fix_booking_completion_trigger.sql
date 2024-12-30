-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS check_booking_overlap_trigger ON bookings;
DROP FUNCTION IF EXISTS check_booking_overlap();
DROP FUNCTION IF EXISTS complete_booking(UUID, TEXT);

-- Create the completion function first (no trigger interference)
CREATE OR REPLACE FUNCTION complete_booking(
  p_booking_id UUID,
  p_completion_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  -- First check if booking exists and isn't completed
  SELECT EXISTS (
    SELECT 1 FROM bookings 
    WHERE id = p_booking_id 
    AND status != 'COMPLETED'
  ) INTO v_exists;

  IF NOT v_exists THEN
    RETURN FALSE;
  END IF;

  -- Use a direct SQL statement to bypass triggers
  EXECUTE 'UPDATE bookings SET status = $1, completed_at = $2, completion_notes = $3, updated_at = $4 WHERE id = $5'
  USING 'COMPLETED'::booking_status, CURRENT_TIMESTAMP, p_completion_notes, CURRENT_TIMESTAMP, p_booking_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the overlap check function for new bookings and time changes
CREATE OR REPLACE FUNCTION check_booking_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check for overlaps on INSERT or when updating time slots
  IF (TG_OP = 'INSERT' OR 
      (TG_OP = 'UPDATE' AND 
       (NEW.start_time IS DISTINCT FROM OLD.start_time OR 
        NEW.end_time IS DISTINCT FROM OLD.end_time))) THEN
    IF EXISTS (
      SELECT 1 FROM bookings
      WHERE professional_id = NEW.professional_id
      AND id <> NEW.id
      AND status NOT IN ('CANCELLED', 'COMPLETED')
      AND (
        (NEW.start_time, NEW.end_time) OVERLAPS (start_time, end_time)
      )
    ) THEN
      RAISE EXCEPTION 'Booking overlaps with an existing appointment';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger only for INSERT and time-related updates
CREATE TRIGGER check_booking_overlap_trigger
  BEFORE INSERT OR UPDATE OF start_time, end_time ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_overlap();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION complete_booking(UUID, TEXT) TO authenticated; 