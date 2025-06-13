
import { Users, Shield, Briefcase, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { User as UserType } from '@/services/userService';

interface UserSummaryCardsProps {
  users: UserType[];
}

export const UserSummaryCards = ({ users }: UserSummaryCardsProps) => {
  // Calculate metrics from user data
  const totalUsers = users.length;
  
  const adminUsers = users.filter(user => user.user_metadata?.role === 'admin').length;
  const employeeUsers = users.filter(user => user.user_metadata?.role === 'employee').length;
  const clientUsers = users.filter(user => user.user_metadata?.role === 'client').length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Total Users Card - Purple */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100" />
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Total Users</p>
              <p className="text-3xl font-bold text-purple-900">{totalUsers}</p>
              <p className="text-xs text-purple-600 mt-1">System users</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Users Card - Red */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100" />
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Admin Users</p>
              <p className="text-3xl font-bold text-red-900">{adminUsers}</p>
              <p className="text-xs text-red-600 mt-1">System administrators</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Users Card - Blue */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100" />
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Employee Users</p>
              <p className="text-3xl font-bold text-blue-900">{employeeUsers}</p>
              <p className="text-xs text-blue-600 mt-1">Staff members</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Users Card - Green */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100" />
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Client Users</p>
              <p className="text-3xl font-bold text-green-900">{clientUsers}</p>
              <p className="text-xs text-green-600 mt-1">External clients</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <User className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
