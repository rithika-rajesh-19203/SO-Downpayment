import { cn } from '../utils/cn';
import { iconPaths, type IconName } from './paths';

/**
 * SLOT sizes. md open item 13: the GLYPH is authored at 16, the SLOT is a
 * per-component decision — five components instance at 14, and the avatar's
 * admin badge goes down to 8. Never hard-code a slot; pick a token.
 */
const sizeMap = {
  //  CONTROL DECORATION, and the one entry that is not on the ramp. A caret
  //  hanging off a dropdown control is not a glyph beside a label: it is part of
  //  the control's shape, and `caret-down-bold`'s ink nearly fills its 24
  //  viewBox, so at `xs` it draws a 12px arrow that competes with the text.
  //
  //  Named separately rather than added to the ramp so that `size="caret"` reads
  //  as what it is, and so nobody reaches for it as "the size below xs".
  caret: 'size-icon-caret', // 7.5
  xs: 'size-icon-xs', // 12
  sm: 'size-icon-sm', // 14 — beside a 12px label
  md: 'size-icon-md', // 16 — the default slot
  lg: 'size-icon-lg', // 20
  xl: 'size-icon-xl', // 24
} as const;

/**
 * TONE. A meaningful glyph is a graphic under WCAG 1.4.11 and needs 3:1 —
 * `subtle` is 2.85:1 and does NOT clear it. md §2.11.4 records nearly shipping
 * a stepper chevron on `icon/subtle` for exactly this reason, so `subtle` is
 * for decoration only.
 *
 * `inherit` is the important one, and usually the right answer: md §2.7.6 found
 * 108 orphan icon paints caused by icons carrying a colour of their own instead
 * of the label's. An icon beside a label is part of that label.
 */
const toneMap = {
  inherit: 'text-current',
  default: 'text-icon-default', // 6.79:1
  //  The step BETWEEN default and subtle, and the one that was missing: 4.52
  //  Light / 5.67 Dark. `subtle` is the only other way to draw a quieter glyph
  //  and it fails 1.4.11, so "a bit lighter" used to mean "below the floor".
  muted: 'text-icon-muted', // 4.52:1 — quieter, still identifies a control
  subtle: 'text-icon-subtle', // 2.85:1 — decorative only
  disabled: 'text-icon-disabled',
  inverse: 'text-icon-inverse',
  primary: 'text-primary-default',
  success: 'text-success-default',
  warning: 'text-warning-default',
  danger: 'text-danger-default',
} as const;

export interface IconProps {
  name: IconName;
  /** Slot size. The glyph does not change; only the room it occupies does. */
  size?: keyof typeof sizeMap;
  /** Defaults to `inherit`, so an icon takes the colour of the text beside it. */
  tone?: keyof typeof toneMap;
  /**
   * Accessible name. Omit for a decorative glyph (the default) and it is hidden
   * from assistive tech — correct when a visible label sits beside it. REQUIRED
   * on an icon-only control: md §2.10.6 notes icon-only is the case most often
   * shipped broken, announced only as "button".
   */
  label?: string;
  className?: string;
}

/**
 * Every icon in the product. One 16x16 slot, one vector, colour inherited.
 *
 * Geometry lives in `paths.ts`; a name with no geometry yet renders a dashed
 * placeholder so the gap is visible in the canon instead of failing silently.
 */
export function Icon({ name, size = 'md', tone = 'inherit', label, className }: IconProps) {
  const glyph = iconPaths[name];
  const a11y = label ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': true };

  return (
    <svg
      //  The glyph's own box, not an assumed one — see IconGeometry.viewBox.
      viewBox={glyph?.viewBox ?? '0 0 16 16'}
      className={cn(sizeMap[size], toneMap[tone], 'shrink-0', className)}
      {...a11y}
    >
      {glyph ? (
        <path
          d={glyph.d}
          fill={glyph.strokeWidth ? 'none' : 'currentColor'}
          stroke={glyph.strokeWidth ? 'currentColor' : undefined}
          strokeWidth={glyph.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        /* Unexported glyph. Deliberately conspicuous — see paths.ts. */
        <rect
          x="1.5"
          y="1.5"
          width="13"
          height="13"
          rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.5"
        />
      )}
    </svg>
  );
}
