import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

/**
 * CREATE PAGE — `ZF-CREATE-PAGE.md` §2. The scrolling body and the action
 * footer of a new-record page.
 *
 * **The header is a sibling, not a child.** The md's `zf-create-page` includes
 * it, but `AppShell` already owns the page shell here and `PageHeader` already
 * owns its own 64 and its `flex-none` — nesting it would give the page two
 * components that both think they are the frame.
 *
 * **The body is the only scroller**, which is the whole reason this is a
 * component: the header stays, the footer stays, and the form moves between
 * them. A page that scrolls as a whole puts Save below the fold on every long
 * form, which is the one control the user is trying to reach.
 *
 * ── THE GRID LIVES HERE ─────────────────────────────────────────────────────
 * `px-10` — `space/10`, 20 either side — and **no gutter**. A 12-column grid
 * usually carries one; this one does not, because the 30px input inset and the
 * one column of slack do all the separating. The consequence is worth stating:
 * a column is a *pure twelfth of the content box*, so the arithmetic is
 * `(W − 40) / 12` and nothing else. Add a gutter and every number in §2's table
 * changes, and the input stops landing on a column edge.
 *
 * `@container` is declared here too — `container-type: inline-size` on the
 * body, so `FormSection`'s reflow queries measure the FORM's width rather than
 * the viewport's. On a page behind a 220 rail that is a 220px difference, and a
 * viewport query would stack the halves at the wrong moment in both directions.
 */
export interface CreatePageProps {
  /** The form. Scrolls; the footer does not. */
  children: ReactNode;
  /**
   * Save and Cancel, in that order — §7.1. The primary action first, because
   * reading order carries more weight here than the platform convention it
   * contradicts.
   */
  footer: ReactNode;
  /**
   * Reserve the 30px trailing lane a `ProductTable`'s delete controls hang in.
   *
   * `zf-product-table.md` §2.1: *"A creation-page body that hosts a Product
   * table needs `padding-inline: 20px 30px`, not `20px 20px`. Amend the host, do
   * not shrink the lane — 30px is what the design calls for and 20px is not
   * enough room for a 24px hit target."* At 20/20 the delete control is clipped
   * by 10 and 62% of the target is unhittable, which the md measured.
   *
   * It is a mode of the page, not a tweak: §2.2 defines the column as
   * `(W − 20 − 30) / 12` when a product table is present, so the grid follows.
   */
  reserveEndLane?: boolean;
  className?: string;
}

export function CreatePage({ children, footer, reserveEndLane, className }: CreatePageProps) {
  return (
    <>
      <div
        className={cn(
          'flex-1 min-h-0 overflow-y-auto overscroll-contain',
          //  ONE branch — two `padding-inline` on one element are settled by the
          //  stylesheet's emission order, not the className's.
          'py-16 ps-10',
          reserveEndLane ? 'pe-15' : 'pe-10',
          'bg-surface-default',
          className,
        )}
        //  Tailwind has no `container-type` utility that also names a container,
        //  and an arbitrary value would fail rule 1. One inline declaration,
        //  which is a layout mode rather than a design value — there is no token
        //  that could hold `inline-size`.
        style={{ containerType: 'inline-size' }}
      >
        {children}
      </div>

      {/* 72 = `space/10` either side of a 32 button. `flex-none`, so a long form
          cannot squeeze it — the footer is the one part of the page that must
          never move. */}
      <div className={cn(
        'flex flex-none items-center gap-5 box-border',
        'h-create-footer px-10',
        'bg-surface-default border-t border-border-divider',
      )}>
        {footer}
      </div>
    </>
  );
}
