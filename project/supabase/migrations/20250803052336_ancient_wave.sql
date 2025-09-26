/*
  # Insert Sample Data

  1. Sample Data
    - Sample subjects for different departments
    - Sample dormitories with various configurations
    - Initial admin user setup instructions

  Note: This migration creates sample data for testing and demonstration purposes.
*/

-- Insert sample subjects
INSERT INTO subjects (subject_code, name, description, credits, department, instructor, capacity, semester) VALUES
('CS101', 'Introduction to Computer Science', 'Basic programming concepts and problem-solving techniques', 3, 'Computer Science', 'Dr. Sarah Johnson', 30, 'Fall 2025'),
('MATH201', 'Calculus II', 'Differential and integral calculus with applications', 4, 'Mathematics', 'Prof. Michael Chen', 25, 'Fall 2025'),
('ENG102', 'English Composition II', 'Advanced writing and research skills', 3, 'English', 'Dr. Emily Rodriguez', 20, 'Fall 2025'),
('PHY301', 'Physics I', 'Mechanics and thermodynamics', 4, 'Physics', 'Dr. James Wilson', 28, 'Fall 2025'),
('HIST150', 'World History', 'Survey of world civilizations', 3, 'History', 'Prof. Lisa Thompson', 35, 'Fall 2025'),
('BIO201', 'General Biology', 'Cell biology and genetics', 4, 'Biology', 'Dr. Robert Davis', 25, 'Fall 2025'),
('CHEM101', 'General Chemistry', 'Basic principles of chemistry', 4, 'Chemistry', 'Dr. Amanda Miller', 30, 'Fall 2025'),
('ART101', 'Introduction to Art', 'Art history and basic techniques', 3, 'Fine Arts', 'Prof. David Kim', 15, 'Fall 2025');

-- Insert sample dormitories
INSERT INTO dormitories (name, building, floor, room_number, capacity, gender_restriction, amenities) VALUES
('North Hall A', 'North Hall', 1, '101', 2, 'Mixed', ARRAY['WiFi', 'AC', 'Study Desk', 'Closet']),
('North Hall B', 'North Hall', 1, '102', 2, 'Female', ARRAY['WiFi', 'AC', 'Study Desk', 'Closet', 'Private Bathroom']),
('North Hall C', 'North Hall', 2, '201', 4, 'Male', ARRAY['WiFi', 'AC', 'Study Desk', 'Closet', 'Common Area']),
('South Tower 1', 'South Tower', 3, '301', 1, 'Mixed', ARRAY['WiFi', 'AC', 'Study Desk', 'Closet', 'Private Bathroom', 'Kitchenette']),
('South Tower 2', 'South Tower', 3, '302', 1, 'Mixed', ARRAY['WiFi', 'AC', 'Study Desk', 'Closet', 'Private Bathroom', 'Kitchenette']),
('East Wing A', 'East Wing', 2, '205', 3, 'Female', ARRAY['WiFi', 'AC', 'Study Desk', 'Closet', 'Shared Bathroom']),
('East Wing B', 'East Wing', 2, '206', 3, 'Male', ARRAY['WiFi', 'AC', 'Study Desk', 'Closet', 'Shared Bathroom']),
('West Complex 1', 'West Complex', 1, '110', 2, 'Mixed', ARRAY['WiFi', 'AC', 'Study Desk', 'Closet', 'Balcony']);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects(subject_code);
CREATE INDEX IF NOT EXISTS idx_subjects_department ON subjects(department);
CREATE INDEX IF NOT EXISTS idx_student_subjects_student_id ON student_subjects(student_id);
CREATE INDEX IF NOT EXISTS idx_student_subjects_subject_id ON student_subjects(subject_id);
CREATE INDEX IF NOT EXISTS idx_student_dormitories_student_id ON student_dormitories(student_id);
CREATE INDEX IF NOT EXISTS idx_student_dormitories_dormitory_id ON student_dormitories(dormitory_id);