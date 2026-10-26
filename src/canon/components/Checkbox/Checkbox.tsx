import { useEffect, useId, useRef } from 'react';
import { Stack, Text } from '../../primitives';
import { cn } from '../../utils/cn';

/**
 * CHECKBOX — design-refs/zf-checkbox.md. That file is an implementation spec,
 * not a transcription: **where it and Figma disagree, it wins.** Twelve values in
 * the Figma file are marked "do not copy" and §4 gives the replacement for each.
 *
 * §1 describes two Figma components — the bare 12px box and `checkbox_defined`,
 * which has no state axes at all. §1 is explicit: "**In code, do not mirror
 * that** — build one component that takes the state as props." So this is one
 * component, and omitting `label` gives the bare box for a table select-row cell
 * (32 of the 34 instances in the file).
 *
 * ── ONE SELECTION ENUM, NEVER TWO BOOLEANS ───────────────────────────────────
 * §2.1. Figma's `is_active` × `is_indeterminate` allows both at once — 8
 * combinations with no styling. A three-valued enum makes the invalid state
 * unrepresentable, "which is the whole point".
 *
 * ── ALL 12 ERROR COMBINATIONS, WHERE FIGMA DRAWS 3 ───────────────────────────
 * §2: error styling exists only for the unchecked box, so a ticked checkbox in an
 * invalid group shows no error and neither does a partly-selected parent row.
 *
 * §9.4 warns that fixing this in CSS is a specificity trap: the state selectors
 * reach (0,5,0) and a bare error class at (0,1,0) loses, so an errored checkbox
 * would turn **blue** on hover while still showing a red halo. Four rules have to
 * mirror the state selectors exactly and win on source order — "if you reorder
 * the stylesheet, this breaks silently".
 *
 * **That trap does not arise here.** `selection`, `error` and `disabled` are all
 * props, so the classes are chosen in JavaScript and exactly one border colour is
 * ever emitted. Nothing competes, and nothing depends on stylesheet order.
 */
export type CheckboxSelection = 'unchecked' | 'checked' | 'indeterminate';

export interface CheckboxProps {
  selection?: CheckboxSelection;
  onSelectionChange?: (next: CheckboxSelection) => void;
  /** Omit for the bare box — the table select-row case. */
  label?: string;
  /**
   * The accessible name when there is no visible one. A bare box has none at
   * all, and `zf-design-cannon.md` §2.24.8 grades exactly that on a table:
   * every row checkbox needs a name, and the header's must say **what it
   * selects** — "Select all 10 purchase orders", not "Select all".
   *
   * Not a substitute for `label`. A visible label is always better; this is for
   * the cases where the column header IS the label and repeating it in every
   * row would be noise.
   */
  ariaLabel?: string;
  description?: string;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  name?: string;
  value?: string;
  className?: string;
}

/**
 * The two glyphs, from §9.3, translated into the 12 × 12 box so the SVG renders
 * 1 : 1 and the stroke lands at exactly the measured 1.75px. §9.3 is emphatic
 * that this must not rescale — "get this wrong and the glyph renders small with a
 * thin stroke".
 *
 *   check  ink 7.32 × 5.46, centred at (2.34, 3.27), stroke 1.75 round
 *   bar    ink 7.89 × 2,    centred at (2.055, 5),   a filled rect, radius a pill
 *
 * §9.3 uses a CSS mask on `::before`; an inline SVG is the same geometry with one
 * fewer indirection and it inherits `currentColor`, so §9.1's reason for avoiding
 * a pseudo-element on the input still holds.
 */
const CHECK_D = 'M 3.215 6.22 L 5.19 7.855 L 8.785 4.145';

export function Checkbox({
  selection = 'unchecked', onSelectionChange, label, ariaLabel, description,
  error, errorMessage, disabled, name, value, className,
}: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);
  const id = useId();
  const descId = `${id}-desc`;
  const errId = `${id}-err`;

  //  §6: `indeterminate` is a DOM property with no HTML attribute.
  //  `<input type="checkbox" indeterminate>` does nothing. "The single most
  //  common implementation mistake with this control."
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = selection === 'indeterminate';
  }, [selection]);

  const selected = selection !== 'unchecked';
  //  §2: the four `disabled + error` cells are reasonably omitted — a control the
  //  user cannot edit cannot be corrected.
  const invalid = Boolean(error) && !disabled;

  const showDesc = Boolean(label && description);
  const showErr = Boolean(invalid && errorMessage);
  //  §9.5: reference only ids that actually render. "Pointing at an absent
  //  element announces nothing, which is worse than omitting the attribute."
  //  Two separate ids, because sharing one would silently drop the error.
  const describedBy = [showDesc && descId, showErr && errId].filter(Boolean).join(' ') || undefined;

  //  ── the box, one class set per render, chosen here rather than in CSS ──────
  //  Hover is driven from the <label> via a group variant, NOT from the input.
  //  zf-toggle.md §8 states the rule: the input is visually hidden and carries
  //  `pointer-events: none`, so it can never match a hover selector — a hover
  //  rule written against it "is dead code that silently does nothing". The
  //  first draft of this component had exactly that, on all seven classes.
  const box = cn(
    //  §3.1: `border-box` renders a true 12px box. Figma's 1px CENTER-aligned
    //  stroke makes it 13px, and `content-box` in CSS would make it 14px.
    //  `chrome/checkbox` — 14, a design decision of 28 Aug 2026 that supersedes
    //  §3.1's measured 12. It is a NAMED token rather than a step, because
    //  `spacing 14` is retired and `npm run check` rejects it inside
    //  `--zf-space-*`; and §3.1's own note says Figma's 1px CENTER stroke
    //  rendered the 12px box at 13 anyway, so 12 was the artefact, not the draw.
    'relative flex size-checkbox shrink-0 items-center justify-center rounded-xs border box-border',
    'transition-colors',
    selected
      //  §4 row 4: same value as Figma, on the role instead of the primitive.
      ? 'bg-primary-default border-primary-default'
      //  §4.2 THE DARK-MODE BUG, and the cheapest real fix in the file. Figma
      //  binds the primitive `base/white`, so in Dark every checkbox renders as
      //  a white block — and 32 of the 34 instances are table select-row cells.
      //  `surface/default` is base/white in Light, so this is a zero-pixel
      //  change today and the entire fix for Dark. Canon open item 38.
      : 'bg-surface-default',
    disabled
      ? cn('cursor-not-allowed',
        //  §4 row 9: KEEP `primary/border`. Its name is wrong and its behaviour
        //  is right — blue/800 in Light, blue/1600 in Dark. Substituting the
        //  primitive would make a disabled control the brightest thing on a dark
        //  panel.
        selected ? 'bg-primary-border border-primary-border'
          : 'bg-surface-disabled border-border-default')
      : cn(
        invalid
          //  §4 row 5: `danger/default` (red/1300, 6.09) rather than Figma's
          //  red/1200 primitive (4.67).
          ? 'border-danger-default'
          //  §4.1: Figma binds a REMOTE library style at 1.26:1 — it fails
          //  1.4.11 and, being remote, cannot have a dark mode at all. §4.1 says
          //  "when `border/control` exists this becomes one token change in four
          //  components". It exists.
          : selected ? '' : 'border-border-default',
        //  §4 row 12 / §4.5: the halo is unbound in Figma and cannot theme. An
        //  alpha modifier on the role reproduces the measured value exactly —
        //  offset 0, blur 0, spread 3, alpha 0.2 — and follows the theme.
        //  §4.5: a selected box darkens instead of haloing.
        selected
          ? cn('group-hover:bg-primary-hover',
            //  §4.3: Figma uses `primary/hover` when checked and `primary/text`
            //  when indeterminate — one gesture, two roles, one of them a text
            //  role. One role for both.
            invalid ? 'group-hover:border-danger-default' : 'group-hover:border-primary-hover')
          : cn('group-hover:ring-3',
            invalid
              ? 'group-hover:ring-danger-default/20'
              : 'group-hover:border-primary-default group-hover:ring-primary-default/20'),
      ),
    //  §4.4: `focus/ring`, the same ring as the button and the input field. The
    //  md is explicit that this trades contrast down 6.94 → 4.32 and that
    //  "consistency of a focus indicator matters more than headroom on one
    //  control". outline-offset on a radius-2 box gives an effective radius of 4.
    'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus-ring',
  );

  const input = (
    <input
      ref={ref}
      id={id}
      type="checkbox"
      //  §9.2: present to assistive tech and to CSS, invisible on screen. NOT
      //  `display:none` and NOT `visibility:hidden` — either removes it from the
      //  tab order. It keeps Space-to-toggle, form participation, :checked,
      //  :indeterminate and :disabled.
      className="peer absolute size-px opacity-0 pointer-events-none m-0 p-0"
      checked={selection === 'checked'}
      //  §6: clicking a mixed parent resolves it. It never cycles back to mixed,
      //  because indeterminate is a computed summary and not a user choice.
      onChange={() => onSelectionChange?.(selection === 'checked' ? 'unchecked' : 'checked')}
      disabled={disabled}
      name={name}
      value={value}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      //  Only when there is no visible label. With one, the <label> wrapping
      //  this input already names it, and an aria-label would silently REPLACE
      //  that name rather than add to it.
      aria-label={label ? undefined : ariaLabel}
    />
  );

  const glyph = selected ? (
    //  The viewBox stays 12: it is a coordinate space, not a size, so the tick
    //  scales with the box and its stroke weight scales with it.
    <svg viewBox="0 0 12 12" aria-hidden className="pointer-events-none size-checkbox text-icon-inverse">
      {selection === 'checked' ? (
        <path
          d={CHECK_D}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <rect x="2.055" y="5" width="7.89" height="2" rx="1" fill="currentColor" />
      )}
    </svg>
  ) : null;

  //  §3.4 / §9: the LABEL is the hit area, and it is the only thing that makes
  //  2.5.8 pass — 12 × 12 is 144px² against the 576px² required, 25%.
  //  §9.5 returns a <span> for the bare form; a <label> is used here instead so
  //  the box stays clickable at all. With the input at `pointer-events: none`
  //  inside a span, nothing would toggle it. Recorded in docs/BACKLOG.md.
  if (!label) {
    return (
      <label className={cn('group relative inline-flex cursor-pointer', className)}>
        {input}
        <span className={box}>{glyph}</span>
      </label>
    );
  }

  return (
    <Stack gap={0} className={className}>
      <label
        className={cn(
          //  §5: 8px control-to-text gap, and min-height 24 is the 2.5.8 fix.
          'group relative flex items-start gap-4 min-h-12',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        )}
      >
        {input}
        {/* §5 optically centres the box on the 20px line box beside it. That
            used to be `mt-2`, from (20 − 12) / 2 = 4 — an arithmetic constant
            that silently went wrong the moment the box stopped being 12: at 14
            the answer is 3, which is not a step and never will be.

            A 20-tall flex line centres ANY box size exactly, computed by the
            browser, and cannot fall out of step with `chrome/checkbox` again. */}
        <span className="flex h-10 shrink-0 items-center">
          <span className={box}>{glyph}</span>
        </span>
        <Stack gap={2}>
          {/*
            §5 measures the label as 13/20 REGULAR. The input field's label is
            Medium after that pass (zf-input-field.md §2.2), and §10 defect 17
            asks which is intended. Following the measurement; §11 Q7.
          */}
          <Text as="span" size="body" tone={disabled ? 'disabled' : 'default'}>{label}</Text>
          {description ? (
            //  §5: Figma's description is 12 / 19.2, off the 12/16 scale. §9 uses
            //  16, which is what `body-sm` is.
            <Text id={descId} as="span" size="body-sm" tone={disabled ? 'disabled' : 'secondary'}>
              {description}
            </Text>
          ) : null}
        </Stack>
      </label>
      {showErr ? (
        //  §9.2 aligns the message under the TEXT column, which starts at the
        //  box's width plus the row's gap. That was `ml-10` — 12 + 8, hardcoded
        //  — and it went 2px out of true the moment the box became 14, silently,
        //  because nothing relates a margin to a width.
        //
        //  A spacer of exactly the box's width inside a row with exactly the
        //  label row's gap is the same two tokens doing the same sum, so the
        //  message cannot drift from the label above it again.
        <div className="flex gap-4">
          <span aria-hidden className="w-checkbox shrink-0" />
          <Text id={errId} size="body-sm" tone="danger" role="alert" className="mt-2">
            {errorMessage}
          </Text>
        </div>
      ) : null}
    </Stack>
  );
}
