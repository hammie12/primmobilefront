-- Create a dedicated function for completing bookings
CREATE OR REPLACE FUNCTION complete_booking_directly(
  p_booking_id UUID,
  p_completion_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  -- Direct update without trigger interference
  UPDATE bookings
  SET 
    status = 'COMPLETED',
    completed_at = CURRENT_TIMESTAMP,
    completion_notes = p_completion_notes,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_booking_id
  AND status != 'COMPLETED';  -- Prevent completing already completed bookings

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION complete_booking_directly TO authenticated;

-- Keep existing trigger for normal booking operations
DROP TRIGGER IF EXISTS check_booking_overlap_trigger ON bookings;

CREATE OR REPLACE FUNCTION check_booking_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for overlaps
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_booking_overlap_trigger
  BEFORE INSERT OR UPDATE OF start_time, end_time ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_overlap();

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated; 