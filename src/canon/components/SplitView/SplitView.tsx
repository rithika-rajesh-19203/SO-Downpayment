import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

/**
 * SPLIT VIEW — a `MiniList` beside the record it is pointing at.
 *
 * Two columns and three decisions, which is why it is a component rather than
 * two divs in a screen:
 *
 * **1 · Each column scrolls on its own, and neither scrolls the other.** That is
 * the whole point of the pattern and the thing `zf-mini-list.md` §5 protects:
 * *"selecting a row does not re-render, scroll, or lose its position."* One
 * shared scroller would move the list every time the record changed, and the
 * user would have to re-find their place on every selection.
 *
 * **2 · `min-w-0` on the detail column.** Without it a wide table or a long
 * unbroken string inside the record sets the column's min-content width, the
 * row refuses to shrink, and the fixed 353px list is pushed off the left edge —
 * where it cannot be scrolled back to.
 *
 * **3 · The list owns its own width and its own edge.** `MiniList` is 353 and
 * carries the `border/divider` between the columns, so nothing here needs to
 * know either number. Swap the list for a different one and the split still
 * holds.
 *
 * ── WHERE 353 BELONGS, EVENTUALLY ────────────────────────────────────────────
 * §8 decision 1: it is on no scale the system has, and `zf-sidebar` is 460 with
 * nothing relating them. Both are **layout** values — column widths, panel
 * widths, shell regions — and they belong in `ZF-SHELL.md`, which is still a
 * stub. Named as chrome tokens until it exists.
 */
export interface SplitViewProps {
  /** The left column — a `<MiniList>`. Owns its own width and its own edge. */
  list: ReactNode;
  /** The record. Scrolls independently of the list. */
  children: ReactNode;
  className?: string;
}

export function SplitView({ list, children, className }: SplitViewProps) {
  return (
    <div className={cn('flex flex-1 min-h-0 w-full bg-surface-default', className)}>
      {list}
      <div className="flex flex-1 min-w-0 min-h-0 flex-col">
        {children}
      </div>
    </div>
  );
}
