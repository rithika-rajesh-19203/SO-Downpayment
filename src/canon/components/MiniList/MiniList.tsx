import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import { Icon } from '../../icons';
import { Text } from '../../primitives';
import { cn } from '../../utils/cn';
import { Button } from '../Button/Button';
import { Checkbox } from '../Checkbox/Checkbox';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import type { StatusBadgeStatus } from '../StatusBadge/StatusBadge';
import { Menu } from '../Menu/Menu';
import type { MenuEntry } from '../Menu/Menu';

/**
 * MINI LIST — `design-refs/zf-mini-list.md`, §2.28. The left column of a split
 * view: a toolbar that does not scroll and a row list that does.
 *
 * **All nine of the md's contrast figures reproduce exactly** against our
 * primitives, as do both source figures and the `text/tertiary` trap.
 *
 * ── IT IS A NAVIGATION CONTROL, NOT A LIST OF LINKS ──────────────────────────
 * §5: *"a user arrowing through seven links navigates seven times."* This is a
 * `listbox` whose selection drives a route — arrows move the active option,
 * Enter opens it, and **selecting a row must not scroll the list or lose its
 * position**, because that is the entire reason the pattern exists.
 *
 * **Two selections coexist and must never be confused.** "Which record am I
 * reading" is the route; "which records am I acting on" is the checkbox. Ticking
 * a box must not navigate — hence the `stopPropagation` below, without which
 * every bulk tick also changes the page.
 *
 * ── THE ACTIVE ROW IS A FILL, AND THE FILL IS `surface/hover` ───────────────
 * §4.4 puts the selected row on `surface/selected`, which is **1.13:1** against
 * its neighbour in Light and **1.02:1** in Dark — where the selected row is
 * fractionally *darker* than the rows around it and reads as receding rather
 * than chosen. The source's own `#F8F7FC` is 1.07.
 *
 * That is why it used to carry a 2px `primary/default` leading edge. The edge
 * is gone by decision, and the fill moved to `surface/hover` — **1.08 Light,
 * 1.07 Dark** — which is a real gain in the pane that had the problem: the Dark
 * active row goes 1.02 → 1.07. Light trades 0.05 and the edge for consistency
 * with every other row treatment in the system.
 *
 * The cost is that a hovered row and the active row share a fill. The pointer
 * disambiguates, and the moment it leaves, one row stays lit. The active row's
 * own hover steps up to `surface/pressed` (1.20 / 1.16) so that pointing at it
 * is not the one place in the list that answers with nothing.
 *
 * **In `forced-colors` every fill is replaced by a system colour**, so a
 * fill-only selection is erased there whichever fill it is. `index.css` repaints
 * it as a real `border-inline-start: 2px solid Highlight` off `data-zf-selected`
 * — now the only cue that survives the mode rather than a backup for a visible
 * one.
 *
 * ── AND THE STATUS IS A BADGE, NOT COLOURED TEXT ─────────────────────────────
 * §4.4 measured the source's status at `#00B050`, 12px, **2.87:1** — a 1.4.3
 * fail on the field that says what state the record is in. Moving it to a tone
 * role only reached 4.52 on a default row and **4.01 on the selected one**, and
 * *a role that passes on one row and fails on the next is not a role you can put
 * text in.*
 *
 * So it is a `StatusBadge`, whose worst pairing across all fourteen variants is
 * **5.80** and whose best is 12.69 — and whose fill and label ship as one token
 * pair, because they are chosen together. That is also the house rule: a status
 * is a `StatusBadge`, never a coloured `Text`.
 *
 * **The word carries the meaning and the colour only reinforces it**, which is
 * what keeps it out of 1.4.1 — the source's `#00B050` carried it alone.
 */
export interface MiniListItem {
  id: string;
  /** Never optional — it is the row's accessible name. */
  name: string;
  /** Pre-formatted. The caller owns the currency, not the component. */
  amount?: string;
  /**
   * Up to three facts, separated by a 1px rule. §3: *"Keep it to three: past
   * that it wraps and the row stops being 93."*
   */
  meta?: string[];
  /** The badge's text — "Paid", "Overdue by 30 days", "Partially paid". */
  status?: string;
  /**
   * WHICH badge. A `StatusBadge` variant, not a colour: the fill and the label
   * colour are chosen together and ship as one token pair, which is the whole
   * argument for `tokens/badge.css` existing.
   *
   * This replaced a four-value `statusTone` that painted coloured text. §4.4
   * measured the source's status at `#00B050`, 12px, **2.87:1** — a 1.4.3 fail
   * on the field that says what state the record is in — and a tone role only
   * moved that to 4.52 on a default row. The badge's worst pairing is 5.80.
   */
  statusVariant?: StatusBadgeStatus;
}

export interface MiniListProps {
  /** Names the listbox. A listbox with no name announces as "listbox". */
  label: string;
  items: MiniListItem[];
  /** The record being read — the route. */
  activeId: string | null;
  onActivate: (id: string) => void;
  /**
   * The records being acted on — bulk. Present means the rows show a checkbox;
   * absent means they do not, and the row is still clickable.
   */
  selection?: {
    selected: ReadonlySet<string>;
    onChange: (next: Set<string>) => void;
  };
  /** The toolbar's view switcher. Omit for a list with one view. */
  views?: { id: string; label: string }[];
  viewId?: string;
  onViewChange?: (id: string) => void;
  onCreate?: () => void;
  /** The ⋯ overflow. Omit for none. */
  moreEntries?: MenuEntry[];
  /**
   * Replaces the toolbar's contents — an `<ActionBar density="compact">` while a
   * bulk selection exists.
   *
   * The bar belongs HERE, on the same side as the checkboxes that filled it,
   * rather than over in the detail column: the selection is a fact about this
   * list, and putting its bar on the other side of the split makes the user
   * look away from what they are ticking to read what they have ticked.
   *
   * The three rules `PageChrome` sets out hold identically:
   *
   * **1 · One cell, one block-size.** The toolbar stays 56 whichever occupant is
   * in it, so ticking the first checkbox cannot move the list under the pointer
   * that just clicked it.
   *
   * **2 · The toolbar is hidden, never unmounted.** It owns the view switcher's
   * open menu and its scroll position; unmounting throws them away and the user
   * rebuilds them after every bulk action.
   *
   * **3 · Focus never crosses the swap.** There is no `autoFocus` here and there
   * must never be one — moving focus because a value changed is 3.2.2, and it
   * would fire on every single checkbox click.
   */
  bar?: ReactNode;
  className?: string;
}


export function MiniList({
  label, items, activeId, onActivate, selection,
  views, viewId, onViewChange, onCreate, moreEntries, bar, className,
}: MiniListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const viewRef = useRef<HTMLButtonElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const activeIx = Math.max(0, items.findIndex((i) => i.id === activeId));
  const [focusIx, setFocusIx] = useState(activeIx);

  //  §5 — a deep link lands on the record AND shows where it sits in the list.
  //  `block: 'nearest'` so arrowing scrolls by the smallest amount rather than
  //  centring on every press, and no `behavior: 'smooth'`: an animated scroll on
  //  arrival is a page that appears to be still loading.
  useEffect(() => {
    rowRefs.current[activeIx]?.scrollIntoView({ block: 'nearest' });
    setFocusIx(activeIx);
  }, [activeIx]);

  const focusRow = useCallback((ix: number) => {
    const next = Math.max(0, Math.min(ix, items.length - 1));
    setFocusIx(next);
    rowRefs.current[next]?.focus();
    rowRefs.current[next]?.scrollIntoView({ block: 'nearest' });
  }, [items.length]);

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); focusRow(focusIx + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focusRow(focusIx - 1); }
    else if (e.key === 'Home') { e.preventDefault(); focusRow(0); }
    else if (e.key === 'End') { e.preventDefault(); focusRow(items.length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const it = items[focusIx];
      if (it) onActivate(it.id);
    }
  };

  const view = views?.find((v) => v.id === viewId) ?? views?.[0];

  return (
    <div className={cn(
      //  353 fixed, and the whole column height. Its own edge is a divider
      //  rather than a border/default: it separates two regions of one surface.
      //  NO SHADOW — a split-view column is not elevated.
      'flex flex-col flex-none w-mini-list min-h-0 box-border',
      'bg-surface-default border-e border-border-divider',
      className,
    )}>
      <div className={cn(
        'relative flex-none h-mini-list-toolbar box-border',
        'border-b border-border-divider',
      )}>
      {/* Rule 2 — a wrapper rather than a prop on the switcher, so nothing in
          the toolbar has to know it can be replaced.

          ONE branch, never `hidden` beside a `flex` class: the UA's
          `[hidden]{display:none}` loses to any author `display`, which is
          exactly how the Modal once rendered whether or not it was open. */}
      <div className={cn(
        bar ? 'hidden' : 'flex',
        'items-center gap-4 h-full px-8 box-border',
      )}>
        {views?.length ? (
          <>
            <button
              ref={viewRef}
              type="button"
              aria-haspopup="listbox"
              aria-expanded={viewOpen}
              onClick={() => setViewOpen((o) => !o)}
              className={cn(
                //  `-ms-3` cancels the button's own `px-3`, so the LABEL starts
                //  at the panel's 16 and lands on the same vertical as the row
                //  names below it — 16 - 6 + 6. The button's box is what moves,
                //  never the text.
                'flex items-center gap-2 min-w-0 -ms-3 py-2 px-3 box-border',
                'border-0 bg-transparent rounded-md cursor-pointer',
                //  `subheading` — 16/24 Semi Bold, and the weight comes free:
                //  it is already `subheading`'s default in the scale. This was
                //  `body` medium, 13px, which read as a row label rather than as
                //  the thing naming the panel.
                'text-subheading font-semibold text-text-default',
                'hover:bg-surface-hover active:bg-surface-pressed',
                'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring',
              )}
            >
              <span className="truncate">{view?.label}</span>
              {/* THE PAGE HEADER'S CARET, to the class. `caret-down-bold` at the
                  `xs` slot in `primary/default`, with `mt-2`.

                  `mt-2` is `space/2` = 4 and **moves the glyph 2px, not 4**:
                  `align-self: center` centres the MARGIN box, so an asymmetric
                  4-and-0 shifts the border box by half the difference. Both
                  switchers now sit on a 24px line-height — heading is 18/24 and
                  subheading 16/24 — so the same 4 buys the same 2 in both, and
                  they cannot drift apart. Anyone "tidying" this to `mt-1` gets
                  1px and wonders why.

                  `self-center` was here and is gone: the row is already
                  `items-center`, and a redundant class is one more thing that
                  can be edited into a difference. */}
              <Icon name="caret-down-bold" size="xs" tone="inherit"
                className="flex-none mt-2 text-primary-default" />
            </button>
            <Menu
              anchor={viewRef.current}
              open={viewOpen}
              onClose={() => setViewOpen(false)}
              label={label}
              entries={(views ?? []).map((v) => ({
                id: v.id,
                label: v.label,
                checked: v.id === (viewId ?? views?.[0]?.id),
                onSelect: () => onViewChange?.(v.id),
              }))}
            />
          </>
        ) : (
          //  Same size and weight as the switcher — the panel's name should not
          //  change appearance because it happens not to be a menu.
          <Text size="subheading" weight="semibold" truncate className="min-w-0 flex-1">
            {label}
          </Text>
        )}

        <div className="flex flex-none items-center gap-4 ms-auto">
          {onCreate ? (
            <Button icon="plus" label={`New ${label}`} size="sm" onClick={onCreate} />
          ) : null}
          {moreEntries?.length ? (
            <>
              <Button
                ref={moreRef}
                emphasis="secondary"
                icon="more"
                label={`More actions for ${label}`}
                size="sm"
                aria-haspopup="menu"
                aria-expanded={moreOpen}
                onClick={() => setMoreOpen((o) => !o)}
              />
              <Menu
                anchor={moreRef.current}
                open={moreOpen}
                onClose={() => setMoreOpen(false)}
                label={`More actions for ${label}`}
                entries={moreEntries}
              />
            </>
          ) : null}
        </div>
      </div>

      {bar ? (
        //  Rule 1 — the bar is 48 inside a 56 cell, centred, and inset to the
        //  panel's own `space/8` so it lines up with the row content beneath it.
        //  Absolute rather than a second flex row, so neither component has to
        //  know the other's height and the cell keeps exactly one block-size.
        <div className={cn(
          //  ── THE COMPACT BAR HUGS ───────────────────────────────────────────
          //  A flex ROW, so the bar sizes to its content and sits as a pill at
          //  the panel's leading edge. `PageChrome` uses `flex-col` for the
          //  opposite reason — its bar spans the page and needs the `ms-auto`
          //  spring to have free space to eat.
          //
          //  Here there is no free space worth springing across: the compact bar
          //  measures ~300 of the ~305 available, so a full-width bar and a
          //  hugging one differ by a few pixels and the hugging one cannot drift
          //  when the count goes from 1 to 3 digits.
          //
          //  DIFFERENT ON PURPOSE. Changing one of these two wrappers to match
          //  the other is what broke the list view once already.
          'absolute inset-x-8 inset-y-0 flex items-center',
          //  ── NO TRANSFORM. CENTRE WITH FLEX. ────────────────────────────────
          //  `-translate-y-1/2` centred this correctly and broke two other things,
          //  because a transform on an ancestor does two spec-level things at once:
          //
          //  1 · it becomes the CONTAINING BLOCK for `position: fixed`
          //      descendants, so the bar's `Menu` — `fixed z-100` — resolved its
          //      coordinates against this 48px strip instead of the viewport and
          //      painted a long way from its button;
          //  2 · it creates a STACKING CONTEXT, which traps that `z-100` inside
          //      this wrapper. The menu then competed only with the wrapper's own
          //      siblings, so the detail column — later in DOM order — painted its
          //      avatar straight over an open dropdown.
          //
          //  `inset-y-0` + `flex items-center` centres identically with no
          //  transform, so `fixed` resolves against the viewport again and `z-100`
          //  means what it says.
        )}>{bar}</div>
      ) : null}
      </div>

      {/* THE ONLY SCROLLER on this side, and the listbox itself. */}
      <ul
        ref={listRef}
        role="listbox"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="flex-1 min-h-0 m-0 p-0 list-none overflow-y-auto overscroll-contain"
      >
        {items.map((item, ix) => {
          const isActive = item.id === activeId;
          const ticked = Boolean(selection?.selected.has(item.id));
          return (
            <li
              key={item.id}
              ref={(el) => { rowRefs.current[ix] = el; }}
              role="option"
              aria-selected={isActive}
              //  §4.4's forced-colors hook. `box-shadow` is discarded there and
              //  the selection IS a shadow, so index.css repaints it as a real
              //  `border-inline-start: 2px solid Highlight` off this attribute.
              data-zf-selected={isActive || undefined}
              //  Roving: one tab stop for the list, arrows inside it.
              tabIndex={ix === focusIx ? 0 : -1}
              onFocus={() => setFocusIx(ix)}
              onClick={() => onActivate(item.id)}
              className={cn(
                //  93 FIXED, so the row height cannot follow its content — §3
                //  and §5 both rest on it.
                'flex items-start gap-5 h-mini-list-row py-6 px-8 box-border cursor-pointer',
                //  The ROW owns its separator, not the list. A separator that
                //  belongs to the list has to know which row is last; one that
                //  belongs to the row does not, and it moves correctly when rows
                //  are virtualised in and out.
                'border-b border-border-divider',
                'transition-colors duration-150 motion-reduce:transition-none',
                'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring',
                //  ── THE ACTIVE ROW IS A FILL, AND THE FILL IS `surface/hover` ──
                //  No leading edge. It was a 2px `primary/default` inset shadow,
                //  because `surface/selected` is 1.13:1 Light and **1.02:1**
                //  Dark — the selected row is fractionally DARKER than its
                //  neighbours there and reads as receding rather than chosen.
                //
                //  `surface/hover` is 1.08 Light and **1.07 Dark**, so dropping
                //  the edge onto it is a real improvement in the pane that had
                //  the problem: the Dark active row goes from 1.02 to 1.07.
                //  Light gives up 0.05 and the edge.
                //
                //  The cost is that a hovered row and the active row are the
                //  same fill. The pointer disambiguates — it is on the one that
                //  is only transiently lit — and the moment it leaves, one row
                //  stays. So the ACTIVE row's own hover steps up to
                //  `surface/pressed` (1.20 L / 1.16 D) rather than doing
                //  nothing, or pointing at it would be the one place in the
                //  list that gives no feedback.
                //
                //  One branch, never two competing fills: `cn` is a joiner and
                //  the stylesheet's order would otherwise decide.
                isActive
                  ? 'bg-surface-hover hover:bg-surface-pressed'
                  : 'bg-surface-default hover:bg-surface-hover',
              )}
            >
              {selection ? (
                //  §5 — the two selections are different things. Without the
                //  stop, ticking a box also navigates.
                <span
                  className="flex flex-none items-center h-10"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  role="presentation"
                >
                  <Checkbox
                    selection={ticked ? 'checked' : 'unchecked'}
                    ariaLabel={`Select ${item.name}`}
                    onSelectionChange={() => {
                      const next = new Set(selection.selected);
                      if (next.has(item.id)) next.delete(item.id); else next.add(item.id);
                      selection.onChange(next);
                    }}
                  />
                </span>
              ) : null}

              <span className="flex-1 min-w-0">
                <span className="flex items-start gap-5">
                  <Text as="span" weight="medium" truncate className="flex-1 min-w-0">
                    {item.name}
                  </Text>
                  {item.amount ? (
                    //  `tabular-nums`: a column of figures has to align.
                    <Text as="span" weight="medium" className="flex-none tabular-nums">
                      {item.amount}
                    </Text>
                  ) : null}
                </span>

                {item.meta?.length ? (
                  <span className="flex items-center gap-4 mt-3">
                    {item.meta.slice(0, 3).map((m, i) => (
                      <span key={m} className="flex items-center gap-4">
                        {i > 0 ? (
                          <span aria-hidden className="block w-px h-6 bg-border-default" />
                        ) : null}
                        <Text as="span" size="body-sm" tone="secondary">{m}</Text>
                      </span>
                    ))}
                  </span>
                ) : null}

                {item.status ? (
                  //  `flex` rather than letting the badge sit inline: a
                  //  `StatusBadge` is `inline-flex` with a fixed 22 height, and
                  //  inline it would sit on the parent's 20px baseline box and
                  //  push 2px past the row's 99. The wrapper gives it a block
                  //  of its own that is exactly its own height.
                  <span className="flex mt-5">
                    <StatusBadge status={item.statusVariant ?? 'unclassified'}>
                      {item.status}
                    </StatusBadge>
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
