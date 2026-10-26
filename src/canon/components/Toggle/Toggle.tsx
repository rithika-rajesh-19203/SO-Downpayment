import { useId } from 'react';
import { Inline, Stack, Text } from '../../primitives';
import { cn } from '../../utils/cn';

/**
 * TOGGLE — design-refs/zf-toggle.md **rev 2**. That file is an implementation
 * spec: "**Where this file and Figma disagree, this file wins.**"
 *
 * A binary switch that takes effect immediately — flipping it IS the action, so
 * there is no Save. §7 has the decision rule against a checkbox.
 *
 * ── THE ONE DELIBERATE, VISIBLE CHANGE ───────────────────────────────────────
 * §2: the white knob is **1.48:1** against the off track, and knob position is
 * the only thing that says whether the switch is on. The track is also 1.48:1
 * against the page, so the control barely reads as a control until it is on.
 *
 * §2.1 measures two fixes and only one passes. **Option A — darken the track to
 * `neutral/1100`** — clears both boundaries at 4.52:1 with no knob border at all.
 * Option B (a knob border) was rev 1's recommendation and rev 2 retracts it:
 * 3.06:1 was measured against the *literal* `#D3D3E5`, and **neither `#D3D3E5`
 * nor `#BCBCD1` is a ZF primitive**, so a real build cannot have that number.
 * Against the nearest primitive it is 2.95 and fails.
 *
 * §9.6: "**If it renders light grey, someone restored `#D3D3E5` or bound it to
 * `neutral/700` — both fail.**"
 *
 * ── THE ROLES CARRYING THAT VALUE ────────────────────────────────────────────
 * `border/control` is exactly `neutral/1100`, which §2.1 names as "the exact
 * value the proposed `border/control` role needs". `border/control-hover` was
 * added alongside it for the hovered track — nothing else held `neutral/1200`.
 *
 * Both are used here as a FILL rather than a border, which is the role-meaning
 * problem §4 catalogues running the other way. The values are right and no other
 * role holds them; the clean answer is a `control/track` family, which is a
 * naming decision. Recorded in docs/BACKLOG.md.
 */
const sizeClasses = {
  md: { track: 'w-toggle-w h-toggle-h', knob: 'size-toggle-knob', travel: 'translate-x-6' },
  sm: { track: 'w-toggle-w-sm h-toggle-h-sm', knob: 'size-toggle-knob-sm', travel: 'translate-x-5' },
} as const;

export type ToggleSize = keyof typeof sizeClasses;

export interface ToggleProps {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  /**
   * REQUIRED. §3.4: both sizes fail WCAG 2.5.8 — 18px and 14px tall against a
   * 24px minimum, "in a dimension not an area". The label is the hit area and
   * the only thing that fixes it. §9.3: "Making it optional invites the failure
   * back."
   */
  label: string;
  size?: ToggleSize;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  name?: string;
  className?: string;
}

export function Toggle({
  checked, onCheckedChange, label, size = 'md',
  error, errorMessage, disabled, name, className,
}: ToggleProps) {
  const id = useId();
  const errId = `${id}-err`;
  const s = sizeClasses[size];
  //  §9.3: only set aria-describedby when the message renders — a dangling IDREF
  //  announces nothing.
  const showErr = Boolean(error && errorMessage);

  return (
    <Stack gap={0} className={className}>
      {/*
        §8: HOVER GOES ON THE WRAPPER. The input is visually hidden with
        `pointer-events: none`, so it can never match `:hover` — a rule written
        against the input "is dead code that silently does nothing". `group` is
        how that is expressed here.
      */}
      <label
        className={cn(
          //  §9.2: 8px gap, min-height 24 — the 2.5.8 fix.
          'group relative flex items-center gap-4 min-h-12',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        )}
      >
        <input
          id={id}
          name={name}
          type="checkbox"
          //  §9.1: this is what changes the announcement from "checkbox, ticked"
          //  to "switch, on".
          role="switch"
          className="peer absolute size-px opacity-0 pointer-events-none m-0 p-0"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          disabled={disabled}
          aria-invalid={error || undefined}
          aria-describedby={showErr ? errId : undefined}
        />

        <span
          aria-hidden
          className={cn(
            //  §3: padding 2 on both sizes; radius carries the intent rather
            //  than Figma's literal 20 / 16, both of which already exceed half
            //  the height.
            'relative flex shrink-0 items-center rounded-full p-1 box-border',
            'transition-colors duration-150',
            s.track,
            disabled
              //  §4.2: the DEFAULT track at 50%, not the hover track Figma uses,
              //  and not `primary/border` — that resolves to blue/800 and
              //  composites to 1.28:1, worse than what Figma ships.
              ? cn('opacity-50', checked ? 'bg-primary-default' : 'bg-border-control')
              : checked
                ? 'bg-primary-default group-hover:bg-primary-hover'
                : 'bg-border-control group-hover:bg-border-control-hover',
            //  §9.2: the error ring goes OUTSIDE the track with a 1px
            //  page-coloured spacer, so it is measured against the page —
            //  6.09:1 Light, 5.56:1 Dark. An INSET ring shares an edge with the
            //  track and is 1.35:1 Light and 1.05:1 Dark on the on-state.
            //  `ring-offset` produces exactly the md's two-layer shadow, and a
            //  shadow paints outside the border box so the knob does not move.
            //  Suppressed when disabled: opacity 50% would fade it to 1.20:1,
            //  "which reads as a rendering bug, not as an error".
            error && !disabled && 'ring-2 ring-danger-default ring-offset-1 ring-offset-surface-default',
            //  §4.3 / §9.2: `focus/ring`, the same ring as the button and the
            //  input field — five components carry four ring colours today.
            //  KEEP THE OFFSET. At 0 the ring touches the track: 1.05:1 off and
            //  1.00:1 on, where focus/ring and primary/default are both
            //  blue/1200. Error pushes it to 5px so the two read as separate
            //  rings instead of one thick red band.
            'peer-focus-visible:outline-2',
            error && !disabled
              ? 'peer-focus-visible:outline-danger-default peer-focus-visible:outline-offset-5'
              : 'peer-focus-visible:outline-focus-ring peer-focus-visible:outline-offset-2',
          )}
        >
          <span
            className={cn(
              //  §4.1: `surface/raised`, NOT `surface/default` and NOT
              //  base-white. "A switch knob should read as a raised object
              //  sitting on the track." Identical in Light; in Dark raised is
              //  the lighter of the two, which is what a knob wants.
              //  §9.2: NO BORDER. Option A does not need one, and a 1px border
              //  with border-box would show 1px of track through the knob's
              //  edge, shrinking the visible knob from 14px to 12px.
              'block rounded-full bg-surface-raised transition-transform duration-150',
              s.knob,
              //  §3: travel = width − 2·padding − knob, which is 12 and 10.
              //  `transform`, not `justify-content` — Figma's MIN/MAX alignment
              //  would be an un-animatable jump, and a transform stays on the
              //  compositor.
              checked ? s.travel : 'translate-x-0',
            )}
          />
        </span>

        <Text as="span" size="body" tone={disabled ? 'disabled' : 'default'}>{label}</Text>
      </label>

      {showErr ? (
        //  §9.3: the indent derives from the track width rather than a hardcoded
        //  38px — the small track is 24px, so a fixed value over-indents by 6px.
        <Inline gap={4} className="mt-2">
          <span aria-hidden className={cn('shrink-0', s.track, 'h-0')} />
          <Text id={errId} size="body-sm" tone="danger" role="alert">{errorMessage}</Text>
        </Inline>
      ) : null}
    </Stack>
  );
}
