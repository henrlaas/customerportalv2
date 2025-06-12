
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, DollarSign, Calendar, Users, CheckCircle, Clock, AlertTriangle, ListTodo } from 'lucide-react';
import { CompanyFavicon } from '@/components/CompanyFavicon';
import { UserAvatarGroup } from '@/components/Tasks/UserAvatarGroup';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectOverviewTabProps {
  project: any;
  assignees: any[];
  tasks: any[];
  financialData: { totalCost: number; totalHours: number } | undefined;
  isLoadingFinancial: boolean;
  onTaskClick: (taskId: string) => void;
}

export const ProjectOverviewTab: React.FC<ProjectOverviewTabProps> = ({
  project,
  assignees,
  tasks,
  financialData,
  isLoadingFinancial,
  onTaskClick
}) => {
  const { isAdmin } = useAuth();

  // Calculate task statistics
  const taskStats = React.useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const overdue = tasks.filter(task => 
      task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
    ).length;
    const dueToday = tasks.filter(task => {
      if (!task.due_date || task.status === 'completed') return false;
      const today = new Date().toDateString();
      return new Date(task.due_date).toDateString() === today;
    }).length;
    const upcoming = tasks.filter(task => 
      task.due_date && 
      new Date(task.due_date) > new Date() && 
      task.status !== 'completed'
    ).length;

    return { total, completed, overdue, dueToday, upcoming };
  }, [tasks]);

  // Calculate project profit
  const calculateProjectProfit = () => {
    const projectValue = project?.value || 0;
    const totalCost = financialData?.totalCost || 0;
    const profit = projectValue - totalCost;
    const profitPercentage = projectValue ? (profit / projectValue) * 100 : 0;
    
    return { profit, profitPercentage };
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatPriceType = (priceType: string | null) => {
    if (!priceType) return 'Not specified';
    return priceType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get recent tasks (last 5)
  const recentTasks = tasks.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Company</p>
                <div className="flex items-center gap-2 mt-1">
                  {project?.company && (
                    <CompanyFavicon 
                      companyName={project.company.name} 
                      website={project.company.website}
                      size="sm"
                    />
                  )}
                  <span className="font-semibold">{project?.company?.name || 'Not assigned'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Project Value</p>
                <p className="font-semibold mt-1">
                  {project?.value ? formatCurrency(project.value) : 'Not specified'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatPriceType(project?.price_type)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Deadline</p>
                <p className="font-semibold mt-1">{formatDate(project?.deadline)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-indigo-600" />
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium">Team Members</p>
              {assignees && assignees.length > 0 ? (
                <div className="mt-2">
                  <UserAvatarGroup
                    users={assignees.map(assignee => ({
                      id: assignee.user_id,
                      first_name: assignee.profiles?.first_name,
                      last_name: assignee.profiles?.last_name,
                      avatar_url: assignee.profiles?.avatar_url
                    }))}
                    size="md"
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    {assignees.length} {assignees.length === 1 ? 'member' : 'members'} assigned
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 mt-1">No team members assigned</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <ListTodo className="h-6 w-6 mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-bold">{taskStats.total}</div>
            <div className="text-sm text-gray-500">Total Tasks</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto text-orange-600 mb-2" />
            <div className="text-2xl font-bold">{taskStats.upcoming}</div>
            <div className="text-sm text-gray-500">Upcoming</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto text-red-600 mb-2" />
            <div className="text-2xl font-bold text-red-600">{taskStats.dueToday}</div>
            <div className="text-sm text-gray-500">Due Today</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 mx-auto text-green-600 mb-2" />
            <div className="text-2xl font-bold">{taskStats.completed}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Finance Section - Only for admins */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Project Finance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 font-medium">Cost to Date</p>
                <p className="text-xl font-bold">
                  {isLoadingFinancial ? (
                    'Loading...'
                  ) : (
                    formatCurrency(financialData?.totalCost || 0)
                  )}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 font-medium">Projected Profit</p>
                {isLoadingFinancial ? (
                  'Loading...'
                ) : (
                  <div className="text-xl font-bold">
                    <span className={calculateProjectProfit().profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(calculateProjectProfit().profit)}
                    </span>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-500 font-medium">Profit Margin</p>
                {isLoadingFinancial ? (
                  'Loading...'
                ) : (
                  <div className="text-xl font-bold">
                    <span className={calculateProjectProfit().profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {calculateProjectProfit().profitPercentage.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Tasks */}
      {recentTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => onTaskClick(task.id)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{task.title}</div>
                    {task.due_date && (
                      <div className="text-sm text-gray-500">
                        Due: {formatDate(task.due_date)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={
                      task.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                      task.status === 'in_progress' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }>
                      {task.status === 'todo' ? 'To Do' : 
                       task.status === 'in_progress' ? 'In Progress' : 
                       'Completed'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
