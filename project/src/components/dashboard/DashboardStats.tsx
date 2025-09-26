import React from 'react';
import { Users, BookOpen, Building, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
            {trend && (
              <div className={`flex items-center mt-1 text-sm ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`h-3 w-3 mr-1 ${trend.isPositive ? '' : 'rotate-180'}`} />
                {trend.value}% from last month
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface DashboardStatsProps {
  stats: {
    totalStudents: number;
    totalSubjects: number;
    totalDormitories: number;
    occupancyRate: number;
  };
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Students"
        value={stats.totalStudents}
        icon={Users}
        color="bg-blue-600"
        trend={{ value: 12, isPositive: true }}
      />
      <StatCard
        title="Active Subjects"
        value={stats.totalSubjects}
        icon={BookOpen}
        color="bg-emerald-600"
        trend={{ value: 8, isPositive: true }}
      />
      <StatCard
        title="Dormitories"
        value={stats.totalDormitories}
        icon={Building}
        color="bg-purple-600"
      />
      <StatCard
        title="Occupancy Rate"
        value={stats.occupancyRate}
        icon={TrendingUp}
        color="bg-orange-600"
        trend={{ value: 5, isPositive: true }}
      />
    </div>
  );
};

export default DashboardStats;