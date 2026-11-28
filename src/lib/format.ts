export function initialsOf(name?: string | null): string {
  const value = (name ?? '')
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  return value || '＋';
}

/** "+2376XXXXXXXX" → "+237 6XX XX XX XX" */
export function formatPhone(phone: string | null): string {
  if (!phone) return '';
  return phone.replace(/^(\+237)(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/, '$1 $2$3 $4 $5 $6');
}