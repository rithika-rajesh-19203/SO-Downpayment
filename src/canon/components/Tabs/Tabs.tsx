import { useId, useRef } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import { cn } from '../../utils/cn';

/**
 * TABS — one record, several views of it.
 *
 * **No md on disk.** Measured off the reference and built to the ARIA Authoring
 * Practices tabs pattern, which is unusually worth following literally here:
 * tabs are the control people most often build out of buttons and `hidden`, and
 * the result announces as a row of buttons next to some text with no stated
 * relationship between them.
 *
 * ── THE FOUR THINGS THAT MAKE IT A TAB AND NOT A BUTTON ─────────────────────
 * **1 · One tab stop for the strip.** `role="tablist"` with a roving
 * `tabIndex` — Tab moves *past* the tabs to the panel, arrows move *between*
 * them. Three tabs that are three tab stops is three presses to reach the
 * content, and the content is what the user came for. 2.1.1.
 *
 * **2 · The panel is `aria-labelledby` its tab and the tab is `aria-controls`
 * its panel.** That pairing is the entire semantic content of the pattern. A
 * screen-reader user who lands in the panel is told which tab they are in.
 *
 * **3 · Selection follows focus, and the panel is `tabIndex={0}`.** Arrowing
 * onto a tab activates it — the APG's default for a cheap panel — and the panel
 * itself takes focus next, so Tab out of the strip lands *in* the content
 * rather than skipping it.
 *
 * **4 · The indicator is 2px, not 1.** A 1px underline sits directly on the
 * strip's own 1px bottom rule and the two read as one slightly darker hairline;
 * at 2 the selected tab is unambiguous. It is also drawn on `primary/default`
 * (4.32:1) with the label on `primary/text` (5.92) — the indicator is a
 * graphic and clears 1.4.11's 3:1; the label is text and clears 1.4.3's 4.5.
 * Using one role for both would fail one of the two.
 *
 * ── AND THE THING IT DELIBERATELY DOES NOT DO ───────────────────────────────
 * No `orientation="vertical"`, and no scrolling strip. A vertical tab list is a
 * different component with a different keyboard model (Up/Down, not Left/Right)
 * — §1's test: *if two values need different HTML, they are different
 * components*, and this one would need different behaviour as well.
 */
export interface TabItem {
  id: string;
  label: string;
  /** Announced after the label — "Activity, 12 items". Never colour alone. */
  badge?: string;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (next: string) => void;
  /** Names the strip: "Invoice views". Required — `role="tablist"` needs one. */
  label: string;
  /**
   * Sits at the far end of the strip, on the same baseline as the tabs. For a
   * control that acts on whichever tab is open — a `Segmented` view switch, a
   * filter. NOT for a tab: anything in here is outside the arrow-key model.
   */
  trailing?: ReactNode;
  /**
   * How far the strip is inset from its container.
   *
   * `section` (default) — `space/15`, 30. For a card that is `pad={0}` so the
   * strip's rule can reach its edges: the strip supplies the inset itself.
   *
   * `none` — flush. For a container that has already inset its own content, a
   * creation-page body being the case that found this: at `section` the tabs
   * sat 30 further in than the form labels above them, and the rule that is
   * supposed to be their shared baseline started in the wrong place.
   */
  inset?: 'section' | 'none';
  /** The panel. One node — the caller decides what the active tab renders. */
  children: ReactNode;
  className?: string;
}

export function Tabs({
  items, value, onChange, label, trailing, inset = 'section', children, className,
}: TabsProps) {
  const uid = useId();
  const stripRef = useRef<HTMLDivElement>(null);
  const tabId = (id: string) => `${uid}-tab-${id}`;
  const panelId = `${uid}-panel`;

  //  Disabled tabs are SKIPPED by the arrows rather than focused-and-inert.
  //  A menu row disabled in place is discoverable; a tab is a destination, and
  //  arrowing onto one you cannot open is a dead end with no way to know why.
  const reachable = items.filter((t) => !t.disabled);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const fwd = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    const at = reachable.findIndex((t) => t.id === value);
    let next: number | null = null;
    if (e.key === fwd) next = (at + 1) % reachable.length;
    else if (e.key === back) next = (at - 1 + reachable.length) % reachable.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = reachable.length - 1;
    if (next === null || !reachable[next]) return;
    e.preventDefault();
    //  Selection follows focus — APG's default. `onChange` first so the panel
    //  has re-rendered by the time focus lands.
    onChange(reachable[next].id);
    stripRef.current
      ?.querySelector<HTMLButtonElement>(`#${CSS.escape(tabId(reachable[next].id))}`)
      ?.focus();
  };

  return (
    <div className={cn('flex flex-col min-h-0', className)}>
      {/* The strip's rule runs the FULL width, under the trailing control too —
          it is the boundary between chrome and content, not a decoration on the
          tabs. The indicator then sits on top of it. */}
      {/* TWO ELEMENTS, and that is the whole point: the padding is on the outer
          one and the RULE is on the inner one, so the rule starts at the first
          tab rather than at the card's edge.

          A `border-b` on the padded element spans its padding box and runs edge
          to edge — which reads as the card being divided in two, rather than as
          the tabs having a baseline. Inset, it starts under the first tab and
          ends level with the panel's own inset below, so the rule, the first
          tab's box and the content beneath it share one left edge.

          `pt-10` (20) and `px-15` (30) — both plain steps now. The 30 used to
          be `--zf-chrome-section-pad` because 30 was retired; it is declared as
          `space/15` since ZF-CREATE-PAGE.md §3.1, so the token is gone and the
          form grid and this strip share one owner for the number.

          `pt` only on the outer: the strip's bottom edge IS the rule, and
          padding under it is a gap the indicator would float above. */}
      <div className={cn('pt-10', inset === 'section' ? 'px-15' : 'px-0')}>
      {/* `items-start`, and that matters: the row's height must be the TABLIST's
          — 28 — because the rule hangs off it and the indicator has to reach it.
          Under `items-stretch` the trailing wrapper's own natural height (24 + 8
          of padding = 32) set the row instead, the rule dropped to 32, the tab
          bottom stayed at 30, and the bar stopped 1px short of the line it is
          supposed to sit on. */}
      <div className="flex items-start gap-8 border-b border-border-divider">
        <div
          ref={stripRef}
          role="tablist"
          aria-label={label}
          aria-orientation="horizontal"
          onKeyDown={onKeyDown}
          //  THE GAP MOVES HERE. With the tab's own inline padding gone, two
          //  labels would otherwise touch — the 16 between them used to be the
          //  two tabs' 8s meeting. Same rhythm, different owner, and now the
          //  space between tabs is one number instead of a sum.
          className="flex items-center gap-8 min-w-0"
        >
          {items.map((t) => {
            const selected = t.id === value;
            return (
              <button
                key={t.id}
                id={tabId(t.id)}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={selected ? panelId : undefined}
                //  Roving: exactly one tab is tabbable, and it is the selected
                //  one — so Shift+Tab back into the strip returns you to where
                //  you were, not to the first tab.
                tabIndex={selected ? 0 : -1}
                disabled={t.disabled}
                onClick={() => onChange(t.id)}
                className={cn(
                  //  NO INLINE PADDING, and the height comes from the label
                  //  plus `pb-4` rather than from a fixed 40. Two consequences,
                  //  both wanted:
                  //
                  //  · the INDICATOR is exactly the width of its label. Padding
                  //    would make the bar 16 wider than the word it underlines,
                  //    which reads as an underlined button rather than a marked
                  //    word.
                  //  · the 8 is a real 8 — measured from the text to the rule.
                  //    Inside a fixed 40 with `items-center` it would have been
                  //    8 plus half the leftover leading, which is 14, and the
                  //    number in the spec would not be the number on screen.
                  //  `pb-6` — 12, `space/6`. Measured from the label's line box
                  //  to the rule, which is only true because the tab has no
                  //  fixed height: inside one, `items-center` would add half the
                  //  leftover leading and the 12 would render as 16 or more.
                  'relative inline-flex items-center gap-3 flex-none px-0 pb-6',
                  'border-0 bg-transparent cursor-pointer whitespace-nowrap',
                  //  14/20 — `body-lg`, a retired size re-entered on purpose and
                  //  declared in the guard's RETIRED_EXCEPTIONS. The ramp jumps
                  //  13 to 16 and a tab sits between: 13 reads as body text that
                  //  happens to be clickable, 16 competes with the heading.
                  'text-body-lg',
                  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring',
                  'transition-colors duration-150 motion-reduce:transition-none',
                  //  One branch. Two `text-*` on one element are settled by the
                  //  stylesheet's emission order, not the className's.
                  //  One branch each. Two `text-*` or two `font-*` on one
                  //  element are settled by the stylesheet's emission order, not
                  //  the className's.
                  //  SELECTED IS BLACK, not blue. `text/default` at 15.15:1 —
                  //  the darkest text role there is. The blue is now spent on
                  //  hover instead, which makes the two states say different
                  //  things: black-and-semibold is "you are here", blue is "you
                  //  could go here".
                  //
                  //  The indicator stays `primary/default`, so the active tab is
                  //  a black label over a blue bar. That is the one place blue
                  //  still means "current", and it is a graphic rather than
                  //  text, so it is answering 1.4.11's 3:1 and not 1.4.3's 4.5.
                  t.disabled ? 'text-text-disabled cursor-default font-medium'
                    : selected ? 'text-text-default font-semibold'
                      //  `primary/text` (5.92), not `primary/default` (4.32):
                      //  this is 14px text and 4.32 fails 1.4.3's 4.5.
                      : 'text-text-secondary hover:text-primary-text font-medium',
                )}
              >
                {/* THE WEIGHT CHANGES ON SELECT, SO THE WIDTH MUST NOT.
                    Semibold is wider than medium, so selecting a tab would grow
                    it and shove every tab after it sideways — under the pointer
                    that just clicked, and again on every arrow press. The fix is
                    to reserve the widest state always: a hidden semibold copy
                    sets the column's width and the visible copy renders at
                    whatever weight the state actually is.

                    `grid` with both in cell 1/1 rather than absolute
                    positioning, so the reserved copy still contributes height
                    and the row cannot collapse. */}
                <span className="grid">
                  <span aria-hidden className="col-start-1 row-start-1 invisible font-semibold">
                    {t.label}
                  </span>
                  <span className="col-start-1 row-start-1">{t.label}</span>
                </span>
                {t.badge ? (
                  //  Inside the tab so it is part of the accessible name: a
                  //  count announced as a separate node is a number floating
                  //  next to a word.
                  <span className={cn(
                    'inline-flex items-center justify-center flex-none',
                    //  20 tall — exactly the label's line-height, so the pill
                    //  cannot make the tab taller than its own text. `min-w` and
                    //  not a fixed width: a circle at one or two digits, a pill
                    //  at three, never a clipped square at 128.
                    'h-10 min-w-10 px-2 rounded-full',
                    //  `tabular-nums` so 9 → 10 cannot resize it.
                    'text-body-sm font-medium tabular-nums',
                    'transition-colors duration-150 motion-reduce:transition-none',
                    //  ONE branch. Two fills or two colours on one element are
                    //  settled by the stylesheet's emission order.
                    t.disabled ? 'bg-surface-sunken text-text-disabled'
                      : selected
                        //  `primary/HOVER`, not `primary/default`. This is a
                        //  12px number and white on `primary/default` is
                        //  **4.32** — it fails 1.4.3's 4.5. `primary/hover` is
                        //  5.48 Light / 8.62 Dark. Third component in this menu
                        //  family to land on the same substitution.
                        ? 'bg-primary-hover text-primary-on-primary'
                        //  `surface/pressed` is the most visible of the three
                        //  neutral fills — 1.20 against the card in Light, 1.16
                        //  in Dark — and `text/secondary` on it is 5.68 / 8.15.
                        : 'bg-surface-pressed text-text-secondary',
                  )}>
                    {t.badge}
                  </span>
                ) : null}
                {/* THE INDICATOR — 3 tall, and `-bottom-px` puts its lower edge
                    level with the rule's rather than on top of it. The two are
                    then one line: 2 of visible bar over the 1 it has covered. A
                    bar that stops at the rule leaves that hairline showing
                    underneath and reads as two lines that failed to meet.

                    TOP corners only, at `radius/xs` (2). The bottom two are
                    inside the rule, and rounding them would let it show through
                    the notches. 2 of curve on a 3 bar is most of its height —
                    which is the point: it reads as a soft mark rather than a
                    cut-off rectangle.

                    `absolute`, so the selected tab is not 3px taller than its
                    neighbours — which would move every label on selection.
                    `aria-hidden` because `aria-selected` already said it. */}
                {selected ? (
                  <span
                    aria-hidden
                    className={cn(
                      'absolute inset-x-0 -bottom-px h-tab-indicator',
                      'rounded-t-xs bg-primary-default',
                    )}
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* CENTRED ON THE TAB TEXT, not on the tab box — and those stopped
            being the same line when the tab gained `pb-4`. The tab is 28 tall
            with its label in the top 20, so its text centre is at 10 while its
            box centre is at 14: an `items-center` row put this control 4px low.

            The wrapper is exactly the label's LINE BOX tall — `h-tab-label`
            points at `--zf-text-body-lg-line-height`, the same declaration the
            label reads, so this is by reference and not by a matching number.
            `items-center` inside it centres a taller control on that line box,
            overflowing it evenly above and below.

            It must not be taller than the tablist or it takes over the row's
            height and drags the rule down with it — which is what an earlier
            `pb` on this wrapper did. */}
        {trailing ? (
          <div className="flex flex-none items-center h-tab-label ms-auto">{trailing}</div>
        ) : null}
      </div>
      </div>

      {/* `tabIndex={0}` so Tab out of the strip lands IN the content. Without it
          the panel is skipped entirely when it holds no focusable child, which
          is the common case for a read-only record view. */}
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={tabId(value)}
        tabIndex={0}
        className="flex-1 min-h-0 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring"
      >
        {children}
      </div>
    </div>
  );
}
