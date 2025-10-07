-- Packages table (must be created first as users references it)
CREATE TABLE paket (
  id BIGSERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  harga DOUBLE PRECISION NOT NULL,
  max_kebun INTEGER NOT NULL,
  fitur_ekspor BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default packages
INSERT INTO paket (nama, harga, max_kebun, fitur_ekspor) VALUES
  ('Free', 0, 2, false),
  ('Basic', 100000, 5, true),
  ('Pro', 250000, 20, true);

-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  paket_id BIGINT REFERENCES paket(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Plantations table
CREATE TABLE kebun (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  luas_ha DOUBLE PRECISION NOT NULL,
  jumlah_pohon INTEGER NOT NULL,
  lokasi TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Harvest table
CREATE TABLE panen (
  id BIGSERIAL PRIMARY KEY,
  kebun_id BIGINT NOT NULL REFERENCES kebun(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL,
  berat_kg DOUBLE PRECISION NOT NULL,
  harga_per_kg DOUBLE PRECISION NOT NULL,
  total_pendapatan DOUBLE PRECISION GENERATED ALWAYS AS (berat_kg * harga_per_kg) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fertilizer table
CREATE TABLE pupuk (
  id BIGSERIAL PRIMARY KEY,
  kebun_id BIGINT NOT NULL REFERENCES kebun(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL,
  jenis_pupuk TEXT NOT NULL,
  biaya DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_kebun_user_id ON kebun(user_id);
CREATE INDEX idx_panen_kebun_id ON panen(kebun_id);
CREATE INDEX idx_panen_tanggal ON panen(tanggal);
CREATE INDEX idx_pupuk_kebun_id ON pupuk(kebun_id);
CREATE INDEX idx_pupuk_tanggal ON pupuk(tanggal);
