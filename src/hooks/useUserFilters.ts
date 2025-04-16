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
  
  // Since the team field doesn't exist in the database, we'll just provide a default empty list
  const teams: string[] = useMemo(() => {
    // We're keeping this for compatibility, but it will only contain "All Teams" since team doesn't exist
    return ["All Teams"];
  }, []);

  // Filter users based on search term and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const firstName = user.user_metadata?.first_name || '';
      const lastName = user.user_metadata?.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      const email = user.email || '';
      const role = user.user_metadata?.role || '';
      
      const matchesSearch = 
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesRole = roleFilter === "All Roles" || role === roleFilter;
      // Since we don't have team data, we'll always match on team filter
      const matchesTeam = true;
      
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
