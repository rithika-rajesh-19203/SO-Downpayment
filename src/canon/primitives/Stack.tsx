import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

/**
 * Gaps are named by STEP, not by t-shirt size and not by pixel value.
 * md §1.6.2: the base unit is 2px, so `4` is 8px because 4 x 2 = 8. Measured
 * across 2,021 auto-layout frames — 2, 6 and 10 account for 1,020 uses and none
 * is a multiple of 4, which is what settled the base at 2px rather than 4px.
 *
 * Step names mean a future density change rescales the whole product from
 * tokens/scale.css without renaming a single prop value. "Your decision, taken."
 *
 * Enumerated as literals rather than built with a template string because
 * Tailwind scans source text for class names — `gap-${step}` is invisible to it.
 */
const gapMap = {
  0: 'gap-0',
  1: 'gap-1', // 2px
  2: 'gap-2', // 4px
  3: 'gap-3', // 6px
  4: 'gap-4', // 8px
  5: 'gap-5', // 10px
  6: 'gap-6', // 12px
  8: 'gap-8', // 16px
  10: 'gap-10', // 20px
  12: 'gap-12', // 24px
  16: 'gap-16', // 32px
  20: 'gap-20', // 40px
} as const;

const alignMap = {
  start: 'items-start', center: 'items-center',
  end: 'items-end', stretch: 'items-stretch',
} as const;

const justifyMap = {
  start: 'justify-start', center: 'justify-center',
  end: 'justify-end', between: 'justify-between',
} as const;

export type Gap = keyof typeof gapMap;

export interface StackProps {
  /** Vertical rhythm between children, as a step on the 2px scale. */
  gap?: Gap;
  align?: keyof typeof alignMap;
  justify?: keyof typeof justifyMap;
  /** Fill remaining space in a flex parent, and allow inner scrolling. */
  grow?: boolean;
  children?: ReactNode;
  className?: string;
}

/**
 * Vertical flex column — the default way to space things apart.
 * Screens reach for this instead of `mt-*` or `space-y-*`, so spacing always
 * comes from the token scale rather than an ad-hoc number.
 */
export function Stack({
  gap = 4, align = 'stretch', justify = 'start', grow, children, className,
}: StackProps) {
  return (
    <div
      className={cn(
        'flex flex-col',
        gapMap[gap], alignMap[align], justifyMap[justify],
        grow && 'flex-1 min-h-0',
        className,
      )}
    >
      {children}
    </div>
  );
}
