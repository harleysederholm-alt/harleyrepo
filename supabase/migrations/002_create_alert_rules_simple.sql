-- Create alert_rules table for user notification preferences
CREATE TABLE IF NOT EXISTS alert_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  notification_method TEXT NOT NULL CHECK (notification_method IN ('email', 'in_app', 'both')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_alert_rules_user_id ON alert_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_enabled ON alert_rules(enabled) WHERE enabled = true;

-- Enable RLS
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own alert rules" ON alert_rules;
DROP POLICY IF EXISTS "Users can create own alert rules" ON alert_rules;
DROP POLICY IF EXISTS "Users can update own alert rules" ON alert_rules;
DROP POLICY IF EXISTS "Users can delete own alert rules" ON alert_rules;

-- Create policies
CREATE POLICY "Users can view own alert rules" ON alert_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own alert rules" ON alert_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alert rules" ON alert_rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own alert rules" ON alert_rules FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_alert_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS update_alert_rules_updated_at ON alert_rules;
CREATE TRIGGER update_alert_rules_updated_at
  BEFORE UPDATE ON alert_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_alert_rules_updated_at();
