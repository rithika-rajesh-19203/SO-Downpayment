import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Text } from '../../primitives';
import { cn } from '../../utils/cn';

/**
 * PILL — design-refs/zf-pill.md. A **filter chip**: a toggle that switches a
 * list between subsets. Not a button (no action), not a badge (it is
 * interactive), not a tab (it does not change a view). §7 has the decision rule.
 *
 * §10.1 calls this "the best-built component in the system" and it is: 8 of 8
 * variants, **34 of 34 paints on semantic roles**, padding and radius on tokens,
 * a real text style. Nothing else in the file is close. It still had two defects
 * a review cannot see, both now fixed in Figma.
 *
 * ── THE ATTRIBUTE IS THE STATE ───────────────────────────────────────────────
 * §8: "**Do not add a `.zf-pill--selected` class.** `aria-pressed` already
 * carries the state, it is what the screen reader reads, and duplicating it into
 * a class creates two sources of truth that will drift."
 *
 * And unlike Checkbox and Toggle, there is no hidden input and no wrapper — a
 * `<button>` is hoverable and focusable itself, so the `pointer-events: none`
 * trap that broke both of those does not apply.
 *
 * ── WHY THE SELECTED FILL IS `primary/selected` AND NOT `primary/default` ────
 * §4.2: at `blue/1300` white reaches **5.48:1**; `primary/default` `blue/1200`
 * would give **4.32** and fail 1.4.3. The Primary button, which does use
 * `primary/default`, fails for exactly this reason. **The pill sidesteps the
 * system's most consequential colour defect by using a different role.**
 *
 * ── THE RESTING BORDER IS LEFT FAILING, DELIBERATELY ─────────────────────────
 * `border/default` is 1.31:1 and fails 1.4.11 — the sixth component with this.
 * `border/control` exists and would take it to 4.52. §9 does **not** bind it,
 * and §4.4a is why: the unselected pill's entire hover feedback is a border
 * colour change, and `neutral/1100` sits **1.3 L* from `blue/1200`**, so the
 * hover would collapse to a hue-only shift at **1.05:1** — invisible in
 * greyscale and to a blue-yellow deficiency.
 *
 * So this is a known, documented failure rather than a silent one, and it is
 * gated on §11 Q2: a 2px hover border, a fill tint, or accept the hue shift.
 * (We measured the fill tint the md could not — `primary/subtle` does exist
 * here, and it is 1.13:1 Light and **1.02:1 Dark**, so it does not rescue the
 * option. A 2px border is the only robust one.)
 */
export interface PillProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'onClick'> {
  label: string;
  selected: boolean;
  onSelectedChange: (next: boolean) => void;
  /**
   * Optional. Figma's `Icon Swap` has no boolean to hide the icon, so every
   * Figma pill has one whether it makes sense or not — and it defaults to
   * `icon / learn`, an open book, on a chip labelled "All Transactions" (§3.4).
   * Most filter chips should not have one.
   *
   * Render it at **16px**. §3.3: the pill instances 16px masters at 12, and
   * Figma scales geometry but *not* stroke weight, so any of the 17 stroked
   * icons comes out 33% too heavy.
   */
  icon?: ReactNode;
}

export function Pill({
  label, selected, onSelectedChange, icon, disabled, className, ...rest
}: PillProps) {
  return (
    <button
      type="button"
      //  §8 — the styling hook and the accessible state are the same attribute.
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onSelectedChange(!selected)}
      className={cn(
        //  §3: padding 6 / 10, gap 4, radius full — every value on a token.
        //  No explicit height: 16 line-height + 12 padding + 2 border = 30px.
        //  Figma renders 26 because its frame is FIXED and silently overrides
        //  its own 6px padding (§3.1). 30 is the price of keeping the padding on
        //  a token rather than on the magic 5 that actually governs there. §11 Q2b.
        'inline-flex items-center gap-2 py-3 px-5 rounded-full border box-border',
        'transition-colors duration-150',
        disabled
          ? cn('cursor-not-allowed',
            selected
              //  §4.3: `text/default`, NOT `primary/on-primary`. `primary/border`
              //  is a light blue in Light and a dark blue in Dark, and on-primary
              //  is white then near-black — the SAME lightness as its own
              //  background, 1.65:1 and 1.93:1. text/default inverts the other
              //  way: 9.18 and 8.72. One token, both modes, no trade-off.
              ? 'bg-primary-border border-primary-border text-text-default'
              : 'bg-surface-disabled border-border-disabled text-text-disabled')
          : selected
            ? cn('bg-primary-selected border-primary-selected text-primary-on-primary',
              //  §4.5: this is only a 1.27:1 shift — below any perceptual
              //  threshold, and weaker than the unselected hover at 3.29. Which
              //  is backwards: the selected chip is the one about to be clicked
              //  to REMOVE a filter. No clean fix inside one hue ramp; §11 Q4.
              'hover:bg-primary-active hover:border-primary-active')
            : cn('bg-surface-default border-border-default text-text-default',
              'hover:border-primary-default'),
        className,
      )}
      {...rest}
    >
      {/*
        §9.3: the wrapper is required, not cosmetic. It applies `flex-none` and
        `aria-hidden` to a node the CONSUMER owns — render {icon} bare and it
        shrinks when the label truncates, and any consumer SVG carrying <title>
        gets announced, doubling the accessible name.

        No colour is set here on purpose. Export with currentColor and the icon
        follows the label in every state; a CSS `fill` would lose to the
        presentation attribute on the child and would flood-fill a stroked glyph.
      */}
      {icon ? <span aria-hidden className="flex-none inline-flex">{icon}</span> : null}
      <Text
        as="span"
        size="label"
        tone="inherit"
        truncate
        //  §9.2, and all three are load-bearing. `min-w-0` defeats the flex
        //  item's automatic minimum size — with nowrap that is the WHOLE string,
        //  so without it nothing can truncate. `truncate` brings the
        //  overflow/text-overflow pair, which only apply to a BLOCK CONTAINER —
        //  putting them on the inline-flex button instead gives a hard clip
        //  mid-glyph with no ellipsis. And the max-width belongs here so 20ch is
        //  20 characters OF LABEL; on the button it would also pay for padding,
        //  border, icon and gap, leaving roughly 13.
        className="min-w-0 max-w-pill-label"
      >
        {label}
      </Text>
    </button>
  );
}
