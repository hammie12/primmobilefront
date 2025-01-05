-- Drop any existing validate_booking_times function
DROP FUNCTION IF EXISTS validate_booking_times() CASCADE;

-- Create a modified version that allows past bookings for testing
CREATE OR REPLACE FUNCTION validate_booking_times()
RETURNS TRIGGER AS $$
BEGIN
    -- Skip validation for past bookings
    IF NEW.start_time <= NOW() THEN
        RETURN NEW;
    END IF;
    
    -- Only validate future bookings
    IF NEW.end_time <= NEW.start_time THEN
        RAISE EXCEPTION 'Invalid booking: End time must be after start time';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER validate_booking_times_trigger
    BEFORE INSERT OR UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION validate_booking_times();

-- Create function to insert test data
CREATE OR REPLACE FUNCTION insert_past_test_bookings()
RETURNS void AS $$
DECLARE
    customer_id_val uuid;
    professional_id_val uuid;
    service_id_val uuid;
BEGIN
    -- Get IDs we need
    SELECT id INTO customer_id_val FROM customer_profiles LIMIT 1;
    SELECT id INTO professional_id_val FROM professional_profiles LIMIT 1;
    SELECT id INTO service_id_val FROM services LIMIT 1;

    -- Insert recent past bookings (last 2 weeks)
    WITH new_bookings AS (
        SELECT 
            gen_random_uuid() as id,
            NOW() - interval '1 day' * s.index as start_time,
            NOW() - interval '1 day' * s.index + interval '1 hour' as end_time,
            CASE 
                WHEN s.index % 3 = 0 THEN 'CANCELLED'::booking_status
                ELSE 'COMPLETED'::booking_status
            END as status
        FROM (SELECT generate_series(1, 14) as index) s
    )
    INSERT INTO bookings (
        id, 
        customer_id, 
        professional_id, 
        service_id, 
        start_time, 
        end_time, 
        status, 
        notes,
        created_at
    )
    SELECT 
        id,
        customer_id_val,
        professional_id_val,
        service_id_val,
        start_time,
        end_time,
        status,
        CASE 
            WHEN status = 'COMPLETED' THEN 'Completed service appointment'
            ELSE 'Cancelled by customer'
        END,
        start_time
    FROM new_bookings;

    -- Insert older completed bookings (last 3 months, different times of day)
    WITH old_bookings AS (
        SELECT 
            gen_random_uuid() as id,
            NOW() - interval '1 day' * s.index as start_time,
            NOW() - interval '1 day' * s.index + interval '1 hour' as end_time,
            (s.index % 12) as hour_offset -- This will vary the time of day
        FROM (SELECT generate_series(15, 90) as index) s
        WHERE s.index % 3 = 0  -- Only insert every third day to spread them out
    )
    INSERT INTO bookings (
        id, 
        customer_id, 
        professional_id, 
        service_id, 
        start_time, 
        end_time, 
        status, 
        notes,
        created_at
    )
    SELECT 
        id,
        customer_id_val,
        professional_id_val,
        service_id_val,
        start_time + interval '1 hour' * hour_offset, -- Vary the time of day
        start_time + interval '1 hour' * hour_offset + interval '1 hour',
        'COMPLETED'::booking_status,
        'Completed service appointment',
        start_time
    FROM old_bookings;

    -- Insert very old completed bookings (3-6 months ago)
    WITH very_old_bookings AS (
        SELECT 
            gen_random_uuid() as id,
            NOW() - interval '1 month' * s.index as start_time,
            NOW() - interval '1 month' * s.index + interval '1 hour' as end_time,
            (s.index % 8 + 9) as hour_offset -- Different time of day (9am-5pm)
        FROM (SELECT generate_series(3, 6) as index) s
    )
    INSERT INTO bookings (
        id, 
        customer_id, 
        professional_id, 
        service_id, 
        start_time, 
        end_time, 
        status, 
        notes,
        created_at
    )
    SELECT 
        id,
        customer_id_val,
        professional_id_val,
        service_id_val,
        start_time + interval '1 hour' * hour_offset,
        start_time + interval '1 hour' * hour_offset + interval '1 hour',
        'COMPLETED'::booking_status,
        'Completed service appointment',
        start_time
    FROM very_old_bookings;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute our insert function
SELECT insert_past_test_bookings();

-- Drop the function after we're done
DROP FUNCTION insert_past_test_bookings();

-- Verify the insertions
SELECT 
    id,
    status,
    start_time,
    end_time
FROM bookings
WHERE start_time < NOW()
ORDER BY start_time DESC; 