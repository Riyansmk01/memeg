-- Add SUPER_ADMIN role
ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'super_admin'));

-- Subscriptions table to track user subscription history
CREATE TABLE subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  paket_id BIGINT NOT NULL REFERENCES paket(id),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments table to track all payment transactions
CREATE TABLE payments (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  paket_id BIGINT NOT NULL REFERENCES paket(id),
  amount DOUBLE PRECISION NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mandiri', 'bri', 'qris')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'rejected')),
  payment_proof_url TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  verified_by TEXT REFERENCES users(id)
);

-- Payment methods configuration table
CREATE TABLE payment_methods (
  id BIGSERIAL PRIMARY KEY,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  qr_code_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert payment methods
INSERT INTO payment_methods (bank_name, account_number, account_holder, is_active) VALUES
  ('Bank Mandiri', '1080028325505', 'Pemilik eSawit', true),
  ('Bank BRI', '109901070159500', 'Pemilik eSawit', true),
  ('QRIS', 'QRIS', 'eSawit Platform', true);

-- Add session and security tracking
CREATE TABLE user_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add rate limiting table
CREATE TABLE rate_limits (
  id BIGSERIAL PRIMARY KEY,
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(identifier, endpoint, window_start)
);

-- Indexes for performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_active ON subscriptions(user_id, is_active);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_rate_limits_lookup ON rate_limits(identifier, endpoint, window_start);
