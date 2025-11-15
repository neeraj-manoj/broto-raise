-- Migration: Allow super admins to update any profile
-- This enables super admins to change admin locations and other profile details

-- Add policy for super admins to update any profile
CREATE POLICY "Super admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
