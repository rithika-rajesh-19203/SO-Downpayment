import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { Icon } from '../../icons';
import type { IconName } from '../../icons';
import { cn } from '../../utils/cn';

/**
 * MENU — `design-refs/zf-menu.md`, §2.25. A floating list of commands with
 * sub-menus, and a keyboard model.
 *
 * **We re-derived 20 of the md's figures against our own primitives and all 20
 * reproduce exactly** — every contrast pair in §4.3, both of §3.2/§4.5's traps,
 * and all three source numbers (3.27, 3.02, 1.19). It is the first md in this
 * series to score perfect against our token layer.
 *
 * ── WHAT THE SOURCE WAS ──────────────────────────────────────────────────────
 * 22 hand-drawn nodes — two rounded `VECTOR`s, four `LINE`s, ten `FRAME`s — with
 * **not one bound paint**, no component, no instance, no text style and no state
 * beyond the two that happened to be drawn. Four things do not survive:
 *
 * **The submenu's active row is white on `#408DFB` — 3.27:1.** A 1.4.3 failure at
 * 13px on the one row the design is drawing attention to. It clears 1.4.11 at
 * 3.0, which is why it looks fine in a screenshot. §9 does not fill the active
 * row at all: `surface/hover` with `text/default` is **14.05:1**, and a menu's
 * active row is a hover-and-focus state, not a selection.
 *
 * **`#EBEAF2` is the panel border, all four separators AND the open row's
 * highlight** — one hex carrying a boundary, a divider and a state, at 1.19:1
 * against the panel, so it carries none of them. Three roles here.
 *
 * **The drop shadow is `#D7D5E2` at 100% alpha.** Not a shadow — an opaque grey
 * band offset 3px down, **3.94 ΔE from `border/default`**: the colour someone
 * would pick if they were drawing a border on purpose.
 *
 * **The submenu indicator is a DOWN caret on a flyout that opens SIDEWAYS**, and
 * the three rows that carry one pad 10 on the right while the three with nothing
 * pad 30 — exactly inverted.
 *
 * ── TWO ROLES THAT LOOK RIGHT AND ARE NOT ────────────────────────────────────
 * **`surface/raised` is `neutral/1900` in Dark — the same primitive as
 * `surface/hover`.** A menu built on the role whose name says "floating panel"
 * has **no hover state at all in Dark**: 1.00:1. Verified. `surface/default`
 * here, on which hover is 1.08 / 1.07 — weak, but real. §11 decision 1.
 *
 * **`danger/subtle` is 1.00:1 against the panel in Dark** (`red/2000` against
 * `neutral/2000`). So `tone: 'danger'` recolours the label and the glyph only —
 * `danger/text` at 7.04 / 9.27 — and takes the same hover and pressed fills as
 * every other row. The md's own build shipped nine variants on `danger/subtle`
 * before catching it.
 *
 * ── WHERE THIS DIVERGES FROM §9 ──────────────────────────────────────────────
 * §9.3 packages the trigger and the panel as one `MoreMenu`. This takes an
 * `anchor` instead, which is **§11 decision 7 answered**: *"a menu opened from a
 * `zf-button`, a table row's ⋯, or a right-click needs the same panel and a
 * different anchor; none of that is specified."* An anchor-based menu needs no
 * `.zf-menu-trigger` rule, and `PageHeader`'s own action already is one.
 */

/** A command, or a branch. Never both — see `children`. */
export interface MenuItem {
  id: string;
  label: string;
  /** The 16px leading slot. A roster glyph by name, or a supplied node. */
  icon?: IconName | ReactNode;
  /** `danger` recolours the LABEL and the GLYPH. Never the fill — see above. */
  tone?: 'default' | 'danger';
  /**
   * Focusable, announced, inert. NOT the native `disabled`, which removes the
   * button from the accessibility tree — §9.3: "a disabled row that the keyboard
   * skips is a disabled row nobody can discover".
   */
  disabled?: boolean;
  /** A sub-menu. A row has `children` OR `onSelect`, never both. */
  children?: MenuItem[];
  /** §5's `Kind=check` — a row whose value is on. Draws `icon/check` trailing. */
  checked?: boolean;
  onSelect?: () => void;
}

/** A separator is not a property of an item; it is an entry in its own right. */
export type MenuEntry = MenuItem | { separator: true };
const isItem = (e: MenuEntry): e is MenuItem => !('separator' in e);

export interface MenuProps {
  /** The control the menu hangs off. Focus returns to it on Escape. */
  anchor: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  entries: MenuEntry[];
  /** Names what the menu belongs to — "More actions for Purchase Orders". */
  label: string;
  /**
   * Which edge of the panel lines up with which edge of the anchor.
   *
   * `end` (default) — right edges flush. Correct for a trigger sitting at the
   * RIGHT of its container, which is every ⋯ in the system: a 240px panel hung
   * off the LEFT edge of a 32px button would run most of its width back across
   * the page it came from.
   *
   * `start` — left edges flush. Correct for a trigger on the left, where `end`
   * throws the panel backwards past its own button and it reads as belonging to
   * whatever it lands on.
   *
   * The clamp applies either way, so neither value can put the panel off screen.
   */
  align?: 'start' | 'end';
  /**
   * How loudly a row announces itself.
   *
   * `default` — the quiet contextual menu: a neutral `surface/hover` fill and
   * the label going `primary/text`. Right for a switcher or a config menu that
   * appears next to what it is about.
   *
   * `strong` — accented glyphs at rest and a **solid blue row** under the
   * pointer, label and glyph in `primary/on-primary`. For a menu that IS the
   * control's whole content, where the rows are the actions rather than a
   * footnote to something visible behind them.
   *
   * ── THE FILL IS `primary/hover`, NOT `primary/default` ─────────────────────
   * Measured: white on `primary/default` `#3874EB` is **4.32:1**, which fails
   * 1.4.3's 4.5 for 13px text — the row's own label. `primary/hover` `#2762D9`
   * is **5.48 Light / 8.62 Dark**. The role named for the state is also the one
   * that passes in it, which is luck rather than design, but it is checked.
   */
  emphasis?: 'default' | 'strong';
  className?: string;
}

//  §3.1 — 240 fixed, `radius/xl` (12, zf-popover's, not the source's 6), 4 all
//  round, and NO border: the edge is the inset half of `shadow/menu`, because a
//  border-box CSS border eats 2px off the row and the label.
//
//  `overflow-x: clip`, not the `auto` Chromium computes when only one axis is
//  set — measured, the panel became horizontally scrollable and a trackpad wheel
//  slid every row 8px sideways.
/**
 * THE PANEL'S PAINT, exported so a second floating list cannot drift from it.
 *
 * No width and no positioning: those are the caller's, and they are the only two
 * things that legitimately differ between a menu anchored to a trigger and a
 * list that hangs off the control it belongs to.
 *
 * §2.25's own complaint about the system is that the rail's flyout and the page
 * header's view switcher are "two lists 6px apart in padding for no reason".
 * Sharing the constant is the only thing that actually stops that recurring —
 * the md folding the two into this component is §11's ambition, and this is the
 * cheap half of it.
 */
export const MENU_SURFACE = cn(
  'box-border p-2 m-0',
  //  `radius/lg` — 8, down from §3.1's `radius/xl` (12). Design decision,
  //  28 Aug 2026. The md's own note recorded 12 as zf-popover's value rather
  //  than the source's 6, so the panel has never matched its own drawing.
  'bg-surface-default rounded-lg border-0 shadow-menu',
  'max-h-menu-h overflow-x-clip overflow-y-auto overscroll-contain outline-none',
);

const PANEL = cn(
  //  HUGS ITS ROWS. §3.1's fixed 240 left 60px of gutter on the widest menu we
  //  ship, and every narrower one worse. `min-w` keeps a short menu from
  //  collapsing into a tooltip and `max-w` keeps a long label from running the
  //  panel across the page — the two bounds are the whole reason `auto` is safe.
  //
  //  The placement measurement is unaffected: the panel renders at left −9999
  //  before it is measured, where shrink-to-fit resolves against a viewport-wide
  //  containing block, so `offsetWidth` there is already the capped width it
  //  will have once placed.
  'fixed z-100 w-auto min-w-menu max-w-menu-max',
  MENU_SURFACE,
  'animate-nav-flyout-in motion-reduce:animate-none',
);

//  §3.3 — 232 × 32. The source's 34 is what 13/AUTO produces, not what anyone
//  chose: Inter at 13 with automatic leading measures 15.73, the node rounds to
//  16, and 9 + 16 + 9 = 34. 6 + 20 + 6 = 32 is the row height the rest of the
//  system already uses. 12 on EVERY row — the source pads 10 where a caret sits
//  and 30 where nothing does.
export const MENU_ROW = cn(
  //  `group/row` so the glyphs can follow the row's hover. A bare `hover:` on a
  //  child fires when the CHILD is hovered, and a 16px icon is not the target.
  //  NO `gap` here. `emphasis` sets it, and two gap utilities on one element
  //  are settled by the stylesheet's emission order rather than the className's
  //  — the cascade hazard this repo has hit five times. Every consumer of
  //  MENU_ROW picks one, including PageHeader's switcher.
  'group/row relative flex items-center w-full h-16 box-border py-0 px-6',
  //  NO `background` and NO `color` here, for the same reason there is no `gap`:
  //  a base that declares a property every branch also declares hands the
  //  decision to the STYLESHEET's emission order. Measured in the built CSS,
  //  `.bg-transparent` lands 1143 bytes after `.bg-primary-hover` and
  //  `.text-text-default` 988 after `.text-danger-text` — so the base silently
  //  won both, the strong menu's active row had no fill (leaving a white glyph
  //  on white), and every danger label rendered in the default colour.
  //
  //  Every consumer supplies exactly one of each. That is the whole fix.
  //  `radius/md` — 6. It was `sm` (4), which read as a hard-edged strip once the
  //  row carries a solid fill: at 4 a 32-tall row is almost a rectangle, and the
  //  corner only becomes visible at all when something is painted in it.
  //
  //  CONCENTRIC: an inner radius should be the outer one less the padding
  //  between them. The panel is now `radius/lg` (8) with `p-2` (4), so the
  //  exactly concentric row is 8 − 4 = 4 — and this is 6, two MORE than that, so
  //  the row's corner is very slightly rounder than the panel's around it.
  //
  //  Both numbers are chosen, so this is recorded rather than corrected. Worth
  //  knowing: 8 and 6 ARE exactly concentric at `p-1` (2px of panel padding)
  //  instead of `p-2`. One class, if the corners ever look wrong.
  'border-0 rounded-md cursor-pointer text-start',
  'text-body font-regular',
);
const ROW = MENU_ROW;

//  8 at `default`, 12 at `strong` — the reference's roomier row. One or the
//  other, never both.
const ROW_GAP = { default: 'gap-4', strong: 'gap-6' } as const;

interface PanelProps {
  entries: MenuEntry[];
  labelledBy: string;
  label?: string;
  id: string;
  top: number;
  left: number;
  onDismiss: () => void;
  className?: string;
  children?: ReactNode;
  onKeyDown: (e: ReactKeyboardEvent) => void;
  activeId?: string;
  panelRef: React.Ref<HTMLDivElement>;
  renderRow: (item: MenuItem, index: number) => ReactNode;
}

function Panel({
  entries, labelledBy, label, id, top, left, onKeyDown, activeId, panelRef, renderRow, className,
}: PanelProps) {
  let ix = -1;
  return (
    <div
      ref={panelRef}
      id={id}
      role="menu"
      tabIndex={-1}
      aria-label={label}
      aria-labelledby={label ? undefined : labelledBy}
      //  §8 — `aria-activedescendant`, NOT a roving tabindex. The panel keeps
      //  focus and the active row is named, so Escape always has a focused
      //  element to return from, a disabled row can be active without being
      //  tabbable, and the browser never scrolls a row behind the trigger.
      aria-activedescendant={activeId}
      style={{ top, left }}
      onKeyDown={onKeyDown}
      className={cn(PANEL, className)}
    >
      {entries.map((entry, i) => {
        if (!isItem(entry)) {
          //  §9.2 — a BORDER, not a background. A background is forced to Canvas
          //  in forced-colors mode and the rule vanishes entirely; a border is
          //  not discarded. Height 0 plus a 1px border keeps the 9px band exact.
          return <div key={`sep-${i}`} role="separator"
            className="h-0 my-2 border-t border-border-divider" />;
        }
        ix += 1;
        return renderRow(entry, ix);
      })}
    </div>
  );
}

export function Menu({
  anchor, open, onClose, entries, label, align = 'end', emphasis = 'default', className,
}: MenuProps) {
  const uid = useId();
  const [activeIx, setActiveIx] = useState(0);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [subIx, setSubIx] = useState(0);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [subPos, setSubPos] = useState<{ top: number; left: number; side: 'left' | 'right' } | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const typeahead = useRef({ buffer: '', at: 0 });
  //  React 19's types dropped the zero-argument `useRef<T>()` overload, so the
  //  explicit undefined is required rather than stylistic.
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const ptr = useRef({ x: 0, y: 0 });
  //  WHICH INPUT IS DRIVING. §4.4 argues the ring because the 1.08:1 fill is not
  //  a focus indicator — and that argument is about the KEYBOARD. `activeIx` is
  //  moved by the pointer too, so drawing the ring off `active` alone paints a
  //  focus ring that follows the mouse, which says "the keyboard is here" about
  //  a row the keyboard is not on.
  //
  //  This is `:focus-visible`'s heuristic, done by hand because focus lives on
  //  the panel and never on a row. Hover keeps the fill; only the keyboard adds
  //  the ring.
  const [kbd, setKbd] = useState(false);

  const strong = emphasis === 'strong';
  const items = entries.filter(isItem);
  //  Indexed by RENDER POSITION, never by `indexOf(entry)` or by id: the same
  //  MenuItem object used twice resolves to the first index for both, which
  //  produces duplicate DOM ids, two rows carrying `data-active` at once, and a
  //  row the arrows can never reach.
  const rowId = (i: number) => `${uid}-row-${i}`;
  const subId = `${uid}-sub`;
  const subItems = items.find((i) => i.id === openSub)?.children ?? [];

  const stopTimer = () => { clearTimeout(hoverTimer.current); hoverTimer.current = undefined; };

  const close = useCallback((refocus = true) => {
    //  Without this the pending 150ms timer fires AFTER close and re-sets
    //  `openSub`, so the next open starts already expanded.
    stopTimer();
    setOpenSub(null);
    onClose();
    if (refocus) anchor?.focus();
  }, [onClose, anchor]);

  //  §9.3 — placement, and it has to be a LAYOUT effect so the panel never
  //  paints in the wrong place. `position: fixed` with no placement resolves
  //  against whatever laid the trigger out: the md measured a panel landing
  //  147px ABOVE its trigger, covering it and half off-screen.
  //
  //  Below the trigger with RIGHT EDGES ALIGNED, flipping up when there is no
  //  room below — which is what an overflow menu at the end of a toolbar does.
  useLayoutEffect(() => {
    if (!open || !anchor) { setPos(null); return; }
    const place = () => {
      const t = anchor.getBoundingClientRect();
      const el = panelRef.current;
      //  If the panel is not in the DOM there is nothing to measure, and a
      //  right-aligned panel measured at width 0 lands at the trigger's right
      //  edge and runs its full 240 off the screen. That is why it renders at
      //  −9999 first and is placed second, rather than being withheld until a
      //  position exists — the position cannot exist until it has rendered.
      if (!el) return;
      const { offsetHeight: h, offsetWidth: w } = el;
      const below = t.bottom + 4;
      const flip = below + h > window.innerHeight && t.top - 4 - h > 0;
      //  The requested edge first, then clamped into the viewport — never the
      //  other way round, or a panel that would have fitted gets nudged anyway.
      const wanted = align === 'start' ? t.left : t.right - w;
      setPos({
        top: flip ? t.top - 4 - h : below,
        left: Math.min(Math.max(4, wanted), Math.max(4, window.innerWidth - w - 4)),
      });
    };
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open, anchor, entries, align]);

  //  §3.5 — the flyout opens RIGHT and flips left. The source only ever draws
  //  the flipped case because its trigger sits at the right of a page header,
  //  and a component that can only open left breaks the first time it is used on
  //  the left of a screen. The 1px overlap is the source's own fine judgement —
  //  it drew 0.86 — and it is kept.
  useLayoutEffect(() => {
    if (!openSub) { setSubPos(null); return; }
    const p = panelRef.current?.getBoundingClientRect();
    const rowEl = rowRefs.current[activeIx];
    const el = subRef.current;
    if (!p || !rowEl || !el) return;
    const r = rowEl.getBoundingClientRect();
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const side: 'left' | 'right' = p.right - 1 + w <= window.innerWidth ? 'right' : 'left';
    setSubPos({
      //  The first CHILD level with its parent row. The source hangs the panel's
      //  top edge 4px above the row instead, which lands the first child 1px
      //  below the row it belongs to. −4 is the panel's own block padding.
      top: Math.min(r.top - 4, window.innerHeight - h - 4),
      left: side === 'right' ? p.right - 1 : p.left + 1 - w,
      side,
    });
  }, [openSub, activeIx]);

  //  §9.3 — dismissal. `pointerdown` beats `click`: a press that starts inside
  //  and releases outside is a drag, not a dismissal. `focusin` catches Tab —
  //  without it the menu stays open, focus leaves, and Escape (bound to the
  //  panel) is dead, so the menu is stuck open and inert with no keyboard
  //  recovery. Escape therefore also lives at document level.
  useEffect(() => {
    if (!open) return;
    const inside = (n: Node | null) => !!n && (
      !!panelRef.current?.contains(n) || !!anchor?.contains(n) || !!subRef.current?.contains(n));
    const onDown = (e: PointerEvent) => { if (!inside(e.target as Node)) close(false); };
    const onFocusIn = (e: FocusEvent) => { if (!inside(e.target as Node)) close(false); };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !inside(document.activeElement)) { e.preventDefault(); close(); }
    };
    const onMove = (e: PointerEvent) => { ptr.current = { x: e.clientX, y: e.clientY }; };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointermove', onMove);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointermove', onMove);
    };
  }, [open, anchor, close]);

  //  Placed FIRST, focused second: `focus()` scrolls its target into view, and
  //  a panel still parked at −9999 would drag the page there.
  useEffect(() => { if (open && pos) panelRef.current?.focus(); }, [open, pos]);
  useEffect(() => stopTimer, []);
  //  `aria-activedescendant` does NOT scroll the active row into view — that is
  //  the price of §8's choice, and it has to be paid explicitly. The md measured
  //  the active row 197px below the panel after 20 keystrokes.
  useEffect(() => {
    if (open) rowRefs.current[activeIx]?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIx]);

  const move = (d: number) => {
    if (items.length) setActiveIx((i) => (i + d + items.length) % items.length);
  };

  const openSubFor = (ix: number) => {
    const it = items[ix];
    if (!it?.children?.length) return;
    setOpenSub(it.id);
    setSubIx(0);
    queueMicrotask(() => subRef.current?.focus());
  };

  const onKeyDown = (e: ReactKeyboardEvent) => {
    setKbd(true);
    const item = items[activeIx];
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); move(1); return;
      case 'ArrowUp': e.preventDefault(); move(-1); return;
      case 'Home': e.preventDefault(); setActiveIx(0); return;
      case 'End': e.preventDefault(); setActiveIx(items.length - 1); return;
      case 'Escape':
        e.preventDefault();
        if (openSub) { setOpenSub(null); panelRef.current?.focus(); } else close();
        return;
      case 'ArrowRight':
        if (item?.children?.length) { e.preventDefault(); openSubFor(activeIx); }
        return;
      case 'Enter': case ' ':
        e.preventDefault();
        if (!item || item.disabled) return;
        if (item.children?.length) openSubFor(activeIx);
        else { item.onSelect?.(); close(); }
        return;
      default: break;
    }
    //  §7 — typeahead. The only way to reach row 14 of 20 without 14 keystrokes.
    //  A 500ms window: past it, a single letter starts a new search from the
    //  NEXT row, so pressing "r" twice walks the r's rather than sticking.
    if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const now = Date.now();
      const t = typeahead.current;
      t.buffer = now - t.at > 500 ? e.key : t.buffer + e.key;
      t.at = now;
      const q = t.buffer.toLowerCase();
      const from = t.buffer.length === 1 ? activeIx + 1 : activeIx;
      for (let n = 0; n < items.length; n += 1) {
        const at = (from + n) % items.length;
        if (items[at].label.toLowerCase().startsWith(q)) { setActiveIx(at); break; }
      }
    }
  };

  const onSubKeyDown = (e: ReactKeyboardEvent) => {
    setKbd(true);
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setSubIx((i) => (i + 1) % subItems.length); return;
      case 'ArrowUp': e.preventDefault(); setSubIx((i) => (i - 1 + subItems.length) % subItems.length); return;
      case 'ArrowLeft': case 'Escape':
        e.preventDefault(); setOpenSub(null); panelRef.current?.focus(); return;
      case 'Enter': case ' ': {
        e.preventDefault();
        const it = subItems[subIx];
        if (it && !it.disabled) { it.onSelect?.(); close(); }
        return;
      }
      default: break;
    }
  };

  /*  §7 / §9.3 — HOVER INTENT AND THE SAFE TRIANGLE.
      A rectangular corridor between the two panels provably cannot work: the
      straight line from a parent row's centre to the flyout's third row crosses
      TWO SIBLING ROWS inside the panel, and each arms its own 150ms timer that
      closes the flyout. The md measured it — hovering "Sort by" then
      "Preferences" closed it every time, with a 12px corridor in place.

      The triangle runs from the pointer's last position to the flyout's near
      edge. Inside it, another row's timer is 300ms instead of 150, which is long
      enough to arrive. That 300 is a chosen value, not a measured one — the md
      says so in its Provenance.  */
  const headingToFlyout = (x: number, y: number) => {
    const f = subRef.current?.getBoundingClientRect();
    if (!f || !subPos) return false;
    const ax = subPos.side === 'right' ? f.left : f.right;
    const tri: [number, number][] = [[ptr.current.x, ptr.current.y], [ax, f.top], [ax, f.bottom]];
    let inside = false;
    for (let i = 0, j = 2; i < 3; j = i, i += 1) {
      const [xi, yi] = tri[i];
      const [xj, yj] = tri[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };

  const onRowEnter = (item: MenuItem, ix: number, e: ReactPointerEvent) => {
    setKbd(false);
    stopTimer();
    if (openSub && openSub !== item.id && headingToFlyout(e.clientX, e.clientY)) {
      hoverTimer.current = setTimeout(() => {
        setActiveIx(ix);
        setOpenSub(item.children?.length ? item.id : null);
      }, 300);
      return;
    }
    setActiveIx(ix);
    hoverTimer.current = setTimeout(() => {
      if (item.children?.length) { setOpenSub(item.id); setSubIx(0); } else setOpenSub(null);
    }, 150);
  };
  //  Without a `pointerleave` anywhere, `openSub` stays set forever once the
  //  pointer leaves the panel — an invisible stuck state a screen reader still
  //  reports as expanded.
  const onClusterLeave = () => {
    stopTimer();
    hoverTimer.current = setTimeout(() => setOpenSub(null), 300);
  };

  const glyph = (icon: MenuItem['icon']) => (typeof icon === 'string'
    ? <Icon name={icon as IconName} size="md" tone="inherit" /> : icon);

  const row = (item: MenuItem, ix: number, sub: boolean) => {
    const active = (sub ? subIx : activeIx) === ix;
    //  On a `strong` row the fill IS solid, so the glyph has to leave its colour
    //  or it disappears into it. Everything on the row moves together.
    const lit = strong && active;
    const danger = item.tone === 'danger';

    /*  ONE ladder for all three glyph slots — the leading icon, the branch
        chevron and the check. They were three copies and the danger row would
        have gained a white glyph in one of them and not the others.  */
    const glyphTone = item.disabled ? 'text-icon-disabled'
      : danger
        ? (strong
          ? (active ? 'text-danger-on-danger'
            : 'text-danger-text group-hover/row:text-danger-on-danger')
          : 'text-danger-text')
        : lit ? 'text-primary-on-primary'
          : strong ? 'text-primary-default'
            : active ? 'text-primary-text'
              : 'text-icon-default group-hover/row:text-primary-text';
    const branch = Boolean(item.children?.length);
    return (
      <button
        key={item.id}
        id={sub ? `${subId}-${ix}` : rowId(ix)}
        ref={sub ? undefined : (el) => { rowRefs.current[ix] = el; }}
        type="button"
        role={item.checked === undefined ? 'menuitem' : 'menuitemcheckbox'}
        //  §8 — never in the tab order. The panel is the only tabbable node.
        tabIndex={-1}
        //  `aria-disabled`, NOT `disabled`: a disabled button is removed from the
        //  accessibility tree, so a keyboard user never learns the row exists.
        aria-disabled={item.disabled || undefined}
        aria-checked={item.checked}
        aria-haspopup={branch ? 'menu' : undefined}
        aria-expanded={branch ? openSub === item.id : undefined}
        aria-controls={branch && openSub === item.id ? subId : undefined}
        onPointerEnter={sub ? () => { setKbd(false); setSubIx(ix); } : (e) => onRowEnter(item, ix, e)}
        onClick={(e) => {
          e.preventDefault();
          if (item.disabled) return;
          if (branch) openSubFor(ix);
          else { item.onSelect?.(); close(); }
        }}
        className={cn(
          ROW,
          ROW_GAP[emphasis],
          //  Resolved to ONE branch. `bg-surface-hover` beside `bg-transparent`,
          //  or two `text-*` classes on one element, are settled by the
          //  stylesheet's emission order rather than the className's — the
          //  cascade hazard this repo has now hit five times.
          //  ON HOVER THE ROW GOES BLUE — label and glyph together.
          //
          //  `primary/text`, not `primary/default`. On the hover fill the first
          //  is 5.49 Light / 7.21 Dark and the second is **4.00** Light, which
          //  fails 1.4.3's 4.5 for 13px text. It is also the role that already
          //  means "interactive text" everywhere else in the system.
          //
          //  The ACTIVE row takes the same blue, so arrowing onto a row and
          //  pointing at it look identical — which is the point of `activeIx`
          //  being moved by both.
          //
          //  Danger does not turn blue and disabled does not turn anything.
          //  ONE background and ONE colour per state, chosen here. Nothing above
          //  or below this line declares either.
          item.disabled
            ? 'bg-transparent text-text-disabled cursor-default'
            //  DANGER DOES NOT GO BLUE, in either emphasis. A destructive row
            //  that turns the same colour as "Clone" under the pointer has
            //  thrown away the one thing that marked it, at the exact moment the
            //  user is about to commit to it.
            : danger
              //  A SOLID RED ROW, by the same rule the blue one follows: the
              //  fill is `danger/HOVER`, and `danger/on-danger` on it is
              //  **7.04 Light / 8.26 Dark**. (`danger/default` would be 6.09 /
              //  6.26 — also passing, but hover is the role named for the state
              //  and it is the darker, more committed red, which is the right
              //  one for the row you are about to click Delete on.)
              ? (strong
                ? (active
                  ? 'bg-danger-hover text-danger-on-danger'
                  : 'bg-transparent text-danger-text hover:bg-danger-hover hover:text-danger-on-danger')
                : 'bg-transparent text-danger-text hover:bg-surface-hover active:bg-surface-pressed')
              : strong
                //  `primary/hover` as the FILL — white on `primary/default` is
                //  4.32 and fails 1.4.3 for the 13px label sitting on it. This
                //  is 5.48 Light / 8.62 Dark.
                ? (active
                  ? 'bg-primary-hover text-primary-on-primary'
                  : 'bg-transparent text-text-default hover:bg-primary-hover hover:text-primary-on-primary')
                : active
                  ? 'bg-surface-hover text-primary-text active:bg-surface-pressed'
                  : cn('bg-transparent text-text-default hover:text-primary-text',
                    'hover:bg-surface-hover active:bg-surface-pressed'),
          //  §4.4 — the ACTIVE row, which is what `aria-activedescendant` points
          //  at. It always takes the fill; it takes the RING only when the
          //  keyboard put it there. The offset is inset, so the row never
          //  changes size either way.
          //
          //  Hover and focus are different facts and a menu shows both at once —
          //  a pointer can rest on row 3 while the keyboard owns row 7 — but the
          //  ring is the keyboard's half, and a ring that follows the mouse is
          //  the fill's job being done twice in the wrong colour.
          active && kbd && 'outline-2 -outline-offset-2 outline-focus-ring',
        )}
      >
        {item.icon ? (
          <span className={cn('flex-none', glyphTone)}>
            {glyph(item.icon)}
          </span>
        ) : null}

        {/* 160 before it truncates: 232 − 12 − 12 = 208, less icon 16, gap 8,
            gap 8 and trailing 16. */}
        <span className="flex-1 min-w-0 truncate">{item.label}</span>

        {/* §5 — `Kind` changes only what sits in the trailing slot. The chevron
            is `aria-hidden`: `aria-haspopup` already announces it. */}
        {branch ? (
          <Icon name="chevron-right" size="md" tone="inherit"
            className={cn('flex-none', glyphTone)} />
        ) : item.checked ? (
          //  `xs` (12), not the 16 §3.3 gives the trailing slot — and it is the
          //  only glyph in the menu that needs it. Measured, the tick's ink is
          //  89.8% × 81.5% of its box, which is SMALLER than `sort` at 97.5% or
          //  `export` at 99.6%. It reads bigger because it is the one SOLID mark
          //  in a set of outlines, and a filled shape lays down several times
          //  the ink of a 1.25px stroke over the same area.
          //
          //  At 12 it is 10.78 × 9.78, which puts it beside the derived
          //  chevron's 9.74 × 5.49 rather than towering over it. `sm` (14) would
          //  give 12.57 × 11.41 if that is still too much of a drop.
          <Icon name="check" size="xs" tone="inherit"
            className={cn('flex-none', glyphTone)} />
        ) : null}
      </button>
    );
  };

  if (!open) return null;

  return (
    <div className={className}>
      <Panel
        entries={entries}
        id={`${uid}-menu`}
        label={label}
        labelledBy={`${uid}-menu`}
        top={pos?.top ?? -9999}
        left={pos?.left ?? -9999}
        onDismiss={close}
        onKeyDown={onKeyDown}
        activeId={items.length ? rowId(activeIx) : undefined}
        panelRef={panelRef}
        renderRow={(item, ix) => row(item, ix, false)}
      />

      {/* §9.2 — the corridor is a REAL ELEMENT, positioned here, not a
          pseudo-element on the row: both panels are scroll containers, so a
          pseudo-element on either is clipped (8 of a 12px corridor was cut off),
          and `inset-inline-start: 100%` puts it on the wrong side entirely
          whenever the flyout flips. It only bridges the 1px seam; the diagonal
          travel is the triangle above. */}
      {openSub && subPos ? (
        <div
          aria-hidden
          className="fixed z-100 w-4"
          style={{
            top: subPos.top,
            height: subRef.current?.offsetHeight ?? 0,
            left: subPos.side === 'right'
              ? subPos.left - 8
              : subPos.left + (subRef.current?.offsetWidth ?? 0),
          }}
          onPointerEnter={stopTimer}
        />
      ) : null}

      {openSub ? (
        <Panel
          entries={subItems}
          id={subId}
          labelledBy={rowId(activeIx)}
          top={subPos?.top ?? -9999}
          left={subPos?.left ?? -9999}
          onDismiss={close}
          onKeyDown={onSubKeyDown}
          activeId={subItems.length ? `${subId}-${subIx}` : undefined}
          panelRef={subRef}
          renderRow={(item, ix) => row(item, ix, true)}
          className="animate-none"
        />
      ) : null}

      {/* The cluster's pointerleave. On the wrapper so it fires once for the
          panel, the corridor and the flyout together. */}
      <div aria-hidden className="contents" onPointerLeave={onClusterLeave} />
    </div>
  );
}
