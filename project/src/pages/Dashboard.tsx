import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import DashboardStats from '../components/dashboard/DashboardStats';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Calendar, Clock, Users, BookOpen } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSubjects: 0,
    totalDormitories: 0,
    occupancyRate: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [studentsRes, subjectsRes, dormitoriesRes] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact' }),
        supabase.from('subjects').select('*', { count: 'exact' }),
        supabase.from('dormitories').select('*'),
      ]);

      const totalCapacity = dormitoriesRes.data?.reduce((sum, dorm) => sum + dorm.capacity, 0) || 0;
      const totalOccupancy = dormitoriesRes.data?.reduce((sum, dorm) => sum + dorm.current_occupancy, 0) || 0;
      const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

      setStats({
        totalStudents: studentsRes.count || 0,
        totalSubjects: subjectsRes.count || 0,
        totalDormitories: dormitoriesRes.data?.length || 0,
        occupancyRate,
      });

      // Fetch recent activities (recent enrollments)
      if (isAdmin) {
        const { data: activities } = await supabase
          .from('student_subjects')
          .select(`
            *,
            students(first_name, last_name),
            subjects(name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);
        
        setRecentActivities(activities || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          {isAdmin ? 'Administrative overview of the student management system' : 'Welcome to your student portal'}
        </p>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Quick Actions
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isAdmin ? (
                <>
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="font-medium">Add New Student</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-emerald-600 mr-3" />
                      <span className="font-medium">Create Subject</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-purple-600 mr-3" />
                      <span className="font-medium">Assign Dormitory</span>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-emerald-600 mr-3" />
                      <span className="font-medium">Enroll in Subject</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-purple-600 mr-3" />
                      <span className="font-medium">View Schedule</span>
                    </div>
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center p-3 rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.students.first_name} {activity.students.last_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Enrolled in {activity.subjects.name}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No recent activities</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;