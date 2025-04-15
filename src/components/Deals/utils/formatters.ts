
// Utility functions for Deals components

/**
 * Formats a number as Norwegian kroner with kr symbol
 */
export const formatCurrency = (value: number | null) => {
  if (value === null) return 'N/A';
  
  return new Intl.NumberFormat('no-NO', {
    style: 'currency',
    currency: 'NOK'
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
