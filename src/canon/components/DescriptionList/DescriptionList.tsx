import type { ReactNode } from 'react';
import { Text } from '../../primitives/Text';
import { cn } from '../../utils/cn';

/**
 * DESCRIPTION LIST — a record's fields, as label-and-value pairs.
 *
 * The body of every detail view is this: eleven labels and eleven values. It is
 * a component rather than a `<Stack>` of `<Inline>`s in the screen for three
 * reasons, and the first is the only one that is about looks.
 *
 * **1 · One label column width, down the whole list.** Ragged labels put every
 * value at a different x and the eye has nothing to run down. `chrome/field-label`
 * is that width, so two detail views cannot disagree about it.
 *
 * **2 · It is a `<dl>`, and that is the information.** A label and its value are
 * a pair; two columns of `<div>`s are twenty-two unrelated strings. A screen
 * reader on a real `<dl>` announces "Balance due, ₹12,400" and can jump
 * pair-by-pair; on divs it reads eleven labels and then eleven numbers, and the
 * user has to hold the mapping in their head. Same pixels, different content.
 *
 * **3 · The row is a `<div>` inside the `<dl>`, not a bare `dt`+`dd`.** HTML5
 * added exactly that allowance so a pair can be laid out as a unit — without it
 * the flex container is the `<dl>` itself and every `dt` and `dd` becomes its
 * own flex item, which lays eleven pairs out as one long ribbon.
 *
 * ── WHAT THIS DELIBERATELY DOES NOT DO ───────────────────────────────────────
 * No `columns` prop, no responsive two-up. The detail column is already the
 * narrow half of a split view; a second column inside it is how the label width
 * stops being one width. If a record needs two columns, that is two
 * `<DescriptionList>`s in a grid the screen owns.
 */
export interface DescriptionListItem {
  /** Distinct per list. Falls back to `label`, which is fine while labels differ. */
  id?: string;
  label: string;
  /**
   * Plain text, or a node when the value carries its own meaning — a
   * `<StatusBadge>`, a due date in `danger`, a `tabular-nums` amount.
   */
  value: ReactNode;
}

export interface DescriptionListProps {
  items: DescriptionListItem[];
  /**
   * `inline` — label beside value, sharing one column width. The default, and
   * what a record summary wants.
   *
   * `stacked` — label above value. For a column too narrow to give 140px away,
   * or for values that are themselves blocks.
   */
  layout?: 'inline' | 'stacked';
  /** Vertical rhythm between pairs. A step on the 2px scale. */
  gap?: 4 | 5 | 6 | 8;
  className?: string;
}

const GAP = { 4: 'gap-4', 5: 'gap-5', 6: 'gap-6', 8: 'gap-8' } as const;

export function DescriptionList({
  items, layout = 'inline', gap = 6, className,
}: DescriptionListProps) {
  const inline = layout === 'inline';

  return (
    <dl className={cn('flex flex-col m-0', GAP[gap], className)}>
      {items.map((item) => (
        <div
          key={item.id ?? item.label}
          //  ONE branch, not two sets of classes joined. `cn` is a plain joiner,
          //  so `flex-col` and `items-start` on the same element would be
          //  settled by the stylesheet's emission order rather than by intent.
          //  Resolving here makes the conflict unrepresentable.
          className={inline ? 'flex items-start gap-5' : 'flex flex-col gap-2'}
        >
          <Text
            as="dt"
            tone="secondary"
            //  Same treatment: the label is either a fixed column or it is not.
            className={inline ? 'w-field-label flex-none' : undefined}
          >
            {item.label}
          </Text>
          {/* `m-0` against the UA's `dd { margin-inline-start: 40px }`. Preflight
              already zeroes it; stated anyway, because the day this renders
              without preflight every value jumps 40px right and the cause is
              invisible. `min-w-0` so a long value truncates or wraps inside the
              column instead of widening the row past the split, and
              `break-words` for the values that have no break to wrap at — an
              email, a reference string, a URL. */}
          <Text as="dd" className="m-0 min-w-0 flex-1 break-words">
            {item.value}
          </Text>
        </div>
      ))}
    </dl>
  );
}
