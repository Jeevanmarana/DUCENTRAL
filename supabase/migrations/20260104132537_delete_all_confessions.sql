/*
  # Delete All Confessions for Fresh Start
  
  1. Changes
    - Delete all records from confessions table
    - Comments will be automatically deleted due to ON DELETE CASCADE constraint
    - This provides a clean slate for the platform
*/

-- Truncate confessions table (comments will cascade delete automatically due to foreign key constraint)
TRUNCATE TABLE confessions CASCADE;

