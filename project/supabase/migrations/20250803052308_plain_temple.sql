/*
  # Create Dormitories Table

  1. New Tables
    - `dormitories`
      - `id` (uuid, primary key)
      - `name` (text, dormitory name)
      - `building` (text, building name/number)
      - `floor` (integer, floor number)
      - `room_number` (text, room number)
      - `capacity` (integer, maximum occupants)
      - `current_occupancy` (integer, current number of students)
      - `gender_restriction` (text, Male/Female/Mixed)
      - `amenities` (text[], list of amenities)
      - `status` (text, available/maintenance/full)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `dormitories` table
    - Add policies for viewing and managing dormitories
*/

CREATE TABLE IF NOT EXISTS dormitories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  building text NOT NULL,
  floor integer NOT NULL CHECK (floor > 0),
  room_number text NOT NULL,
  capacity integer NOT NULL CHECK (capacity > 0),
  current_occupancy integer DEFAULT 0 CHECK (current_occupancy >= 0),
  gender_restriction text DEFAULT 'Mixed' CHECK (gender_restriction IN ('Male', 'Female', 'Mixed')),
  amenities text[] DEFAULT ARRAY[]::text[],
  status text DEFAULT 'Available' CHECK (status IN ('Available', 'Maintenance', 'Full')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(building, room_number),
  CHECK (current_occupancy <= capacity)
);

ALTER TABLE dormitories ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read dormitories
CREATE POLICY "Authenticated users can read dormitories"
  ON dormitories
  FOR SELECT
  TO authenticated
  USING (true);

-- Admins can insert dormitories
CREATE POLICY "Admins can insert dormitories"
  ON dormitories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Admins can update dormitories
CREATE POLICY "Admins can update dormitories"
  ON dormitories
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Admins can delete dormitories
CREATE POLICY "Admins can delete dormitories"
  ON dormitories
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create trigger for dormitories table
CREATE TRIGGER update_dormitories_updated_at
  BEFORE UPDATE ON dormitories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();