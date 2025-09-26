import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit, Trash2, Users, Search, BookOpen } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import { Card, CardHeader, CardContent } from '../components/ui/Card';

interface Subject {
  id: string;
  subject_code: string;
  name: string;
  description?: string;
  credits: number;
  department: string;
  instructor?: string;
  capacity: number;
  semester: string;
  status: string;
}

const Subjects: React.FC = () => {
  const { isAdmin } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    subject_code: '',
    name: '',
    description: '',
    credits: 3,
    department: '',
    instructor: '',
    capacity: 30,
    semester: 'Fall 2025',
    status: 'Active'
  });

  useEffect(() => {
    fetchSubjects();
    if (isAdmin) {
      fetchStudents();
    }
  }, [isAdmin]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('subject_code');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('status', 'Active')
        .order('first_name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchEnrollments = async (subjectId: string) => {
    try {
      const { data, error } = await supabase
        .from('student_subjects')
        .select(`
          *,
          students(first_name, last_name, student_id)
        `)
        .eq('subject_id', subjectId);

      if (error) throw error;
      setEnrollments(data || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSubject) {
        const { error } = await supabase
          .from('subjects')
          .update(formData)
          .eq('id', editingSubject.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('subjects')
          .insert([formData]);
        
        if (error) throw error;
      }

      await fetchSubjects();
      resetForm();
    } catch (error) {
      console.error('Error saving subject:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  const handleEnroll = async (studentId: string) => {
    if (!selectedSubject) return;

    try {
      const { error } = await supabase
        .from('student_subjects')
        .insert([{
          student_id: studentId,
          subject_id: selectedSubject.id
        }]);

      if (error) throw error;
      await fetchEnrollments(selectedSubject.id);
    } catch (error) {
      console.error('Error enrolling student:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      subject_code: '',
      name: '',
      description: '',
      credits: 3,
      department: '',
      instructor: '',
      capacity: 30,
      semester: 'Fall 2025',
      status: 'Active'
    });
    setEditingSubject(null);
    setModalOpen(false);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      subject_code: subject.subject_code,
      name: subject.name,
      description: subject.description || '',
      credits: subject.credits,
      department: subject.department,
      instructor: subject.instructor || '',
      capacity: subject.capacity,
      semester: subject.semester,
      status: subject.status
    });
    setModalOpen(true);
  };

  const openEnrollModal = async (subject: Subject) => {
    setSelectedSubject(subject);
    await fetchEnrollments(subject.id);
    setEnrollModalOpen(true);
  };

  const departments = [...new Set(subjects.map(s => s.department))];
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = `${subject.name} ${subject.subject_code} ${subject.department} ${subject.instructor}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'All' || subject.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-600">Manage course offerings and enrollments</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              label="Department"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Departments' },
                ...departments.map(dept => ({ value: dept, label: dept }))
              ]}
            />
            <div className="flex items-end">
              <Button variant="outline" onClick={fetchSubjects} className="w-full">
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjects Table */}
      <Card>
        <Table headers={['Code', 'Name', 'Department', 'Credits', 'Instructor', 'Capacity', 'Status', 'Actions']}>
          {filteredSubjects.map((subject) => (
            <TableRow key={subject.id}>
              <TableCell className="font-mono text-sm font-medium">{subject.subject_code}</TableCell>
              <TableCell className="font-medium">{subject.name}</TableCell>
              <TableCell>{subject.department}</TableCell>
              <TableCell>{subject.credits}</TableCell>
              <TableCell>{subject.instructor || 'TBA'}</TableCell>
              <TableCell>{subject.capacity}</TableCell>
              <TableCell>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  subject.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {subject.status}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => openEnrollModal(subject)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Manage enrollments"
                      >
                        <Users className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(subject)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit subject"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(subject.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete subject"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
        
        {filteredSubjects.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">No subjects found</p>
            <p className="text-gray-600">Start by adding course offerings</p>
          </div>
        )}
      </Card>

      {/* Add/Edit Subject Modal */}
      {isAdmin && (
        <Modal
          isOpen={modalOpen}
          onClose={resetForm}
          title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Subject Code"
                value={formData.subject_code}
                onChange={(e) => setFormData({ ...formData, subject_code: e.target.value })}
                required
                placeholder="e.g., CS101"
              />
              <Input
                label="Credits"
                type="number"
                min="1"
                max="6"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                required
              />
            </div>

            <Input
              label="Subject Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the subject"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
                placeholder="e.g., Computer Science"
              />
              <Input
                label="Instructor"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                placeholder="Instructor name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                required
              />
              <Input
                label="Semester"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                required
                placeholder="e.g., Fall 2025"
              />
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' }
                ]}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" type="button" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">
                {editingSubject ? 'Update Subject' : 'Add Subject'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Enrollment Management Modal */}
      {isAdmin && (
        <Modal
          isOpen={enrollModalOpen}
          onClose={() => setEnrollModalOpen(false)}
          title={`Manage Enrollments - ${selectedSubject?.name}`}
          size="xl"
        >
          <div className="space-y-6">
            {/* Current Enrollments */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Current Enrollments ({enrollments.length})</h4>
              {enrollments.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">
                          {enrollment.students.first_name} {enrollment.students.last_name}
                        </p>
                        <p className="text-sm text-gray-600">ID: {enrollment.students.student_id}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          enrollment.status === 'Enrolled' ? 'bg-green-100 text-green-800' :
                          enrollment.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {enrollment.status}
                        </span>
                        {enrollment.grade && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                            Grade: {enrollment.grade}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No students enrolled yet</p>
              )}
            </div>

            {/* Available Students */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Available Students</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {students
                  .filter(student => !enrollments.some(e => e.student_id === student.id))
                  .map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium">{student.first_name} {student.last_name}</p>
                        <p className="text-sm text-gray-600">ID: {student.student_id}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleEnroll(student.id)}
                      >
                        Enroll
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Subjects;