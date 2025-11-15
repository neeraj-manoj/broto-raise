-- Migration to change attachments column from TEXT[] to JSONB[]
-- This allows storing complete file metadata (name, size, type, url) instead of just URLs

-- Step 1: Add new column with JSONB[] type
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS attachments_new JSONB[];

-- Step 2: Migrate existing data (convert TEXT URLs to JSONB objects)
UPDATE public.complaints
SET attachments_new = (
  SELECT array_agg(
    jsonb_build_object(
      'url', url,
      'name', regexp_replace(url, '^.*/(.+)$', '\1'),
      'size', 0,
      'type', 'application/octet-stream'
    )
  )
  FROM unnest(attachments) AS url
  WHERE attachments IS NOT NULL
)
WHERE attachments IS NOT NULL AND array_length(attachments, 1) > 0;

-- Step 3: Drop old column
ALTER TABLE public.complaints DROP COLUMN IF EXISTS attachments;

-- Step 4: Rename new column to original name
ALTER TABLE public.complaints RENAME COLUMN attachments_new TO attachments;
