/*
  # Add Foreign Key Relationship Between Confessions and Profiles
  
  1. Changes
    - Add foreign key constraint from confessions.user_id to profiles.id
    - This allows joining confessions with profiles to get user names
*/

ALTER TABLE confessions
ADD CONSTRAINT confessions_user_id_fkey_profiles
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
