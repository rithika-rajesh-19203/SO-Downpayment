import { useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { Icon } from '../../icons';
import type { IconName } from '../../icons';
import { cn } from '../../utils/cn';

/**
 * SEGMENTED CONTROL — design-refs/zf-segmented.md. 2–4 mutually exclusive
 * options in a shared track, exactly one selected, switching instantly. A radio
 * group that looks like a switch.
 *
 * §7 — the three-way distinction, because all three are a row of small targets:
 *   segmented  exactly one, always · changes HOW the same content is shown
 *   tabs       exactly one         · changes WHICH content is shown
 *   pills      zero to many        · filters the content
 * "If none-selected is a valid state, it is not a segmented control." That is
 * also why there is no `error` state — it always has exactly one value.
 *
 * ── THE HEADLINE DEFECT, FIXED ───────────────────────────────────────────────
 * §2: the whole job of this component is showing which option is on, and in
 * Figma that is `surface/default` on `surface/sunken` — **1.12:1**, and **1.05:1
 * in Dark**. The two supporting cues are no better: the shadow edge is 1.34 /
 * 1.07 (a black shadow on a black surface composites to #171A26 and does
 * nothing), and the label delta 2.23 / 1.59.
 *
 * A 1px `border/control` gives **4.02 Light / 3.75 Dark** against the track, and
 * 4.52 / 3.58 against the fill — both boundaries pass in both modes. It is
 * additive: fill, shadow and label colours are untouched.
 *
 * §2.1 rejects tinting it `primary/*`, quoting the Figma doc frame: "a segmented
 * control is a neutral switcher, and tinting the selected segment blue would
 * make it compete with the primary action on the page." Correct — which is why
 * this reaches for a border where the wizard and pill reach for `primary`.
 */
export interface SegmentOption {
  value: string;
  /**
   * ALWAYS required — `showLabels={false}` hides it, never drops it. §9.1:
   * Figma's `Show label = false` deletes the text node, which for a `<button>`
   * means no accessible name at all. "This is the one place where following
   * Figma literally produces an unusable control." Optional would invite one.
   */
  label: string;
  icon?: IconName;
}

export interface SegmentedProps {
  /** 2–4. Beyond that use a select — §7. */
  options: SegmentOption[];
  value: string;
  onChange: (next: string) => void;
  /** Figma's `Show label`. False hides the label visually, never removes it. */
  /**
   * `md` (default) — the measured control: 32 overall, a 28 segment.
   * `sm` — 24 overall, a 20 segment. For a control riding another component's
   * baseline, where 32 stands taller than the thing it sits beside.
   *
   * The 2px track inset and the 9px inline padding are unchanged, so the two
   * sizes are the same control and not two drawings of one. The radii scale with
   * it and stay concentric across that inset: 8/6 at `md`, **4/2** at `sm`.
   */
  size?: 'sm' | 'md';
  showLabels?: boolean;
  /**
   * The WHOLE group. `SegmentOption` has no `disabled` field on purpose — §9.3:
   * a disabled *selected* segment leaves the group with no reachable value, and
   * the arrow handler would `onChange` onto it while `focus()` silently no-ops.
   */
  disabled?: boolean;
  /** The radiogroup's accessible name. Required. */
  label: string;
  className?: string;
}

export function Segmented({
  options, value, onChange, size = 'md', showLabels = true, disabled, label, className,
}: SegmentedProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  //  §9.3 — the roving tab stop. If `value` matches no option (a stale value, or
  //  a first render before it is set) every button would get tabIndex -1 and the
  //  group would be unreachable by keyboard. Fall back to the first.
  const selectedIndex = options.findIndex((o) => o.value === value);
  const tabStop = selectedIndex === -1 ? 0 : selectedIndex;

  //  §8 — this is the one component in the system where a native element is not
  //  enough. A radiogroup is ONE tab stop with arrows inside it; `<button>` does
  //  not give that, and a fieldset of real radios only does with the native
  //  appearance stripped — which reintroduces the hidden-input `pointer-events`
  //  hover trap that broke Checkbox and Toggle. So: ARIA, and fifteen lines.
  //
  //  Arrows MOVE AND SELECT, which is what native radios do and what
  //  role="radio" promises. If a product needs focus-without-select it wants
  //  role="tablist" with manual activation — i.e. it is tabs, not this (§7).
  function onKeyDown(e: KeyboardEvent, i: number) {
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % options.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + options.length) % options.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = options.length - 1;
    if (next === -1) return;
    e.preventDefault();
    onChange(options[next].value);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        //  §3.2 — the cleanest container geometry in the file. 32 = 2 + 28 + 2,
        //  and the radii are concentric across the 2px inset: 6 + 2 = 8 exactly.
        //
        //  `sm` keeps that arithmetic rather than dropping it: segment 2, track
        //  2 + 2 = 4. Setting the TRACK to 2 instead would force the segment to
        //  0 and the pills would be square inside a rounded box — the one shape
        //  combination that always looks like a mistake.
        'inline-flex items-center gap-1 p-1 box-border',
        size === 'sm' ? 'rounded-sm' : 'rounded-lg',
        'bg-surface-sunken',
        //  §9.2 — max-width on the TRACK is what makes the label's ellipsis
        //  reachable. Without a constraint somewhere, `truncate` is dead code.
        'max-w-full',
        className,
      )}
    >
      {options.map((o, i) => {
        const checked = o.value === value;
        const iconOnly = !showLabels && Boolean(o.icon);

        return (
          <button
            key={o.value}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={i === tabStop ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              'inline-flex items-center justify-center gap-3 box-border',
              //  §9.2 — load-bearing. Without it a segment overflows a
              //  constrained track instead of shrinking, and nothing truncates.
              'min-w-0',
              //  ONE branch. Two block-sizes on one element are settled by the
              //  stylesheet's emission order, not the className's.
              size === 'sm' ? 'h-segment-sm' : 'h-segment',
              //  §9.2 — space/5 MINUS the 1px border. `box-sizing: border-box`
              //  only subtracts a border from a SPECIFIED dimension: the height
              //  absorbs it, the auto width does not. px-5 with a 1px border
              //  renders 102 against Figma's 100, and the track 203 against 199.
              'px-segment-pad',
              //  §9.2 — the transparent border is RESERVED on the base rule, so
              //  turning the selected colour on below shifts nothing. Write the
              //  border only on the selected rule and every selection jumps 2px.
              'border border-transparent',
              //  ONE branch — two radii on one element are settled by the
              //  stylesheet's emission order, not the className's.
              size === 'sm' ? 'rounded-xs' : 'rounded-md',
              'text-body-sm font-medium',
              'transition-colors duration-150 motion-reduce:transition-none',
              disabled ? 'cursor-not-allowed' : 'cursor-pointer',
              //  §9.2 — offset 0, NOT the system-wide 2. An outline extends
              //  `offset + width` outward, so offset-2 would reach 4px — and both
              //  the inter-segment gap and the track padding are 2px, so the ring
              //  would paint over the neighbour and spill past the track's
              //  rounded edge. offset-0 reaches exactly 2px, filling the track's
              //  inset and reproducing Figma's ring (104×32 at −2,−2, INSIDE).
              //  §3.4: zero clearance is only a defect when the thing behind the
              //  ring shares its hue. Here the neighbours are neutral surfaces at
              //  3.84–8.06:1; on the pill the neighbour was `primary/selected`,
              //  one step from `focus/ring` — 1.27 Light and 1.00 Dark.
              'focus-visible:outline-offset-0',
              checked
                ? cn(
                  'bg-surface-default shadow-raised',
                  //  §2.1 REVERTED ON REQUEST, 2026-08-24. Figma draws NO border
                  //  on the selected segment at all, so this takes
                  //  `border/default` — the nearest Figma weight — rather than the
                  //  `border/control` the md prescribes (which gave 4.02 / 3.75).
                  //
                  //  Know what it costs: the selected segment is 1.12:1 against
                  //  the track in Light and **1.05:1 in Dark**, and the shadow
                  //  meant to support it composites to #171A26 over a dark track —
                  //  1.07:1. §2: "in Dark the only remaining cue is the label,
                  //  shifting by 1.59:1." That is this component's one job.
                  //  To restore the fix, bind `border-border-control`.
                  'border-border-default',
                  disabled ? 'text-text-disabled' : 'text-text-default',
                )
                : disabled
                  ? 'text-text-disabled'
                  : cn(
                    'text-text-secondary',
                    //  §2.2 — the hover classes are applied CONDITIONALLY rather
                    //  than restated on a higher-specificity selector. The md's
                    //  CSS needs an extra `[aria-checked=true]:hover` rule
                    //  because `:hover:not(:disabled)` at (0,3,0) outranks
                    //  `[aria-checked='true']` at (0,2,0) — and warns "do not let
                    //  a dedupe lint remove it". In Tailwind that rule could not
                    //  win anyway: variant utilities are emitted after base ones,
                    //  so ordering, not authoring, decides. Not emitting the
                    //  class is the only construction a lint cannot break.
                    //
                    //  A selected segment is inert on hover BY DESIGN: clicking
                    //  it does nothing (exactly one is always on), and "a control
                    //  that cannot respond should not offer feedback". Contrast
                    //  the pill, where clicking a selected item deselects it.
                    //
                    //  Worth knowing: this fill is 1.04:1 against the track —
                    //  `surface/hover` is one ramp step from `surface/sunken`.
                    //  The LABEL darkening is what a user actually perceives.
                    'hover:bg-surface-hover hover:text-text-default',
                    //  §5 — Figma has no pressed state; the role exists. Honest
                    //  about what it buys: 1.06:1 Light, 1.21 Dark. A nod to the
                    //  click, not a legible state change. Unselected only —
                    //  a selected segment stays inert on press too.
                    'active:bg-surface-pressed',
                  ),
            )}
          >
            {/*
              §3.3 — in Figma the icon costs 28 hand-maintained overrides (2 per
              instance × 14 places): the masters sit on `icon/default` at 1.25
              and every use needs `text/*` at 1.2, and the doc frame records a
              swap silently resetting three of them to `neutral/1100`.
              `tone="inherit"` is `currentColor`, so there are zero overrides
              here and a swap cannot break anything.

              Slot `sm` = 14px, matching Figma's 14×14 instance of a 16×16
              master. We keep the system's 1.25 stroke rather than the md's 1.2:
              CLAUDE.md fixes ONE stroke weight system-wide, the md's own
              defect 8 records 1.25-vs-1.2 as a Figma inconsistency, and at a
              14px slot the painted difference is 1.09 vs 1.20 — imperceptible,
              and not worth a second weight in the system.
            */}
            {o.icon ? <Icon name={o.icon} size="sm" tone="inherit" /> : null}
            {iconOnly
              ? <span className="sr-only">{o.label}</span>
              : <span className="truncate">{o.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
