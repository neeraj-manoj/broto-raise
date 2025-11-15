-- Fix double-encoded attachments data
-- This migration cleans up attachments where the entire object was stringified into the url field

-- First, let's see if we have any malformed data and fix it
UPDATE public.complaints
SET attachments = (
  SELECT array_agg(
    CASE
      -- If url field contains a JSON string, parse it
      WHEN (elem->>'url')::text LIKE '{%' THEN
        (elem->>'url')::jsonb
      -- Otherwise keep as-is
      ELSE
        elem
    END
  )
  FROM unnest(attachments) AS elem
)
WHERE attachments IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM unnest(attachments) AS elem
    WHERE (elem->>'url')::text LIKE '{%'
  );
