/**
 * formatters.js - Shared utility functions for formatting data
 */

export const formatSalary = (salary) => {
  if (salary === null || salary === undefined || isNaN(salary) || Number(salary) === 0) {
    return 'Negotiable';
  }
  return `${Number(salary).toLocaleString('en-US')} VND`;
};

export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  const defaultOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options
  };
  try {
    return new Date(dateString).toLocaleDateString('en-US', defaultOptions);
  } catch (err) {
    console.error('Error formatting date:', err);
    return dateString;
  }
};
