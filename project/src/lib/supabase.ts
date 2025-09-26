import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          student_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          gender: 'Male' | 'Female' | 'Other' | null;
          date_of_birth: string | null;
          address: string | null;
          enrollment_date: string;
          status: 'Active' | 'Inactive' | 'Graduated';
          user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          gender?: 'Male' | 'Female' | 'Other' | null;
          date_of_birth?: string | null;
          address?: string | null;
          enrollment_date?: string;
          status?: 'Active' | 'Inactive' | 'Graduated';
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          gender?: 'Male' | 'Female' | 'Other' | null;
          date_of_birth?: string | null;
          address?: string | null;
          enrollment_date?: string;
          status?: 'Active' | 'Inactive' | 'Graduated';
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          subject_code: string;
          name: string;
          description: string | null;
          credits: number;
          department: string;
          instructor: string | null;
          capacity: number;
          semester: string;
          status: 'Active' | 'Inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subject_code: string;
          name: string;
          description?: string | null;
          credits?: number;
          department: string;
          instructor?: string | null;
          capacity?: number;
          semester?: string;
          status?: 'Active' | 'Inactive';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          subject_code?: string;
          name?: string;
          description?: string | null;
          credits?: number;
          department?: string;
          instructor?: string | null;
          capacity?: number;
          semester?: string;
          status?: 'Active' | 'Inactive';
          created_at?: string;
          updated_at?: string;
        };
      };
      dormitories: {
        Row: {
          id: string;
          name: string;
          building: string;
          floor: number;
          room_number: string;
          capacity: number;
          current_occupancy: number;
          gender_restriction: 'Male' | 'Female' | 'Mixed';
          amenities: string[];
          status: 'Available' | 'Maintenance' | 'Full';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          building: string;
          floor: number;
          room_number: string;
          capacity: number;
          current_occupancy?: number;
          gender_restriction?: 'Male' | 'Female' | 'Mixed';
          amenities?: string[];
          status?: 'Available' | 'Maintenance' | 'Full';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          building?: string;
          floor?: number;
          room_number?: string;
          capacity?: number;
          current_occupancy?: number;
          gender_restriction?: 'Male' | 'Female' | 'Mixed';
          amenities?: string[];
          status?: 'Available' | 'Maintenance' | 'Full';
          created_at?: string;
          updated_at?: string;
        };
      };
      student_subjects: {
        Row: {
          id: string;
          student_id: string;
          subject_id: string;
          enrollment_date: string;
          grade: string | null;
          status: 'Enrolled' | 'Completed' | 'Dropped';
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          subject_id: string;
          enrollment_date?: string;
          grade?: string | null;
          status?: 'Enrolled' | 'Completed' | 'Dropped';
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          subject_id?: string;
          enrollment_date?: string;
          grade?: string | null;
          status?: 'Enrolled' | 'Completed' | 'Dropped';
          created_at?: string;
        };
      };
      student_dormitories: {
        Row: {
          id: string;
          student_id: string;
          dormitory_id: string;
          assignment_date: string;
          move_out_date: string | null;
          status: 'Active' | 'Moved_Out';
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          dormitory_id: string;
          assignment_date?: string;
          move_out_date?: string | null;
          status?: 'Active' | 'Moved_Out';
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          dormitory_id?: string;
          assignment_date?: string;
          move_out_date?: string | null;
          status?: 'Active' | 'Moved_Out';
          created_at?: string;
        };
      };
    };
  };
};