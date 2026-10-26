import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { Icon } from '../../icons';
import type { IconName } from '../../icons';
import { Text } from '../../primitives';
import { cn } from '../../utils/cn';

/**
 * BUTTON — design-refs/zf-button.md. 208 Figma variants across four sets.
 *
 * ── WHY THIS IS ONE COMPONENT AND NOT FOUR ───────────────────────────────────
 * The sharpest test in CLAUDE.md is: if two values need different HTML, they are
 * different components. Applied to the four sets:
 *
 *   Button        <button>                       ─┐ same element, so one
 *   Button Icons  <button> with no text child     ─┘ component
 *   Hyperlink     <a>                              different element
 *   Split Button  two interactive regions          different element
 *
 * So `Button Icons` is not a component. It is this component with no children —
 * which also dissolves md defect 4, where the Figma set declares a `Label` TEXT
 * property and contains zero text nodes to put it in. Here the label is the
 * children, and its absence is what makes the button icon-only. 96 + 96 Figma
 * variants collapse into one API.
 *
 * `Hyperlink` and `Split Button` are separate components, still queued.
 *
 * ── AND WHY STATE IS NOT A PROP ──────────────────────────────────────────────
 * Figma's fourth axis is `State` = Default / Hover / Focus / Disabled. A button
 * is a `<button>`, so all four are native pseudo-classes and inventing props for
 * them would mean the component could render "hover" while the pointer is
 * elsewhere. md §11 reaches the same conclusion. That removes a factor of four.
 *
 * 4 intents x 2 emphases x 3 sizes = 24 real variants.
 */

const sizeClasses = {
  lg: 'h-button-lg px-6 gap-5', // 32px tall, 12px sides, 10px gap
  md: 'h-button-md px-4 gap-5', // 30px, 8px, 10px
  sm: 'h-button-sm px-3 gap-3', // 28px, 6px, 6px
} as const;

/**
 * PRIMARY — a filled button. The intent owns the fill; the label is the matching
 * `on-*` role, which is the one role whose entire job is to be legible on it.
 *
 * `success` and `warning` have no `{family}/active` role, so their pressed state
 * reuses hover and a press produces no visible change. Only `primary` and
 * `danger` have one. Flagged in docs/BACKLOG.md — it is four token rows, not a
 * component fix.
 */
const primaryClasses = {
  default: 'bg-primary-default text-primary-on-primary hover:bg-primary-hover active:bg-primary-active',
  //  No pressed class on these two: there is no `success/active` or
  //  `warning/active` role, and pointing a pressed class at the hover role would
  //  be a no-op, since pressing implies hovering and the two would never
  //  compete. Leaving it off states the gap rather than papering over it. A
  //  press on these two produces no visible change; that is four token rows,
  //  recorded in docs/BACKLOG.md.
  //
  //  NB: do not write the literal class name in this comment. Tailwind v4 scans
  //  raw source text and does not parse comments, so naming a class here emits
  //  the rule — the first draft of this comment shipped a dead
  //  `.active\:bg-success-hover` into the bundle.
  success: 'bg-success-default text-success-on-success hover:bg-success-hover',
  warning: 'bg-warning-default text-warning-on-warning hover:bg-warning-hover',
  danger: 'bg-danger-default text-danger-on-danger hover:bg-danger-hover active:bg-danger-active',
} as const;

/**
 * SECONDARY — the intent rides the LABEL, not the fill and not the border.
 *
 * md §5.4 measures Secondary's border at 1.31:1 and records that no `border/*`
 * role in the system reaches the 3:1 of WCAG 1.4.11. We measured the intent
 * borders too, and they are no better: `success/border` 1.42, `warning/border`
 * 1.69, `danger/border` 1.75. So an intent-coloured border would fail exactly as
 * hard while looking like it had solved something.
 *
 * The `{family}/text` roles, by contrast, clear it comfortably on the button's
 * own fill — 5.92 / 8.06 / 7.77 / 7.04 in Light and higher in Dark. So the label
 * carries the intent, legibly, and the border stays neutral.
 *
 * This is an extension beyond the md, which states no per-intent Secondary values
 * at all — its own CSS has one `.zf-btn--secondary` rule. Without it `intent`
 * would be a prop that does nothing on half the matrix, which is CLAUDE.md's
 * fourth test for a fake axis: one value making another axis irrelevant. It is
 * also the correct use of these roles, which is the point of md §4: bind to the
 * role that MEANS the right thing.
 *
 * ── TWO VALUES HERE DIVERGE FROM §5.3, AND NO ROLE CAN CLOSE THEM ────────────
 * §5.3 measures the Secondary rest fill as `neutral/100` #FAFAFC and the hover
 * fill as `neutral/200` #F7F8FC. **No semantic role holds either step** —
 * `surface/default` and `surface/raised` are both `base/white`, and
 * `surface/hover` is `neutral/300`. So this renders white on rest (15.15:1
 * against §5.3's 14.54) and `neutral/300` on hover (14.05 against 14.28).
 *
 * Left as roles rather than closed with two new tokens, because §5.4 says the
 * fill is doing no work anyway: "#FAFAFC against a white page is 1.04:1, so the
 * fill contributes nothing, and the border is doing all the work of saying this
 * is a control." White makes that literal. If design wants the hair of
 * separation back it needs a role, not a component change.
 */
const secondaryClasses = {
  default: 'text-text-default',
  success: 'text-success-text',
  warning: 'text-warning-text',
  danger: 'text-danger-text',
} as const;

//  §5.4 measures this border at 1.31:1 and §11's CSS calls for `neutral/1100`
//  (4.52). When Button was built no role held that value, so `border/default`
//  went in with a flag. `border/control` exists now — created for Radio, and
//  zf-pill.md §4.4a warns that rebinding can flatten whatever state change sat
//  on the border. It does not here: Secondary's hover is a FILL change
//  (`surface/hover`), so the border carries no state. Same reasoning that made
//  the wizard safe to rebind first.
const SECONDARY_BASE =
  'bg-surface-default border-border-default hover:bg-surface-hover active:bg-surface-pressed';

/**
 * DISABLED is one appearance for all eight intent x emphasis combinations, and
 * it is deliberately NOT a tinted version of the intent.
 *
 * Figma fills a disabled Primary with `{hue}/800` and keeps the white label,
 * which md §5.3 measures at 1.42 - 1.75:1 — exempt from 1.4.3, but "close enough
 * to invisible that the label is effectively gone". It also reaches that tint
 * through `{family}/border`, a border role used as a fill, which is md defect 6.
 *
 * `surface/disabled` + `text/disabled` is 1.89:1 — still low, still exempt, but
 * better than every value it replaces, and it says "disabled" rather than "a
 * faded danger button". A disabled control has no intent left to communicate.
 */
const DISABLED = 'bg-surface-disabled text-text-disabled border-border-disabled cursor-not-allowed';

/**
 * WHERE A BUTTON SITS IN A JOINED GROUP, and it is a radius question only.
 *
 * A joined trio shares its borders so it reads as one control with three
 * settings. `zf-action-bar.md` §3.3 builds that with a −1px margin on every
 * child after the first — but the overlap alone leaves each button's own rounded
 * corners meeting at the seam, which is what the reference does NOT show: one
 * outer radius, hairline dividers, square internal corners.
 *
 * This lives on `Button` rather than being overridden from outside, and that is
 * the whole point. §8 of the action-bar spec is blunt that a caller must not
 * restyle the button family — *"a BEM modifier is specificity (0,1,0); a scoped
 * descendant rule is (0,2,0) and silently beats the button's own --secondary,
 * --danger and :disabled rules"*. The Tailwind equivalent is the same hazard by
 * a different route: `rounded-e-none` passed in `className` sits beside the
 * base's `rounded-md` at equal specificity, and the STYLESHEET's order decides
 * which wins, not the className's.
 *
 * As a prop it resolves to exactly one branch in the one place the radius is
 * chosen, so the conflict cannot be expressed.
 */
const joinRadius = {
  start: 'rounded-s-md rounded-e-none',
  middle: 'rounded-none',
  end: 'rounded-s-none rounded-e-md',
} as const;

export type ButtonJoin = keyof typeof joinRadius;

/**
 * The icon slot grows with the button — **16 / 14 / 12**, which is `icon-md`,
 * `icon-sm` and `icon-xs` on the shared ramp. No component-specific token, and
 * nothing off the scale.
 *
 * This DIVERGES from zf-button.md §2, which measures 13 / 12 / 11. Two reasons
 * to prefer this ramp, and it is a recorded decision rather than a
 * transcription — see docs/BACKLOG.md:
 *
 *   - 13 and 11 are on no scale in this system, and both carry the signature of
 *     the scaling artefacts zf-icons.md §3.3 catalogues — 16/14 and 16/7 style
 *     residue from glyphs authored in one box and resized into another.
 *   - 13 -> 11 is an 18% span across the whole ramp, which reads as drift rather
 *     than as a decision. 16 -> 12 is 33%, and lands on three slots that already
 *     exist.
 *
 * The key names read oddly and correctly: a MEDIUM button takes the SMALL icon
 * slot. They are two different scales that happen to share words.
 */
const iconSlot = {
  lg: 'md', // 16
  md: 'sm', // 14
  sm: 'xs', // 12
} as const;

/** Icon-only is square: the height, with the side padding dropped to match. */
const iconOnlyWidth = {
  lg: 'h-button-lg w-button-lg',
  md: 'h-button-md w-button-md',
  sm: 'h-button-sm w-button-sm',
} as const;

export type ButtonIntent = keyof typeof primaryClasses;
export type ButtonEmphasis = 'primary' | 'secondary';
export type ButtonSize = keyof typeof sizeClasses;

interface ButtonBase extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'children'> {
  /** What the action means. Owns the fill on `primary`, the label on `secondary`. */
  intent?: ButtonIntent;
  /** How loudly it asks. `primary` is filled; `secondary` is outlined. */
  emphasis?: ButtonEmphasis;
  size?: ButtonSize;
  /** Leading glyph. Defaults to none — Figma defaults both icons to `true`, md defect 7. */
  icon?: IconName;
  /** Trailing glyph — a chevron on a menu trigger, an arrow on a "next". */
  /**
   * Trailing glyph. A roster name takes the button's own slot (16/14/12 by
   * size); pass a node to choose the slot yourself — a dropdown caret wants
   * `size="caret"`, which is smaller than any button slot.
   */
  iconRight?: IconName | ReactNode;
  /**
   * Native `type`. Defaults to `'button'`: the default in HTML is `'submit'`, so
   * an unmarked button inside a form submits it. md §2.11.6 records that exact
   * bug on the stepper arrows.
   */
  type?: 'button' | 'submit' | 'reset';
  /**
   * Position in a joined group — `start`, `middle` or `end`. Squares off the
   * corners that meet a neighbour and leaves the outer ones alone. Omit it for a
   * button standing on its own, including the only button in a group of one.
   *
   * The caller still supplies the −1px overlap; this is only the radius.
   */
  join?: ButtonJoin;
  /**
   * The underlying `<button>`. Needed by anything that has to MEASURE this
   * control or hand focus back to it — a `Menu` anchors off its rect and returns
   * focus here on Escape, and neither is possible through props.
   *
   * A plain prop rather than `forwardRef`: React 19 passes `ref` to function
   * components directly, and the wrapper `forwardRef` adds would show up in the
   * tree and in every stack trace for no gain.
   */
  ref?: Ref<HTMLButtonElement>;
  className?: string;
}

/**
 * The label is the children. With no children the button is icon-only, and then
 * `label` is REQUIRED — an icon-only control with no accessible name announces
 * as "button" and nothing else. The union enforces it at compile time rather
 * than hoping a review catches it.
 */
export type ButtonProps = ButtonBase & (
  | { children: ReactNode; label?: string }
  | { children?: never; label: string }
);

export function Button({
  intent = 'default',
  emphasis = 'primary',
  size = 'md',
  icon,
  iconRight,
  label,
  type = 'button',
  join,
  ref,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  const iconOnly = children === undefined;

  //  Chosen in JS rather than through Tailwind's `disabled:` variant on purpose.
  //  `:disabled` and `:hover` have equal specificity, so which one wins would be
  //  decided by the order Tailwind happens to emit them in. Picking here means a
  //  disabled button simply never carries a hover class.
  const look = disabled
    ? DISABLED
    : emphasis === 'primary'
      ? `${primaryClasses[intent]} border-transparent`
      : `${SECONDARY_BASE} ${secondaryClasses[intent]}`;

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-label={iconOnly ? label : undefined}
      className={cn(
        'inline-flex items-center justify-center shrink-0 select-none',
        'border transition-colors',
        join ? joinRadius[join] : 'rounded-md',
        iconOnly ? iconOnlyWidth[size] : sizeClasses[size],
        look,
        className,
      )}
      {...rest}
    >
      {/* `tone="inherit"` throughout: the button owns the colour, and a glyph or
          label that re-declared it would drift the moment an intent changed.
          md §2.7.6 found 108 orphan icon paints from exactly that. */}
      {icon ? <Icon name={icon} size={iconSlot[size]} tone="inherit" /> : null}
      {children === undefined ? null : (
        <Text
          as="span"
          size={size === 'sm' ? 'body-sm' : 'body'}
          weight="medium"
          tone="inherit"
          truncate
        >
          {children}
        </Text>
      )}
      {typeof iconRight === 'string'
        ? <Icon name={iconRight as IconName} size={iconSlot[size]} tone="inherit" />
        : iconRight}
    </button>
  );
}
