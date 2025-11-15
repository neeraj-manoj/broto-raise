-- Create status_history table to track complaint status changes
CREATE TABLE IF NOT EXISTS status_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('new', 'under_review', 'in_progress', 'resolved', 'closed', 'urgent')),
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_status_history_complaint_id ON status_history(complaint_id);
CREATE INDEX IF NOT EXISTS idx_status_history_changed_at ON status_history(changed_at DESC);

-- Add RLS policies
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Status history is viewable by everyone"
  ON status_history FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert status history"
  ON status_history FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- Create function to automatically log status changes
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) OR TG_OP = 'INSERT' THEN
    INSERT INTO status_history (complaint_id, status, changed_by)
    VALUES (
      NEW.id,
      NEW.status,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically log status changes
DROP TRIGGER IF EXISTS trigger_log_status_change ON complaints;
CREATE TRIGGER trigger_log_status_change
  AFTER INSERT OR UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION log_status_change();

-- Backfill existing complaints with initial status
INSERT INTO status_history (complaint_id, status, changed_by, changed_at)
SELECT id, status, created_by, created_at
FROM complaints
ON CONFLICT DO NOTHING;
