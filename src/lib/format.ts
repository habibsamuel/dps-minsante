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