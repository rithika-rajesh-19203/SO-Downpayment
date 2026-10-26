import {
  useCallback, useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import { Icon } from '../../icons';
import type { IconName } from '../../icons';
import { cn } from '../../utils/cn';
import { Button } from '../Button/Button';
import { Checkbox } from '../Checkbox/Checkbox';
import { Menu } from '../Menu/Menu';
import type { MenuEntry } from '../Menu/Menu';

/**
 * ACTION BAR — `design-refs/zf-action-bar.md`, §2.26. What replaces the page
 * header while rows are selected.
 *
 * **All six of the md's rebuild contrast figures reproduce exactly** against our
 * primitives, as do its three ΔE values and the 1.45:1 button stroke.
 *
 * ── WHAT THE SOURCE WAS ──────────────────────────────────────────────────────
 * A 37-node group of raw rectangles — no auto-layout, no variant, **no bound
 * paint**, no text style, and no expression at all of the thing that makes an
 * action bar an action bar: the moment it replaces the page header.
 *
 * **The count "06" is 4.39:1 on its chip** — a 1.4.3 failure at 12px, on the one
 * number the whole component exists to report. Here `primary/text` on
 * `primary/subtle` is **5.25 / 7.56**.
 *
 * **"Selected" is pure `#000000`** — 19.32 ΔE from `text/default`, a value that
 * appears nowhere else in 26 components. It is not a token; it is what happens
 * when a colour picker opens at its default.
 *
 * **The close glyph is `#FE4242`** — a destructive red 30.75 ΔE from
 * `danger/default`, on a control that destroys nothing. Red on a safe control
 * teaches distrust of red everywhere.
 *
 * **Three stacked shadows**, the first with `spread: 1` at zero offset and zero
 * blur — a 1px hard-edged 4%-black outline, a border wearing a shadow's clothes.
 * One `shadow/popover` here, which is the same `0 8 24 #12141F @12%` five
 * components now carry by hand (§11 decision 1).
 *
 * **Nothing is where it says it is.** Two controls at two different `y` — 63 and
 * 64.57, and *neither* centres in a 48px bar, whose centre is 65.
 *
 * ── ONE FINDING THAT DOES NOT APPLY TO US ────────────────────────────────────
 * §4.4 reports that building this bar exposed **every Secondary button in the
 * system rendering 1.04:1 in Dark** — 217 fills bound to the single-mode
 * `ZF Primitives` while their labels flipped. Our `Button` has been on semantic
 * roles since it was built, and its rest fill is already `surface/default` and
 * not `surface/raised` — which §4.4 calls load-bearing, because `raised` and
 * `hover` are the same primitive in Dark and a Secondary button on `raised`
 * would have a dead hover. Nothing to fix; worth recording that it was checked.
 */
export interface ActionBarAction {
  id: string;
  label: string;
  onSelect: () => void;
  disabled?: boolean;
}
export interface ActionBarIconAction extends ActionBarAction {
  /** A roster glyph by name, or a supplied node. The label is its ONLY name. */
  icon: IconName | ReactNode;
}

export interface ActionBarProps {
  /** How many rows are selected. 0 means the bar should not be rendered at all. */
  count: number;
  /** Total available, so `Scope=all` is derived rather than asked for. */
  total?: number;
  /** The one action the user came for. */
  primary?: ActionBarAction;
  /**
   * Wordless actions — mail, print, export. Capped at 4 and rendered JOINED.
   *
   * §3.2 is worth keeping: the labelled action comes first because it is the one
   * they came for, and reading order carries more weight here than density.
   * "Five unlabelled glyphs in a row is a guessing game, and the guess is being
   * made about an operation that will apply to every selected row."
   */
  iconActions?: ActionBarIconAction[];
  /** Named actions. Everything past the width budget moves into the ⋯ menu. */
  actions?: ActionBarAction[];
  /** The ceiling. The ResizeObserver only ever lowers it. Ignored when `density`
   * is `compact`, which has no visible actions to cap. */
  maxVisible?: number;
  /**
   * How much room the bar has.
   *
   * `default` — the full bar: the primary action, the joined icon trio, the
   * named actions, and a ⋯ for whatever does not fit. Written for a page-width
   * cell.
   *
   * `compact` — **count, one Actions menu, and the ✕.** Everything else —
   * primary, icons, named actions — moves inside that one menu, separated into
   * the same three clusters. For a bar that has to live in a 353px column,
   * where the full layout has room for the count and nothing else.
   *
   * Two arrangements of the same content, and a bar is exactly one of them —
   * so it is one axis with two values, not a pile of booleans. `compact` does
   * subsume `maxVisible`, which is stated rather than hidden.
   */
  density?: 'default' | 'compact';
  /**
   * Renders the select-all checkbox at the head of the bar, and receives the
   * state it should move TO.
   *
   * Its own state is derived, never passed: the bar already knows `count` and
   * `total`, so `checked` when they match and `indeterminate` when they do not.
   * Asking the caller for it as well would let the tick disagree with the number
   * beside it.
   */
  onToggleAll?: (next: boolean) => void;
  onClear: () => void;
  label?: (n: number, all: boolean) => string;
  className?: string;
}

const DEFAULT_LABEL = (_n: number, all: boolean) => (all ? 'All selected' : 'Selected');

export function ActionBar({
  count, total, primary, iconActions = [], actions = [],
  maxVisible = 3, density = 'default', onToggleAll,
  onClear, label = DEFAULT_LABEL, className,
}: ActionBarProps) {
  const compact = density === 'compact';
  const barRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState(0);
  const [budget, setBudget] = useState(Infinity);
  const [menuOpen, setMenuOpen] = useState(false);

  const all = total !== undefined && count >= total && count > 0;

  /*  §7 — WHERE FOCUS GOES WHEN THE BAR LEAVES.
      "the bar unmounts, the header returns, focus goes back to the checkbox that
      emptied the selection — that checkbox still exists and is still where the
      user is looking."

      Focus must not move when the bar MOUNTS (3.2.2, and §7 calls auto-focusing
      it the most common bug in this pattern), so the element that had it is
      captured instead and handed back on the way out. Without this, clearing
      from a control INSIDE the bar — the ✕, or Escape while a bar button holds
      focus — leaves focus on `<body>`: the next Tab restarts at the top of the
      document, and nothing on screen says where you are.

      Only when focus is still inside the bar. If the user has since clicked
      elsewhere, taking focus back would be the context change §7 forbids. */
  const returnTo = useRef<HTMLElement | null>(null);
  useEffect(() => {
    returnTo.current = document.activeElement as HTMLElement | null;
    const bar = barRef.current;
    return () => {
      if (!bar?.contains(document.activeElement)) return;
      const el = returnTo.current;
      if (el?.isConnected) el.focus();
    };
  }, []);

  //  §9.4 — `borderBoxSize`, NOT `contentRect`. The bar sets `padding-inline: 8`,
  //  so `contentRect` is 16 narrower than the width the thresholds are written
  //  against and every one of them would fire one action early. Measured:
  //  borderBox − contentRect = 16.00 at every width.
  useLayoutEffect(() => {
    const el = barRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => setBudget(
      entry.borderBoxSize?.[0]?.inlineSize ?? entry.target.getBoundingClientRect().width,
    ));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  //  Never below 1. The ⋯ trigger renders independently of `visible`, but a bar
  //  with no named actions and no trigger would strand every one of them.
  const shown = Math.min(maxVisible, budget >= 1232 ? 3 : budget >= 916 ? 2 : 1);
  const visible = compact ? [] : actions.slice(0, shown);
  const overflow = compact ? [] : actions.slice(shown);
  const hasLeading = !compact && (Boolean(primary) || iconActions.length > 0);
  const hasTrailing = !compact && (visible.length > 0 || overflow.length > 0);

  /*  COMPACT — every action in one menu, and the three clusters kept apart by
      the separators they already earn in the wide bar. §3.2's ordering survives
      the collapse: the one they came for is first, the wordless trio next with
      its glyphs intact (a Menu row has a leading 16px slot, so nothing is lost
      by folding them), the named actions last.

      A separator only where BOTH sides exist — a rule with nothing above it is
      the defect the details toolbar's §2 names.  */
  const menuEntries: MenuEntry[] = !compact ? [] : [
    ...(primary
      ? [{ id: primary.id, label: primary.label, disabled: primary.disabled, onSelect: primary.onSelect }]
      : []),
    ...(primary && iconActions.length > 0 ? [{ separator: true as const }] : []),
    ...iconActions.map((a) => ({
      id: a.id,
      label: a.label,
      icon: typeof a.icon === 'string' ? (a.icon as IconName) : undefined,
      disabled: a.disabled,
      onSelect: a.onSelect,
    })),
    ...((primary || iconActions.length > 0) && actions.length > 0
      ? [{ separator: true as const }] : []),
    ...actions.map((a) => ({
      id: a.id, label: a.label, disabled: a.disabled, onSelect: a.onSelect,
    })),
  ];

  /*  §7 — ESCAPE. A DOCUMENT listener, added only while the bar is mounted, that
      bails on `defaultPrevented`. That is the only way to get both halves right:

      · focus is usually in the TABLE, not the bar, so a listener on the bar
        element never fires and Escape looks dead;
      · a bare document listener eats the key from every dropdown and dialog on
        the page. Checking `defaultPrevented` lets the innermost overlay win,
        because it called `preventDefault()` when it closed itself.  */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      e.preventDefault();
      onClear();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClear]);

  /*  §6 — a toolbar is ONE tab stop. The open ⋯ panel owns its own arrow-key
      model, so its rows are excluded: without that, the effect stamps
      `tabIndex=-1` on the menu's own rows and ArrowRight walks into the panel. */
  const controls = useCallback(() => {
    const root = barRef.current;
    if (!root) return [] as HTMLElement[];
    //  The select-all is an `<input type="checkbox">`, not a button, and it is
    //  inside the toolbar — so leaving it out of this set does not exclude it
    //  from the tab order, it gives the toolbar TWO tab stops. §6 allows one.
    //  Document order puts it first, which is also where it is drawn.
    return Array.from(root.querySelectorAll<HTMLElement>(
      'button:not([disabled]):not([role="menuitem"]), input[type="checkbox"]:not([disabled])',
    ));
  }, []);

  //  Depends on the DATA, not on derived lengths. `actions.length` does not
  //  change when an action's `disabled` flips, and `controls()` filters on
  //  `[disabled]` — so with stale deps the toolbar can end up with ZERO tabbable
  //  controls, which is keyboard-unreachable. 2.1.1.
  useLayoutEffect(() => {
    const items = controls();
    if (!items.length) return;
    const i = Math.max(0, Math.min(active, items.length - 1));
    items.forEach((el, n) => { el.tabIndex = n === i ? 0 : -1; });
  }, [active, controls, count, primary, iconActions, actions, shown, menuOpen]);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.target instanceof Element && e.target.closest('[role="menu"]')) return;
    const items = controls();
    const cur = items.indexOf(document.activeElement as HTMLElement);
    if (cur === -1) return;
    let next = cur;
    if (e.key === 'ArrowRight') next = (cur + 1) % items.length;
    else if (e.key === 'ArrowLeft') next = (cur - 1 + items.length) % items.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = items.length - 1;
    else return;
    e.preventDefault();
    setActive(next);
    items[next].focus();
  };

  const divider = (
    //  §4.5 — 1.20:1, and decorative. It may NEVER be the only thing that groups
    //  the actions: it is invisible to a low-vision user, absent in
    //  forced-colors, and not in the accessibility tree at all. The `role=group`
    //  on each cluster is what actually carries the grouping.
    <span aria-hidden className={cn(
      'flex-none w-px h-8 bg-border-divider',
      //  NO margin in compact. The bar's own `gap-5` already puts 10 either
      //  side; `mx-5` doubles that to 30 around a 1px rule, which is breathing
      //  room in a page-width bar and 20 of the 305 available in a 353 column.
      //  Measured: with it, the row is 309 and `overflow-x-clip` eats the ✕.
      !compact && 'mx-5',
    )} />
  );

  const countLabel = (
  <p aria-live="polite" aria-atomic
          //  `min-w-0` and a truncating label, so that if the bar is ever put
        //  somewhere narrower than the arithmetic assumed, the word "Selected"
        //  shortens instead of `overflow-x-clip` silently eating the ✕ off the
        //  end. A control disappearing is a 2.1.1 failure; a clipped word is not.
        className="flex min-w-0 items-center gap-4 m-0 text-body font-regular text-text-default">
          <span className={cn(
            //  `min-w` and not `size`: a fixed 24 square holds two digits and
          //  clips the third, and "125 selected" is an ordinary number in a real
          //  account. `rounded-full` keeps it a circle at one or two digits and
          //  lets it become a pill at three, rather than a clipped circle.
          'grid place-items-center h-12 min-w-12 px-2 rounded-full flex-none',
            'bg-primary-subtle text-primary-text',
            //  12/16 Semi Bold. `tabular-nums` so 6 → 7 cannot resize the chip.
            'text-body-sm font-semibold tabular-nums',
          )}>
            {all
              //  §3.4 — `Scope=all` swaps the numeral for a check, which reads as
              //  "all of them" without asking the user to compare a number against
              //  a total they cannot see.
              ? <Icon name="check" size="xs" tone="inherit" label="All" />
              : String(count).padStart(2, '0')}
          </span>
          <span className="truncate">{label(count, all)}</span>
        </p>
  );

  return (
    <div
      ref={barRef}
      role="toolbar"
      aria-label="Selection actions"
      onKeyDown={onKeyDown}
      className={cn(
        'flex items-center gap-5 h-action-bar box-border min-w-0',
        //  10 in compact, against the wide bar's 8 — `space/5`. It went 8 → 6 →
        //  10 across two passes: 6 read tight once the head checkbox's 24 target
        //  was pulling its box back over the padding anyway.
        //
        //  The head checkbox keeps its `-ms-3`, so the BOX still sits 4 inside
        //  the pill while its target runs the full 24. The 10 is what the ✕ and
        //  the pill's own radius get.
        compact ? 'px-5' : 'px-4',
        'bg-surface-default rounded-lg border-0 shadow-popover',
        //  §9.4 — never `flex-wrap`. A wrapped action bar is two rows tall, which
        //  breaks §7's one promise: nothing reflows. Clipping on BOTH axes
        //  enforces it — `overflow-y` alone computes `overflow-x` to `auto`, and
        //  a future change that causes a wrap then clips visibly instead of
        //  silently shifting the table.
        'overflow-x-clip overflow-y-clip',
        //  §9.2 — 120ms ease-out from 4px above, which is the direction the
        //  thing actually travels: it drops into the space the page header just
        //  left. The nav flyout's animation slides in from the LEFT, correct for
        //  a panel hanging off a rail and wrong here.
        'animate-action-bar-in motion-reduce:animate-none',
        className,
      )}
    >
      {/* ── THE HEAD OF THE COMPACT BAR ─────────────────────────────────────
          Reference order, left to right: select-all · Bulk Actions · rule ·
          count · ✕. The three things you can DO sit together on the left; the
          two facts ABOUT the selection sit together on the right.

          ONE button, not a split. The earlier build put the primary action in a
          left half that fired directly — the reference is a single dropdown
          whose rows are all actions, so the primary went back into the menu
          where the other nine are. Nothing here selects a value. */}
      {compact && onToggleAll ? (
        //  Not a `<Button>`: it is a checkbox and has to announce as one. Its
        //  state is DERIVED — `checked` only when the count has reached the
        //  total, `indeterminate` otherwise — so the tick can never disagree
        //  with the number two elements to its right.
        //  A 24 SQUARE TARGET AROUND A 12 BOX, pulled back by its own inset.
        //
        //  The bare `Checkbox` is a 14px box and the whole of it is the hit
        //  target — well under 2.5.8's 24, with the Bulk Actions button 10px
        //  away so the spacing exception cannot cover it either. A 24 square
        //  around it fixes that, and would otherwise push the box to 11 from the
        //  pill's edge.
        //
        //  `-ms-3` gives 6 of that back, so the BOX sits 5 from the edge while
        //  the TARGET still runs the full 24 — out over the bar's own padding,
        //  which is empty space nothing else wants. Same move as the mini list
        //  switcher's `-ms-3`.
        <span className="grid flex-none place-items-center size-12 -ms-3">
          <Checkbox
            selection={all ? 'checked' : 'indeterminate'}
            //  NOT "Clear selection": the ✕ at the other end already owns that
            //  name, and two controls with the same accessible name in one
            //  toolbar is a 4.1.2 defect — the same one the split button's caret
            //  had. These also mean different things: this one is about the
            //  LIST, the ✕ is about the selection.
            ariaLabel={all ? 'Deselect all' : `Select all ${total ?? ''}`.trim()}
            onSelectionChange={() => onToggleAll(!all)}
          />
        </span>
      ) : null}

      {compact && menuEntries.length > 0 ? (
        <>
          <Button
            ref={moreRef}
            emphasis="secondary"
            //  `caret`, not the button's own 14 slot. `caret-down-bold`'s ink
            //  nearly fills its 24 viewBox, so the slot is the arrow: at 14 it
            //  draws a 14px arrow next to a 78px label. 7.5 is the drawn width.
            iconRight={<Icon name="caret-down-bold" size="caret" tone="inherit" />}
            //  §9.1 — `aria-haspopup` and `aria-expanded`, and deliberately NO
            //  `aria-controls`: it is an IDREF and the panel is not in the DOM
            //  while the menu is closed. A dangling IDREF is a 4.1.2 defect.
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="flex-none"
          >
            Bulk Actions
          </Button>
          <Menu
            anchor={moreRef.current}
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            label="Bulk actions"
            //  LEFT edges flush. The default hangs a 240px panel off the RIGHT
            //  edge of its trigger, which is right for a ⋯ at the end of a bar
            //  and wrong here: it would throw the panel backwards across the
            //  button and past the checkbox beside it.
            align="start"
            entries={menuEntries}
          />
          {/* §4.5 — 1.20:1 and decorative. It separates the controls from the
              readout, and it is allowed to be invisible because nothing depends
              on seeing it: the two sides are already a `role="group"` and a
              live region. */}
          {divider}
        </>
      ) : null}

      {hasLeading ? (
        <div role="group" aria-label="Bulk actions" className="flex items-center gap-5 min-w-0">
          {primary ? (
            <Button emphasis="secondary" disabled={primary.disabled} onClick={primary.onSelect}>
              {primary.label}
            </Button>
          ) : null}

          {iconActions.length > 0 ? (
            //  §3.3 — JOINED, so the trio reads as one control with three
            //  settings rather than three unrelated actions. A negative MARGIN,
            //  never a negative `gap`: **`gap` clamps a negative value to zero**,
            //  the declaration is accepted and then ignored, and nothing warns.
            //  Three 32px buttons occupy 94, not 96.
            <div role="group" aria-label="Send and export" className="flex items-center">
              {iconActions.slice(0, 4).map((a, i, arr) => (
                <Button
                  key={a.id}
                  emphasis="secondary"
                  label={a.label}
                  icon={typeof a.icon === 'string' ? (a.icon as IconName) : undefined}
                  //  The overlap alone leaves each button's own rounded corners
                  //  meeting at the seam, where the reference is ONE outer
                  //  radius with hairline dividers and square internal corners.
                  //  `join` squares off exactly the corners that touch a
                  //  neighbour — a Button prop rather than a class from here,
                  //  because a radius passed in `className` races the base's own
                  //  `rounded-md` and the stylesheet's order decides the winner.
                  //
                  //  One button in a group of one is joined to nothing.
                  join={arr.length === 1 ? undefined
                    : i === 0 ? 'start' : i === arr.length - 1 ? 'end' : 'middle'}
                  disabled={a.disabled}
                  onClick={a.onSelect}
                  className={cn(
                    i > 0 && '-ms-px',
                    //  So the live border draws OVER both neighbours' rather
                    //  than under them.
                    'hover:z-1 focus-visible:z-1',
                  )}
                >
                  {undefined}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {hasLeading && hasTrailing ? divider : null}

      {/* The guard is `hasTrailing`, not `visible.length`: at narrow widths
          `visible` empties and every named action lives in the ⋯ menu. Guarding
          on `visible.length` makes the trigger disappear with them, and the
          actions become unreachable. */}
      {hasTrailing ? (
        <div role="group" aria-label="Document actions" className="flex items-center gap-5 min-w-0">
          {visible.map((a) => (
            <Button key={a.id} emphasis="secondary" disabled={a.disabled} onClick={a.onSelect}>
              {a.label}
            </Button>
          ))}
          {overflow.length > 0 ? (
            <>
              <Button
                ref={moreRef}
                emphasis="secondary"
                icon="more"
                label="More actions"
                //  §9.1 — `aria-haspopup` and `aria-expanded`, and deliberately
                //  NO `aria-controls`: it is an IDREF and the panel is not in the
                //  DOM while the menu is closed. A dangling IDREF is a 4.1.2
                //  defect, not a nicety.
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
              />
              <Menu
                anchor={moreRef.current}
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                label="More actions"
                entries={overflow.map((a) => ({
                  id: a.id, label: a.label, disabled: a.disabled, onSelect: a.onSelect,
                }))}
              />
            </>
          ) : null}
        </div>
      ) : null}

      {(hasLeading || hasTrailing) ? divider : null}

      {/* §6 / 4.1.3 — the live region is MOUNTED WITH THE BAR and written into
          afterwards. A region inserted at the same moment its text appears does
          not announce at all. `aria-atomic` so "6 Selected" is one announcement
          rather than "6" and then "Selected" as two events.

          A `<p>`, not a `<div>`: the plainest container an AT will re-read, and
          it carries no unwanted role. */}
      {countLabel}

      {/* §3.2 — the spring is `ms-auto`, not a spacer element. A 1px-tall empty
          div is a node the AT walks past for nothing. */}
      <div className="flex flex-none items-center gap-3 ms-auto">
        {/* §3.5 — "Esc" is a HINT, not a control. `aria-hidden` and not
            focusable: two focus stops for one action is one too many, and a
            screen-reader user does not need to be told about a key they can
            simply press. 4.52:1, which clears 4.5 and nothing more.

            DROPPED in compact. At 353px the hint costs more than it teaches,
            and it is the only thing here that is not a control. Escape itself is
            untouched — the document listener above does not know about density,
            so the key works in both. */}
        {compact ? null
          : <span aria-hidden className="text-body font-regular text-text-tertiary">Esc</span>}
        <button
          type="button"
          //  §7 — never "Close". It does not close anything, and a label that
          //  lies is worse than no label.
          aria-label="Clear selection"
          onClick={onClear}
          className={cn(
            //  32 × 32, where the source drew 14 × 14 — an outright 2.5.8 fail.
            'grid flex-none place-items-center size-16 p-0 border-0 rounded-md',
            'bg-transparent cursor-pointer',
            'hover:bg-surface-hover active:bg-surface-pressed',
            'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring',
            'transition-colors duration-150 motion-reduce:transition-none',
          )}
        >
          {/*  RED, and that is a deliberate override of the md.
               §4.2 replaced the source's `#FE4242` with `icon/default` and gave
               a good reason — *"clearing a selection destroys nothing. Red on a
               safe control teaches distrust of red everywhere."* The design
               owner has overruled it, so this is `danger/default`: **6.09:1
               Light, 5.56 Dark**, and a bound role rather than the source's raw
               hex, which was 30.75 ΔE from anything the palette owns.

               The reasoning survives even though the decision did not — if a
               red ✕ starts appearing on controls that DO destroy things, this is
               the one to look at first. */}
          <Icon name="close" size="md" tone="danger" />
        </button>
      </div>
    </div>
  );
}
