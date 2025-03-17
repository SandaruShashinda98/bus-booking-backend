/**
 * Converts an enum value (e.g., 'FIRST_NAME') to a user-friendly string (e.g., 'First Name').
 */
export function convertEnumToDisplay(value: string): string {
  // Replace underscores with spaces and convert to title case
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Utility function to convert snake_case to Title Case
export function convertToSnakeCase(label: string): string {
  return label.replace(/\s+/g, '_').toLowerCase();
}
