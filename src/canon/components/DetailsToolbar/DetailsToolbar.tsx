import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode, Ref } from 'react';
import { Icon } from '../../icons/Icon';
import type { IconName } from '../../icons/paths';
import { cn } from '../../utils/cn';

/**
 * DETAILS TOOLBAR — zf-details-toolbar.md §2.29. The action row under
 * `PageHeader` on a record.
 *
 * **There was no component.** 16 raw nodes: a rectangle, two rotated `LINE`s,
 * two actions drawn as bare icon-plus-text, and an imported 18 × 18 overflow
 * frame. Every hex in §4.1 reproduces against our primitives — 16 of 16 — and
 * every Light contrast figure with it.
 *
 * ── THE TARGET, WHICH IS THE WHOLE REASON THIS IS A COMPONENT ────────────────
 * §6.1: "Edit" is a **44.95 × 17** text box with no padding. 2.5.8 asks for
 * 24 × 24, so it is short by 7 — 29% — on the most-used control on a record
 * page. The spacing exception technically applies (the two actions are 127.5px
 * apart centre-to-centre), and the md's own sentence is the right one: *"an
 * exception is a licence, not a design."* A padding-free target also has
 * nowhere to render a hover or a focus ring, which is the second defect. The
 * item is now 28 × 58.
 *
 * ── THE SHADOW WAS A BORDER ──────────────────────────────────────────────────
 * §4.3: the source draws a 1px `OUTSIDE` stroke on the **top** edge and a
 * `DROP_SHADOW 0 2 4 #D7DAEB @72%` underneath — two mechanisms for the two
 * edges of one band, and at 72% over 4px of blur the lower one is a blurred
 * hairline pretending to be an elevation. A toolbar is part of the page, not
 * floating over it. One 1px **bottom** rule replaces both, and unlike a shadow
 * it survives `forced-colors`.
 *
 * The top edge is gone entirely: `PageHeader` already carries a bottom stroke
 * on all three variants, and two adjacent hairlines read as one 2px line.
 *
 * ── THE BAND IS NOT TINTED, AND OUR DARK PANE DISAGREES WITH THE MD ──────────
 * §4.2 fills the source band `#F8F8FD` and rejects it, because on
 * `surface/sunken` a neutral hover reaches **1.04:1**. Verified: 1.04 exactly.
 * So the bar is `surface/default` and the item hovers to `surface/hover` —
 * 1.08 Light, 1.07 Dark, the same hover every other component uses.
 *
 * **But the argument is a Light-pane argument, and it inverts in Dark.** Our
 * `surface/sunken` is `#191C29` there, and against `surface/hover` `#222536`
 * that is **1.12:1** — better than the 1.07 we ship. The md states one figure
 * per role because §2.1 specifies one pane. We still take `surface/default`:
 * consistency across the system beats 0.05 of contrast in one pane, and a bar
 * that is tinted in Dark and not in Light is two components.
 *
 * ── WHAT THE MD GETS WRONG ABOUT FOLDING ─────────────────────────────────────
 * §3 folds at "1100 / 900 / 700", which are **viewport** widths. This toolbar
 * lives in the detail column of a `SplitView`, behind a 353px mini list and a
 * 220px rail — so the viewport is up to 573px wider than the bar, and a
 * viewport breakpoint folds at the wrong moment in both directions. Folding
 * here is driven by a `ResizeObserver` on the bar's own content box, so it is
 * correct wherever the bar is put.
 *
 * The order §3 asks for is kept exactly: **the label hides before the icon
 * does**, and only then do items fold into `⋯` from the right.
 */

export interface DetailsToolbarItem {
  id: string;
  /** The visible label, and the accessible name once the label folds away. */
  label: string;
  icon?: IconName | ReactNode;
  /**
   * The action opens a menu. Draws the caret and sets `aria-haspopup="menu"` —
   * §5: *"a caret with no `aria-haspopup` tells a sighted user a menu is coming
   * and a screen-reader user nothing."*
   */
  menu?: boolean;
  /** Bind to the `Menu`'s open state so the caret and ARIA agree. */
  expanded?: boolean;
  /**
   * `aria-disabled`, **never** the `disabled` attribute — §5. A `disabled`
   * button leaves the tab order, and in a roving-tabindex toolbar that means a
   * keyboard user never learns the action exists.
   */
  disabled?: boolean;
  /** For anchoring a `Menu` to this item. */
  ref?: Ref<HTMLButtonElement>;
  onSelect: () => void;
}

export interface DetailsToolbarGroup {
  id: string;
  /**
   * Names the cluster for assistive tech. Required, and it is doing the real
   * work: §5 — the separator is 1.31:1, so *"a 1.31:1 hairline cannot be the
   * only thing grouping the actions."* The hairline is the picture of the
   * grouping; this is the grouping.
   */
  label: string;
  items: DetailsToolbarItem[];
}

export interface DetailsToolbarProps {
  /**
   * Three groups, at most four items in one — §3. Past that the separators stop
   * grouping and start decorating, and the honest answer is that some of those
   * actions belong in the overflow or on the record rather than on the chrome.
   */
  groups: DetailsToolbarGroup[];
  /** `role="toolbar"`'s accessible name. */
  label?: string;
  /**
   * The `⋯`, pinned to the far end. Rendered whenever it is supplied **or**
   * anything has folded — an action that folds away with nowhere to go is an
   * action the user cannot reach.
   */
  overflow?: {
    label?: string;
    expanded?: boolean;
    ref?: Ref<HTMLButtonElement>;
    /** Receives the ids that folded, so the menu can offer exactly those. */
    onSelect: (foldedIds: string[]) => void;
  };
  /**
   * Take the bar off the page without unmounting it.
   *
   * The action bar does not only replace the page header — it replaces the
   * **record's chrome**, and the toolbar is part of that. The header names the
   * displayed record and the toolbar acts on it, so when the user is acting on
   * a multi-record selection instead, both step aside together. Leaving the
   * toolbar up puts "Record Payment" on screen twice, 40px apart, meaning two
   * different things.
   *
   * `hidden`, never unmounted — the same argument `PageChrome` makes for the
   * header. This bar holds the roving-tabindex position and a set of measured
   * natural widths; unmounting throws both away and pays for a fresh
   * measurement pass every time a checkbox is ticked.
   */
  hidden?: boolean;
  className?: string;
}

//  §2 — 28 tall, `space/3` either side, `space/3` between glyph and label,
//  `radius/sm`. The hit target the source did not have.
const ITEM = [
  'inline-flex items-center flex-none gap-3 px-3 h-details-toolbar-item',
  'rounded-sm border-0 bg-transparent text-text-default whitespace-nowrap cursor-pointer',
  'text-body font-regular',
  'hover:bg-surface-hover',
  //  A negative outline-offset rather than §7.2's inset box-shadow. Same 2px
  //  ring inside the same 28 box, so the label still does not shift — but
  //  `forced-colors` discards box-shadow and paints outline, which deletes the
  //  md's whole `@media (forced-colors: active)` block instead of leaving a
  //  second copy of the rule to fall out of sync. Same departure PageHeader
  //  documents against §9.2.
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring',
  //  2.13:1 Light, 2.38 Dark. WCAG exempts inactive controls from 1.4.3.
  'aria-disabled:text-text-disabled aria-disabled:cursor-default',
  'aria-disabled:hover:bg-transparent',
  'transition-colors duration-150 motion-reduce:transition-none',
].join(' ');

//  THE SLOT IS 14, not §2's 16. Design decision, 28 Aug 2026 — one value for
//  every glyph in the bar, the caret and the ⋯ included, so nothing in the row
//  is drawn at a different scale from its neighbour.
//
//  It lands the caret where it should be by arithmetic rather than by luck:
//  `caret-down`'s ink fills only 51% of its 16 viewBox, so a 14 slot draws a
//  **7.1px** arrow — the same mark as the Bulk Actions caret's 7.5, reached from
//  the ramp instead of needing a token. (`caret-down-bold` fills 109% of a 24
//  viewBox and would draw 15.3 in the same slot. They are not interchangeable.)
//
//  `inherit`, so every glyph is exactly its own label's colour and therefore
//  exactly every other glyph's colour.
//
//  §4.1 puts the icon on `icon/default` (#565A70, 6.79:1) and the label on
//  `text/default` (#222536, 15.15:1) — two roles, so the row reads as a grey
//  glyph beside a black word, and a filled glyph and a 1.25-stroked one drift
//  further apart again. CLAUDE.md's own icon rule is the answer: *"an icon
//  beside a label is part of that label."* Inheriting also carries `disabled`
//  for free, which is why the tone argument is gone rather than defaulted.
//
//  It raises the glyph from 6.79 to 15.15. Nothing about 1.4.11 gets worse.
const glyph = (icon: IconName | ReactNode) =>
  (typeof icon === 'string'
    ? <Icon name={icon as IconName} size="sm" tone="inherit" />
    : icon);

/** Every focusable cell, in visual order — what the roving tabindex walks. */
type Slot = { id: string; disabled?: boolean };

export function DetailsToolbar({
  groups, label = 'Record actions', overflow, hidden = false, className,
}: DetailsToolbarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());

  const flat = groups.flatMap((g) => g.items);
  //  A signature rather than the array: `groups` is rebuilt on every render of
  //  the screen above, so an object identity dep would re-measure forever.
  const signature = flat.map((i) => `${i.id}:${i.label}:${i.icon ? 1 : 0}:${i.menu ? 1 : 0}`).join('|')
    + `#${groups.map((g) => g.items.length).join(',')}`;

  /** Natural widths, measured once per content change off the ghost row. */
  const nat = useRef<{ full: number[]; iconOnly: number[]; sep: number; more: number; gap: number }>({
    full: [], iconOnly: [], sep: 0, more: 0, gap: 0,
  });

  const [compact, setCompact] = useState(false);
  const [shown, setShown] = useState(flat.length);
  const [active, setActive] = useState(0);

  //  ── MEASURE ────────────────────────────────────────────────────────────────
  //  Off a ghost row that always renders every item at full fidelity. Measuring
  //  the live row instead would read widths that folding had already changed,
  //  and the fold would then never come back when the bar grew again.
  useLayoutEffect(() => {
    const ghost = ghostRef.current;
    if (!ghost) return;
    //  Read rather than restated: `space/3` is a token and the icon-only
    //  arithmetic has to follow it, not carry a second copy of 6.
    const gap = parseFloat(getComputedStyle(ghost).columnGap || '0') || 0;
    const cells = Array.from(ghost.querySelectorAll<HTMLElement>('[data-cell]'));
    const full: number[] = [];
    const iconOnly: number[] = [];
    for (const cell of cells) {
      const w = cell.getBoundingClientRect().width;
      full.push(w);
      const lbl = cell.querySelector<HTMLElement>('[data-label]');
      const hasGlyph = cell.querySelector('[data-glyph]');
      //  An item with no glyph cannot drop its label: it would have no visible
      //  content and no accessible one either.
      iconOnly.push(
        lbl && hasGlyph
          ? w - lbl.getBoundingClientRect().width - parseFloat(getComputedStyle(cell).columnGap || '0')
          : w,
      );
    }
    const sepEl = ghost.querySelector<HTMLElement>('[data-sep]');
    const moreEl = ghost.querySelector<HTMLElement>('[data-more]');
    //  MARGINS, and this is the whole 17. `getBoundingClientRect` returns the
    //  BORDER box, so the separator measures its 1px rule and none of the
    //  `space/4` either side — the fit would then undercount by 16 per
    //  separator and the bar would fold 32px too late with three groups.
    //  §2 is explicit that the separator component is 17 x 20, not 1 x 20.
    let sep = 0;
    if (sepEl) {
      const scs = getComputedStyle(sepEl);
      sep = sepEl.getBoundingClientRect().width
        + (parseFloat(scs.marginInlineStart || '0') || 0)
        + (parseFloat(scs.marginInlineEnd || '0') || 0);
    }
    nat.current = {
      full,
      iconOnly,
      sep,
      more: moreEl ? moreEl.getBoundingClientRect().width : 0,
      gap,
    };
  }, [signature]);

  //  ── FIT ────────────────────────────────────────────────────────────────────
  //  `groups` and `overflow` are rebuilt by the parent on every render, so
  //  closing over them would make `fit` a new function each time — tearing the
  //  ResizeObserver down and re-creating it on every render, and losing any
  //  resize that landed in the gap. Latest values through a ref instead, and
  //  `fit` depends only on the signature.
  const latest = useRef({ groups, hasOverflow: Boolean(overflow), count: flat.length });
  latest.current = { groups, hasOverflow: Boolean(overflow), count: flat.length };

  const fit = useCallback(() => {
    const bar = barRef.current;
    const { hasOverflow, count } = latest.current;
    const { full, iconOnly, sep, more, gap } = nat.current;
    if (!bar || full.length !== count) return;

    const cs = getComputedStyle(bar);
    const avail = bar.clientWidth
      - parseFloat(cs.paddingInlineStart || '0')
      - parseFloat(cs.paddingInlineEnd || '0');
    //  A `display: none` bar has a clientWidth of 0, and a ResizeObserver fires
    //  on the way there. Without this the bar folds to a single item every time
    //  it is hidden, and the user sees it snap back open on the way in. Hold
    //  the last good fit instead — nothing has changed while it was away.
    if (avail <= 0) return;

    //  The first `n` items, plus one rule between every adjacent pair. Groups
    //  no longer change the arithmetic at all — they used to contribute a rule
    //  each at their boundaries, and now every boundary has one — so this walks
    //  the flat sequence and does not need to know where the groups are.
    const widthOf = (n: number, useIconOnly: boolean) => {
      if (n === 0) return 0;
      const w = useIconOnly ? iconOnly : full;
      let total = 0;
      for (let i = 0; i < n; i += 1) total += w[i];
      //  `gap` is 0 by construction — the separator's own margin is the only
      //  spacing — but it is read rather than assumed, so a container gap put
      //  back later cannot silently make every fold 4px early.
      total += Math.max(0, n - 1) * (sep + gap);
      return total;
    };

    //  The ⋯ costs its own width AND the rule in front of it.
    const spring = hasOverflow ? more + sep + gap : 0;
    const reserve = (n: number) => (n < count || hasOverflow ? more + sep + gap : 0);

    if (widthOf(count, false) + spring <= avail) {
      setCompact(false); setShown(count); return;
    }
    //  §3 — THE LABEL HIDES BEFORE THE ICON DOES.
    if (widthOf(count, true) + spring <= avail) {
      setCompact(true); setShown(count); return;
    }
    //  Then fold from the right. Never below one: a bar of nothing but `⋯` has
    //  lost the action the whole page is about, and §3 keeps Edit to the end.
    let n = count;
    while (n > 1 && widthOf(n, true) + reserve(n) > avail) n -= 1;
    setCompact(true); setShown(n);
  }, []);

  useLayoutEffect(fit, [fit, signature]);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(fit);
    ro.observe(bar);
    return () => ro.disconnect();
  }, [fit]);

  //  ── ROVING TABINDEX ────────────────────────────────────────────────────────
  //  §5: ONE tab stop. Seven tab stops between the header and the record is
  //  seven presses to reach what the user came to read.
  const visible = flat.slice(0, shown);
  const folded = flat.slice(shown);
  const showMore = Boolean(overflow) || folded.length > 0;
  const slots: Slot[] = [
    ...visible.map((i) => ({ id: i.id, disabled: i.disabled })),
    ...(showMore ? [{ id: '__more' }] : []),
  ];

  //  Folding can strand the roving index past the end of the row.
  const index = Math.min(active, Math.max(0, slots.length - 1));

  const focusSlot = (n: number) => {
    const slot = slots[n];
    if (!slot) return;
    setActive(n);
    itemRefs.current.get(slot.id)?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    //  Logical, not physical: in RTL the row is mirrored and ArrowRight has to
    //  walk backwards, or the keyboard disagrees with the eye.
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    const fwd = rtl ? 'ArrowLeft' : 'ArrowRight';
    let next: number | null = null;
    if (e.key === fwd) next = (index + 1) % slots.length;
    else if (e.key === back) next = (index - 1 + slots.length) % slots.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = slots.length - 1;
    if (next === null) return;
    e.preventDefault();
    focusSlot(next);
  };

  const bind = (id: string) => (el: HTMLButtonElement | null) => {
    if (el) itemRefs.current.set(id, el); else itemRefs.current.delete(id);
  };

  const renderItem = (
    item: DetailsToolbarItem, slotIndex: number, hideLabel: boolean, ghost = false,
  ) => {
    const labelHidden = hideLabel && Boolean(item.icon);
    return (
      <button
        key={item.id}
        //  THE GHOST BINDS NOTHING. It renders every item a second time, and it
        //  renders AFTER the live row — so a shared ref callback would leave
        //  every entry in the map, and the consumer's own `ref`, pointing at the
        //  invisible copy. Arrow-key focus would go nowhere and a Menu would
        //  anchor to a zero-opacity box off the left edge.
        ref={ghost ? undefined : (el) => {
          bind(item.id)(el);
          if (typeof item.ref === 'function') item.ref(el);
          else if (item.ref) (item.ref as { current: HTMLButtonElement | null }).current = el;
        }}
        type="button"
        data-cell
        //  §3 — an item with no label must carry one anyway.
        aria-label={labelHidden ? item.label : undefined}
        aria-haspopup={item.menu ? 'menu' : undefined}
        aria-expanded={item.menu ? Boolean(item.expanded) : undefined}
        aria-disabled={item.disabled || undefined}
        tabIndex={slotIndex === index ? 0 : -1}
        onFocus={() => setActive(slotIndex)}
        //  `aria-disabled` keeps the control focusable, so the click has to be
        //  refused here rather than by the platform.
        onClick={() => { if (!item.disabled) item.onSelect(); }}
        className={ITEM}
      >
        {item.icon ? <span data-glyph className="flex-none">{glyph(item.icon)}</span> : null}
        {labelHidden ? null : <span data-label>{item.label}</span>}
        {item.menu ? (
          <span data-glyph className="flex-none">
            <Icon name="caret-down" size="sm" tone="inherit" />
          </span>
        ) : null}
      </button>
    );
  };

  //  §7.1 has no spacer element and springs this to the far end. It is PACKED
  //  here instead — see the class list below.
  const renderMore = (slotIndex: number) => (
    <button
      key="__more"
      ref={(el) => {
        bind('__more')(el);
        if (overflow?.ref) {
          if (typeof overflow.ref === 'function') overflow.ref(el);
          else (overflow.ref as { current: HTMLButtonElement | null }).current = el;
        }
      }}
      type="button"
      data-cell
      data-more
      aria-label={overflow?.label ?? 'More actions'}
      aria-haspopup="menu"
      aria-expanded={Boolean(overflow?.expanded)}
      tabIndex={slotIndex === index ? 0 : -1}
      onFocus={() => setActive(slotIndex)}
      onClick={() => overflow?.onSelect(folded.map((i) => i.id))}
      //  PACKED, not sprung. §7.1 pins the overflow to the far end with
      //  `margin-inline-start: auto`, which is right when the rule before it is
      //  a GROUP boundary — but with a rule between every pair, springing the ⋯
      //  strands its own rule 400px to the left of it. The reference packs it.
      className={cn(ITEM, 'justify-center px-0 w-details-toolbar-item')}
    >
      <Icon name="more" size="sm" tone="inherit" />
    </button>
  );

  const separator = (key: string) => (
    <span
      key={key}
      data-sep
      aria-hidden="true"
      //  `mx-4` is `space/4` — 8 either side, and it is the ONLY space between
      //  two items now. The bar and the groups run at `gap-0` for exactly that
      //  reason: with a rule between every pair, a container gap would stack on
      //  top of this margin and the visible gap would be 12, not the 8 asked
      //  for. One owner for one measurement.
      className="flex-none w-px h-details-toolbar-rule mx-4 bg-border-default"
    />
  );

  //  A rule between every adjacent pair, wherever the group boundaries fall.
  //  `emitted` counts across groups, so the first item of the second group gets
  //  its rule too — and the FIRST item of all never does, which is the one thing
  //  a per-group loop gets wrong.
  let cursor = 0;
  let emitted = 0;
  const rows: ReactNode[] = [];
  for (const g of groups) {
    const take = Math.max(0, Math.min(g.items.length, shown - cursor));
    if (take > 0) {
      const kids: ReactNode[] = [];
      g.items.slice(0, take).forEach((item, k) => {
        if (emitted > 0) kids.push(separator(`sep-${item.id}`));
        kids.push(renderItem(item, cursor + k, compact));
        emitted += 1;
      });
      rows.push(
        //  The group survives even though it no longer looks like one: the rules
        //  are `aria-hidden` and never carried the grouping anyway — §5 is
        //  explicit that a 1.31:1 hairline cannot. This is what an AT hears.
        <div key={g.id} role="group" aria-label={g.label} className="flex items-center">
          {kids}
        </div>,
      );
    }
    cursor += g.items.length;
  }

  return (
    <div
      ref={barRef}
      role="toolbar"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        //  ONE branch. `hidden` as an attribute alongside a `flex` class is the
        //  exact trap the Modal shipped once: the UA's `[hidden]{display:none}`
        //  loses to any author `display`, so the bar renders whether or not it
        //  is meant to. Resolving the two here makes that unrepresentable.
        hidden ? 'hidden' : 'flex',
        //  `relative` so the ghost below can be taken out of flow against THIS
        //  box rather than against whatever ancestor happens to be positioned.
        'relative items-center flex-none box-border',
        'h-details-toolbar px-10',
        'bg-surface-default',
        //  BOTTOM only. §2 — PageHeader already draws the rule above, and two
        //  adjacent hairlines read as one 2px line.
        'border-b border-border-divider',
        //  §3 — the bar never wraps and never scrolls; items fold instead.
        'overflow-clip',
        className,
      )}
    >
      {rows}
      {showMore ? (
        <>
          {emitted > 0 ? separator('sep-more') : null}
          {renderMore(slots.length - 1)}
        </>
      ) : null}

      {/* THE GHOST — every item at full fidelity, laid out but never painted
          and never reachable, so the natural widths stay true no matter what
          the live row has folded. Measuring the live row instead would read
          widths that folding had already changed, and the items would never
          come back when the bar grew again.

          `invisible` rather than `hidden`: a `display: none` subtree generates
          no boxes and measures 0. `absolute` keeps it out of the live row's
          flow, and the bar's own `overflow-clip` stops it painting a second
          toolbar if `visibility` ever fails to apply. */}
      <div
        ref={ghostRef}
        aria-hidden="true"
        // @ts-expect-error — `inert` is a real attribute; React's types lag it.
        inert=""
        className="absolute start-0 top-0 invisible pointer-events-none flex items-center"
      >
        {groups.flatMap((g, gi) => (
          g.items.map((item, k) => (
            <span key={item.id} className="flex items-center">
              {gi + k > 0 ? separator(`gsep-${item.id}`) : null}
              {renderItem(item, -1, false, true)}
            </span>
          ))
        ))}
        {separator('gsep-more')}
        {/* `data-more` ONLY. `data-cell` here would put the ⋯ in the item
            census, `full.length` would come back one longer than the item
            count, and fit()'s guard would trip on every call — the bar would
            silently never fold. */}
        <span data-more className={cn(ITEM, 'justify-center px-0 w-details-toolbar-item')}>
          <Icon name="more" size="sm" tone="inherit" />
        </span>
      </div>
    </div>
  );
}
