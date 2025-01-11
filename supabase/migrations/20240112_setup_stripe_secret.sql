-- Create app settings if they don't exist
CREATE TABLE IF NOT EXISTS app_settings (
    key text PRIMARY KEY,
    value text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Set the Stripe secret key
INSERT INTO app_settings (key, value)
VALUES ('stripe_secret_key', 'sk_test_51Q8TrvRsKcK7rhaugNBPehjVA8xKqBrE1p63KsyQgLjPGvb0gNkraq2ZPB3qZI20GoRPVooq6qT0hWZ4R8WoIOkT00gIgNp8as')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    updated_at = now();

-- Create function to get app setting
CREATE OR REPLACE FUNCTION get_app_setting(setting_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (SELECT value FROM app_settings WHERE key = setting_key);
END;
$$;

-- Allow the function to access Stripe secret
ALTER DATABASE postgres SET "app.settings.stripe_secret_key" FROM CURRENT;
ALTER ROLE postgres SET "app.settings.stripe_secret_key" FROM CURRENT; 