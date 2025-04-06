
import { useState } from "react";
import { UserManagement } from "@/components/UserManagement";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { 
  UserPlus,
  Search, 
  Filter, 
  MoreHorizontal 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock user data
const mockUsers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    role: "Admin",
    team: "Executive Team",
    initial: "S"
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael.chen@example.com",
    role: "Senior Advisory",
    team: "Executive Team",
    initial: "M"
  },
  {
    id: 3,
    name: "Alex Wong",
    email: "alex.wong@example.com",
    role: "Advisory",
    team: "Creative Team",
    initial: "A"
  },
  {
    id: 4,
    name: "Jessica Smith",
    email: "jessica.smith@example.com",
    role: "Operations",
    team: "Creative Team",
    initial: "J"
  },
  {
    id: 5,
    name: "David Miller",
    email: "david.miller@example.com",
    role: "Operations",
    team: "Client Services",
    initial: "D"
  }
];

const UserManagementPage = () => {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [teamFilter, setTeamFilter] = useState("All Teams");
  const [users, setUsers] = useState(mockUsers);

  // Only admins can access this page
  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesRole = roleFilter === "All Roles" || user.role === roleFilter;
    const matchesTeam = teamFilter === "All Teams" || user.team === teamFilter;
    
    return matchesSearch && matchesRole && matchesTeam;
  });

  // Get unique roles and teams for filters
  const roles = ["All Roles", ...Array.from(new Set(users.map(user => user.role)))];
  const teams = ["All Teams", ...Array.from(new Set(users.map(user => user.team)))];

  // Role badge color based on role
  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case "Admin":
        return "bg-purple-100 text-purple-800";
      case "Senior Advisory":
        return "bg-blue-100 text-blue-800";
      case "Advisory":
        return "bg-green-100 text-green-800";
      case "Operations":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button 
          className="bg-blue-500 hover:bg-blue-600"
          onClick={() => window.location.href = '/user-management/add'}
        >
          <UserPlus className="mr-2 h-5 w-5" />
          Add User
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Role</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Team</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center text-gray-600 font-medium">
                        {user.initial}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.team}</td>
                  <td className="py-3 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500">Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No users found matching your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
