import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

/**
 * FORM SECTION — `ZF-CREATE-PAGE.md` §2. Two halves of six columns.
 *
 * **What separates the halves is not a gap.** It is the left half's slack
 * column (110 at the 1360 specimen) plus the right half's label column (220) —
 * 330 of empty and label that the grid produces for free. The md is explicit
 * that it "must not be implemented as one", and it matters: a `column-gap`
 * here would make a column stop being a pure twelfth, and §2's whole table
 * would be wrong by the width of the gap.
 *
 * So `gap-x-0`, stated rather than omitted, because the next person to open
 * this file will want to add one.
 *
 * ── ORDER IS DOM ORDER, AND THAT IS A REQUIREMENT ───────────────────────────
 * §5, 2.4.3: children fill the LEFT half top-to-bottom, then the right. Never
 * column-interleaved. A two-column form whose DOM zig-zags across the halves
 * tabs in an order nobody expects — and the fix is a column layout per half,
 * not `grid-auto-flow: column`, which would do exactly the zig-zag.
 */
export interface FormSectionProps {
  /** Rows for the left half, top to bottom. */
  children: ReactNode;
  /** Rows for the right half. Omit for a single-column section. */
  trailing?: ReactNode;
  /**
   * Rows that run across all twelve columns, rendered after both halves.
   *
   * A `FormRow span="full"` MUST go here and not in `children`. Its
   * `col-span-full` needs a grid to span, and the halves are flex columns — put
   * one in `children` and the span is inert, `2fr 9fr 1fr` resolves inside the
   * half instead of across the section, and the label track comes out **half
   * the width** every other row has. The label then overflows it and the control
   * starts left of every control above it, which is the one thing §4.1's
   * fixed track exists to prevent.
   */
  full?: ReactNode;
  /**
   * The last section carries no rule — a divider with nothing under it is the
   * line the source drew twice.
   */
  last?: boolean;
  /**
   * How much room the rule gets.
   *
   * `default` — §2's 32 of block-end padding, with the space BELOW left to
   * whatever follows (a `Stack` gap, usually).
   *
   * `tight` — `chrome/form-divider` on **both** sides, owned here rather than
   * split between this component and the caller's gap. A rule with 25 above and
   * 32 below is not a divider, it is a divider that has slipped, and two owners
   * is how that happens.
   */
  dividerGap?: 'default' | 'tight';
  className?: string;
}

export function FormSection({
  children, trailing, full, last, dividerGap = 'default', className,
}: FormSectionProps) {
  return (
    <section className={cn(
      'grid min-w-0',
      //  Two halves of 6. `1fr 1fr` and not `repeat(2, 1fr)` for the same
      //  reason as everywhere else: `min-w-0` on the children is what stops a
      //  long value blowing the track, and `1fr` alone would not.
      'grid-cols-2 gap-x-0 gap-y-12',
      //  ONE branch of three. Two `padding-block-end` or two `margin-block-end`
      //  on one element are settled by the stylesheet's emission order, not the
      //  className's.
      last ? 'pb-0 mb-0 border-b-0'
        : dividerGap === 'tight'
          ? 'pb-form-divider mb-form-divider border-b border-border-divider'
          : 'pb-16 mb-0 border-b border-border-divider',
      className,
    )}>
      {/* Each half is its own column flow, so DOM order IS reading order and
          the tab order cannot zig-zag. §5, 2.4.3. */}
      <div className="flex flex-col gap-12 min-w-0">{children}</div>
      {trailing ? <div className="flex flex-col gap-12 min-w-0">{trailing}</div> : null}

      {/* Direct children of the SECTION's grid, so `col-span-full` has something
          to span. In their own flex column so several of them keep the same
          `space/12` rhythm as the halves. */}
      {full ? (
        <div className="col-span-full flex flex-col gap-12 min-w-0">{full}</div>
      ) : null}
    </section>
  );
}
