-- Enable HTTP extension if not already enabled
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Create the function to handle Stripe Connect account creation
CREATE OR REPLACE FUNCTION create_connect_account(user_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    stripe_account json;
    account_link json;
    profile_record RECORD;
    stripe_secret text := current_setting('app.settings.stripe_secret_key', true);
    stripe_base_url text := 'https://api.stripe.com/v1';
    headers json := json_build_object(
        'Authorization', concat('Bearer ', stripe_secret),
        'Content-Type', 'application/x-www-form-urlencoded'
    );
BEGIN
    -- Get professional profile
    SELECT * INTO profile_record
    FROM professionals
    WHERE user_id = create_connect_account.user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Professional profile not found';
    END IF;

    -- Create Stripe Connect account
    SELECT content::json INTO stripe_account
    FROM http((
        'POST',
        stripe_base_url || '/accounts',
        headers,
        'application/x-www-form-urlencoded',
        'type=express&country=GB&capabilities[card_payments][requested]=true&capabilities[transfers][requested]=true&business_type=individual&business_profile[name]=' || profile_record.business_name || '&business_profile[mcc]=7230'
    )::http_request);

    -- Update professional profile with Stripe account ID
    UPDATE professionals
    SET 
        stripe_connect_id = stripe_account->>'id',
        stripe_connect_status = 'pending'
    WHERE user_id = create_connect_account.user_id;

    -- Create account link for onboarding
    SELECT content::json INTO account_link
    FROM http((
        'POST',
        stripe_base_url || '/account_links',
        headers,
        'application/x-www-form-urlencoded',
        'account=' || (stripe_account->>'id') || '&refresh_url=https://hbxohxltckwzugtxsnxs.supabase.co/settings/payment-methods?refresh=true&return_url=https://hbxohxltckwzugtxsnxs.supabase.co/settings/payment-methods?success=true&type=account_onboarding'
    )::http_request);

    RETURN json_build_object(
        'url', account_link->>'url'
    );
END;
$$; 