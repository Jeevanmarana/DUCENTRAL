/*
  # Create Comments Table for Confessions

  1. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `confession_id` (uuid, foreign key to confessions)
      - `user_id` (uuid, foreign key to auth.users)
      - `content` (text, the comment message)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `comments` table
    - Add policy for authenticated users to create comments
    - Add policy for all authenticated users to read all comments
    - Add policy for authors to delete their own comments
*/

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id uuid NOT NULL REFERENCES confessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
