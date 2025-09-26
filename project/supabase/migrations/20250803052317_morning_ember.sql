/*
  # Create Student Enrollments and Dormitory Assignments

  1. New Tables
    - `student_subjects` (enrollment junction table)
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to students)
      - `subject_id` (uuid, foreign key to subjects)
      - `enrollment_date` (date, when enrolled)
      - `grade` (text, letter grade)
      - `status` (text, enrolled/completed/dropped)
      - `created_at` (timestamp)

    - `student_dormitories` (dormitory assignment junction table)
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to students)
      - `dormitory_id` (uuid, foreign key to dormitories)
      - `assignment_date` (date, when assigned)
      - `move_out_date` (date, when moved out)
      - `status` (text, active/moved_out)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add appropriate policies for data access
*/

-- Student-Subject enrollment table
CREATE TABLE IF NOT EXISTS student_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  enrollment_date date DEFAULT CURRENT_DATE,
  grade text CHECK (grade IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', '')),
  status text DEFAULT 'Enrolled' CHECK (status IN ('Enrolled', 'Completed', 'Dropped')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, subject_id)
);

-- Student-Dormitory assignment table
CREATE TABLE IF NOT EXISTS student_dormitories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  dormitory_id uuid NOT NULL REFERENCES dormitories(id) ON DELETE CASCADE,
  assignment_date date DEFAULT CURRENT_DATE,
  move_out_date date,
  status text DEFAULT 'Active' CHECK (status IN ('Active', 'Moved_Out')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE student_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_dormitories ENABLE ROW LEVEL SECURITY;

-- Policies for student_subjects
CREATE POLICY "Students can read own enrollments"
  ON student_subjects
  FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all enrollments"
  ON student_subjects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can manage enrollments"
  ON student_subjects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policies for student_dormitories
CREATE POLICY "Students can read own dormitory assignments"
  ON student_dormitories
  FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all dormitory assignments"
  ON student_dormitories
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can manage dormitory assignments"
  ON student_dormitories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Function to update dormitory occupancy
CREATE OR REPLACE FUNCTION update_dormitory_occupancy()
RETURNS TRIGGER AS $$
BEGIN
  -- Update occupancy count when assignment changes
  IF TG_OP = 'INSERT' AND NEW.status = 'Active' THEN
    UPDATE dormitories 
    SET current_occupancy = current_occupancy + 1,
        status = CASE WHEN current_occupancy + 1 >= capacity THEN 'Full' ELSE 'Available' END
    WHERE id = NEW.dormitory_id;
  END IF;
  
  IF TG_OP = 'UPDATE' THEN
    -- If status changed from Active to Moved_Out
    IF OLD.status = 'Active' AND NEW.status = 'Moved_Out' THEN
      UPDATE dormitories 
      SET current_occupancy = current_occupancy - 1,
          status = CASE WHEN current_occupancy - 1 < capacity THEN 'Available' ELSE status END
      WHERE id = NEW.dormitory_id;
    END IF;
    
    -- If status changed from Moved_Out to Active
    IF OLD.status = 'Moved_Out' AND NEW.status = 'Active' THEN
      UPDATE dormitories 
      SET current_occupancy = current_occupancy + 1,
          status = CASE WHEN current_occupancy + 1 >= capacity THEN 'Full' ELSE 'Available' END
      WHERE id = NEW.dormitory_id;
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' AND OLD.status = 'Active' THEN
    UPDATE dormitories 
    SET current_occupancy = current_occupancy - 1,
        status = CASE WHEN current_occupancy - 1 < capacity THEN 'Available' ELSE status END
    WHERE id = OLD.dormitory_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create triggers for dormitory occupancy
CREATE TRIGGER update_dormitory_occupancy_trigger
  AFTER INSERT OR UPDATE OR DELETE ON student_dormitories
  FOR EACH ROW
  EXECUTE FUNCTION update_dormitory_occupancy();