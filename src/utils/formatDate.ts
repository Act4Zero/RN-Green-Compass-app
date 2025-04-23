/**
 * Format a Date object into a readable string format
 * @param date The date to format
 * @returns A formatted date string (e.g., "Apr 18, 2025")
 */
function formatDate(date: Date): string {
  if (!(date instanceof Date)) {
    return '';
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export default formatDate;
