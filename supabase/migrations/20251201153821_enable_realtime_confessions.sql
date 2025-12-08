/*
  # Enable Realtime for Confessions Table
  
  1. Changes
    - Enable realtime publication on confessions table
    - This allows confessions to appear instantly for all users without page refresh
*/

ALTER PUBLICATION supabase_realtime ADD TABLE confessions;
