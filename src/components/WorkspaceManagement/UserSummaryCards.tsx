
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
      {/* Total Users Card */}
      <Card className="bg-purple-50 text-purple-700 border-purple-200 border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Total Users</p>
              <p className="text-2xl font-bold mt-1">{totalUsers}</p>
              <p className="text-xs opacity-80 mt-1">System users</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      {/* Admin Users Card */}
      <Card className="bg-red-50 text-red-700 border-red-200 border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Admin Users</p>
              <p className="text-2xl font-bold mt-1">{adminUsers}</p>
              <p className="text-xs opacity-80 mt-1">System administrators</p>
            </div>
            <Shield className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>

      {/* Employee Users Card */}
      <Card className="bg-blue-50 text-blue-700 border-blue-200 border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Employee Users</p>
              <p className="text-2xl font-bold mt-1">{employeeUsers}</p>
              <p className="text-xs opacity-80 mt-1">Staff members</p>
            </div>
            <Briefcase className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      {/* Client Users Card */}
      <Card className="bg-green-50 text-green-700 border-green-200 border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Client Users</p>
              <p className="text-2xl font-bold mt-1">{clientUsers}</p>
              <p className="text-xs opacity-80 mt-1">External clients</p>
            </div>
            <User className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
