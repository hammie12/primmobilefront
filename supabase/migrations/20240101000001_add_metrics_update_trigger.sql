-- Function to update professional metrics
CREATE OR REPLACE FUNCTION update_professional_metrics_on_completion()
RETURNS TRIGGER AS $$
DECLARE
    v_professional_id UUID;
    v_date DATE;
BEGIN
    -- Get the professional ID and date from the booking
    SELECT professional_id, DATE(completed_at)
    INTO v_professional_id, v_date
    FROM bookings
    WHERE id = NEW.id;

    -- Update metrics for the professional on the completion date
    INSERT INTO professional_metrics (
        professional_id,
        date,
        total_bookings,
        total_revenue,
        average_rating,
        unique_clients,
        bookings_by_hour,
        revenue_by_service
    )
    SELECT 
        v_professional_id,
        v_date,
        COUNT(DISTINCT b.id),
        COALESCE(SUM(s.price), 0),
        COALESCE(AVG(r.rating), 0),
        COUNT(DISTINCT b.customer_id),
        jsonb_object_agg(
            EXTRACT(HOUR FROM b.start_time)::text,
            COUNT(*)
        ),
        jsonb_object_agg(
            s.category,
            SUM(s.price)
        )
    FROM bookings b
    LEFT JOIN services s ON b.service_id = s.id
    LEFT JOIN reviews r ON b.professional_id = r.professional_id
    WHERE b.professional_id = v_professional_id
    AND DATE(b.completed_at) = v_date
    GROUP BY b.professional_id
    ON CONFLICT (professional_id, date)
    DO UPDATE SET
        total_bookings = EXCLUDED.total_bookings,
        total_revenue = EXCLUDED.total_revenue,
        average_rating = EXCLUDED.average_rating,
        unique_clients = EXCLUDED.unique_clients,
        bookings_by_hour = EXCLUDED.bookings_by_hour,
        revenue_by_service = EXCLUDED.revenue_by_service,
        updated_at = CURRENT_TIMESTAMP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update metrics when a booking is completed
DROP TRIGGER IF EXISTS update_metrics_on_booking_complete ON bookings;
CREATE TRIGGER update_metrics_on_booking_complete
    AFTER UPDATE OF status ON bookings
    FOR EACH ROW
    WHEN (OLD.status != 'COMPLETED' AND NEW.status = 'COMPLETED')
    EXECUTE FUNCTION update_professional_metrics_on_completion();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_professional_metrics_on_completion() TO authenticated; 