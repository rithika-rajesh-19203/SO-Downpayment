import type { InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

/**
 * RADIO — design-refs/zf-radio.md. The control only: 12 × 12, no label, no
 * description, no hit area. "Everything except the 12px circle is the consumer's
 * problem" (§2), and that is faithful to the Figma set, which has zero text
 * nodes.
 *
 * ── SELECTION IS A RING. THERE IS NO CENTRE DOT. ─────────────────────────────
 * §9 marks this as the component's "one genuinely unusual decision", and warns
 * it "will be corrected by anyone who does not read this". The border thickens
 * from 1px to 3px, leaving a 6px core of the surface showing through. Nothing is
 * drawn in the middle. If you are about to add a dot, don't.
 *
 * ── A NATIVE INPUT, BECAUSE THE STATES ARE NATIVE ────────────────────────────
 * §10: five of the six Figma axis values map straight onto pseudo-classes —
 * `:hover`, `:focus-visible`, `:disabled`, `:checked` — so `State` and
 * `Is Active` are not props. Only validation needs one, because CSS has no
 * selector for "this group is invalid".
 *
 * A shared `name` also gives arrow-key navigation within the group for free,
 * which is the whole reason this is not a styled `<div>`.
 *
 * ── §13 Q3: `checked + error` IS A REAL STATE ────────────────────────────────
 * The md offers two readings — draw the four missing `checked + error` variants,
 * or collapse `Is Active` × `Is Error` into one `Condition` axis of
 * unchecked / checked / error, "which is what the canvas already believes".
 *
 * Taking the first. CLAUDE.md's first test for a fake axis is *can two of its
 * values be true at once*, and a selected option absolutely can be invalid — the
 * chosen shipping method is unavailable for this address, the picked plan is not
 * offered in this region. §3's own table agrees: it lists `default + error,
 * checked` under "should add", not under "correctly omitted". A `Condition` axis
 * would make that state untypeable.
 *
 * So: selection is native `:checked`, validation is `error`, and all 16
 * combinations exist by construction — including the two `focus + error` gaps
 * §3 calls "the serious ones", where a keyboard user in an error state currently
 * gets no focus indication at all.
 *
 * `disabled + error` is the exception, and §3 agrees it is "likely correct to
 * omit": a disabled control cannot be corrected, so `error` is ignored when
 * disabled rather than producing a state that means nothing.
 */
export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Validation failure. Independent of selection — see the note above. */
  error?: boolean;
}

export function Radio({ error, disabled, className, ...rest }: RadioProps) {
  //  Ignored when disabled, per §3. Not a silent drop: `aria-invalid` goes with
  //  it, so the announced state and the drawn state cannot disagree.
  const invalid = error && !disabled;

  return (
    <input
      type="radio"
      disabled={disabled}
      aria-invalid={invalid || undefined}
      className={cn(
        //  §10's base rule. `border-box` is global, and it is load-bearing here:
        //  it is what makes the resting outer diameter 12px instead of 13px, so
        //  selecting a radio no longer shrinks it by half a pixel on every side.
        //  §4.1 — "in a vertical group the left edges of the circles will not
        //  line up between the chosen option and the rest." Defect 6, fixed by
        //  the box model rather than by a value.
        'appearance-none size-6 shrink-0 rounded-full border transition-shadow',

        //  §5.3: the 6px core is the SURFACE showing through the ring, not a
        //  white fill. Bound to `surface/default` so it follows Dark mode —
        //  Figma binds `base/white`, which is correct today and wrong at night.
        'bg-surface-default',

        //  §4.1 / §2: 1px resting, 3px selected. Same box, so nothing moves.
        'checked:border-3',

        invalid
          ? [
            //  §5 measures Figma's error border at #CC2132, nearest ZF step
            //  red/1400. `danger/default` is red/1300 — one step lighter,
            //  6.09:1 against 6.32:1, both far past 1.4.11's 3:1. Bound to the
            //  role because no role holds red/1400 and inventing one to close a
            //  0.23 gap in a passing value would be noise.
            'border-danger-default checked:border-danger-default',
            'hover:not-disabled:not-checked:ring-3 hover:not-disabled:not-checked:ring-danger-default/20',
            'checked:hover:not-disabled:border-danger-hover',
          ].join(' ')
          : [
            //  THE ONE VALUE THAT NEEDED A NEW ROLE. §5.1: Figma's resting
            //  border is 1.26:1 and the canon's proposed `neutral/600` is 1.31:1
            //  — both fail 1.4.11, and this is the state a radio is in almost
            //  all of the time. The first neutral step that clears 3:1 is
            //  `neutral/1100` at 4.52:1, which is what §10's own CSS uses.
            //  `border/control` was added to zf-colours.md for it.
            'border-border-default',
            'hover:not-disabled:not-checked:border-primary-default',
            'hover:not-disabled:not-checked:ring-3 hover:not-disabled:not-checked:ring-primary-default/20',
            'checked:border-primary-default',
            'checked:hover:not-disabled:border-primary-hover',
          ].join(' '),

        //  §4.5: the halo is on hover and UNCHECKED only. Figma carries it on
        //  six variants and shows it on two, and all four hidden ones are the
        //  checked column — "an abandoned decision rather than an oversight".
        //  §10 resolves it: `:checked:hover { box-shadow: none }`. Here the
        //  `not-checked:` on every halo class says the same thing declaratively.

        //  §5.2: a disabled radio in Figma is a pale disc whose border is
        //  1.121:1 against its own fill — invisible rather than dimmed.
        //  `border/disabled` against `surface/disabled` is no better, so this is
        //  reported rather than solved; §13 Q7.
        'disabled:bg-surface-disabled disabled:border-border-disabled disabled:cursor-not-allowed',
        'checked:disabled:border-primary-border',

        className,
      )}
      {...rest}
    />
  );
}
