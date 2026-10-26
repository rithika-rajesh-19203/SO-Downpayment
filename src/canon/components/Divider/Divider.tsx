import { cn } from '../../utils/cn';

/**
 * DIVIDER — a thematic break between two blocks, or between two columns.
 *
 * An `<hr>`, not a styled `<div>`. It carries `role="separator"` for free, it is
 * what the HTML element is *for*, and — the reason it matters here — it means a
 * screen can draw a rule without a bare element, which rule 4 forbids and which
 * was previously being worked around by rendering an **empty `FormSection`** and
 * borrowing the rule it draws. A section with no rows is not a divider; it is a
 * section that failed to render.
 *
 * ── THE RULE IS THE BOX, NOT A BORDER ───────────────────────────────────────
 * `w-px` / `h-px` with a background, rather than `border-t`. Two reasons, and
 * the second is why it changed: a UA `<hr>` draws an inset 3D groove, so a
 * border approach has to zero all four edges before setting one — and border
 * widths take Tailwind's own numeric scale, so a **0.5px** border cannot be
 * expressed at all. A box can, because `--spacing-*` accepts a named key.
 *
 * ── `hairline` IS A HINT, NOT A GUARANTEE ───────────────────────────────────
 * At 1px `border/divider` is already the lightest role we have (1.20:1) and the
 * only way further down is thinner, not paler. Half a device pixel at 1x gets
 * antialiased into something fainter; at 2x it is one crisp device pixel, and
 * different engines round it differently. **Never carry information on it.**
 */
export interface DividerProps {
  /**
   * `horizontal` (default) — a full-width rule between two blocks.
   * `vertical` — `self-stretch`, so it spans the tallest item in the flex row it
   * sits in. Put it BETWEEN the columns; it has no width of its own to give.
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * `default` — 1px.
   * `hairline` — `chrome/hairline`, 0.5px. For a rule that is separating columns
   * of the same card rather than two parts of a page.
   */
  weight?: 'default' | 'hairline';
  /**
   * Space on the two sides the rule does NOT run along.
   *
   * `none` (default) — flush; the surrounding gap is the caller's.
   * `tight` — `chrome/form-divider`, 25, matching
   * `FormSection dividerGap="tight"`. Deliberately the same token: a page whose
   * form dividers breathe at 25 and whose block dividers breathe at something
   * else has two rhythms and no reason for either.
   */
  gap?: 'none' | 'tight';
  className?: string;
}

export function Divider({
  orientation = 'horizontal', weight = 'default', gap = 'none', className,
}: DividerProps) {
  const vertical = orientation === 'vertical';

  return (
    <hr
      //  An `<hr>` is a horizontal separator by default, so a vertical one has
      //  to say so or it is announced as the wrong thing.
      aria-orientation={vertical ? 'vertical' : undefined}
      className={cn(
        //  `border-0` first: the UA draws an inset 3D groove and zeroing only
        //  one edge leaves the other three behind.
        'border-0 bg-border-divider flex-none',
        //  ONE branch per axis. Two block-sizes, or two margins, on one element
        //  are settled by the stylesheet's emission order, not the className's.
        vertical
          ? cn('self-stretch', weight === 'hairline' ? 'w-hairline' : 'w-px',
            gap === 'tight' ? 'mx-form-divider' : 'mx-0')
          : cn('w-full', weight === 'hairline' ? 'h-hairline' : 'h-px',
            gap === 'tight' ? 'my-form-divider' : 'my-0'),
        className,
      )}
    />
  );
}
