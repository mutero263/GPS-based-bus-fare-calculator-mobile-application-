import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit, Trash2, Users, Search, Building } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import { Card, CardHeader, CardContent } from '../components/ui/Card';

interface Dormitory {
  id: string;
  name: string;
  building: string;
  floor: number;
  room_number: string;
  capacity: number;
  current_occupancy: number;
  gender_restriction: string;
  amenities: string[];
  status: string;
}

const Dormitories: React.FC = () => {
  const { isAdmin } = useAuth();
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editingDormitory, setEditingDormitory] = useState<Dormitory | null>(null);
  const [selectedDormitory, setSelectedDormitory] = useState<Dormitory | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    building: '',
    floor: 1,
    room_number: '',
    capacity: 2,
    gender_restriction: 'Mixed',
    amenities: [] as string[],
    status: 'Available'
  });

  const availableAmenities = [
    'WiFi', 'AC', 'Study Desk', 'Closet', 'Private Bathroom', 
    'Shared Bathroom', 'Kitchenette', 'Common Area', 'Balcony', 'Laundry'
  ];

  useEffect(() => {
    fetchDormitories();
    if (isAdmin) {
      fetchStudents();
    }
  }, [isAdmin]);

  const fetchDormitories = async () => {
    try {
      const { data, error } = await supabase
        .from('dormitories')
        .select('*')
        .order('building, floor, room_number');

      if (error) throw error;
      setDormitories(data || []);
    } catch (error) {
      console.error('Error fetching dormitories:', error);
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

  const fetchAssignments = async (dormitoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('student_dormitories')
        .select(`
          *,
          students(first_name, last_name, student_id, gender)
        `)
        .eq('dormitory_id', dormitoryId)
        .eq('status', 'Active');

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingDormitory) {
        const { error } = await supabase
          .from('dormitories')
          .update(formData)
          .eq('id', editingDormitory.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('dormitories')
          .insert([formData]);
        
        if (error) throw error;
      }

      await fetchDormitories();
      resetForm();
    } catch (error) {
      console.error('Error saving dormitory:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dormitory?')) return;

    try {
      const { error } = await supabase
        .from('dormitories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchDormitories();
    } catch (error) {
      console.error('Error deleting dormitory:', error);
    }
  };

  const handleAssign = async (studentId: string) => {
    if (!selectedDormitory) return;

    try {
      const { error } = await supabase
        .from('student_dormitories')
        .insert([{
          student_id: studentId,
          dormitory_id: selectedDormitory.id
        }]);

      if (error) throw error;
      await fetchAssignments(selectedDormitory.id);
      await fetchDormitories(); // Refresh to update occupancy
    } catch (error) {
      console.error('Error assigning student:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      building: '',
      floor: 1,
      room_number: '',
      capacity: 2,
      gender_restriction: 'Mixed',
      amenities: [],
      status: 'Available'
    });
    setEditingDormitory(null);
    setModalOpen(false);
  };

  const openEditModal = (dormitory: Dormitory) => {
    setEditingDormitory(dormitory);
    setFormData({
      name: dormitory.name,
      building: dormitory.building,
      floor: dormitory.floor,
      room_number: dormitory.room_number,
      capacity: dormitory.capacity,
      gender_restriction: dormitory.gender_restriction,
      amenities: dormitory.amenities,
      status: dormitory.status
    });
    setModalOpen(true);
  };

  const openAssignModal = async (dormitory: Dormitory) => {
    setSelectedDormitory(dormitory);
    await fetchAssignments(dormitory.id);
    setAssignModalOpen(true);
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const filteredDormitories = dormitories.filter(dormitory => {
    const matchesSearch = `${dormitory.name} ${dormitory.building} ${dormitory.room_number}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || dormitory.status === statusFilter;
    return matchesSearch && matchesStatus;
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
          <h1 className="text-2xl font-bold text-gray-900">Dormitories</h1>
          <p className="text-gray-600">Manage dormitory rooms and student assignments</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Dormitory
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
                placeholder="Search dormitories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'Available', label: 'Available' },
                { value: 'Full', label: 'Full' },
                { value: 'Maintenance', label: 'Maintenance' }
              ]}
            />
            <div className="flex items-end">
              <Button variant="outline" onClick={fetchDormitories} className="w-full">
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dormitories Table */}
      <Card>
        <Table headers={['Name', 'Building', 'Room', 'Capacity', 'Occupancy', 'Gender', 'Status', 'Actions']}>
          {filteredDormitories.map((dormitory) => (
            <TableRow key={dormitory.id}>
              <TableCell className="font-medium">{dormitory.name}</TableCell>
              <TableCell>{dormitory.building}</TableCell>
              <TableCell>Floor {dormitory.floor} - {dormitory.room_number}</TableCell>
              <TableCell>{dormitory.capacity}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <span className="mr-2">{dormitory.current_occupancy}/{dormitory.capacity}</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(dormitory.current_occupancy / dormitory.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{dormitory.gender_restriction}</TableCell>
              <TableCell>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  dormitory.status === 'Available' ? 'bg-green-100 text-green-800' :
                  dormitory.status === 'Full' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {dormitory.status}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => openAssignModal(dormitory)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Manage assignments"
                      >
                        <Users className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(dormitory)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit dormitory"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(dormitory.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete dormitory"
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
        
        {filteredDormitories.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">No dormitories found</p>
            <p className="text-gray-600">Start by adding dormitory facilities</p>
          </div>
        )}
      </Card>

      {/* Add/Edit Dormitory Modal */}
      {isAdmin && (
        <Modal
          isOpen={modalOpen}
          onClose={resetForm}
          title={editingDormitory ? 'Edit Dormitory' : 'Add New Dormitory'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Dormitory Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., North Hall A"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Building"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                required
                placeholder="e.g., North Hall"
              />
              <Input
                label="Floor"
                type="number"
                min="1"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                required
              />
              <Input
                label="Room Number"
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                required
                placeholder="e.g., 101"
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
              <Select
                label="Gender Restriction"
                value={formData.gender_restriction}
                onChange={(e) => setFormData({ ...formData, gender_restriction: e.target.value })}
                options={[
                  { value: 'Mixed', label: 'Mixed' },
                  { value: 'Male', label: 'Male Only' },
                  { value: 'Female', label: 'Female Only' }
                ]}
              />
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { value: 'Available', label: 'Available' },
                  { value: 'Maintenance', label: 'Maintenance' },
                  { value: 'Full', label: 'Full' }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableAmenities.map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" type="button" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">
                {editingDormitory ? 'Update Dormitory' : 'Add Dormitory'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Assignment Management Modal */}
      {isAdmin && (
        <Modal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          title={`Manage Assignments - ${selectedDormitory?.name}`}
          size="xl"
        >
          <div className="space-y-6">
            {/* Current Assignments */}
            <div>
              <h4 className="text-lg font-semibold mb-4">
                Current Residents ({assignments.length}/{selectedDormitory?.capacity})
              </h4>
              {assignments.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">
                          {assignment.students.first_name} {assignment.students.last_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          ID: {assignment.students.student_id} • {assignment.students.gender}
                        </p>
                        <p className="text-xs text-gray-500">
                          Assigned: {new Date(assignment.assignment_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No residents assigned yet</p>
              )}
            </div>

            {/* Available Students */}
            {selectedDormitory && selectedDormitory.current_occupancy < selectedDormitory.capacity && (
              <div>
                <h4 className="text-lg font-semibold mb-4">Available Students</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {students
                    .filter(student => {
                      // Filter by gender restriction
                      if (selectedDormitory.gender_restriction !== 'Mixed') {
                        return student.gender === selectedDormitory.gender_restriction;
                      }
                      return true;
                    })
                    .filter(student => !assignments.some(a => a.student_id === student.id))
                    .map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium">{student.first_name} {student.last_name}</p>
                          <p className="text-sm text-gray-600">ID: {student.student_id} • {student.gender}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAssign(student.id)}
                        >
                          Assign
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Dormitories;