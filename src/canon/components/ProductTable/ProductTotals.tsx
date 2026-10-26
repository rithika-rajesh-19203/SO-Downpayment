import { cn } from '../../utils/cn';
import { Text } from '../../primitives/Text';
import type { TotalRow } from './types';

/**
 * §14 — the totals card. Right-aligned under the table, four grid columns wide.
 *
 * **`box-sizing: border-box` is required and it is not a nicety.** Measured in
 * the md: with the default `content-box`, the 16px padding and 1px border push a
 * `33.333%` card out to **476.33** — 34 wider than four columns — and because
 * the card is right-aligned the whole overshoot lands on its LEFT edge, exactly
 * where "four columns wide" is supposed to be legible. `min-inline-size: 320`
 * likewise renders 354.
 *
 * **Amounts are right-aligned here**, unlike the grid (§4.1). These are read and
 * compared; the grid's are typed.
 */
export interface ProductTotalsProps {
  rows: TotalRow[];
  onInputChange?: (id: string, next: string) => void;
  className?: string;
}

export function ProductTotals({ rows, onInputChange, className }: ProductTotalsProps) {
  return (
    <div className={cn(
      //  `box-border` — see above. Four columns of the card's content box is
      //  1/3 of it, floored so it stays legible in a narrow body.
      'box-border w-1/3 min-w-pt-totals-min',
      'grid gap-5 p-8 rounded-lg',
      'bg-surface-sunken border border-border-divider',
      className,
    )}>
      {rows.map((r) => (
        <div key={r.id} className="flex items-center gap-5 min-w-0">
          <Text
            as="span"
            size="body-sm"
            weight={r.kind === 'emphasis' ? 'semibold' : 'medium'}
            className="flex-1 min-w-0 truncate"
          >
            {r.label}
          </Text>

          {r.kind === 'editable' ? (
            <input
              value={r.input ?? ''}
              onChange={(e) => onInputChange?.(r.id, e.target.value)}
              aria-label={r.label}
              className={cn(
                //  28 — `chrome/button-sm`. §20: "28 is the toolbar-item height
                //  already in the system. 26 would be a fourth control height."
                //  It is the FIFTH token in this system holding 28, which is the
                //  control-height problem §7 decision 2 names, not a new one.
                'w-pt-total-input h-button-sm px-5 box-border flex-none',
                'rounded-md border border-border-default bg-surface-default',
                'text-body-sm text-text-default text-end tabular-nums',
                'placeholder:text-text-placeholder',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
              )}
            />
          ) : null}

          <Text
            as="span"
            size="body-sm"
            weight={r.kind === 'emphasis' ? 'semibold' : 'medium'}
            //  Right-aligned and tabular: a column of figures has to align, and
            //  9 → 10 must not resize anything.
            className="flex-none text-end tabular-nums"
          >
            {r.amount}
          </Text>
        </div>
      ))}
    </div>
  );
}
