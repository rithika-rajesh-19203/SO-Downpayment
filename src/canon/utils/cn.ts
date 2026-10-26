/**
 * Minimal class-name joiner. Filters falsy values so conditionals read
 * cleanly: cn('base', isActive && 'active', className).
 *
 * Dependency-free by choice. If real class-conflict problems ever appear,
 * swapping this single function for clsx + tailwind-merge is the whole change.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
