import type { ElementType, ReactNode } from 'react';
import { Text } from '../../primitives';
import { cn } from '../../utils/cn';

/**
 * WIZARD — design-refs/zf-wizard.md. A stepper: where the user is in a flow, how
 * far they have come, how far is left.
 *
 * ── THREE FIGMA SETS, ONE COMPONENT ──────────────────────────────────────────
 * §7: `zf-step` and `zf-step-card` "are the same component wearing different
 * clothes". They share `State`, `Focused`, a purpose and a position, and
 * disagree on seven things — and in each one atom is right, but not consistently
 * the same atom. "That is the signature of two components maintained separately
 * rather than one component with a presentation variant."
 *
 * So there is one step here with a `variant`, driven by the orientation. The
 * state logic, the ARIA, the completion mark and the focus treatment are written
 * once and cannot drift.
 *
 * ── THE HEADLINE DEFECT, FIXED ───────────────────────────────────────────────
 * §2.1: in Figma a **completed card is indistinguishable from an upcoming one**.
 * Both carry `border/divider` — not a similar value, the same variable, so the
 * ratio is **1.00:1** — and the card has no tick, no green, no badge. The only
 * difference is the title's colour and weight: 3.35 Light, **2.65 Dark**.
 *
 * "Switching a wizard from `horizontal` to `tabs` loses the progress information
 * entirely, which is the one thing a stepper exists to convey." The card gets the
 * same `success/default` tick the marker atom already uses.
 */
export type StepState = 'upcoming' | 'current' | 'completed' | 'error';

export interface Step {
  id: string;
  label: string;
  state: StepState;
  /**
   * A second line under the label — "Add items and pricing". Both orientations.
   *
   * It costs two alignment fixes and they are worth stating, because both are
   * invisible until a description exists and then wrong everywhere:
   *
   * · the **label** is centred against the marker inside a 24-tall line box, not
   *   against the whole two-line block. Without that the marker sits at the
   *   optical centre of label-plus-description and reads a line too low.
   * · the **connector** is pinned to the marker's centre rather than the step's.
   *   A taller step drags a centre-aligned connector down with it, so the line
   *   between step 1 and step 2 stops meeting either of their markers.
   */
  description?: string;
  /**
   * §5 — a product decision per step, not a variant. Defaults by state:
   * completed and error are navigable, current and upcoming are not.
   *
   * A non-clickable step renders as a `<span>`, so it is out of the tab order
   * and cannot match `:hover` — no `disabled`, no `pointer-events: none`, no
   * state class. §8 notes this also sidesteps the trap that broke Checkbox and
   * Toggle, because there is no hidden input here.
   */
  clickable?: boolean;
}

export type WizardOrientation = 'horizontal' | 'vertical' | 'tabs';

export interface WizardProps {
  steps: Step[];
  orientation?: WizardOrientation;
  onStepClick?: (id: string) => void;
  /** Required — §9.4: an unlabelled `<ol>` of steps announces as a bare list. */
  label: string;
  className?: string;
}

/**
 * §9.1 — the visually-hidden state word. This is what closes the 1.4.1 failure
 * for a screen reader; the visible completion mark closes it for everyone else.
 * Both are needed. It also means `aria-current` on a `<span>` is belt-and-braces
 * rather than load-bearing, since support on a non-interactive element is uneven.
 */
const STATE_TEXT: Record<StepState, string> = {
  upcoming: 'not started',
  current: 'current step',
  completed: 'completed',
  error: 'needs attention',
};

/**
 * §3.1 — the ink extent IS the viewBox. The 9 × 6 path, inset by half of the 2px
 * `CENTER`-aligned stroke on every side, so the stroke lands flush at 11 × 8.
 * Same authoring rule as zf-checkbox.md §9.3; get it wrong by half a pixel and
 * the tick renders clipped or small.
 */
function Tick({ w = 11, h = 8 }: { w?: number; h?: number }) {
  return (
    <svg viewBox="0 0 11 8" width={w} height={h} aria-hidden focusable="false">
      <path
        d="M1 4.3 4.2 7 10 1"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

//  §4.1. Every one of these is a FILL except `upcoming`, which is the only
//  border. §4.4 says the wizard could take `border/control` cleanly where the
//  pill could not — no state sits on a border here for the rebind to flatten.
//
//  REVERTED ON REQUEST, 2026-08-24 to Figma's `border/divider`: 1.20:1, the
//  faintest role in the ramp. §2.1's finding stands and is now visible again —
//  a completed card and an upcoming card carry THE SAME border variable. What
//  still separates them is the green tick badge, which was the other half of
//  that fix and is untouched.
const markerClasses: Record<StepState, string> = {
  upcoming: 'border border-border-divider text-text-tertiary',
  current: 'bg-primary-selected text-primary-on-primary',
  completed: 'bg-success-default text-success-on-success',
  error: 'bg-danger-default text-danger-on-danger',
};

const labelTone: Record<StepState, 'tertiary' | 'default' | 'danger'> = {
  upcoming: 'tertiary', current: 'default', completed: 'default', error: 'danger',
};

//  §9.3 — the card's border. `danger/default` for error, NOT `danger/border`:
//  that is red/800 at 1.75:1 and fails 1.4.11, and the marker atom already uses
//  `danger/default` at 6.09 for the same state. Defect 3b, and fixing it also
//  removes a disagreement between the two atoms.
const cardBorder: Record<StepState, string> = {
  upcoming: 'border-border-divider',
  current: 'border-primary-selected',
  completed: 'border-border-divider',
  error: 'border-danger-default',
};

export function Wizard({
  steps, orientation = 'horizontal', onStepClick, label, className,
}: WizardProps) {
  const card = orientation === 'tabs';
  const vertical = orientation === 'vertical';

  return (
    //  §8: `role="list"` is NOT redundant. Safari with VoiceOver drops list
    //  semantics from an <ol> with `list-style: none`, and this component relies
    //  on the list for position — the numeral is aria-hidden precisely so it is
    //  not announced twice.
    <ol
      role="list"
      aria-label={label}
      className={cn(
        'flex list-none m-0 p-0',
        vertical && 'flex-col items-start',
        orientation === 'horizontal' && 'flex-row items-center gap-10',
        card && cn(
          'flex-row items-stretch gap-10 py-8 px-10',
          //  §4.3: Figma fills this with the PRIMITIVE neutral/100 — 1.04:1 in
          //  Light, and with one value it stays near-white in Dark while the
          //  page goes dark, so the strip and its contents swap polarity.
          //
          //  CORRECTED per zf-segmented.md's closing note. That file's track is
          //  the same recessed container, and it binds `surface/sunken`
          //  (neutral/400 Light, neutral/2100 Dark) — a role that has existed
          //  all along. zf-wizard.md §4.3 claimed no such role existed; I had
          //  checked for `surface/subtle`, the wrong name, and reported the
          //  family absent. The border workaround is gone.
          'bg-surface-sunken',
        ),
        className,
      )}
    >
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        const clickable = s.clickable ?? (s.state === 'completed' || s.state === 'error');
        //  §9.4: ElementType, NOT the inferred `'button' | 'span'` union — TS
        //  rejects spreading a `type` prop into that union, because `type` is
        //  not a valid prop on `span`.
        const Control: ElementType = clickable ? 'button' : 'span';

        //  §4.5: the travelled path. Figma paints every connector
        //  `border/divider`, so progress is both invisible (1.20:1) and
        //  undifferentiated. Green up to the current step, `border/control`
        //  after it — 4.52:1 rather than 1.20:1.
        const line = s.state === 'completed' ? 'bg-success-default' : 'bg-border-divider';

        const control = (
          <Control
            {...(clickable ? { type: 'button' as const, onClick: () => onStepClick?.(s.id) } : {})}
            {...(s.state === 'current' ? { 'aria-current': 'step' as const } : {})}
            className={cn(
              //  §9.2: `min-w-0` is REQUIRED. A flex item defaults to its
              //  min-content size, which with nowrap is the whole string — so
              //  without it the control cannot shrink and the label never
              //  truncates.
              //  `items-start`, not `items-center`. With a description the
              //  control is two lines tall and centring would drop the marker to
              //  the middle of both; the label's own 24-tall line box (below)
              //  is what actually holds the two together.
              'flex min-w-0 items-start gap-5 text-left',
              //  §9.2: no background. A prior Figma pass bound every set ROOT to
              //  `surface/default` to stop the sets vanishing on Figma's dark
              //  canvas, but instances inherit from the VARIANT, so it never
              //  reached them — and it should not. A step belongs on whatever
              //  surface hosts it, and `text/default` is already mode-aware.
              'bg-transparent border-0 p-0',
              clickable && 'cursor-pointer',
              //  §9.2: the outline radius is border-radius + offset, so xs (2)
              //  + 2 lands near Figma's 6. `radius/md` would draw 8–10 and read
              //  noticeably rounder than the ring Figma draws.
              'focus-visible:rounded-xs',
              card && cn(
                'flex-col items-start gap-4 py-10 px-16 rounded-xl border',
                'bg-surface-default shadow-raised',
                //  §9.3 / §2.3: a CONSTANT basis. Figma's card is HUG, and the
                //  title weight changes with state, so advancing a step makes
                //  the tab 2px wider and shifts every tab after it. Taking the
                //  width off the title entirely is what stops the reflow.
                'basis-step-card',
                cardBorder[s.state],
              ),
              !card && 'min-h-12',
            )}
          >
            {card ? (
              <>
                {/*
                  §2.1 THE FIX. The card control is a column, so the badge sits
                  above the title row rather than beside it — which is what a tab
                  wants anyway.
                */}
                {s.state === 'completed' ? (
                  <span className="inline-grid size-8 place-items-center rounded-full bg-success-default text-success-on-success">
                    <Tick w={8} h={6} />
                  </span>
                ) : null}
                <span className="flex min-w-0 items-baseline">
                  {/*
                    §9.4 / defect 7: the numeral comes from the array index.
                    Figma bakes it into the Title string ("1.  Overview", with
                    two spaces) so it cannot be counted, styled or reordered —
                    and the doc frame records the vertical layout once shipping
                    "3" on four consecutive steps because of it.
                  */}
                  <Text as="span" size="title" weight="semibold" aria-hidden
                    tone={s.state === 'upcoming' ? 'tertiary' : s.state === 'error' ? 'danger' : 'default'}
                    className="pr-2">
                    {i + 1}.
                  </Text>
                  {/* §2.3: ONE weight for all states. Figma's Regular/Semi Bold
                      split also groups `error` with `upcoming`, which is
                      backwards — a failed step is one the user has visited. */}
                  <Text as="span" size="title" weight="semibold" tone={labelTone[s.state]}
                    className="min-w-0">
                    {s.label}
                    <span className="sr-only"> — {STATE_TEXT[s.state]}</span>
                  </Text>
                </span>
              </>
            ) : (
              <>
                <span
                  aria-hidden
                  className={cn(
                    //  §3.1: 24 × 24, radius full. 13/16 Semi Bold is not in the
                    //  type scale at all — the nearest is `body` at 13/20
                    //  (defect 6). The marker is a centred grid, so the line box
                    //  does not matter and 13/20 fits inside 24px.
                    'grid size-12 shrink-0 place-items-center rounded-full box-border',
                    'text-body font-semibold',
                    markerClasses[s.state],
                  )}
                >
                  {s.state === 'completed' ? <Tick /> : i + 1}
                </span>
                <span className="flex flex-col min-w-0">
                  {/* `min-h-12` — the marker's own 24. The label centres in a box
                      the marker's height rather than in the whole two-line
                      block, so the two stay on one line whether or not there is
                      a description under them. `body` is 13/20, so the 24 also
                      gives it its 2px of optical room either side. */}
                  <span className="flex items-center min-h-12 min-w-0">
                    <Text as="span" size="body" weight="medium" tone={labelTone[s.state]}
                      truncate className="min-w-0">
                      {s.label}
                      <span className="sr-only"> — {STATE_TEXT[s.state]}</span>
                    </Text>
                  </span>
                  {/* `truncate` for the same reason the label has it: a step list
                      that wraps stops being a fixed rhythm and the connectors
                      stop lining up. */}
                  {s.description ? (
                    <Text as="span" size="body-sm" tone="secondary" truncate className="min-w-0">
                      {s.description}
                    </Text>
                  ) : null}
                </span>
              </>
            )}
          </Control>
        );

        if (card) {
          return <li key={s.id} className="flex flex-1 min-w-0">{control}</li>;
        }

        if (vertical) {
          return (
            <li key={s.id} className="flex w-full gap-5">
              {/*
                §3.3: Figma's vertical connector is a FIXED 30px frame, so the
                step pitch is frozen at 10 + 30 + 10 = 50 and cannot adapt. Here
                the line is a min-height that grows, so the default reproduces
                Figma exactly (74px marker-to-marker) and a wrapped label
                stretches it. The column is 24 wide, so the 1px line centres on
                the marker's axis with no magic number.
              */}
              <span aria-hidden className="flex w-12 shrink-0 flex-col items-center">
                <span className={cn('grid size-12 shrink-0 place-items-center rounded-full box-border',
                  'text-body font-semibold', markerClasses[s.state])}>
                  {s.state === 'completed' ? <Tick /> : i + 1}
                </span>
                {last ? null : <span className={cn('w-px flex-1 min-h-step-line my-5', line)} />}
              </span>
              <span className={cn('flex min-w-0 pt-3', last ? '' : 'pb-5')}>
                <Control
                  {...(clickable ? { type: 'button' as const, onClick: () => onStepClick?.(s.id) } : {})}
                  {...(s.state === 'current' ? { 'aria-current': 'step' as const } : {})}
                  className={cn('flex min-w-0 bg-transparent border-0 p-0 text-left focus-visible:rounded-xs',
                    clickable && 'cursor-pointer')}
                >
                  <Text as="span" size="body" weight="medium" tone={labelTone[s.state]} truncate
                    className="min-w-0">
                    {s.label}
                    <span className="sr-only"> — {STATE_TEXT[s.state]}</span>
                  </Text>
                </Control>
              </span>
            </li>
          );
        }

        return (
          //  §9.2: only NON-LAST steps grow. Give `flex-1` to every step and the
          //  last absorbs a share of the free space as trailing dead air,
          //  because it has no connector to spend it on.
          //  The li's gap supplies 20px between the control and the line; the
          //  <ol>'s gap supplies 20px between the line and the next control.
          //  Both are needed — a margin here would stack with the container gap
          //  and give 20 on one side and 40 on the other.
          <li key={s.id} className={cn('flex min-w-0 items-start gap-10', last ? 'flex-none' : 'flex-1')}>
            {control}
            {/* `mt-6` — half the marker's 24, so the line meets the marker's
                centre. It used to ride `items-center` on this row, which is the
                same place ONLY while every step is exactly one marker tall: add
                a description and the row grows, the centre moves down with it,
                and the line between two steps meets neither of their markers. */}
            {last ? null : <span aria-hidden className={cn('h-px flex-1 min-w-12 mt-6', line)} />}
          </li>
        );
      })}
    </ol>
  );
}

export interface WizardPanelProps { children: ReactNode }
/** The body a step reveals. A slot — the wizard does not own its content. */
export function WizardPanel({ children }: WizardPanelProps) {
  return <div className="pt-10">{children}</div>;
}
