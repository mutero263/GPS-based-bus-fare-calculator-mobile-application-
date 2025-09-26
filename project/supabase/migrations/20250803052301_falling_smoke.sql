/*
  # Create Subjects Table

  1. New Tables
    - `subjects`
      - `id` (uuid, primary key)
      - `subject_code` (text, unique subject code)
      - `name` (text, subject name)
      - `description` (text, subject description)
      - `credits` (integer, credit hours)
      - `department` (text, department name)
      - `instructor` (text, instructor name)
      - `capacity` (integer, maximum students)
      - `semester` (text, semester/term)
      - `status` (text, active/inactive)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `subjects` table
    - Add policies for viewing and managing subjects
*/

CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  credits integer DEFAULT 3 CHECK (credits > 0),
  department text NOT NULL,
  instructor text,
  capacity integer DEFAULT 30 CHECK (capacity > 0),
  semester text DEFAULT 'Fall 2025',
  status text DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read subjects
CREATE POLICY "Authenticated users can read subjects"
  ON subjects
  FOR SELECT
  TO authenticated
  USING (true);

-- Admins can insert subjects
CREATE POLICY "Admins can insert subjects"
  ON subjects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Admins can update subjects
CREATE POLICY "Admins can update subjects"
  ON subjects
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Admins can delete subjects
CREATE POLICY "Admins can delete subjects"
  ON subjects
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create trigger for subjects table
CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();