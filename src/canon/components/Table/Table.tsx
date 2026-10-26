import type { ReactNode } from 'react';
import { Checkbox } from '../Checkbox/Checkbox';
import { Icon } from '../../icons';
import { Text } from '../../primitives';
import { cn } from '../../utils/cn';

/**
 * TABLE — `zf-design-cannon.md` §2.24, Type 1 (`zf-table-list`): the module list
 * view. Rows separated by a rule, no cell boundaries, 44px rows, a 12px inset.
 *
 * §2.24.1 sets out two tables — the list and the grid (a parent record and its
 * breakdown, with a rule on every cell and a `#` hierarchy column). They render
 * the same `<table>`, so by the "different HTML means different components" test
 * they are one component with a variant axis, and §2.24.7 names it
 * `.zf-table--list | --grid`. **That axis is not here**, because it would have
 * exactly one value: an axis with one value is a dead axis, and adding `grid`
 * later is purely additive. `Style` is one axis and not two — the rule and the
 * inset move together, because a bordered cell needs more inset than a
 * borderless one.
 *
 * ── WHAT THE SOURCE GOT WRONG, AND WHAT THAT COSTS HERE ──────────────────────
 * §2.24.11 lists 13 resolved defects. Four shape this file:
 *
 * **No cell inset at all.** Type 1's text began **1.25px** after the column
 * boundary, so every column moves 12–13px here. 12 is the smallest inset that
 * stops a left-aligned value touching the cell edge once a border or a selected
 * fill appears behind it.
 *
 * **An alignment edge made of words.** Numbers right-aligned to the width of the
 * *header's text* — `Total QTY` at x=884 with its numbers at 951, which is the
 * right edge of the words, not of the column. Rename the column to "Qty" and the
 * data moves. Here `align` right-aligns the header and the data to the same
 * column edge, which is why one figure in the rebuild sits 65.6px from where it
 * was drawn: the single largest deviation, and it is the bug being removed.
 *
 * **A header band that is present in the file and absent on screen.** `#FAFAFD`
 * against a white row is **1.02:1**; what reads in a screenshot is the rule
 * beneath it. `table/head` is 1.12 against a row and 1.04 against a hovered one,
 * so the header stays distinguishable from both. It is a role of its own rather
 * than `surface/sunken`, which shares its Light value but goes *darker* than the
 * surface in Dark — a header needs to go lighter.
 *
 * **Four body-text values, 17.59 ΔE apart**, one of them `#222222` — a pure grey
 * among neutrals that all carry a blue cast. All four are `text/default`.
 *
 * Every contrast figure §2.24 states was recomputed against our primitives and
 * all eight reproduce: header label 6.04 / 8.15, body 15.15 / 15.00, link 5.92 /
 * 7.69, sort caret 4.32 / 5.86, band 1.12, band-on-hover 1.04, row rule 1.20.
 */
export interface TableColumn<Row> {
  id: string;
  /** Rendered 11/17.6 Semi Bold +0.6 UPPER — `overline`, which the source drew correctly. */
  header: string;
  /**
   * `end` right-aligns the header AND the data to the column's right edge.
   * Numeric columns take it; §2.24.2's whole "alignment edge made of words"
   * defect is what happens when only one of the two moves.
   */
  align?: 'start' | 'end';
  /** Adds the sort control. `aria-sort` goes on the `<th>`, per §2.24.8. */
  sortable?: boolean;
  /** What the cell renders. A node, so a cell can hold a StatusBadge or a link. */
  cell: (row: Row) => ReactNode;
}

export interface TableSort {
  columnId: string;
  direction: 'asc' | 'desc';
}

export interface TableProps<Row> {
  /**
   * REQUIRED, and visually hidden. 1.3.1 — a table with no caption announces as
   * "table, 8 columns, 11 rows" and nothing else. §2.24.8 grades table semantics
   * REVIEW precisely because Figma cannot express any of this.
   */
  caption: string;
  columns: TableColumn<Row>[];
  rows: Row[];
  /** Stable identity per row. Never the array index. */
  rowKey: (row: Row) => string;
  /** Controlled. Omit `onSortChange` and no column renders a sort control. */
  sort?: TableSort;
  onSortChange?: (next: TableSort) => void;
  /**
   * WHERE THE TABLE SITS, which decides whether it has a frame.
   *
   * `card` — a block inside content: 1px `border/default` all round, `radius/md`,
   * and the scroll clips inside that edge. §2.24.1's "side detail views".
   *
   * `page` — the table IS the view: full-bleed, no outer border, no radius, so
   * the rows run to the region's edges. §2.24.1's "module list views". The
   * header's own bottom rule and the rules between rows still do all the
   * separating; §2.24.5 records the outer border as the one drawn TWICE, at
   * `#E4E4EF` and `#E4E4F0`, 0.52 ΔE apart — nobody chose two values, somebody
   * sampled the same border twice. A view that does not need it is the cheapest
   * possible resolution.
   *
   * One axis, two values, and it fails none of the four tests: they cannot both
   * be true, it changes what the component is doing rather than what it
   * contains, neither value is two values concatenated, and neither means
   * "ignore another axis".
   */
  placement?: 'card' | 'page';
  /**
   * Row selection. Present means a leading checkbox column; absent means none —
   * one prop rather than a boolean plus three handlers that can disagree.
   *
   * §2.24.8 grades three things REVIEW here and all three are code-only:
   * **the header checkbox needs an indeterminate state**, it **needs a label
   * naming what it selects** ("Select all 10 purchase orders", not "Select
   * all"), and 2.5.8 wants **the row cell as the hit area, not the 12px box**.
   */
  selection?: {
    selected: ReadonlySet<string>;
    onChange: (next: Set<string>) => void;
    /** Names what the header checkbox selects. */
    allLabel: string;
    /** Names one row's checkbox. Defaults to the row key, which is rarely a name. */
    rowLabel?: (row: Row) => string;
  };
  /**
   * The column-configuration control. Present means a trailing cell holding
   * `icon/table-config` — §2.24.2's *"a 60px cell holding icon / table-config"*,
   * where the source drew "a 36 × 33.24 white button at the far right".
   *
   * It is **sticky**, because a control that scrolls away with the columns it
   * configures is only reachable once you have already found what you were
   * looking for.
   */
  onConfigure?: { label: string; onSelect: () => void; expanded?: boolean };
  /** Rendered in place of the body when `rows` is empty. */
  empty?: ReactNode;
  className?: string;
}

const RING = 'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring';

export function Table<Row>({
  caption, columns, rows, rowKey, sort, onSortChange,
  placement = 'card', selection, onConfigure, empty, className,
}: TableProps<Row>) {
  //  §2.24.8's indeterminate state, derived rather than stored: a header
  //  checkbox holding its own boolean drifts the moment a row is toggled.
  const picked = rows.filter((r) => selection?.selected.has(rowKey(r))).length;
  const all: 'checked' | 'indeterminate' | 'unchecked' =
    picked === 0 ? 'unchecked' : picked === rows.length ? 'checked' : 'indeterminate';

  //  §2.24.3's 12px cell inset everywhere, and 20 at the two outer edges when
  //  the table IS the page — so the first column lines up with the page header's
  //  own `space/10` and the last ends level with it. On a `card` the frame
  //  already provides that offset, so all cells keep 12.
  const span = columns.length + (selection ? 1 : 0) + (onConfigure ? 1 : 0);
  //  The config cell IS the trailing gutter when it is present — it sits at the
  //  column's right edge, so a second one behind it would be dead space.
  const gutter = (i: number) => placement === 'page' && (
    i === 0 ? 'ps-10'
      : i === span - 1 && !onConfigure ? 'pe-10' : undefined
  );
  //  THE SELECT COLUMN NEEDS END PADDING, and `pe-0` is why the focus ring was
  //  disappearing.
  //
  //  The cell is `w-0`, so with `table-layout: auto` the column collapses to
  //  padding plus content — 20 + 12 + 0 = 32. `Checkbox`'s ring is
  //  `outline-2 outline-offset-2`, which reaches 4px past a 12px box, so its
  //  right edge lands at 36 in a 32px cell. A table cell does not clip, but the
  //  NEXT header cell is opaque `table/head` and comes later in the DOM, so it
  //  paints straight over the overhang. Tab to the select-all box and a quarter
  //  of the ring is simply gone.
  //
  //  8 leaves 4 of slack past the ring's 4, which also covers the hover halo's
  //  3px spread. Nothing else moves: the column was sized by its content either
  //  way, and the data columns keep their own inset.
  const lead = placement === 'page' ? 'ps-10 pe-4' : 'ps-6 pe-4';
  return (
    //  §2.24.11 open item 16: "column widths are fixed in the component and every
    //  product will want different ones… a 7-column component is a sample, not a
    //  contract." Content-driven is the answer that invents nothing — the widths
    //  come from the data. The horizontal scroll is what keeps that honest on a
    //  narrow viewport instead of squeezing every column to illegibility.
    <div className={cn(
      'w-full overflow-auto bg-surface-default',
      //  ON `page`, THE TABLE IS THE SCROLL CONTAINER, and that is what makes a
      //  sticky header possible at all.
      //
      //  `position: sticky` resolves against the nearest SCROLLING ancestor, and
      //  `overflow-x: auto` alone computes `overflow-y` to `auto` too — so this
      //  div is already a vertical scroller whether or not it was meant to be.
      //  A `thead` inside it therefore sticks to THIS box, not to the page's,
      //  and with no height here the box never scrolls and the header never
      //  sticks. There is no arrangement where a horizontally-scrolling wrapper
      //  lets a descendant stick to an outer scroller.
      //
      //  So it takes a definite height from its parent and owns both axes. The
      //  page chrome then sits outside it and does not scroll at all.
      placement === 'page' && 'h-full overscroll-contain',
      //  Resolved to ONE branch rather than composed from two. `rounded-md` and
      //  `rounded-none` on the same element are settled by the stylesheet's
      //  emission order, not by the className's — the cascade hazard this repo
      //  has now hit three times (the wizard's tabs, the nav's row fills, the
      //  shell's skip link). A ternary makes the conflict unrepresentable.
      placement === 'card'
        ? 'rounded-md border border-border-default'
        : 'rounded-none border-0',
      className,
    )}>
      <table className="w-full border-collapse text-body">
        <caption className="sr-only">{caption}</caption>

        <thead>
          <tr>
            {selection ? (
              <th scope="col" className={cn(
                //  STICKY TOO. It was the one header cell without it, so on
                //  scroll the select-all box slid out of view and the first
                //  row's checkbox came up into the gap — the band appeared to
                //  start one column in, with a stray checkbox above it.
                'sticky top-0 z-1',
                'h-table-head w-0 box-border', lead,
                'bg-table-head border-b border-border-divider',
              )}>
                <Checkbox
                  selection={all}
                  onSelectionChange={() => selection.onChange(
                    all === 'checked' ? new Set() : new Set(rows.map(rowKey)),
                  )}
                  ariaLabel={selection.allLabel}
                />
              </th>
            ) : null}
            {columns.map((c, ci) => {
              const active = sort?.columnId === c.id;
              const sortable = Boolean(c.sortable && onSortChange);
              //  What a click does from here: a fresh column sorts ascending,
              //  and the sorted one flips. Computed once because the handler,
              //  the tooltip and the glyph must all agree — three places
              //  deriving it separately is how a control ends up promising one
              //  thing and doing another.
              const next: 'asc' | 'desc' =
                active && sort?.direction === 'asc' ? 'desc' : 'asc';
              const label = (
                <Text as="span" size="overline" tone="secondary" className="truncate">
                  {c.header}
                </Text>
              );
              return (
                <th
                  key={c.id}
                  scope="col"
                  //  §2.24.8 — on the `th`, not on the button inside it.
                  aria-sort={!sortable ? undefined
                    : active ? (sort?.direction === 'asc' ? 'ascending' : 'descending')
                      : 'none'}
                  className={cn(
                    //  36 replaces the source's two header heights, 35 and 33.
                    'h-table-head px-6 box-border',
                    //  Sticky against the scroller above. A no-op when there is
                    //  nothing to scroll, so it costs `card` nothing. The band's
                    //  own opaque fill is what stops rows showing through.
                    'sticky top-0 z-1',
                    gutter(selection ? ci + 1 : ci),
                    //  1.12:1 against a row. The rule sits on the HEADER, not on
                    //  the first row — §2.24.2 — so the first row is like every
                    //  other one. The source left a 9px gap under it instead.
                    'bg-table-head border-b border-border-divider',
                    'font-normal',
                    c.align === 'end' ? 'text-end' : 'text-start',
                  )}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => onSortChange?.({ columnId: c.id, direction: next })}
                      //  THE TOOLTIP, and it is the browser's. There is no
                      //  `Tooltip` in the canon and no §2.x measuring one — the
                      //  only "Tooltip" in the source is a PROPERTY NAME on the
                      //  colour picker's nose (§2.12) — so a styled one would be
                      //  invented, and this repo does not invent.
                      //
                      //  `title` is not a consolation prize here: it is
                      //  keyboard- and AT-reachable, it needs no portal, no
                      //  placement logic and no dismiss handling, and it says
                      //  the one thing that matters. It names WHAT THE CLICK
                      //  WILL DO, not what the state is — hovering an unsorted
                      //  column offers "Sort ascending", and hovering the
                      //  ascending one offers "Sort descending".
                      title={next === 'asc' ? 'Sort ascending' : 'Sort descending'}
                      className={cn(
                        //  Fills the 36px band, so the target is the header cell
                        //  rather than the 11px label. 36 >= 24 — 2.5.8.
                        'group/sort flex items-center gap-2 w-full h-table-head p-0',
                        'border-0 bg-transparent cursor-pointer',
                        //  ON A RIGHT-ALIGNED COLUMN THE ARROW GOES FIRST.
                        //
                        //  `justify-end` alone puts [label][gap][arrow] flush
                        //  right, so the LABEL's right edge sits 20px inside the
                        //  column — 12 of glyph plus an 8 gap — while the figures
                        //  below it sit flush. The header and its data then
                        //  right-align to two different edges, which is §2.24.2's
                        //  "alignment edge made of words" defect arriving from
                        //  the other direction: there the numbers followed the
                        //  header's text, here the header could never reach the
                        //  numbers.
                        //
                        //  Reversing the row puts the label last in the visual
                        //  order and flush against the column's right edge, level
                        //  with every figure under it. It is also the convention:
                        //  a numeric column carries its sort indicator on the
                        //  left. The DOM order does not change, so the label is
                        //  still what a screen reader reads first.
                        //
                        //  AND NO `justify-end`. It was here, and under
                        //  `flex-row-reverse` it means the opposite: `flex-end`
                        //  packs toward the end of the REVERSED axis, which is
                        //  the visual left. The default `flex-start` packs
                        //  toward main-start, which in a reversed row is the
                        //  right — so the correct spelling is no justify class
                        //  at all, in both directions.
                        c.align === 'end' && 'flex-row-reverse',
                        RING,
                      )}
                    >
                      {label}
                      {/* Always drawn, so the column never reflows when the
                          sort moves — only its opacity and its meaning change.
                          Two resolved branches rather than four composed
                          classes: `opacity-0` beside `opacity-100`, or
                          `text-primary-default` beside `text-icon-default`,
                          would each be settled by the stylesheet's order rather
                          than the className's.

                          ACTIVE — `primary/default` at 4.32:1, the role
                          §2.24.2 names. The source's `#408DFB` was 3.27 and is
                          the unowned bright blue open item 25 has now met eight
                          times.

                          HOVER PREVIEW — `icon/default` at 6.79, and
                          deliberately not the accent: it is showing what a
                          click would do, not a state the table is in. A blue
                          caret on a column that is not sorted claims it is. */}
                      <Icon
                        name={active && sort?.direction === 'desc' ? 'arrow-down' : 'arrow-up'}
                        size="xs" tone="inherit"
                        className={cn('flex-none transition-opacity duration-150',
                          'motion-reduce:transition-none',
                          active
                            ? 'opacity-100 text-primary-default'
                            : cn('opacity-0 text-icon-default',
                              'group-hover/sort:opacity-100',
                              'group-focus-visible/sort:opacity-100'))}
                      />
                    </button>
                  ) : label}
                </th>
              );
            })}
            {onConfigure ? (
              <th scope="col" className={cn(
                //  THE CORNER, so it stacks above both — `z-2` against the
                //  header row's `z-1` and the body's sticky column, or whichever
                //  of the two came later in the DOM wins and the corner flickers
                //  between them while scrolling diagonally.
                'top-0 z-2',
                //  A SQUARE ON THE BAND: `--zf-chrome-table-config` is the
                //  header's own height. It is a real cell and not an overlay,
                //  which is the only shape that satisfies all three things at
                //  once — the rows and rules still run edge to edge because the
                //  cell is part of the row; nothing is ever covered when the
                //  table fits; and scrolled to the far right the cell sits back
                //  in its own slot, so the last column is fully readable.
                //
                //  An overlay could not do the third. It is pinned to the
                //  container, so whatever reaches the right edge goes under it —
                //  including, at the end of the scroll, the last column.
                'sticky end-0 w-table-config h-table-head p-0 box-border',
                'bg-table-head border-b border-border-divider',
                //  The seam is on the HEADER ONLY. Down the body it would read
                //  as a cell boundary, and §2.24.1's whole distinction between
                //  the list table and the grid is that the list has none.
                'border-s border-border-divider',
              )}>
                <button
                  type="button"
                  aria-label={onConfigure.label}
                  aria-haspopup="dialog"
                  aria-expanded={onConfigure.expanded}
                  onClick={onConfigure.onSelect}
                  className={cn(
                    'grid place-items-center size-table-config p-0 border-0',
                    'bg-transparent text-icon-default cursor-pointer',
                    'hover:bg-surface-hover active:bg-surface-pressed',
                    'transition-colors duration-150 motion-reduce:transition-none',
                    RING,
                  )}
                >
                  <Icon name="table-config" size="md" tone="inherit" />
                </button>
              </th>
            ) : null}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={span} className="h-table-row px-6 text-center">
                {empty ?? <Text tone="secondary">Nothing here yet.</Text>}
              </td>
            </tr>
          ) : rows.map((row, i) => (
            <tr key={rowKey(row)}
              //  `table/row-hover`, the same role the editable grid uses — the
              //  two tables share a visual language and a row hover is the most
              //  visible thing they would disagree about.
              className={cn('group/tr hover:bg-table-row-hover',
                'transition-colors duration-150 motion-reduce:transition-none')}>
              {selection ? (
                <td className={cn(
                  'h-table-row w-0 box-border', lead,
                  (placement === 'page' || i < rows.length - 1)
                    && 'border-b border-border-divider',
                )}>
                  <Checkbox
                    selection={selection.selected.has(rowKey(row)) ? 'checked' : 'unchecked'}
                    onSelectionChange={() => {
                      const next = new Set(selection.selected);
                      const k = rowKey(row);
                      if (next.has(k)) next.delete(k); else next.add(k);
                      selection.onChange(next);
                    }}
                    ariaLabel={selection.rowLabel?.(row) ?? rowKey(row)}
                  />
                </td>
              ) : null}
              {columns.map((c, ci) => (
                <td
                  key={c.id}
                  className={cn(
                    //  44, kept exactly. The 12px inset is §2.24.3's answer to a
                    //  source that had none.
                    'h-table-row px-6 box-border text-text-default',
                    gutter(selection ? ci + 1 : ci),
                    //  The rule between rows. Under the last one only when
                    //  there is no frame: `card` already has its own
                    //  `border/default` there, and two 1px lines 0px apart is
                    //  what §2.24.9's "two greys one hex digit apart" looks like
                    //  in geometry. `page` has nothing under the last row, so
                    //  without it the table just stops.
                    //
                    //  An index test rather than an arbitrary `[&:last-child]`
                    //  variant, which rule 1 rejects and which would be a raw
                    //  selector besides.
                    (placement === 'page' || i < rows.length - 1)
                      && 'border-b border-border-divider',
                    c.align === 'end' ? 'text-end' : 'text-start',
                  )}
                >
                  {c.cell(row)}
                </td>
              ))}
              {onConfigure ? (
                //  Opaque, so the columns pass BEHIND it rather than through it
                //  while the table scrolls. `group-hover/tr` because a sticky
                //  cell with its own fill would otherwise be the one cell in the
                //  row that does not light up with it.
                <td className={cn(
                  'sticky end-0 z-1 w-table-config h-table-row p-0 box-border',
                  'bg-surface-default group-hover/tr:bg-surface-hover',
                  'transition-colors duration-150 motion-reduce:transition-none',
                  (placement === 'page' || i < rows.length - 1)
                    && 'border-b border-border-divider',
                )} />
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
