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

-- Add index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_alert_rules_user_id ON alert_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_enabled ON alert_rules(enabled) WHERE enabled = true;

-- Enable Row Level Security
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own alert rules
CREATE POLICY "Users can view own alert rules"
  ON alert_rules
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own alert rules
CREATE POLICY "Users can create own alert rules"
  ON alert_rules
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own alert rules
CREATE POLICY "Users can update own alert rules"
  ON alert_rules
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own alert rules
CREATE POLICY "Users can delete own alert rules"
  ON alert_rules
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_alert_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_alert_rules_updated_at
  BEFORE UPDATE ON alert_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_alert_rules_updated_at();

-- Add comment for documentation
COMMENT ON TABLE alert_rules IS 'User-defined alert rules for procurement notifications';
COMMENT ON COLUMN alert_rules.criteria IS 'JSON object containing: keywords (array), categories (array), min_budget (number), max_budget (number), organizations (array), min_match_score (number)';
COMMENT ON COLUMN alert_rules.notification_method IS 'How to notify: email, in_app, or both';
