import { useId, useRef, useState } from 'react';
import { Icon } from '../../icons';
import { Stack, Text } from '../../primitives';
import { cn } from '../../utils/cn';

/**
 * INPUT STEPPER — design-refs/zf-input-stepper.md. A numeric input with
 * increment and decrement chevrons.
 *
 * §7 — when NOT to use it: "If a user is more likely to type the number than to
 * click, use a plain field", and "if the step is not obvious, a stepper lies. A
 * ± button implies a natural increment."
 *
 * ── THE HEADLINE DEFECT, FIXED ───────────────────────────────────────────────
 * §2: `zf-stepper-field` has a `Tone` axis and `zf-stepper` has a `Validation`
 * axis with the same three values — and **all six field variants embed
 * `Validation=none`**. So `Tone=error` changes the help icon and the help text
 * colour, and leaves the field's border `border/default` grey.
 *
 * "A user is told there is an error by a line of small print beneath a control
 * that looks completely normal." The 16 correct variants exist, are complete,
 * and are bound to the right roles — 4.56 and 6.09, which would be the strongest
 * boundary this component has. They are simply not selected.
 *
 * Here one `tone` drives the border AND the message. There is no second place to
 * forget, which is why this class of bug cannot recur in code.
 */
export type StepperTone = 'neutral' | 'success' | 'error';

export interface StepperProps {
  value: number;
  onValueChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  tone?: StepperTone;
  disabled?: boolean;
  readOnly?: boolean;
  /** §3.2 — `Position=left`. Reversed child order, never a rotation. */
  btnsLeft?: boolean;
  /** Required unless the control is inside a `StepperField`, which supplies it. */
  label: string;
  id?: string;
  describedBy?: string;
  className?: string;
}

//  §4.4 / §9.4. Four `border/*` uses fail 1.4.11 here — the field border at
//  1.31, hover at 2.85, and the internal divider and button rule at **1.20**,
//  the worst role in the ramp. The md binds all three static ones to
//  `border/control` (4.52).
//
//  REVERTED ON REQUEST, 2026-08-24: all four are back on Figma's own roles, so
//  all four failures stand as measured. The VALIDATION colours below are
//  unaffected — §2 was a wiring defect, not a colour one, and success/default
//  (4.56) and danger/default (6.09) are Figma's own values.
//
//  §11 decision 2 was CONTINGENT and no longer applies. It said: once the
//  resting border is 4.52, `border/hover` at 2.85 is *lighter* than it and
//  inverts the feedback, so hover must move to `text/secondary` at 6.79. With
//  the resting border back at Figma's 1.31, that premise is gone — 1.31 → 2.85
//  darkens correctly, which is what Figma does. Hover is back on `border/hover`.
//
//  Validated hover DARKENS THE SAME HUE rather than dropping to grey. §2.1:
//  within `zf-stepper`, `Validation` overrides `State` on the border, so all
//  four of default/hover/focus/active carry one colour and "hover is silently
//  dead on exactly the fields a user is most likely to be interacting with".
const TONE_BORDER: Record<StepperTone, string> = {
  neutral: 'border-border-default hover:border-border-hover',
  success: 'border-success-default hover:border-success-text',
  error: 'border-danger-default hover:border-danger-text',
};

//  §2 / §9.3 — the glyph changes with the tone, not just the colour, so an error
//  is carried by shape and words as well as hue. Figma already does this half
//  correctly; it is the border half that never fired.
const TONE_ICON = { neutral: 'info', success: 'check-circle', error: 'alert-circle' } as const;
const TONE_TEXT: Record<StepperTone, 'secondary' | 'success' | 'danger'> = {
  neutral: 'secondary', success: 'success', error: 'danger',
};

export function Stepper({
  value, onValueChange, min = -Infinity, max = Infinity, step = 1,
  tone = 'neutral', disabled, readOnly, btnsLeft, label, id, describedBy, className,
}: StepperProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  //  §9.3 — a CONTROLLED number input needs a draft string while the user types.
  //  Clamping inside onChange makes the field un-clearable: an empty input gives
  //  valueAsNumber NaN, the change is dropped, React re-renders the old value and
  //  the caret fights back. It also snaps mid-typing — with min=1900, typing "2"
  //  toward 2024 jumps straight to 1900. Clamp on blur and on step.
  const [draft, setDraft] = useState<string | null>(null);
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  const commit = () => {
    if (draft === null) return;
    const n = Number(draft);
    onValueChange(draft.trim() === '' || Number.isNaN(n) ? value : clamp(n));
    setDraft(null);
  };

  const nudge = (delta: number) => {
    setDraft(null);
    onValueChange(clamp(value + delta * step));
    inputRef.current?.focus();   // the buttons are tabIndex -1; keep the caret
  };

  const inert = disabled || readOnly;

  const btn = (dir: 'up' | 'down') => {
    const atBound = dir === 'up' ? value >= max : value <= min;
    return (
      <button
        type="button"
        tabIndex={-1}
        //  §9.1 — interpolate the field's label. Figma's buttons contain a
        //  chevron and nothing else, so without this they announce as "button",
        //  twice, indistinguishably. Ten steppers on a page would otherwise
        //  produce twenty identically-named buttons.
        aria-label={`${dir === 'up' ? 'Increase' : 'Decrease'} ${label}`}
        //  §9.3 / defect 8 — Figma has no concept of a bound, so a stepper at
        //  its maximum currently looks fully operable.
        disabled={disabled || readOnly || atBound}
        onClick={() => nudge(dir === 'up' ? 1 : -1)}
        className={cn(
          //  §9.2 — `flex-none` with an explicit height, NOT `flex: 1 1 0`. Two
          //  border-box buttons splitting a 34px column by flex-basis would get
          //  16.5 and 15.5, because the first carries a 1px border in its base.
          //  That is a half-pixel-off divider and two unequal targets.
          'flex-none h-stepper-btn-h grid place-items-center p-0 border-0 bg-transparent',
          'text-icon-default',
          //  §3.1 — the rule between the buttons belongs to `up`.
          dir === 'up' && 'border-b border-border-divider',
          inert || atBound
            ? 'text-icon-disabled cursor-not-allowed'
            : cn(
              'cursor-pointer',
              //  §4.3 — these fills are 1.08 and 1.12 against the field. Almost
              //  invisible. What a user actually perceives is the CHEVRON going
              //  6.79 → 14.05 → 3.84 with a hue shift on press. The fills are
              //  decoration — worth knowing before someone "fixes" a state by
              //  adjusting one.
              'hover:bg-surface-hover hover:text-text-default',
              //  §5 / defect 3 — `:active` scopes to the button that received
              //  the pointer. Figma's `State=active` lives on the CONTAINER and
              //  sets BOTH chevrons active, so pressing anywhere lights up and
              //  down together. In CSS the correct behaviour is free.
              'active:bg-surface-sunken active:text-primary-default',
            ),
        )}
      >
        <Icon name={dir === 'up' ? 'chevron-up' : 'chevron-down'} size="sm" tone="inherit" />
      </button>
    );
  };

  return (
    <div
      className={cn(
        'inline-flex items-stretch box-border self-start overflow-hidden',
        'w-stepper h-control rounded-md',
        'border',
        //  §3.2 — `Position=left` reverses child order. The doc frame records
        //  the previous build ROTATING the column −180°, which carried the radii
        //  and the up/down order with it.
        btnsLeft && 'flex-row-reverse',
        //  §9.2 — the ring is on the wrapper at a real 2px offset, matching
        //  Figma's 2px CENTER stroke at −3 (spanning −4…−2). An element's own
        //  outline is not clipped by its own `overflow: hidden`, so this paints.
        'focus-within:outline-2 focus-within:outline-offset-2',
        disabled
          ? 'bg-surface-disabled border-border-disabled'
          : cn(
            readOnly ? 'bg-surface-sunken' : 'bg-surface-default',
            //  The tone classes are applied CONDITIONALLY rather than restated
            //  at higher specificity. §9.2 needs two extra `[data-tone]:hover`
            //  rules because `:hover` at (0,3,1) beats `[data-tone]` at (0,2,0)
            //  "regardless of source order" — and warns they are required, not
            //  redundant. Not emitting the class is the construction nothing can
            //  break; same reasoning as Segmented.
            readOnly ? 'border-border-default' : TONE_BORDER[tone],
            //  §2.1 — a validated field KEEPS its hue on focus and lets the ring
            //  carry focus. Only a neutral field turns blue.
            tone === 'neutral'
              ? 'focus-within:border-primary-default focus-within:outline-focus-ring'
              : tone === 'success'
                ? 'focus-within:outline-success-default'
                : 'focus-within:outline-danger-default',
          ),
        className,
      )}
    >
      <input
        ref={inputRef}
        id={id}
        type="number"
        value={draft ?? value}
        min={min === -Infinity ? undefined : min}
        max={max === Infinity ? undefined : max}
        step={step}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={tone === 'error' || undefined}
        aria-describedby={describedBy}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}
        className={cn(
          'min-w-0 flex-1 border-0 bg-transparent px-5 outline-none',
          'text-body font-regular',
          //  §9.4 / defect 7 — Figma left-aligns the value. A column of steppers
          //  cannot be compared digit-by-digit that way.
          'text-right',
          disabled ? 'text-text-disabled cursor-not-allowed' : 'text-text-default',
          //  We draw our own chevrons, so the browser's spinner must go.
          '[&::-webkit-outer-spin-button]:appearance-none',
          '[&::-webkit-inner-spin-button]:appearance-none',
          '[&::-webkit-inner-spin-button]:m-0',
        )}
      />
      <div
        className={cn(
          'flex flex-col flex-none w-stepper-btn h-control box-border',
          //  §9.2 — THE TRICK. Figma's column is the container's FULL height,
          //  sitting ON the 1px border rather than inside it, so the divider
          //  meets the outer edge. As a plain flex child it would be laid out in
          //  the 32px content box. Pulling it 1px past each edge restores
          //  17 + 17, and the wrapper's `overflow-hidden` clips it back to the
          //  radius — which is what Figma's radius-5 clipping frame does (6 − 1).
          '-my-px',
          btnsLeft ? 'border-e border-border-divider' : 'border-s border-border-divider',
        )}
      >
        {btn('up')}
        {btn('down')}
      </div>
    </div>
  );
}

export interface StepperFieldProps extends Omit<StepperProps, 'id' | 'describedBy'> {
  /** Help text, or the error text when `tone` is `error`. */
  help?: string;
  /** §3.3 — Figma's `Layout=left`. */
  inline?: boolean;
}

/**
 * The composite — label + control + help. `tone` is passed to BOTH halves, and
 * that single duplication is the whole fix for §2: a caller cannot colour the
 * message without colouring the border.
 */
export function StepperField({ label, help, inline, className, ...control }: StepperFieldProps) {
  const id = useId();
  const helpId = `${id}-help`;
  const tone = control.tone ?? 'neutral';

  const message = help ? (
    <span className="flex items-center gap-2">
      <Icon name={TONE_ICON[tone]} size="sm" tone="inherit" />
      <Text as="span" size="body-sm" tone={TONE_TEXT[tone]}>{help}</Text>
    </span>
  ) : null;

  //  §9.1 — the control column. In the inline layout this wrapper is what keeps
  //  the help text UNDER the stepper instead of beside it. Figma's Layout=left
  //  has exactly this frame (170 × 56, VERTICAL, gap 6); without it the row
  //  direction puts label, control AND help all on one line.
  const column = (
    <Stack gap={3} className="w-stepper">
      <Stepper {...control} label={label} id={id} describedBy={help ? helpId : undefined} />
      {message ? <span id={helpId}>{message}</span> : null}
    </Stack>
  );

  if (inline) {
    return (
      <div className={cn('flex items-start gap-6', className)}>
        {/*
          §3.3 / defect 10 — Figma nudges this label with `padding-top: 7`, which
          is off the spacing scale (6 and 8 exist). (34 − 20) / 2 = 7 is the
          arithmetic; expressing it as centring against the control's height
          keeps it honest and rescales if the control does.
        */}
        <label htmlFor={id} className="flex flex-none w-stepper-label min-h-control items-center">
          <Text as="span" size="body" tone={control.disabled ? 'disabled' : 'default'}>{label}</Text>
        </label>
        {column}
      </div>
    );
  }

  return (
    <Stack gap={3} className={className}>
      <label htmlFor={id}>
        <Text as="span" size="body" tone={control.disabled ? 'disabled' : 'default'}>{label}</Text>
      </label>
      {column}
    </Stack>
  );
}
