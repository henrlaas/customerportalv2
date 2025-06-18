
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, MessageSquare, Clock, Activity } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const AnalyticsDashboardTab: React.FC = () => {
  // Mock data for demonstration
  const notificationData = [
    { name: 'Mon', sent: 12, opened: 8 },
    { name: 'Tue', sent: 19, opened: 15 },
    { name: 'Wed', sent: 3, opened: 2 },
    { name: 'Thu', sent: 5, opened: 4 },
    { name: 'Fri', sent: 15, opened: 12 },
    { name: 'Sat', sent: 8, opened: 6 },
    { name: 'Sun', sent: 4, opened: 3 },
  ];

  const typeDistribution = [
    { name: 'Task Assignments', value: 35 },
    { name: 'Due Date Reminders', value: 25 },
    { name: 'Contract Updates', value: 20 },
    { name: 'System Alerts', value: 20 },
  ];

  const userEngagement = [
    { name: 'Week 1', active: 45, total: 50 },
    { name: 'Week 2', active: 48, total: 52 },
    { name: 'Week 3', active: 42, total: 55 },
    { name: 'Week 4', active: 50, total: 58 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Analytics Dashboard</h3>
        <p className="text-sm text-muted-foreground">
          Monitor system usage, notification performance, and user engagement
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">58</div>
            <p className="text-xs text-muted-foreground">
              +4 new this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4h</div>
            <p className="text-xs text-muted-foreground">
              -0.3h from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">Excellent</Badge>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notification Activity</CardTitle>
            <CardDescription>
              Weekly notification sending and open rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={notificationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sent" fill="#8884d8" name="Sent" />
                <Bar dataKey="opened" fill="#82ca9d" name="Opened" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
            <CardDescription>
              Distribution of notification types sent this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
            <CardDescription>
              Active vs total users over the past month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userEngagement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="active" stroke="#8884d8" name="Active Users" />
                <Line type="monotone" dataKey="total" stroke="#82ca9d" name="Total Users" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>
              Key performance indicators and system health
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Database Response Time</span>
              <Badge variant="secondary">{"< 100ms"}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">API Response Time</span>
              <Badge variant="secondary">{"< 200ms"}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Error Rate</span>
              <Badge variant="secondary">0.1%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Memory Usage</span>
              <Badge variant="secondary">45%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">CPU Usage</span>
              <Badge variant="secondary">12%</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
