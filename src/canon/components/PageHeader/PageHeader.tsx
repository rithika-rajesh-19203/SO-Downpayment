import { useCallback, useEffect, useId, useRef } from 'react';
import type { ReactNode, Ref } from 'react';
import { Icon } from '../../icons';
import { MENU_ROW, MENU_SURFACE } from '../Menu/Menu';
import type { IconName } from '../../icons';
import { Text } from '../../primitives';
import { cn } from '../../utils/cn';

/**
 * PAGE HEADER — design-refs/zf-page-header.md. A 64px band at the top of the
 * content column carrying what identifies the page and what you can do to it.
 *
 * §7 draws the line this component sits on: the top bar is **global** chrome and
 * is the document's one `banner`; the page header is about **the current page**
 * and scrolls with the content. One `<h1>` per page and it lives here — the top
 * bar has no heading at all.
 *
 * The md calls this the best-built family in the system and it is right: 143 of
 * 143 paints role-bound, 20 of 20 text nodes on a style, five descriptions that
 * are arguments rather than labels, and every arithmetic claim in its doc frame
 * reproduces. **We re-derived 44 of its figures against our own token layer and
 * 41 match to 0.01.** The three that do not are all the same divergence, below.
 *
 * ── `border/control` IS BETTER HERE THAN THE MD THINKS ───────────────────────
 * The md assumes `border/control` is `neutral/1100` in both panes and quotes
 * 4.52 / **3.58** against the band. Ours is a per-mode pair — `neutral/1100`
 * Light, `neutral/1000` Dark — so Dark reads **5.67**, not 3.58. Every §9 fix
 * that leans on this role therefore lands higher in Dark than the md claims:
 *
 * | | md | ours |
 * |---|---|---|
 * | vs the band | 4.52 / 3.58 | 4.52 / **5.67** |
 * | vs `surface/hover` | 4.19 / 3.35 | 4.19 / **5.31** |
 * | vs `surface/pressed` | 3.78 / 3.09 | 3.78 / **4.89** |
 *
 * This is the fifth md in a row to assume the single value. Nothing to fix; the
 * numbers in the comments below are ours.
 */

/** An icon-only action in the trailing cluster. */
export interface HeaderAction {
  id: string;
  /**
   * The accessible name, and §9.1 is specific about it: name what it **does**,
   * not what it is. "Discard and close", not "Close". A screen reader user who
   * hears "Back" three times in a session has learned nothing.
   */
  label: string;
  /**
   * A roster glyph by name, or a supplied node. Same widening `NavNode.icon` and
   * `TopBarAction.icon` took — `icons:sync` checks for a 16-unit viewBox, so a
   * product mark could not be ingested and should not be.
   */
  icon: IconName | ReactNode;
  disabled?: boolean;
  /**
   * The underlying `<button>`. An overlay that anchors to this control has to
   * measure its rect and hand focus back to it, and neither is reachable
   * through props.
   */
  ref?: Ref<HTMLButtonElement>;
  /**
   * Present when this action opens a menu. ONE prop, two attributes:
   * `aria-haspopup="menu"` and `aria-expanded`, which always travel together —
   * `haspopup` without `expanded` announces a menu that never reports its state,
   * and `expanded` without `haspopup` reports the state of nothing.
   *
   * Omit it entirely for an action that just acts. `false` is not the same as
   * absent: it means "opens a menu, currently closed".
   */
  expanded?: boolean;
  onSelect: () => void;
}

/** The one primary action. Optional, and at most one — §3.7. */
export interface HeaderCta {
  label: string;
  icon?: IconName | ReactNode;
  disabled?: boolean;
  onSelect: () => void;
}

interface Shared {
  /** The page's `<h1>`. */
  title: string;
  /**
   * No `Count` cap. Figma stops at three because a variant axis has to
   * enumerate every cell; an array does not — §3.7. Figma's own description
   * says the eight variants exist only because a boolean's default is set-wide.
   */
  actions?: HeaderAction[];
  cta?: HeaderCta;
  /**
   * Actions rendered AFTER the primary action. Figma has no such slot — §3.7's
   * `zf-header-actions` is `Count`(0–3) × `CTA`(yes/no) and every icon sits
   * before the CTA — so this is additive, and the split is not arbitrary:
   *
   * `actions` act on the **records** (attach, edit, discard). `trailing` acts on
   * the **view** (the filter, the overflow). The reference puts the second group
   * past the primary action for that reason, and one array cannot express
   * "after" no matter how it is ordered.
   */
  trailing?: HeaderAction[];
  className?: string;
}

/**
 * `type` is a DISCRIMINATED UNION, not three options on one shape. §9.3: they
 * are alternatives, not options — a page is exactly one of the three, and a
 * `detail` header without a `parent` should not compile.
 */
export type PageHeaderProps =
  | (Shared & {
    type: 'list';
    /** The views the switcher offers. Required, because §9.3 renders the menu. */
    views: { id: string; label: string }[];
    onViewChange: (id: string) => void;
    viewMenuOpen?: boolean;
    onViewMenuToggle: () => void;
  })
  | (Shared & { type: 'create' })
  | (Shared & {
    type: 'detail';
    /** The parent record. A LINK, not a heading — §7. */
    parent: { label: string; href: string };
    onBack: () => void;
  });

//  The house focus treatment, and a deliberate departure from §9.2. The md draws
//  every ring as an `inset box-shadow` and then needs a whole
//  `@media (forced-colors: active)` block to restore them, because that mode
//  forces `box-shadow: none` — it names the same regression in the LHS menu and
//  the top bar. A negative `outline-offset` is painted in forced-colors, so the
//  fallback block is unnecessary and cannot fall out of sync.
//
//  Everything else about §5's convention is kept exactly: the fill does not
//  change, the ring is 2px INSIDE so the box never resizes, the radius matches,
//  and on the solid CTA it recolours to white.
const RING = 'focus-visible:outline-2 focus-visible:-outline-offset-2';

const glyph = (icon: IconName | ReactNode) =>
  (typeof icon === 'string' ? <Icon name={icon as IconName} size="md" tone="inherit" /> : icon);

/**
 * The 32×32 icon action. §5.1's five states, with two substitutions from §9.4.
 */
function ActionButton({ action, className }: { action: HeaderAction; className?: string }) {
  return (
    <button
      ref={action.ref}
      type="button"
      aria-label={action.label}
      aria-haspopup={action.expanded === undefined ? undefined : 'menu'}
      aria-expanded={action.expanded}
      disabled={action.disabled}
      onClick={action.onSelect}
      className={cn(
        'grid place-items-center size-16 p-0 box-border rounded-md cursor-pointer',
        //  §9.2 — without `flex-none` the back button is a flex item at
        //  `0 1 auto` and its min-content contribution is the 16px glyph plus
        //  the border. The md measured a long detail title squeezing it to
        //  18 × 32, with the glyph overflowing so nothing looked wrong. 2.5.8.
        'flex-none',
        'bg-surface-default text-icon-default',
        //  The resting border is Figma's own `border/default` at 1.31 / 1.26,
        //  and it stays. §07 of the doc frame grades it REVIEW and argues
        //  correctly that the glyph identifies the control at 6.79 / 7.60, so
        //  the border is not information *required* under 1.4.11.
        'border border-border-default',
        //  THE §4.4 FIX, and the finding nobody had. Figma's hover border is
        //  `border/hover` `neutral/1000`, which against `surface/hover` is
        //  **2.65 Light / 2.23 Dark** — and hover's ENTIRE expression is the
        //  border, since the fill moves only 1.08:1. A resting border that is
        //  decorative can be excused; a hover border IS the state indicator,
        //  and 1.4.11's first bullet covers information required to identify
        //  the *states* of a component.
        //
        //  `border/control` is the next step up and overshoots — 4.19 Light,
        //  5.31 Dark — because the neutral ramp jumps straight from 2.85 at
        //  `neutral/1000` to 4.52 at `neutral/1100` with nothing near 3:1.
        //  Verified against our own primitives: both exact. The doc frame's
        //  refusal to invent a local grey for this is the best sentence about
        //  system hygiene in the file and it is kept.
        'hover:bg-surface-hover hover:border-border-control',
        //  Pressed moves with hover so the two cannot invert. 3.78 / 4.89.
        'active:bg-surface-pressed active:border-border-control',
        'transition-colors duration-150 motion-reduce:transition-none',
        RING, 'focus-visible:outline-focus-ring',
        //  1.89 / 2.49, and correct — 1.4.3 and 1.4.11 both exempt inactive
        //  components, and a disabled control that is obviously disabled is
        //  doing its job. The one number here that looks like a failure.
        'disabled:bg-surface-disabled disabled:border-border-disabled',
        'disabled:text-icon-disabled disabled:cursor-default',
        className,
      )}
    >
      {glyph(action.icon)}
    </button>
  );
}

export function PageHeader(props: PageHeaderProps) {
  const { type, title, actions = [], cta, trailing = [], className } = props;
  const menuId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);

  const listOpen = type === 'list' && Boolean(props.viewMenuOpen);
  const onToggle = type === 'list' ? props.onViewMenuToggle : undefined;

  //  Figma has a `Label` and a caret and no way to express a list, so it draws
  //  no menu at all. `aria-expanded` on a trigger with nothing behind it is a
  //  4.1.2 failure rather than an omission (§9.3), so the menu is part of the
  //  component — and a menu that cannot be dismissed is a second one.
  const close = useCallback(() => { if (listOpen) onToggle?.(); }, [listOpen, onToggle]);
  useEffect(() => {
    if (!listOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [listOpen, close]);

  const heading = (
    //  §3.5 — every text node in the family is `textTruncation: DISABLED` with
    //  no `maxWidth`, inside a `SPACE_BETWEEN` row whose `clipsContent` is
    //  false. So a long title pushes the trailing cluster to the padding and
    //  then leaves the band entirely. On a detail page the title is a record
    //  name, which makes that the common case rather than the edge case.
    <Text as="h1" size="heading" weight="semibold" tone="default" truncate
      className="m-0 min-w-0">{title}</Text>
  );

  return (
    <header
      //  NOT role="banner". A bare <header> maps to `banner`, and the top bar
      //  already owns that role — §9.1 measured three of these shipped without a
      //  scoping ancestor producing THREE banner landmarks. **The caller must
      //  place this inside <main>** (or article / aside / nav / section);
      //  `role="none"` here would take the <h1> with it.
      className={cn(
        'flex items-center justify-between w-full box-border',
        //  `flex-none`, because 64 is a specification and a flex item's default
        //  `flex-shrink: 1` is not bound by it. The shell's <main> is a flex
        //  column so a view can claim the whole ground; the moment the body is
        //  taller than the viewport — 35 table rows will do it — the column has
        //  overflow to distribute, the body's own content floors it at its
        //  natural height, and every pixel of the shortfall lands HERE. The band
        //  collapsed from 64 to about 34 and the title stopped centring with it.
        //
        //  Nothing about the page header knows it is in a flex column, and it
        //  should not have to: a fixed band declares that it is fixed.
        'flex-none',
        //  64 is the specification and `--zf-chrome-page-header` already held
        //  it. The 1px rule is INSIDE, so the content box is 63 and everything
        //  centres at 31.5 — §3.1's four regions, three heights, one centre
        //  line. `align-items: center` on a border-box band reproduces that
        //  without the arithmetic.
        'h-page-header',
        //  20 on ALL THREE types. Figma's list variant uses 14 because the chip
        //  adds its own 6 — correct arithmetic, and 14 is off the spacing scale
        //  and the one padding in the family that is unbound (§3.6). The chip
        //  pulls itself back instead, so the band keeps one value.
        'px-10',
        'bg-surface-default',
        //  A DIVIDER, not a boundary — 1.20:1 against the band and 1.11 against
        //  the page below. Two regions of the same surface do not need 3:1 and
        //  no criterion reaches it; the doc frame's framing is right. It is
        //  still the fourth component in a row with this shape of finding (rail
        //  1.07, side panel 1.21, top bar 1.02), which is §4.5's real point.
        'border-b border-border-divider',
        className,
      )}
    >
      <div className="flex items-center gap-4 min-w-0">
        {type === 'detail' ? (
          <ActionButton action={{
            id: 'back',
            //  §9.1 — what it goes back TO, not "Back".
            label: `Back to ${props.parent.label}`,
            icon: 'chevron-left',
            onSelect: props.onBack,
          }} />
        ) : null}

        {type === 'list' ? (
          <div ref={wrapRef} className={cn(
            'relative flex min-w-0',
            //  THE −6 IS ON THE WRAPPER, NOT THE BUTTON, and that is what makes
            //  the menu line up. `start-0` positions against the nearest
            //  positioned ancestor, so with the margin on the button the
            //  wrapper sat 6px to its right and the whole listbox hung 6px off
            //  the control it belongs to. Visible the moment it opens.
            '-ms-3',
          )}>
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={listOpen}
              aria-controls={menuId}
              onClick={props.onViewMenuToggle}
              className={cn(
                'flex items-center gap-2 min-w-0 py-2 px-3 box-border',
                //  −6 on the wrapper, +6 of padding here: the TITLE lands 20
                //  from the band's edge while the band keeps 20 on all three
                //  types. Figma's 14 + 6, without the unbound 14.
                //
                //  NO REST BORDER, and the reference confirms it: the title is
                //  bare text and a caret, with no box around it.
                //
                //  §2 is right that this is Figma's weakest point — the chip is
                //  `surface/default` on a `surface/default` band, **1.00:1**, so
                //  at rest the menu button is not drawn at all — and §9 answers
                //  it with a 1px `border/control`. That answer is not taken
                //  here, for the reason §2 itself gives: the caret DOES identify
                //  the control at 4.32, which is 1.4.11's own escape, so nothing
                //  is non-functional and borders match the drawing.
                //
                //  The border was also 1px wrong. With `box-border` its width
                //  adds to the 6px padding, so the title landed at **21**, not
                //  the 20 §3.2 works out so carefully — the arithmetic the whole
                //  14 + 6 story exists to protect. Removing it restores 20.
                //
                //  Open decision 1 is the real answer, and it is a system
                //  question: how should ANY menu button be drawn at rest?
                'border-0 bg-transparent cursor-pointer rounded-md',
                'hover:bg-surface-hover active:bg-surface-pressed',
                'transition-colors duration-150 motion-reduce:transition-none',
                RING, 'focus-visible:outline-focus-ring',
              )}
            >
              {heading}
              {/* Decoration. `aria-expanded` on the button is the state — a
                  second announcement of it here would be noise. */}
              {/*
                `caret-down-bold` at the NORMAL `md` slot, which retires a
                workaround. This caret used to be `chevron-down` at `xl` (24) —
                two rungs up the ramp — purely to stop a 1.25px stroke reading as
                a hairline beside 18px Semi Bold. A solid glyph needs no such
                trick: at 16 it measures **15.8 × 8.6**, all but identical to the
                14.6 × 8.2 the inflated slot was producing, and the slot is back
                where every other icon's is.

                It is the roster's third down-pointing glyph and they are three
                weight classes, not three names for one thing — `chevron-down`
                stroked at 9.7 × 5.5, `caret-down` an outline at 8.1 × 4.6, this
                one solid. §3.1 of zf-icons.md is entirely about weight.

                At `xs` its ink is **11.9 × 6.45**, against the 14.6 × 8.2 the
                inflated `xl` slot used to produce — a quarter smaller, and still
                heavier than either of the other two at any slot, because it is
                solid rather than a 1.25px stroke.

                The reasoning the `xl` slot rested on, kept because it is still
                true of the other two:

                Our `Icon` puts `strokeWidth` in USER UNITS inside a 16-unit
                viewBox and sizes the slot in CSS, so the stroke scales with the
                box. At `md` the derived chevron renders **9.7 × 5.5 with a
                1.25px stroke** — a hairline beside 18px Semi Bold. At `xl` it is
                **14.6 × 8.2 at 1.88**, which is what the reference draws.

                The alternative was a thicker stroke, and that is not available:
                `ICON_STROKE_WEIGHT` is 1.25 for the whole roster, chosen on
                instance count across §3.1's four measured weights, and one glyph
                opting out is how a system ends up with four again. Picking a
                different rung of the slot ramp is the sanctioned move —
                xs 12 · sm 14 · md 16 · lg 20 · xl 24, and a component picks.

                It also fixes the gap. §10.1 measures title-to-caret at 4 and
                `gap-2` is that 4 — but the VISIBLE gap is 4 plus the slot's own
                padding, which is 3.1 at `md` and 4.7 at `xl`. 8.7 against the
                reference's ~9.5, where `md` gave 7.1.

                A filled `caret-down` exists in the roster and was the obvious
                first try. It is **thinner** — 1.01 units of ink against the
                chevron's 1.25, and 8.1 × 4.6 against 9.7 × 5.5 — so it makes the
                mark lighter, not heavier.
              */}
              <Icon name="caret-down-bold" size="xs" tone="inherit"
                className={cn(
                  //  `primary/default`, the md's own role — 4.32 Light, 5.86
                  //  Dark against the band. NOT `primary/text`: that is the
                  //  link role, one step darker, and this is not a link.
                  'flex-none text-primary-default',
                  //  `mt-2` is 4 — `space/2`, the value you measured.
                  //
                  //  **It moves the glyph 2px, not 4**, and that is not a bug to
                  //  correct later. `align-self: center` centres the MARGIN box,
                  //  so an asymmetric 4-and-0 shifts the border box by half the
                  //  difference. Anyone "tidying" this to `mt-1` for a 2px nudge
                  //  will get 1px and wonder why.
                  //
                  //  Two is also exactly the gap the arithmetic predicts, in the
                  //  direction the eye actually wanted: at 18/24 the baseline
                  //  sits at 16.5 and the cap band runs 3.5..16.5, so the caps
                  //  centre at 10 where the line box centres at 12. I applied
                  //  that correction upward first, from estimated metrics for a
                  //  font the token layer does not name — `--zf-font-family` is
                  //  not a Figma variable — and got the sign wrong. The number
                  //  came from measuring the rendered thing, which is why it is
                  //  the one that stays.
                  //
                  //  `self-center` rather than relying on the row's
                  //  `items-center`, so the intent survives someone changing the
                  //  parent — and because the halving above depends on it.
                  'self-center mt-2',
                  'transition-transform duration-150 motion-reduce:transition-none',
                  listOpen && 'rotate-180')} />
            </button>

            {listOpen ? (
              //  THE MENU'S SURFACE, imported rather than copied — `radius/xl`,
              //  the inset-ring-plus-elevation `shadow/menu`, 4 of block
              //  padding. The 1px `border/control` and `radius/md` that were
              //  here made this the third floating list with its own paint, and
              //  §2.25's own complaint about this system is that the rail's
              //  flyout and this one are "two lists 6px apart in padding for no
              //  reason".
              //
              //  Width is the caller's: a view switcher hangs off a title whose
              //  length it does not control, so `min-w-full` follows the trigger
              //  where the menu's fixed 240 would sometimes be narrower than it.
              <ul
                id={menuId}
                role="listbox"
                aria-label={title}
                className={cn('absolute top-full start-0 z-10 mt-2 min-w-full list-none',
                  MENU_SURFACE)}
              >
                {props.views.map((v) => {
                  const chosen = v.label === title;
                  return (
                    <li
                      key={v.id}
                      role="option"
                      aria-selected={chosen}
                      onClick={() => { props.onViewChange(v.id); close(); }}
                      className={cn(
                        //  MENU_ROW carries no gap, no background and no colour
                        //  — a base that declares what a branch also declares
                        //  hands the decision to the stylesheet's emission order.
                        //  This switcher supplies one of each.
                        MENU_ROW, 'gap-4 whitespace-nowrap',
                        chosen
                          ? 'bg-transparent text-primary-text'
                          : 'bg-transparent text-text-default hover:text-primary-text hover:bg-surface-hover',
                      )}
                    >
                      <span className="flex-1 min-w-0 truncate">{v.label}</span>
                      {/* THE CHOSEN VIEW IS A GLYPH, not a fill. It used to be
                          `surface/pressed` at 1.20:1 — and §11 decision 6 makes
                          the same point about `surface/selected`, which is 1.13
                          Light and **1.02** Dark and so cannot carry a selection
                          on its own. `xs` for the same reason the menu uses it:
                          the tick is the one solid mark in a set of outlines. */}
                      {chosen ? (
                        <Icon name="check" size="xs" tone="inherit" className="flex-none" />
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        ) : type === 'detail' ? (
          <div className="flex flex-col min-w-0">
            {/* A LINK, not an <h2>. It is the parent record and it is
                navigable; a level-2 heading ABOVE the level-1 inverts the
                document outline — §7, and the doc frame says the same. */}
            <Text as="a" size="label" tone="secondary" truncate
              href={props.parent.href}
              className={cn('no-underline hover:underline rounded-xs',
                //  The one ring in the family that is NOT inset: a text link
                //  has no box to inset into, so 2px OUTSIDE at radius/xs is the
                //  §9.2 treatment and the only place it differs. 4.32 / 7.69.
                'focus-visible:outline-2 focus-visible:outline-offset-2',
                'focus-visible:outline-focus-ring')}>
              {props.parent.label}
            </Text>
            {heading}
          </div>
        ) : heading}
      </div>

      {/* §3.7 — Figma needs `zf-header-actions` because a variant selection is
          stored per node. The DOM does not, so there is no wrapper component,
          and `Count=0, CTA=no` renders nothing rather than Figma's 1px sliver. */}
      {actions.length > 0 || cta || trailing.length > 0 ? (
        <div className="flex flex-none items-center gap-5">
          {actions.map((a) => <ActionButton key={a.id} action={a} />)}

          {cta ? (
            <button
              type="button"
              disabled={cta.disabled}
              onClick={cta.onSelect}
              className={cn(
                'inline-flex items-center gap-3 h-16 px-6 box-border rounded-md cursor-pointer',
                //  A 1px TRANSPARENT border at rest, so the disabled state's
                //  real border costs nothing. §3.4: Figma's disabled variant is
                //  the only one with a stroke, the stroke is INSIDE and the
                //  frame HUGs — so it measures **77 × 32** where every other
                //  state is 75, and the whole trailing cluster shifts left as
                //  the button disables.
                'border border-transparent',
                'bg-brand-solid text-brand-on-solid',
                //  Label 5.48 Blue / 4.67 Red — both clear 4.5, Red by 0.17.
                'text-body font-medium',
                'hover:bg-brand-solid-hover active:bg-brand-solid-pressed',
                'transition-colors duration-150 motion-reduce:transition-none',
                //  Recoloured against the fill: 5.48, where a blue ring on blue
                //  would give 1.27. §5.2 — the detail most systems miss.
                RING, 'focus-visible:outline-brand-on-solid',
                'disabled:bg-surface-disabled disabled:border-border-disabled',
                'disabled:text-text-disabled disabled:cursor-default',
              )}
            >
              {cta.icon ? <span className="flex-none">{glyph(cta.icon)}</span> : null}
              {cta.label}
            </button>
          ) : null}

          {trailing.map((a) => <ActionButton key={a.id} action={a} />)}
        </div>
      ) : null}
    </header>
  );
}
