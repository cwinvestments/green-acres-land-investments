-- Clear Test Data Script
-- Keeps only 2 specific customers and the placeholder image
-- Run this in your Supabase SQL Editor

BEGIN;

-- Get the user IDs we want to keep
DO $$
DECLARE
    keep_user_1 INT;
    keep_user_2 INT;
BEGIN
    -- Get the IDs of users we want to keep
    SELECT id INTO keep_user_1 FROM users WHERE email = 'ramason1022@gmail.com';
    SELECT id INTO keep_user_2 FROM users WHERE email = 'an023.petrova@gmail.com';
    
    -- Delete all payments (must be first due to foreign keys)
    DELETE FROM payments;
    RAISE NOTICE 'Deleted all payments';
    
    -- Delete all loan notices
    DELETE FROM loan_notices;
    RAISE NOTICE 'Deleted all loan notices';
    
    -- Delete all contracts
    DELETE FROM contracts;
    RAISE NOTICE 'Deleted all contracts';
    
    -- Delete all loans
    DELETE FROM loans;
    RAISE NOTICE 'Deleted all loans';
    
    -- Delete all property tax payments
    DELETE FROM property_tax_payments;
    RAISE NOTICE 'Deleted all property tax payments';
    
    -- Delete all selling expenses
    DELETE FROM selling_expenses;
    RAISE NOTICE 'Deleted all selling expenses';
    
    -- Delete all property images EXCEPT the placeholder
    DELETE FROM property_images 
    WHERE url NOT LIKE '%IMAGES-COMING-SOON%';
    RAISE NOTICE 'Deleted all property images except placeholder';
    
    -- Delete all properties
    DELETE FROM properties;
    RAISE NOTICE 'Deleted all properties';
    
    -- Delete all users EXCEPT the 2 we want to keep
    DELETE FROM users 
    WHERE id != keep_user_1 
      AND id != keep_user_2;
    RAISE NOTICE 'Deleted all users except the 2 specified';
    
    RAISE NOTICE 'Test data cleared successfully!';
    RAISE NOTICE 'Kept users: ramason1022@gmail.com and an023.petrova@gmail.com';
END $$;

COMMIT;

-- Verify what's left
SELECT 'Users remaining:' as info, COUNT(*) as count FROM users
UNION ALL
SELECT 'Properties remaining:', COUNT(*) FROM properties
UNION ALL
SELECT 'Loans remaining:', COUNT(*) FROM loans
UNION ALL
SELECT 'Payments remaining:', COUNT(*) FROM payments
UNION ALL
SELECT 'Property images remaining:', COUNT(*) FROM property_images;