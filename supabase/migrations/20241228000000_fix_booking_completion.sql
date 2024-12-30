-- Drop existing trigger and function
DROP TRIGGER IF EXISTS check_booking_overlap_trigger ON bookings;
DROP FUNCTION IF EXISTS check_booking_overlap();
DROP FUNCTION IF EXISTS complete_booking(UUID, TEXT);

-- Create the new overlap check function
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

-- Create the new trigger
CREATE TRIGGER check_booking_overlap_trigger
  BEFORE INSERT OR UPDATE OF start_time, end_time ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_overlap();

-- Create the completion function
CREATE OR REPLACE FUNCTION complete_booking(
  p_booking_id UUID,
  p_completion_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  -- Directly update the booking status to COMPLETED
  UPDATE bookings
  SET 
    status = 'COMPLETED',
    completed_at = CURRENT_TIMESTAMP,
    completion_notes = p_completion_notes,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_booking_id
  AND status != 'COMPLETED';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION complete_booking(UUID, TEXT) TO authenticated; 