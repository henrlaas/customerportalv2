
import { useState, useMemo } from "react";
import { User } from "@/services/userService";

export function useUserFilters(users: User[] = []) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [teamFilter, setTeamFilter] = useState("All Teams");

  // Get unique roles and teams for filters
  const roles: string[] = useMemo(() => {
    return ["All Roles", ...Array.from(new Set(users
      .map(user => user.user_metadata?.role || '')
      .filter(Boolean) as string[]))];
  }, [users]);
  
  const teams: string[] = useMemo(() => {
    return ["All Teams", ...Array.from(new Set(users
      .map(user => user.user_metadata?.team || '')
      .filter(Boolean) as string[]))];
  }, [users]);

  // Filter users based on search term and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const fullName = `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim();
      const email = user.email || '';
      const role = user.user_metadata?.role || '';
      const team = user.user_metadata?.team || '';
      
      const matchesSearch = 
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesRole = roleFilter === "All Roles" || role === roleFilter;
      const matchesTeam = teamFilter === "All Teams" || team === teamFilter;
      
      return matchesSearch && matchesRole && matchesTeam;
    });
  }, [users, searchTerm, roleFilter, teamFilter]);

  return {
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    teamFilter,
    setTeamFilter,
    roles,
    teams,
    filteredUsers
  };
}
