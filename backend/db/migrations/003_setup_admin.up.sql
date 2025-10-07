-- Setup super admin user
-- Note: This will be created when a specific user logs in through Clerk
-- The auth handler will check if the email matches the super admin email

-- Add a table to store super admin configuration
CREATE TABLE super_admin_config (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert your email as super admin (change this to your actual email)
-- When this user logs in via Clerk, they will automatically get super_admin role
INSERT INTO super_admin_config (email) VALUES ('admin@esawit.com');
