/*
  # Create Confessions Table for Social Mode

  1. New Tables
    - `confessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `content` (text, the confession message)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `confessions` table
    - Add policy for authenticated users to create confessions
    - Add policy for all authenticated users to read all confessions
    - Add policy for authors to update/delete their own confessions
*/

CREATE TABLE IF NOT EXISTS confessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE confessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read confessions"
  ON confessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create confessions"
  ON confessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own confessions"
  ON confessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own confessions"
  ON confessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
