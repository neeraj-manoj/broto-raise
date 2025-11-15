-- Migration to set admin@demo.com as super_admin
-- This establishes the initial super admin account

-- Update the admin@demo.com account to super_admin role
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'admin@demo.com';

-- Verify the update
DO $$
DECLARE
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count
    FROM public.profiles
    WHERE email = 'admin@demo.com' AND role = 'super_admin';

    IF admin_count = 0 THEN
        RAISE NOTICE 'Warning: admin@demo.com not found or not updated to super_admin';
    ELSE
        RAISE NOTICE 'Success: admin@demo.com is now a super_admin';
    END IF;
END $$;
