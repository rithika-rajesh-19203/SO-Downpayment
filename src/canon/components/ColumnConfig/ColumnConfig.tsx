import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../icons';
import { Text } from '../../primitives';
import { cn } from '../../utils/cn';
import { Checkbox } from '../Checkbox/Checkbox';
import { Modal } from '../Modal/Modal';

/**
 * COLUMN CONFIG — which columns a table shows, and in what order.
 *
 * **Nothing measures this.** §2.24.2 measures the trigger — *"a 60px cell
 * holding `icon / table-config`"* — and stops there; there is no section for the
 * dialog behind it and none for a reorder list anywhere in the system.
 *
 * So the shell is `Modal`, which IS measured — `zf-modal.md` §2.27, the dialog
 * for *doing* rather than telling, and a column-rearrange form is exactly what
 * §2 has in mind. The rows borrow `Checkbox` and the menu's 32px rhythm, and
 * **the drag behaviour is invented** because there is nothing to copy. Flagged
 * rather than hidden.
 *
 * ── DRAG IS THE POINTER'S SHORTCUT, NOT THE MECHANISM ────────────────────────
 * A reorder list that only reorders by dragging is a **2.1.1 failure** — no
 * keyboard, no touch assistive tech, no switch access. So the handle is a real
 * `<button>`, it is in the tab order, and **↑ / ↓ move the row** whether or not
 * a pointer is involved. Dragging moves the same state through the same
 * function; it is a faster way to reach it, not a second implementation.
 *
 * That reasoning also carried the glyph while `drag-handle` was a roster name
 * with no export — a dashed placeholder on the one affordance a feature depends
 * on, survivable only because the affordance was never the mechanism. The export
 * has landed; the keyboard path stays, and no longer has to carry anything.
 *
 * ── POINTER EVENTS, NOT HTML5 DRAG AND DROP ──────────────────────────────────
 * `draggable` + `dragover` cannot be made to work on touch at all, needs a drag
 * image nobody wants, and fires `dragover` on the element under the cursor
 * rather than telling you where the pointer is. `setPointerCapture` gives one
 * stream of coordinates from press to release, on mouse, pen and touch alike.
 */
export interface ColumnConfigItem {
  id: string;
  label: string;
  /** Checked = shown. */
  visible: boolean;
  /**
   * Cannot be hidden or moved. A list view whose first column can be switched
   * off is a list of blank rows — the identifying column is not optional.
   */
  locked?: boolean;
}

export interface ColumnConfigProps {
  open: boolean;
  /** Discards the draft. */
  onClose: () => void;
  items: ColumnConfigItem[];
  /** Commits the draft. The dialog does not close itself — the caller does. */
  onSave: (next: ColumnConfigItem[]) => void;
  title?: string;
}

/**
 * LOCKED FIRST, ALWAYS. A stable partition, so the locked rows keep their own
 * relative order and so does everything else.
 *
 * It is a real ordering decision and not just a tidy: the list IS the column
 * order, so pinning `locked` to the top makes the identifying column the
 * table's first — which is what it should be, and is the reason it is locked.
 */
const pinLocked = (rows: ColumnConfigItem[]) => [
  ...rows.filter((r) => r.locked),
  ...rows.filter((r) => !r.locked),
];

export function ColumnConfig({
  open, onClose, items, onSave, title = 'Rearrange the Columns',
}: ColumnConfigProps) {
  //  A DRAFT. Every edit is local until Save, which is the only thing that makes
  //  Close mean "discard" rather than "stop editing" — a dialog with Save and
  //  Close that has already applied its changes is lying about one of them.
  const [draft, setDraft] = useState(items);
  const [dragIx, setDragIx] = useState<number | null>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);

  //  Re-seed whenever it opens, so a discarded draft does not survive into the
  //  next open. Keyed on `open` and not on `items`: re-seeding on `items` would
  //  wipe the draft the moment the parent re-rendered for any other reason.
  useEffect(() => { if (open) { setDraft(pinLocked(items)); setDragIx(null); } }, [open, items]);

  //  Where the movable region starts. Locked rows are pinned to the front, so it
  //  is simply how many of them there are.
  const firstFree = draft.filter((r) => r.locked).length;

  const move = (from: number, to: number) => {
    if (draft[from]?.locked) return;
    //  CLAMPED into the free region, not refused at its edge. It used to bail
    //  when `to` landed on a locked row, which made a locked row a WALL: with
    //  one sitting mid-list, nothing could be dragged past it in either
    //  direction, and the arrow keys went dead at that row with no explanation.
    //  Pinning locked to the top turns the wall into a floor, and a floor you
    //  can push against is a boundary a user can feel.
    const target = Math.min(Math.max(to, firstFree), draft.length - 1);
    if (target === from) return;
    const next = [...draft];
    const [row] = next.splice(from, 1);
    next.splice(target, 0, row);
    setDraft(next);
  };

  //  Which row the pointer is over, by midpoint. Measured live rather than from
  //  a cached height, because a label can wrap and the rows are not all equal.
  const rowUnder = (y: number) => {
    for (let i = 0; i < rowRefs.current.length; i += 1) {
      const el = rowRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (y < r.top + r.height / 2) return i;
    }
    return rowRefs.current.length - 1;
  };

  return (
    <Modal
      open={open}
      //  `onRequestClose`, not `onClose` — §5: "a dialog that cannot refuse to
      //  close cannot protect a half-filled form". Nothing here needs to refuse
      //  yet (a discarded draft is the expected outcome of Close), so this
      //  returns nothing and the dialog closes. The day this warns about unsaved
      //  changes, it returns `false` and everything else already works.
      onRequestClose={onClose}
      title={title}
      //  §2 — the PRIMARY first, on the body's own left margin. An alert's
      //  actions are the content and centre under it; a form's follow the
      //  content and start where it starts.
      primaryAction={{ label: 'Save', onSelect: () => onSave(draft) }}
      secondaryAction={{ label: 'Close', onSelect: onClose }}
    >
      {/*  NO PADDING OF ITS OWN. `Modal`'s body is already `space/10` all round —
           §3.3 — and this was adding another 20 to the description and 12 to the
           list on top of it, so the copy sat at 40 from the dialog edge and the
           rows at 32. Two components each supplying "the inside padding" is how
           one number becomes three.  */}
      <Text size="body-sm" tone="secondary" className="block mb-6">
        Uncheck a column to hide it. Drag the handle, or focus it and press
        the up and down arrows, to change the order.
      </Text>

      {/*  `-mx-2` against the rows' `px-2`: the content still starts on the
           body's 20, level with the copy above it, and the hover fill bleeds 4px
           past it on each side so a hovered row does not look clipped to the
           text. */}
      <ul className="flex flex-col -mx-2 my-0 p-0 list-none">
        {draft.map((item, ix) => (
          <li
            key={item.id}
            ref={(el) => { rowRefs.current[ix] = el; }}
            className={cn(
              'group/row flex items-center gap-4 h-16 px-2 box-border rounded-sm',
              'hover:bg-surface-hover',
              //  A rule under the last locked row, so the floor is visible
              //  rather than only discoverable by pushing against it.
              //  `border/divider` — 1.20:1, decorative, and exempt.
              firstFree > 0 && ix === firstFree - 1 && 'mb-2 border-b border-border-divider',
              //  The row being dragged, so the pointer has something to follow.
              dragIx === ix && 'bg-surface-pressed',
            )}
          >
            {/* THE HANDLE. A button, in the tab order, and the keyboard's way in.
                It is `opacity-0` until the row is hovered or the handle itself is
                focused — the hint is for the pointer; the keyboard already has
                the control. It keeps its space either way, so nothing shifts. */}
            <button
              type="button"
              aria-label={`Reorder ${item.label}. Use the up and down arrows.`}
              disabled={item.locked}
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp') { e.preventDefault(); move(ix, ix - 1); }
                if (e.key === 'ArrowDown') { e.preventDefault(); move(ix, ix + 1); }
              }}
              onPointerDown={(e) => {
                if (item.locked) return;
                //  Capture, so the stream keeps arriving when the pointer leaves
                //  the handle — which it does immediately, since dragging a row
                //  means moving away from where the press started.
                e.currentTarget.setPointerCapture(e.pointerId);
                setDragIx(ix);
              }}
              onPointerMove={(e) => {
                if (dragIx === null) return;
                const over = rowUnder(e.clientY);
                if (over !== dragIx) { move(dragIx, over); setDragIx(over); }
              }}
              onPointerUp={() => setDragIx(null)}
              onPointerCancel={() => setDragIx(null)}
              className={cn(
                'grid flex-none place-items-center size-12 p-0 border-0 rounded-sm',
                'bg-transparent text-icon-default',
                item.locked ? 'cursor-default opacity-0' : 'cursor-grab active:cursor-grabbing',
                !item.locked && cn('opacity-0 group-hover/row:opacity-100',
                  'focus-visible:opacity-100'),
                'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring',
                'transition-opacity duration-150 motion-reduce:transition-none',
              )}
            >
              {/*  `sm` (14), not the default 16. The grip is six solid dots
                   filling its box top to bottom — 10.2 × 16 of ink at a 16 slot,
                   where the checkbox beside it is 12 — so at the default it read
                   as the heaviest thing in a row it is only a hint for. */}
              <Icon name="drag-handle" size="sm" tone="inherit" />
            </button>

            <Checkbox
              selection={item.visible ? 'checked' : 'unchecked'}
              disabled={item.locked}
              ariaLabel={`Show ${item.label}`}
              onSelectionChange={(next) => setDraft((d) => d.map((r, i) => (
                i === ix ? { ...r, visible: next === 'checked' } : r)))}
            />

            <Text as="span" tone={item.locked ? 'secondary' : 'default'} truncate
              className="flex-1 min-w-0">
              {item.label}
            </Text>

            {item.locked ? (
              <Text as="span" size="caption" tone="tertiary" className="flex-none">Always shown</Text>
            ) : null}
          </li>
        ))}
      </ul>
    </Modal>
  );
}
