
import { useState, useMemo } from "react";
import { User } from "@/services/userService";

export function useUserFilters(users: User[] = []) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");

  // Get unique roles for filters
  const roles: string[] = useMemo(() => {
    return ["All Roles", ...Array.from(new Set(users
      .map(user => user.user_metadata?.role || '')
      .filter(Boolean) as string[]))];
  }, [users]);

  // Filter users based on search term and role filter
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
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  return {
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    roles,
    filteredUsers
  };
}
