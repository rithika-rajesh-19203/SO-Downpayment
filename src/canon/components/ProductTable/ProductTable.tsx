import {
  useCallback, useEffect, useId, useMemo, useRef, useState,
} from 'react';
import type {
  KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode,
} from 'react';
import { Icon } from '../../icons';
import { cn } from '../../utils/cn';
import { Text } from '../../primitives/Text';
import { Menu } from '../Menu/Menu';
import { applyFormat } from '../InputField/InputField';
import { Select } from '../Select/Select';
import { SplitButton } from '../SplitButton/SplitButton';
import { ProductTotals } from './ProductTotals';
import type { ProductColumn, ProductRow, TotalRow } from './types';

/**
 * PRODUCT TABLE — `zf-product-table.md`. An **editable** line-item grid: every
 * data cell is an input or a select, and rows are created, cloned, reordered and
 * deleted while the form is being filled in.
 *
 * **It is not `Table`.** That one is read-only — it sorts, paginates and selects
 * rows for bulk actions, and its cells render values. The two share a visual
 * language and nothing else, and §1 is explicit that one component must not do
 * both jobs: *a data table's row click navigates; a product table's row click
 * puts a cursor in a cell.* Opposed interaction models.
 *
 * ── THE LANES ARE OUTSIDE THE GRID ──────────────────────────────────────────
 * §2.1, and the easiest thing here to get wrong. **The card is the 12 columns**;
 * the 20px drag lane and the 30px delete lane hang outside it, reclaiming the
 * page margin with negative inline margins. A host body that shows a product
 * table therefore needs `padding-inline: 20px 30px`, not `20px 20px` — the right
 * lane is 30 and a symmetric body clips the delete control by 10.
 *
 * ── ONE BOX CANNOT BOTH SCROLL AND LET CHILDREN ESCAPE ──────────────────────
 * §18.2, recorded at length in the md because it gets re-attempted. The card
 * must scroll horizontally AND, if the lane controls live inside the rows, let
 * them paint outside its border. Those are mutually exclusive on one box:
 * `hidden` clips them, `visible` is not a scrollport, and **`clip auto` computes
 * to `hidden auto`** — the coercion is on computed values, not on syntax, so
 * writing it as a shorthand does not help.
 *
 * The resolution is to separate the jobs: the **card** paints the frame and does
 * not scroll, an inner **scrollport** scrolls, and the lane controls are
 * SIBLINGS of the card absolutely positioned against the grid at
 * `35 + i × 34`.
 *
 * ── AND THE SPACER IS 35, NOT 34 ────────────────────────────────────────────
 * §5.2. The lane's top aligns with the card's border box; the head row starts
 * one pixel lower, inside the card's 1px top border. A 34 spacer puts every lane
 * control 1px above its row — a real defect in the md's first build, on all six
 * controls in both lanes. Ours is `calc(row + 1px)`, so it cannot drift.
 */
export interface ProductTableProps {
  /** The section heading — "Add Products". */
  title?: string;
  /**
   * A control on the heading's own line, at the far end — a tax-inclusive
   * toggle, a units switch.
   *
   * It belongs to the TABLE, not to a row: anything that changes what every
   * cell means goes here, and anything that changes one row goes in that row's
   * `⋯`. A control in the footer beside `Add New Row` would read as another way
   * to add something.
   */
  titleTrailing?: ReactNode;
  columns: ProductColumn[];
  rows: ProductRow[];
  onRowsChange: (next: ProductRow[]) => void;
  totals?: TotalRow[];
  onTotalInput?: (id: string, next: string) => void;
  onAddRow?: () => void;
  onAddGroup?: () => void;
  onRowMenu?: (id: string, action: 'clone' | 'insert-row' | 'insert-header') => void;
  onConfigureColumns?: () => void;
  className?: string;
}

const ROW = 34;

export function ProductTable({
  title, titleTrailing, columns, rows, onRowsChange, totals, onTotalInput,
  onAddRow, onAddGroup, onRowMenu, onConfigureColumns, className,
}: ProductTableProps) {
  const uid = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLParagraphElement>(null);

  const dataCols = useMemo(() => columns.filter((c) => c.id !== 'index'), [columns]);
  const [widths, setWidths] = useState<Record<string, number>>(
    () => Object.fromEntries(columns.map((c) => [c.id, c.width])),
  );

  const cardRef = useRef<HTMLDivElement>(null);
  //  Which boundary is being dragged, and where its guide should paint. `null`
  //  when nothing is: rendering a zero-opacity guide would leave a `fixed`
  //  element over the page swallowing pointer events between drags.
  const [resizing, setResizing] = useState<string | null>(null);
  const [guide, setGuide] = useState<{ x: number; top: number; height: number } | null>(null);

  const [menuFor, setMenuFor] = useState<string | null>(null);
  const menuRefs = useRef(new Map<string, HTMLButtonElement>());
  const [lifted, setLifted] = useState<string | null>(null);

  /*  ── §8.1 AND §17.1 CONTRADICT EACH OTHER, AND §17.1 WINS ─────────────────
      §8.1 reveals the lane controls with `.zf-pt-row:hover .zf-pt-lane-control`
      — a DESCENDANT selector. §17.1 then moves those controls out of the rows
      entirely, because a box cannot both scroll and let its children paint
      outside it (§18.2). Once they are siblings of the card, no selector on the
      row can reach them: they are in a different subtree.

      So the row's hover is state. It drives the control's opacity AND the row's
      own tint, which keeps the two from ever disagreeing — and it costs nothing
      extra, because §16.1 records that in Dark `surface/hover` is 1.07:1 against
      `surface/default` and the controls appearing ARE what signals the hover.  */
  const [hot, setHot] = useState<string | null>(null);

  /*  ── POINTER DRAG ─────────────────────────────────────────────────────────
      §9. The keyboard path (§9.1) and this one share `lifted` and `move`, so a
      row cannot be lifted by one and dropped by the other.

      `dropAt` is the index the row would land on. It is state because the target
      row has to draw the §9 edge; `from` is a ref because it changes once per
      gesture and re-rendering the whole table on pointerdown would drop frames
      out of the very first move.  */
  const laneRef = useRef<HTMLDivElement>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);
  const from = useRef<number | null>(null);

  //  Which row the pointer is over. The rows are a FIXED 34 (§5.2) and the head
  //  is one more than that inside the card's top border, which is the same
  //  arithmetic the lane controls are positioned by — so the hit test and the
  //  controls cannot disagree about where a row is.
  const rowAtY = useCallback((clientY: number) => {
    const box = laneRef.current?.getBoundingClientRect();
    if (!box) return null;
    const i = Math.floor((clientY - box.top - (ROW + 1)) / ROW);
    return Math.min(Math.max(i, 0), rows.length - 1);
  }, [rows.length]);

  const onGripDown = (e: ReactPointerEvent<HTMLButtonElement>, i: number) => {
    //  Left button only — a right-click on the grip should open the context
    //  menu, not start a drag nobody can end.
    if (e.button !== 0) return;
    //  §10.2's lesson, and it applies just as hard here: without pointer capture
    //  a fast drag leaves the 20px grip and the pointermove stream stops, so the
    //  row sticks halfway and the gesture never ends.
    e.currentTarget.setPointerCapture(e.pointerId);
    //  Stops the drag painting a text selection across half the table.
    e.preventDefault();
    document.documentElement.dataset.zfDragging = 'row';
    from.current = i;
    setLifted(rows[i].id);
    setDropAt(i);
    say(`Lifted row ${i + 1} of ${rows.length}`);
  };

  const onGripMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (from.current === null) return;
    const to = rowAtY(e.clientY);
    if (to !== null) setDropAt(to);
  };

  const endDrag = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (from.current === null) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    delete document.documentElement.dataset.zfDragging;
    const a = from.current;
    const b = dropAt;
    from.current = null;
    setLifted(null);
    setDropAt(null);
    if (b !== null && b !== a) move(a, b);
    else say('Dropped');
  };

  //  §11 — the index counts ACROSS group breaks: they are the document's line
  //  numbers, and an invoice's line 4 is line 4 whatever headings sit above it.
  const numbers = useMemo(() => {
    let n = 0;
    return rows.map((r) => (r.kind === 'group' ? 0 : ++n));
  }, [rows]);

  //  ── §7.2 · THE RAIL SHADOW IS CONDITIONAL ─────────────────────────────────
  //  A sticky column that shadows at rest reads as a floating panel. A sentinel
  //  rather than a scroll listener: it fires once per state change instead of
  //  once per frame, and it cannot get out of sync with a programmatic scroll.
  useEffect(() => {
    const el = sentinelRef.current;
    const port = scrollRef.current;
    if (!el || !port) return;
    const io = new IntersectionObserver(
      ([e]) => { port.dataset.scrolledX = String(!e.isIntersecting); },
      { root: port, threshold: 1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const say = (msg: string) => { if (liveRef.current) liveRef.current.textContent = msg; };

  const move = useCallback((from: number, to: number) => {
    if (to < 0 || to >= rows.length || from === to) return;
    const next = rows.slice();
    const [r] = next.splice(from, 1);
    next.splice(to, 0, r);
    //  §9.2 — reorder the DATA and let React re-render. Moving DOM nodes by hand
    //  gets overwritten on the next render, and the index column and the totals
    //  then silently disagree with what is on screen.
    onRowsChange(next);
    say(`Row ${from + 1} of ${rows.length}, moved to position ${to + 1}`);
  }, [rows, onRowsChange]);

  //  ── §9.1 · KEYBOARD REORDER IS MANDATORY ──────────────────────────────────
  //  Pointer-only reordering is not shippable. The grip is a real button.
  const onGripKey = (e: ReactKeyboardEvent<HTMLButtonElement>, i: number) => {
    const id = rows[i].id;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (lifted === id) { setLifted(null); say('Dropped'); }
      else { setLifted(id); say(`Lifted row ${i + 1} of ${rows.length}`); }
      return;
    }
    if (lifted !== id) return;
    if (e.key === 'Escape') { e.preventDefault(); setLifted(null); say('Cancelled'); return; }
    let to: number | null = null;
    if (e.key === 'ArrowUp') to = i - 1;
    else if (e.key === 'ArrowDown') to = i + 1;
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = rows.length - 1;
    if (to === null) return;
    e.preventDefault();
    move(i, to);
  };

  //  ── §10 · COLUMN RESIZE ───────────────────────────────────────────────────
  const startResize = (e: ReactPointerEvent<HTMLDivElement>, col: ProductColumn) => {
    //  §10.2 — without pointer capture a fast drag outside the 7px grabber drops
    //  the pointermove stream and the column sticks halfway.
    e.currentTarget.setPointerCapture(e.pointerId);
    document.documentElement.dataset.zfResizing = 'col';
    const x0 = e.clientX;
    const w0 = widths[col.id] ?? col.width;
    const card = cardRef.current?.getBoundingClientRect();
    setResizing(col.id);
    if (card) setGuide({ x: e.clientX, top: card.top, height: card.height });

    const onMove = (ev: PointerEvent) => {
      setWidths((w) => ({ ...w, [col.id]: Math.max(col.min, w0 + ev.clientX - x0) }));
      //  The guide tracks the POINTER, not the boundary: the boundary stops at
      //  the column's `min` and the pointer does not, and a guide pinned to the
      //  boundary would sit still while the hand kept moving, which reads as the
      //  drag having died.
      if (card) setGuide({ x: ev.clientX, top: card.top, height: card.height });
    };
    const onUp = () => {
      delete document.documentElement.dataset.zfResizing;
      setResizing(null);
      setGuide(null);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const laneTop = (i: number) => `calc(var(--zf-chrome-pt-spacer) + ${i * ROW}px)`;

  const cellText = 'w-full h-full min-w-0 bg-transparent outline-none text-body';

  return (
    <section className={cn('zf-product-table', className)}>
      {title || titleTrailing ? (
        //  NO inset. The md's §18 gives the title `padding-inline-start: 20`
        //  because IT puts the negative margins on the section, so the section
        //  starts 20 left of the content box and the title needs the 20 back to
        //  reach the card. Here the negative margins are on the inner grid, so
        //  the section already starts at the content box — and the card, being
        //  grid column 2, starts there too. Adding the 20 pushed the heading 20
        //  right of the table it names.
        //
        //  Same destination, one fewer moving part: the heading, the card and
        //  everything else in the body all sit on the content box's edge.
        <div className="flex items-center gap-5 mb-5">
          {title ? (
            <Text as="h3" size="subheading" className="min-w-0 flex-1">{title}</Text>
          ) : <span className="flex-1" />}
          {titleTrailing ? <div className="flex flex-none items-center">{titleTrailing}</div> : null}
        </div>
      ) : null}

      {/* §2.1 — the block reclaims the page margin it sits in. The card is the
          12 columns; the lanes hang outside it. */}
      <div className={cn(
        'relative grid -ms-10 -me-15',
        'grid-cols-pt',
      )}>
        {/* The lanes reserve their width and nothing else — the controls in them
            are siblings of the card, positioned against this grid. §17.1. */}
        <div aria-hidden className="col-start-1" />

        <div ref={cardRef} className={cn(
          'col-start-2 box-border min-w-0',
          //  §18.2 — the card paints the frame and does NOT scroll.
          'overflow-visible rounded-md border border-border-default bg-surface-default',
        )}>
          <div
            ref={scrollRef}
            //  …the scrollport does. `group/scroll` so the rail's shadow can key
            //  off the sentinel's data attribute set on this element.
            className="group/scroll overflow-x-auto overflow-y-visible rounded-md"
          >
            <div ref={sentinelRef} aria-hidden className="absolute w-0" />

            <table className={cn(
              'border-collapse table-fixed',
              //  §4.2's trap. Under `table-layout: fixed` a `<col>` with no
              //  width gets the leftover INCLUDING NONE: widen Product past
              //  ~475 and the flexible column renders at 0, not at its min,
              //  which lives nowhere in the CSS. `max-content` lets the table
              //  grow past the card and the scrollport scroll; `min-w-full`
              //  stops it ever being narrower than the card.
              'w-max min-w-full',
            )}>
              <colgroup>
                <col className="w-20" />
                {dataCols.map((c) => (
                  <col key={c.id} style={c.flex ? undefined : { width: widths[c.id] ?? c.width }} />
                ))}
                <col className="w-pt-rail" />
              </colgroup>

              <thead>
                <tr className="bg-table-head">
                  <th scope="col" className={cn(HEAD, 'text-center')}>#</th>
                  {dataCols.map((c) => (
                    <th
                      key={c.id}
                      scope="col"
                      className={cn(HEAD, 'relative', c.flex && 'min-w-pt-flex-min')}
                    >
                      {c.label}
                      {c.resizable !== false ? (
                        <div
                          role="separator"
                          aria-orientation="vertical"
                          aria-label={`Resize ${c.label} column`}
                          aria-valuenow={widths[c.id] ?? c.width}
                          aria-valuemin={c.min}
                          tabIndex={0}
                          onPointerDown={(e) => startResize(e, c)}
                          onKeyDown={(e) => {
                            const w = widths[c.id] ?? c.width;
                            if (e.key === 'ArrowLeft') setWidths((s) => ({ ...s, [c.id]: Math.max(c.min, w - 8) }));
                            else if (e.key === 'ArrowRight') setWidths((s) => ({ ...s, [c.id]: w + 8 }));
                            else if (e.key === 'Home') setWidths((s) => ({ ...s, [c.id]: c.min }));
                            else return;
                            e.preventDefault();
                          }}
                          //  §10 — 7 wide on a 1px line, so it is catchable.
                          //
                          //  ANCHORED AT `end-0`, not centred on the border by
                          //  −3 as the md draws it. NO named-key inset utility
                          //  emits: Tailwind's insets take its own numeric scale
                          //  and keywords, not a `--spacing-*` key — and
                          //  `w-pt-resizer` right beside it DOES work, which is
                          //  what makes the gap easy to miss. With no
                          //  `inset-inline-end` the grabber fell back to `auto`
                          //  and sat at its static position after the label,
                          //  nowhere near the divider it is meant to be on.
                          //  That is why hovering the divider did nothing.
                          //
                          //  At `end-0` the 7px strip is the last 7 INSIDE the
                          //  cell and the 1px divider is inside that, so the
                          //  divider is catchable — which is the requirement. It
                          //  gives up only the 3px on the far side.
                          className={cn(
                            'group/rz absolute inset-y-0 end-0 w-pt-resizer cursor-col-resize touch-none',
                            'flex items-center justify-end',
                            'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring',
                          )}
                        >
                          {/* §10's 4 × 30 pill. The md reveals it only while
                              dragging; here it comes up on HOVER and FOCUS too,
                              because at rest the boundary is a 1.20:1 hairline
                              and nothing says it can be grabbed — the cursor
                              alone only tells you once you have already found it
                              by accident. */}
                          <span
                            aria-hidden
                            className={cn(
                              'w-pt-resizer-pill h-15 rounded-full bg-primary-default',
                              'opacity-0 transition-opacity duration-150 motion-reduce:transition-none',
                              'group-hover/rz:opacity-100 group-focus-visible/rz:opacity-100',
                              resizing === c.id && 'opacity-100',
                            )}
                          />
                        </div>
                      ) : null}
                    </th>
                  ))}
                  <th scope="col" className={cn(HEAD, RAIL, 'text-center')}>
                    <button
                      type="button"
                      aria-label="Customise columns"
                      onClick={onConfigureColumns}
                      className="grid place-items-center size-12 mx-auto rounded-sm border-0 bg-transparent cursor-pointer text-primary-default hover:bg-surface-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring"
                    >
                      <Icon name="table-config" size="md" tone="inherit" />
                    </button>
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  //  §15 — the head band is already meaningful, so the empty
                  //  state is one row of copy rather than an illustration.
                  <tr className="h-pt-row">
                    <td colSpan={dataCols.length + 2} className="text-center text-body text-text-placeholder">
                      No products added yet.
                    </td>
                  </tr>
                ) : rows.map((row, i) => (
                  row.kind === 'group' ? (
                    <tr
                      key={row.id}
                      className={ROW_CLS}
                      data-hot={hot === row.id ? '' : undefined}
                      onPointerEnter={() => setHot(row.id)}
                      onPointerLeave={() => setHot((h) => (h === row.id ? null : h))}
                      onFocus={() => setHot(row.id)}
                      onBlur={() => setHot((h) => (h === row.id ? null : h))}
                    >
                      {/* §11 — one cell, no dividers, no index. `colSpan` is
                          COMPUTED: hard-coding 7 leaves a gap the moment a
                          column is hidden. */}
                      <th
                        scope="rowgroup"
                        colSpan={dataCols.length + 1}
                        //  §18.7 — this is NOT a `.zf-pt-cell`, so it needs its
                        //  own block-size. Measured at 27 against 34 in the md's
                        //  build, which then threw every lane control below a
                        //  group break out by 7.
                        className="box-border h-pt-row py-0 ps-8 text-start text-body font-semibold text-text-default"
                      >
                        {row.label}
                      </th>
                      <td className={cn(CELL, RAIL, 'text-center')}>{railBtn(row.id)}</td>
                    </tr>
                  ) : (
                    <tr
                      key={row.id}
                      className={ROW_CLS}
                      data-lifted={lifted === row.id ? '' : undefined}
                      data-hot={hot === row.id ? '' : undefined}
                      //  §9 — the edge goes on the side the lift will LAND, so
                      //  dragging down marks the target's bottom and dragging up
                      //  marks its top. Same row, opposite edge, and the
                      //  difference is the only thing telling the user whether
                      //  they are inserting before or after it.
                      //  TWO BOOLEAN attributes rather than one with a value:
                      //  `data-[drop=above]` needs Tailwind's arbitrary-variant
                      //  brackets, which rule 1 rejects — and rightly, since the
                      //  bracket escape is exactly how a raw value gets into a
                      //  component. Two plain attributes need no escape.
                      data-drop-above={
                        dropAt === i && from.current !== null && from.current > i ? '' : undefined
                      }
                      data-drop-below={
                        dropAt === i && from.current !== null && from.current < i ? '' : undefined
                      }
                      onPointerEnter={() => setHot(row.id)}
                      onPointerLeave={() => setHot((h) => (h === row.id ? null : h))}
                      //  Focus counts as hover for the lanes: a keyboard user in
                      //  a cell must be able to see the row's controls without
                      //  a pointer. `onFocus`/`onBlur` bubble in React, so this
                      //  is `:focus-within` without the selector.
                      onFocus={() => setHot(row.id)}
                      onBlur={() => setHot((h) => (h === row.id ? null : h))}
                    >
                      <td className={cn(CELL, 'text-center text-text-secondary font-regular')}>
                        {numbers[i]}
                      </td>
                      {dataCols.map((c) => {
                        const v = row.values?.[c.id] ?? '';
                        return (
                          <td key={c.id} className={cn(CELL, c.flex && 'min-w-pt-flex-min')}>
                            {c.kind === 'select' ? (
                              <Select
                                options={c.options ?? []}
                                value={v}
                                onChange={(next) => onRowsChange(rows.map((r) => (
                                  r.id === row.id ? { ...r, values: { ...r.values, [c.id]: next } } : r
                                )))}
                                placeholder={c.placeholder ?? 'Select'}
                                ariaLabel={`${c.label}, row ${numbers[i]}`}
                                //  A cell select is the CELL — no border, no
                                //  radius, full bleed. The field's own box would
                                //  put a second frame inside the grid's.
                                className="h-full border-0 rounded-none px-0 bg-transparent hover:border-0"
                              />
                            ) : c.kind === 'read-only' ? (
                              <span className={cn('text-body', c.muted && 'text-text-secondary font-regular')}>{v}</span>
                            ) : c.unit ? (
                              <UnitCell
                                column={c}
                                value={v}
                                unit={row.values?.[`${c.id}:unit`] || c.unit.default}
                                label={`${c.label}, row ${numbers[i]}`}
                                inputClass={cn(cellText, 'placeholder:text-text-placeholder')}
                                onChange={(patch) => onRowsChange(rows.map((r) => (
                                  r.id === row.id ? { ...r, values: { ...r.values, ...patch } } : r
                                )))}
                              />
                            ) : (
                              <input
                                value={v}
                                //  Filtered through the SAME helper `InputField`
                                //  uses. The cell input is bare by design — no
                                //  border, no radius, full bleed — so it cannot
                                //  be an `InputField`, but it must not be a
                                //  second opinion about what a number is.
                                inputMode={c.format === 'decimal' ? 'decimal'
                                  : c.format === 'numeric' ? 'numeric' : undefined}
                                onChange={(e) => {
                                  const next = c.format
                                    ? applyFormat(e.target.value, c.format)
                                    : e.target.value;
                                  onRowsChange(rows.map((r) => (
                                    r.id === row.id ? { ...r, values: { ...r.values, [c.id]: next } } : r
                                  )));
                                }}
                                placeholder={c.placeholder}
                                aria-label={`${c.label}, row ${numbers[i]}`}
                                //  §18.5 — `::placeholder` is targeted DIRECTLY.
                                //  It does not inherit `color`, and without this
                                //  the browser paints its own #757575 while the
                                //  audited token never appears on screen.
                                className={cn(cellText, 'placeholder:text-text-placeholder')}
                              />
                            )}
                          </td>
                        );
                      })}
                      <td className={cn(CELL, RAIL, 'text-center')}>{railBtn(row.id)}</td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div aria-hidden className="col-start-3" />

        {/* §17.2 — an EXPLICIT grid area. As the grid's fourth child this would
            auto-place into column 1 of a new implicit row: a 20px box tucked
            under the card, which is fine for the absolutely-positioned controls
            but gives the help text and the live region a 20px content box in the
            drag lane. */}
        <div ref={laneRef} className="relative col-start-1 col-end-4 row-start-1">
          {rows.map((row, i) => (
            //  THE CONTROLS KEEP THEIR OWN ROW HOT, and this is not belt and
            //  braces — it is the bug §17.1's structure creates.
            //
            //  The row sets `hot` on pointer enter and clears it on leave. The
            //  lane controls are SIBLINGS of the card, not descendants of the
            //  row, so moving the pointer off the row and onto the grip fires
            //  the row's `pointerleave` — `hot` clears, both controls fade, and
            //  the thing the user was reaching for is gone before they arrive.
            //
            //  Pointer events fire leave-then-enter, so the enter below always
            //  wins the race and the controls stay up while the pointer is on
            //  them. Clearing is guarded on the id, so a stale leave from the
            //  row cannot turn off a lane the pointer has since moved into.
            <div
              key={row.id}
              onPointerEnter={() => setHot(row.id)}
              onPointerLeave={() => setHot((h) => (h === row.id ? null : h))}
            >
              {/* §8.1 — revealed with OPACITY, never `display`. The control has
                  to stay focusable (a keyboard user Tabs to it and the
                  `:focus-visible` in the selector brings it back), nothing may
                  reflow, and `getBoundingClientRect()` has to stay honest for
                  hit-testing. Never `transform`: the rect returns the
                  TRANSFORMED box and a mid-animation grip reports a box the
                  pointer is not over. */}
              <button
                type="button"
                aria-label={`Reorder row ${numbers[i] || row.label || i + 1}`}
                aria-pressed={lifted === row.id}
                aria-describedby={`${uid}-reorder-help`}
                onKeyDown={(e) => onGripKey(e, i)}
                onPointerDown={(e) => onGripDown(e, i)}
                onPointerMove={onGripMove}
                onPointerUp={endDrag}
                //  A cancelled gesture — Escape, a system dialog, the pointer
                //  being torn away — must not leave the row lifted and the
                //  document stuck in `grabbing`.
                onPointerCancel={endDrag}
                //  NO `onClick`. It fired after every pointerup and toggled
                //  `lifted` straight back on, so a completed drag left the row
                //  still lifted. The keyboard path does not need it either:
                //  `onKeyDown` handles Space with `preventDefault`, which is
                //  what stops a button synthesising a click from it.
                style={{ insetBlockStart: laneTop(i) }}
                className={cn(LANE, 'absolute start-0 w-10 h-pt-row grid place-items-center',
                  //  ONE branch. Two opacities on one element are settled by the
                  //  stylesheet's emission order, not the className's.
                  lifted === row.id ? 'opacity-100 text-primary-default cursor-grabbing'
                    : hot === row.id ? 'opacity-100 text-icon-subtle hover:text-icon-default cursor-grab'
                      : 'opacity-0 text-icon-subtle cursor-grab')}
              >
                <Icon name="drag-handle" size="md" tone="inherit" />
              </button>

              <button
                type="button"
                //  §17.1 — the control is no longer inside its row, so its name
                //  has to identify the row by CONTENT, not by position.
                aria-label={`Delete row ${numbers[i] || i + 1}: ${row.values?.[dataCols[0]?.id ?? ''] || row.label || 'empty'}`}
                onClick={() => onRowsChange(rows.filter((r) => r.id !== row.id))}
                style={{ insetBlockStart: laneTop(i) }}
                className={cn(LANE, 'absolute end-0 w-15 h-pt-row grid place-items-center',
                  hot === row.id ? 'opacity-100' : 'opacity-0')}
              >
                <span className="grid place-items-center size-12 rounded-sm text-danger-default hover:bg-danger-subtle hover:text-danger-hover">
                  <Icon name="close" size="md" tone="inherit" />
                </span>
              </button>
            </div>
          ))}

          <p id={`${uid}-reorder-help`} className="sr-only">
            Press Space to lift the row, then the up and down arrows to move it.
            Press Space again to drop it, or Escape to cancel.
          </p>
          {/* §9.1 — without this a screen-reader user hears nothing at all while
              reordering. `polite`, so it does not interrupt the key they are
              still holding. */}
          <p ref={liveRef} aria-live="polite" aria-atomic className="sr-only" />
        </div>
      </div>

      {/* §10's full-height guide. `fixed`, so it is not clipped by the
          scrollport the way an in-card element would be, and
          `pointer-events-none` so it cannot eat the pointermove stream the drag
          is running on. */}
      {guide ? (
        <div
          aria-hidden
          style={{ insetInlineStart: guide.x, insetBlockStart: guide.top, blockSize: guide.height }}
          className="fixed z-100 w-px outline outline-2 outline-primary-default pointer-events-none"
        />
      ) : null}

      <footer className="flex items-start justify-between gap-8 mt-8">
        <SplitButton
          icon="plus-circle"
          onSelect={() => onAddRow?.()}
          entries={[
            { id: 'header', label: 'Add Header', onSelect: () => onAddGroup?.() },
            { id: 'multi', label: 'Add Multiple Rows…', onSelect: () => {} },
          ]}
        >
          Add New Row
        </SplitButton>

        {totals?.length ? <ProductTotals rows={totals} onInputChange={onTotalInput} /> : null}
      </footer>
    </section>
  );

  function railBtn(id: string) {
    return (
      <>
        <button
          ref={(el) => { if (el) menuRefs.current.set(id, el); else menuRefs.current.delete(id); }}
          type="button"
          aria-label="Row actions"
          aria-haspopup="menu"
          aria-expanded={menuFor === id}
          onClick={() => setMenuFor((m) => (m === id ? null : id))}
          className={cn(
            'grid place-items-center size-12 mx-auto rounded-full box-border cursor-pointer',
            'bg-surface-default border border-border-divider text-icon-default',
            'hover:bg-primary-subtle hover:border-primary-border hover:text-primary-default',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
          )}
        >
          <Icon name="more" size="sm" tone="inherit" />
        </button>
        {menuFor === id ? (
          <Menu
            anchor={menuRefs.current.get(id) ?? null}
            open
            onClose={() => setMenuFor(null)}
            label="Row actions"
            entries={[
              { id: 'clone', label: 'Clone', onSelect: () => onRowMenu?.(id, 'clone') },
              { separator: true },
              { id: 'insert-row', label: 'Insert New Row', onSelect: () => onRowMenu?.(id, 'insert-row') },
              { id: 'insert-header', label: 'Insert Header', onSelect: () => onRowMenu?.(id, 'insert-header') },
            ]}
          />
        ) : null}
      </>
    );
  }
}

//  §5.3 — `block-size: 34px` does NOT give a 34px cell. Two UA behaviours have
//  to be cancelled or the rows render at 37 and the card at 290 instead of 240:
//  without `box-sizing` the height sizes the CONTENT box (+2 for the collapsed
//  rules), and Chromium's UA `td { padding: 1px }` survives setting only
//  `padding-inline` (+2 more).
const CELL_BASE = 'box-border h-pt-row py-0 px-6';

const HEAD = cn(
  CELL_BASE,
  'text-start text-overline uppercase text-text-secondary',
  //  §5.1 — the head's underline is `border/default`, one step stronger than the
  //  row rules, so the header separates from the body more firmly than rows
  //  separate from each other.
  'border-b border-border-default border-e border-border-divider last:border-e-0',
);

const CELL = cn(CELL_BASE, 'text-body text-text-default border-e border-border-divider');

//  §5.1 — every row carries its own rule and the LAST one suppresses it, because
//  the card's own border already draws that line.
const ROW_CLS = cn(
  //  The tint is driven by the same state as the lane controls, so the two can
  //  never disagree about which row is hot.
  //
  //  `table/row-hover` and not `surface/hover`: a table row is a wide band, and
  //  the tint that reads as a light touch on a 32px menu row reads as a stripe
  //  across 1300px. `neutral/200` — 1.061 against the card, where the general
  //  hover is 1.079.
  //
  //  It is a real role added through `zf-colours.md` and `tokens:sync`, not a
  //  hand-edit: the generator checks the alias against the hex the table states,
  //  and a role written straight into the CSS is one the next sync deletes.
  'bg-surface-default data-hot:bg-table-row-hover',
  '[&:not(:last-child)>*]:border-b [&:not(:last-child)>*]:border-border-divider',
  //  §9.1a — the lift is a BORDER, not `surface/raised`. Verified against our
  //  own aliases: raised is base/white in Light, the same alias as
  //  surface/default, so the lift would be a no-op; and neutral/1900 in Dark,
  //  the same alias as surface/hover, so a lifted row would be indistinguishable
  //  from a hovered one. Open item 47.
  'data-lifted:shadow-pt-lifted',
  'data-drop-above:shadow-pt-drop-above',
  'data-drop-below:shadow-pt-drop-below',
);

//  §7 — the rail does not scroll with the table and is not resizable.
//  `bg-inherit` is LOAD-BEARING: paint `surface/default` unconditionally and the
//  hovered row's tint stops dead at the rail, breaking the row in half. §7.1.
const RAIL = cn(
  'sticky end-0 z-1 w-pt-rail bg-inherit',
  'border-e-0 border-s border-border-divider',
  'group-data-scrolled-x/scroll:shadow-sticky-start',
);

//  §8.1
//  §8.1 — OPACITY, never `display`. Three reasons, all of them load-bearing:
//  the control stays focusable so a keyboard user can Tab to it; nothing
//  reflows, because the lanes hold their 20/30 whether or not anything is
//  painted in them; and `getBoundingClientRect()` stays honest for hit-testing,
//  where a `display: none` element reports zeros.
//
//  And never `transform` for the reveal — the rect returns the TRANSFORMED box,
//  so a grip mid-animation reports a box the pointer is not actually over and
//  the first drag of a row silently misses.
const LANE = cn(
  'border-0 bg-transparent p-0 transition-opacity duration-150',
  'motion-reduce:transition-none',
  //  Its OWN focus still reveals it even when the row is not hot — that is the
  //  keyboard path in, and the one case the row's state cannot cover.
  'focus-visible:opacity-100',
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring',
);

/**
 * A typed cell with its unit — the value, and a joined `% ▾` segment that opens
 * a `Menu` of units. The input is the same bare, full-bleed cell input every
 * other typed column uses, filtered by the same `applyFormat`; only the segment
 * is new. The segment is a small bordered chip rather than a full-height one,
 * because the cell has no frame of its own for it to join.
 */
function UnitCell({ column, value, unit, label, inputClass, onChange }: {
  column: ProductColumn;
  value: string;
  unit: string;
  label: string;
  inputClass: string;
  onChange: (patch: Record<string, string>) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const options = column.unit?.options ?? [];
  const current = options.find((o) => o.value === unit)?.label ?? unit;

  return (
    <div className="flex items-center h-full min-w-0 gap-2">
      <input
        value={value}
        inputMode={column.format === 'decimal' ? 'decimal' : column.format === 'numeric' ? 'numeric' : undefined}
        onChange={(e) => onChange({
          [column.id]: column.format ? applyFormat(e.target.value, column.format) : e.target.value,
        })}
        placeholder={column.placeholder}
        aria-label={label}
        className={inputClass}
      />
      <button
        ref={ref}
        type="button"
        aria-label={`${label} unit: ${current}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex-none inline-flex items-center gap-1 h-button-sm px-3 rounded-sm',
          'border border-border-default bg-surface-sunken text-body-sm text-text-default',
          'hover:bg-surface-hover',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
        )}
      >
        {current}
        <Icon name="caret-down" size="xs" tone="inherit" />
      </button>
      <Menu
        anchor={ref.current}
        open={open}
        onClose={() => setOpen(false)}
        label={`${column.label} unit`}
        emphasis="strong"
        entries={options.map((o) => ({
          id: o.value,
          label: o.label,
          checked: o.value === unit,
          onSelect: () => { onChange({ [`${column.id}:unit`]: o.value }); setOpen(false); },
        }))}
      />
    </div>
  );
}
