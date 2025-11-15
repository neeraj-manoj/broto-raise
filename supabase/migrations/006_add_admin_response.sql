-- Add admin_response column to complaints table
-- This allows admins and super admins to respond to complaints

ALTER TABLE public.complaints
ADD COLUMN IF NOT EXISTS admin_response TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN public.complaints.admin_response IS 'Optional response from admin/super admin to the student';
