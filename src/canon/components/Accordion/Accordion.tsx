import { Children, cloneElement, isValidElement } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../../icons';
import type { IconName } from '../../icons';
import { Text } from '../../primitives';
import { cn } from '../../utils/cn';

/**
 * ACCORDION — design-refs/zf-accordion.md. A disclosure list: stacked sections,
 * each with a clickable header that shows or hides its body.
 *
 * §7 — when NOT to use it: "If it must be one-at-a-time, ask whether it is
 * really tabs. An accordion that closes the previous section on every open is
 * tabs with more vertical motion." And "if there is one section, it is not an
 * accordion" — that is a single item with no container.
 *
 * ── BUILT ON <details> / <summary> ───────────────────────────────────────────
 * §8, which the Figma doc frame got to first. It gives the open state, the
 * toggle, keyboard operation and the expanded/collapsed announcement with **no
 * script and no ARIA at all**. `open` is the state, not a class — it is what the
 * browser toggles and what the accessibility tree reads.
 *
 * `group` maps to `<details name>`, so one-at-a-time is enforced by the browser
 * with no state and no effects.
 */
export interface AccordionItemProps {
  title: string;
  /** §1 — Figma's `Body` INSTANCE_SWAP, which in React is just children. */
  children: ReactNode;
  count?: number;
  /** Announced, not shown — turns "Section two 12" into "…12 records". §9.3 */
  countLabel?: string;
  action?: { label: string; icon?: IconName; onClick: () => void };
  /** §5 — tied to the side the chevron sits on. See the convention below. */
  chevron?: 'leading' | 'trailing';
  defaultOpen?: boolean;
  disabled?: boolean;
  /** Shared name → one section open at a time. Set by `Accordion`. */
  group?: string;
  className?: string;
}

/**
 * §5 — the most interesting decision in this component. Four legacy Figma sets
 * disagreed about chevron direction and it looked like carelessness. It was not:
 *
 *   leading   collapsed → · expanded ↓   a disclosure triangle; the row opens
 *                                        downward from the marker
 *   trailing  collapsed ↓ · expanded ↑   an expander; the arrow points at where
 *                                        the content will go
 *
 * Both are correct *for their side*, so tying direction to position turns two
 * contradictions into one rule.
 *
 * Figma implements this as four real glyph swaps with `rotation: 0` everywhere —
 * correct there, because a Figma rotation carries radii and child order with it
 * (the hazard zf-input-stepper.md §10.1 records). In CSS a transform has none of
 * those hazards and animates for free, so one glyph plus a rotation is simpler.
 * The base glyph points DOWN, so `trailing` needs no transform at rest.
 */
const CHEVRON_ROTATION = {
  trailing: 'rotate-0 group-open:rotate-180',
  leading: '-rotate-90 group-open:rotate-0',
} as const;

export function AccordionItem({
  title, children, count, countLabel, action,
  chevron = 'trailing', defaultOpen, disabled, group, className,
}: AccordionItemProps) {
  return (
    <details
      className={cn('group bg-surface-default', className)}
      open={defaultOpen}
      name={group}
      aria-disabled={disabled || undefined}
    >
      <summary
        className={cn(
          'flex items-center gap-5 px-8 py-accordion-y',
          //  §9.2 — remove the native disclosure marker so the chevron can be a
          //  real element. Both are needed: the pseudo-element for Safari,
          //  `list-style` for everything else.
          'list-none [&::-webkit-details-marker]:hidden',
          disabled ? 'bg-surface-disabled cursor-not-allowed' : 'cursor-pointer hover:bg-surface-hover',
          //  §2.1 — the ring goes INSIDE the header. Figma draws it at −2 with a
          //  CENTER stroke, which spans −3…−1 — a **1px** gap, not the 2px its
          //  doc frame claims, and the construction zf-input-stepper.md's own
          //  frame documents as wrong. Worse, items sit at gap 0, so an outward
          //  ring paints over the neighbours, and the container clips it on the
          //  first and last rows.
          //
          //  −5, not −3: a square outline inside `overflow-hidden` + a radius is
          //  still nicked at the container's rounded corners — ~2px at radius 8,
          //  4px at 10, 5px at 12. −5 clears radius/xl. Re-check if that changes.
          'focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:-outline-offset-5',
        )}
        //  §9.3 — `<details>` has no `disabled`, so the toggle is cancelled on
        //  the summary's CLICK, not on the details' onToggle: `toggle` fires
        //  AFTER the state change, so resetting `open` there opens the body for
        //  one frame and fires two events. A click guard covers the keyboard too
        //  — Enter and Space on a focused <summary> both dispatch a click.
        onClick={(e) => { if (disabled) e.preventDefault(); }}
      >
        <Icon
          name="chevron-down"
          //  §3.1 — instanced at its NATIVE 16px, which no other component in
          //  this file manages: the pill takes the same master down to 12, the
          //  segmented control and stepper to 14. Nothing is scaled here, so no
          //  stroke-weight correction is needed.
          size="md"
          tone={disabled ? 'disabled' : 'subtle'}
          className={cn('shrink-0 transition-transform duration-150 motion-reduce:transition-none',
            CHEVRON_ROTATION[chevron],
            chevron === 'leading' && 'order-first')}
        />

        <Text as="span" size="body" weight="medium" tone={disabled ? 'disabled' : 'default'}
          className="flex-1 min-w-0">
          {title}
        </Text>

        {count !== undefined ? (
          <span
            className={cn(
              'shrink-0 px-3 py-1 rounded-md text-label font-semibold',
              disabled
                //  §9.2 — a disabled badge is a SURFACE plus a border, not a text
                //  role used as a fill. `text/disabled` as a background under
                //  on-primary white is 2.13:1 and is the same role misuse the md
                //  flags elsewhere.
                ? 'bg-surface-disabled border border-border-divider text-text-disabled'
                //  THE §2 FIX. `primary/default` + `primary/on-primary` at 11px is
                //  **4.32:1** and fails 1.4.3 — the same pair that fails on the
                //  Primary button, landing here on a badge that is hidden by
                //  default, "so nobody has ever looked at it".
                //
                //  `primary/selected` gives 5.48 / 8.62. The md contradicts itself
                //  here: §2 reasons for primary/selected because "it is the role
                //  the pill and the wizard already standardised on", while §9.2,
                //  §9.4 and defect 2 all say primary/active (6.94). §2's reasoning
                //  is checkable and correct — Pill and Wizard both use
                //  primary/selected — and consistency beats 1.46 of extra
                //  headroom on a value that already clears 4.5.
                : 'bg-primary-selected text-primary-on-primary',
            )}
          >
            {count}
            {/*
              §9.3 — NO aria-describedby. The badge is a descendant of the
              <summary>, so it is ALREADY part of the summary's accessible name;
              pointing a description at it makes a screen reader say the count
              twice. The visually-hidden unit is what turns "Section two12" into
              "Section two 12 records".
            */}
            {countLabel ? <span className="sr-only"> {countLabel}</span> : null}
          </span>
        ) : null}

        {action ? (
          <button
            type="button"
            disabled={disabled}
            //  §8 — I had to correct the doc frame here. It says the action must
            //  `stopPropagation` or it toggles the section. That is true of a
            //  NON-interactive child, and stopPropagation does not fix it either:
            //  toggling is <summary>'s DEFAULT ACTION rather than a listener, so
            //  only preventDefault stops it. But a real <button> becomes the
            //  activation target itself, so <summary>'s activation behaviour
            //  never runs and nothing toggles with no handler at all. The button
            //  IS the fix; preventDefault is insurance against this ever becoming
            //  a <span> or a <div role="button">.
            onClick={(e) => { e.preventDefault(); action.onClick(); }}
            className={cn(
              'shrink-0 inline-flex items-center gap-3 px-2 bg-transparent border-0',
              //  §3.5 / defect 7 — Figma's action is 61 × 20 and fails 2.5.8 with
              //  no exception available: the Spacing exception cannot apply to a
              //  target nested inside a larger one, and there is no equivalent
              //  control. 24 is the minimum — but the header's content box is only
              //  20px, so a bare min-height makes the header 46px whenever an
              //  action is present and 42px when it is not, which defeats the
              //  one-height fix. The negative margin buys the target back out of
              //  the header's own padding.
              'min-h-12 -my-1',
              'rounded-sm focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-offset-1',
              disabled ? 'pointer-events-none' : 'cursor-pointer',
            )}
          >
            {action.icon ? <Icon name={action.icon} size="sm" tone="inherit" /> : null}
            <Text as="span" size="body" tone={disabled ? 'disabled' : 'link'}>{action.label}</Text>
          </button>
        ) : null}
      </summary>

      {/*
        §2.2 — THE 1px FIX. Figma adds a bottom border to the HEADER only when
        expanded, so the header is 42 collapsed and 43 expanded: opening a
        section nudges everything below it by a pixel on top of the body's own
        height change. Putting the same rule on the body's top edge draws an
        identical line and leaves the header at exactly 42 in both states.
      */}
      <div className="border-t border-border-divider">{children}</div>
    </details>
  );
}

export interface AccordionProps {
  children: ReactNode;
  /** Pass a name to make the group exclusive — one section open at a time. */
  group?: string;
  className?: string;
}

/**
 * The container. §3.3: Figma's `zf-accordion` has **no properties at all** —
 * three items, three hardcoded titles, `Expanded` hardcoded on the second. Its
 * own doc frame diagnosed exactly this in the *old* build ("the list had no way
 * to say which item was open") and the rebuild reproduces that half. So this is
 * the part with no Figma counterpart to copy: a border, dividers, and a shared
 * name.
 */
export function Accordion({ children, group, className }: AccordionProps) {
  return (
    <div
      className={cn(
        //  Figma's radius is 10, which is not on the scale (8 and 12 are).
        //  radius/xl per §9.4 — and the −5 focus offset above is measured
        //  against exactly this value.
        'rounded-xl overflow-hidden bg-surface-default',
        //  §4.3 — the md binds this to `border/control` (4.52). Kept on Figma's
        //  `border/default` (1.31) per the standing decision of 2026-08-24 to
        //  match the design file's border weights.
        'border border-border-default',
        //  §9.2 — dividers BETWEEN items, never on the outside. Figma uses
        //  explicit 1px rectangles; a sibling border is the same thing with no
        //  extra nodes to keep in sync. 1.20:1, and §11 decision 1 argues for
        //  leaving it: these separate parts of one object rather than bounding
        //  it, and three 520px rules at 4.52 "turn a list of sections into a
        //  heavily-ruled table".
        '[&>details+details]:border-t [&>details+details]:border-border-divider',
        className,
      )}
    >
      {group
        ? Children.map(children, (child) =>
          isValidElement<AccordionItemProps>(child) ? cloneElement(child, { group }) : child)
        : children}
    </div>
  );
}

/**
 * §3.4 — the default `Body`: an empty-state message. Figma's padding is 28
 * (off-scale; 24 and 32 exist) and its type is 12/18, which "matches nothing in
 * the type scale" — the 12px tier is 12/16. Both moved onto the scale.
 */
export function AccordionNote({ children }: { children: ReactNode }) {
  return (
    <div className="py-12 px-10 text-center">
      <Text size="body-sm" tone="secondary">{children}</Text>
    </div>
  );
}
