-- Create complaint_upvotes table
CREATE TABLE IF NOT EXISTS complaint_upvotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(complaint_id, user_id)
);

-- Enable RLS
ALTER TABLE complaint_upvotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Everyone can view upvotes (to see counts)
CREATE POLICY "Upvotes are viewable by everyone"
ON complaint_upvotes FOR SELECT
USING (true);

-- Authenticated users can insert their own upvotes
CREATE POLICY "Users can add their own upvotes"
ON complaint_upvotes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Authenticated users can delete their own upvotes
CREATE POLICY "Users can remove their own upvotes"
ON complaint_upvotes FOR DELETE
USING (auth.uid() = user_id);

-- Add upvotes_count to complaints table for easier sorting/querying (optional but recommended for performance)
-- Alternatively, we can count on the fly. For now, let's stick to counting on the fly or using a view if needed,
-- but adding a column and a trigger is often better for "Most Upvoted" sorting.
-- Let's add a column and a trigger to keep it in sync.

ALTER TABLE complaints ADD COLUMN IF NOT EXISTS upvotes_count INTEGER DEFAULT 0;

-- Function to update upvotes_count
CREATE OR REPLACE FUNCTION update_complaint_upvotes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE complaints
        SET upvotes_count = upvotes_count + 1
        WHERE id = NEW.complaint_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE complaints
        SET upvotes_count = upvotes_count - 1
        WHERE id = OLD.complaint_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_vote_change ON complaint_upvotes;
CREATE TRIGGER on_vote_change
AFTER INSERT OR DELETE ON complaint_upvotes
FOR EACH ROW EXECUTE FUNCTION update_complaint_upvotes_count();
