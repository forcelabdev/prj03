-- Kripto cüzdanlar tablosu
CREATE TABLE IF NOT EXISTS crypto_wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  network VARCHAR(20) NOT NULL, -- 'btc', 'eth', 'trx', 'usdt-trc20', 'usdt-erc20'
  address TEXT NOT NULL UNIQUE,
  label TEXT, -- opsiyonel not (örn: "Cüzdan 1")
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cüzdan atamaları tablosu
CREATE TABLE IF NOT EXISTS crypto_wallet_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID NOT NULL REFERENCES crypto_wallets(id),
  username TEXT NOT NULL,
  network VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'expired', 'cancelled'
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '15 minutes',
  confirmed_at TIMESTAMPTZ,
  amount_try NUMERIC(12,2),
  amount_crypto NUMERIC(18,8)
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_assignments_wallet_id ON crypto_wallet_assignments(wallet_id);
CREATE INDEX IF NOT EXISTS idx_assignments_username ON crypto_wallet_assignments(username);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON crypto_wallet_assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_expires_at ON crypto_wallet_assignments(expires_at);
CREATE INDEX IF NOT EXISTS idx_wallets_network ON crypto_wallets(network);

-- Süresi dolan atamaları otomatik expire eden fonksiyon
CREATE OR REPLACE FUNCTION expire_old_assignments()
RETURNS void AS $$
BEGIN
  UPDATE crypto_wallet_assignments
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
