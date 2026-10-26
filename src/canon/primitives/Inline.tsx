import type { ReactNode } from 'react';
import { cn } from '../utils/cn';
import type { Gap } from './Stack';

/** Same step scale as Stack — see the note there on why these are literals. */
const gapMap: Record<Gap, string> = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
  12: 'gap-12',
  16: 'gap-16',
  20: 'gap-20',
};

const alignMap = {
  start: 'items-start', center: 'items-center',
  end: 'items-end', baseline: 'items-baseline', stretch: 'items-stretch',
} as const;

const justifyMap = {
  start: 'justify-start', center: 'justify-center',
  end: 'justify-end', between: 'justify-between',
} as const;

export interface InlineProps {
  gap?: Gap;
  align?: keyof typeof alignMap;
  justify?: keyof typeof justifyMap;
  wrap?: boolean;
  /** Fill remaining width, and let children truncate rather than overflow. */
  grow?: boolean;
  children?: ReactNode;
  className?: string;
}

/** Horizontal flex row — the sibling of Stack. */
export function Inline({
  gap = 3, align = 'center', justify = 'start', wrap, grow, children, className,
}: InlineProps) {
  return (
    <div
      className={cn(
        'flex flex-row',
        gapMap[gap], alignMap[align], justifyMap[justify],
        wrap && 'flex-wrap',
        grow && 'flex-1 min-w-0',
        className,
      )}
    >
      {children}
    </div>
  );
}
