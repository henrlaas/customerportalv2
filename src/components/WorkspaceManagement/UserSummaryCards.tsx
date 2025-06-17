
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
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold text-purple-600">{totalUsers}</p>
              <p className="text-xs text-muted-foreground mt-1">System users</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Users Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Admin Users</p>
              <p className="text-3xl font-bold text-red-600">{adminUsers}</p>
              <p className="text-xs text-muted-foreground mt-1">System administrators</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Users Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Employee Users</p>
              <p className="text-3xl font-bold text-blue-600">{employeeUsers}</p>
              <p className="text-xs text-muted-foreground mt-1">Staff members</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Users Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Client Users</p>
              <p className="text-3xl font-bold text-green-600">{clientUsers}</p>
              <p className="text-xs text-muted-foreground mt-1">External clients</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <User className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
