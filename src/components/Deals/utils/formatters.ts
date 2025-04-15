
// Utility functions for Deals components

/**
 * Formats a number as Norwegian kroner with kr symbol
 */
export const formatCurrency = (value: number | null) => {
  if (value === null) return 'N/A';
  
  return new Intl.NumberFormat('no-NO', {
    style: 'currency',
    currency: 'NOK',
    currencyDisplay: 'symbol'
  }).format(value).replace('NOK', 'kr');
};

/**
 * Formats a date string in a consistent format
 */
export const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('no-NO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Gets company name by ID from companies list
 */
export const getCompanyName = (companyId: string | null, companies: Array<{ id: string; name: string; }>) => {
  if (!companyId) return 'No company';
  const company = companies.find(c => c.id === companyId);
  return company ? company.name : 'Unknown Company';
};

/**
 * Gets user name by ID from profiles list
 */
export const getAssigneeName = (userId: string | null, profiles: Array<{ id: string; first_name: string | null; last_name: string | null; }>) => {
  if (!userId) return 'Unassigned';
  const profile = profiles.find(p => p.id === userId);
  if (!profile) return 'Unknown User';
  return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
};

