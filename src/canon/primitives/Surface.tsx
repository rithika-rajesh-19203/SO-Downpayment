import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

/**
 * Surface roles. `canvas` is what a page sits on; `default` is the page or card;
 * `sunken` is a recessed well; `raised` is a card above the page; `inverse` is
 * the dark band a step trail sits on.
 *
 * `pressed` is neutral/500, deliberately NOT neutral/400 — §7 of the colours doc
 * records it being added at 400, exactly where `disabled` and `sunken` already
 * sat, so a pressed control and a disabled control were the same colour. The
 * interaction ladder is monotonic in both panes and disabled sits OFF it, which
 * is correct: disabled is not a stronger version of pressed.
 */
const toneMap = {
  canvas: 'bg-surface-canvas',
  default: 'bg-surface-default',
  raised: 'bg-surface-raised',
  sunken: 'bg-surface-sunken',
  hover: 'bg-surface-hover',
  pressed: 'bg-surface-pressed',
  selected: 'bg-surface-selected',
  disabled: 'bg-surface-disabled',
  inverse: 'bg-surface-inverse',
} as const;

/** Padding as a step on the 2px scale — same vocabulary as Stack's `gap`. */
const padMap = {
  0: 'p-0',
  2: 'p-2', // 4px
  3: 'p-3', // 6px
  4: 'p-4', // 8px
  5: 'p-5', // 10px
  6: 'p-6', // 12px
  8: 'p-8', // 16px
  10: 'p-10', // 20px
  12: 'p-12', // 24px
} as const;

/**
 * Radius, md §1.5. `md` (6px) is the default — 371 uses, buttons and inputs.
 *
 * Prefer `full` over any half-of-height arithmetic: §1.5 records an avatar drawn
 * with `cornerRadius: 50` on one size and 999 on three others. 999 always
 * resolves to a capsule; 50 is a circle at exactly 100px and a rounded
 * rectangle at every other size.
 */
const radiusMap = {
  //  A ROLE, not a step — `chrome/card` at 10. It sits between `lg` (8) and `xl`
  //  (12) and is deliberately not on the ramp: 10 is a retired scale value and
  //  the guard rejects it inside `--zf-radius-*`. Named so a section cannot be
  //  "about 10" in one screen and 11 in the next.
  card: 'rounded-card',
  none: 'rounded-none',
  xs: 'rounded-xs',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
} as const;

/**
 * Border roles. `default` is 1.31:1 against white and FAILS WCAG 1.4.11 — nine
 * components inherit that failure and the neutral ramp has nothing near 3:1.
 * Open items 12 and 35; do not paper over it per component.
 */
const borderMap = {
  none: '',
  default: 'border border-border-default',
  hover: 'border border-border-hover',
  strong: 'border border-border-strong',
  divider: 'border border-border-divider',
} as const;

/**
 * Elevation. §1 defines no scale (open item 13), so these are the four values
 * actually drawn in the file, promoted to roles in tokens/scale.css so a fifth
 * shadow cannot be invented per component.
 */
const elevationMap = {
  none: '',
  raised: 'shadow-raised',
  popover: 'shadow-popover',
  modal: 'shadow-modal',
  drawer: 'shadow-drawer',
} as const;

export interface SurfaceProps {
  tone?: keyof typeof toneMap;
  pad?: keyof typeof padMap;
  radius?: keyof typeof radiusMap;
  border?: keyof typeof borderMap;
  elevation?: keyof typeof elevationMap;
  grow?: boolean;
  children?: ReactNode;
  className?: string;
}

/**
 * Any panel, card or region needing a background, border, radius or shadow.
 * Centralising those four decisions is what stops eight subtly different cards
 * appearing across the product — md §2.14.3 found one component with three
 * nested cards at radius 16, 11 and 10, two borders and two shadows.
 */
export function Surface({
  tone = 'default', pad = 8, radius = 'md', border = 'none',
  elevation = 'none', grow, children, className,
}: SurfaceProps) {
  return (
    <div
      className={cn(
        toneMap[tone], padMap[pad], radiusMap[radius],
        borderMap[border], elevationMap[elevation],
        grow && 'flex-1 min-h-0',
        className,
      )}
    >
      {children}
    </div>
  );
}
