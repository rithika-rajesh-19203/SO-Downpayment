import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

/**
 * PAGE CHROME — the cell the page header and the action bar share.
 *
 * `zf-action-bar.md` §12: *"The action bar is the first component that cannot be
 * specified without saying something about the page around it. Everything before
 * it — a button, a menu, a table — is a thing you place. This is a thing that
 * **replaces** another thing, and the replacement has a size."*
 *
 * §12 gives three rules and says they belong to the shell rather than to either
 * component. All three are here:
 *
 * **1 · One cell, one fixed block-size, equal to the taller occupant.**
 * `PageHeader` is **64** in all three of its variants; `ActionBar` is **48**.
 * Without the fixed height the table jumps 16px on the first click and back
 * again on the last — under the pointer that just clicked it.
 *
 * **2 · The header is `hidden`, never unmounted.** It owns state the user put
 * there: the view switcher, a half-typed search, a scroll position in its own
 * overflow menu. Unmounting throws all of it away and they rebuild it after
 * every bulk action. `hidden` keeps the node and its state and takes it out of
 * the accessibility tree.
 *
 * **3 · Focus never crosses the swap.** Not into the bar when it appears, not
 * into the header when it returns — it stays on the checkbox the user was
 * operating. Moving focus on a value change is a **3.2.2** failure: the user
 * changed a value, they did not request a context change. §7 calls it the most
 * common bug in this pattern, and it fires on every checkbox click.
 *
 * That third rule is enforced by omission — there is no `autoFocus` here and
 * there must never be one. It is the easiest thing in the file to "improve".
 */
export interface PageChromeProps {
  /** The `<PageHeader>`. Always rendered; hidden while `bar` is present. */
  children: ReactNode;
  /**
   * The `<ActionBar>`, or nothing. Present means a selection exists, so the
   * header steps aside.
   */
  bar?: ReactNode;
  className?: string;
}

export function PageChrome({ children, bar, className }: PageChromeProps) {
  return (
    <div className={cn(
      'relative flex-none h-page-header',
      //  STICKY, and it needs a fill to be sticky at all — a transparent sticky
      //  strip has the page sliding visibly through it. `surface/default` is the
      //  page header's own fill, so the cell is seamless whichever of the two is
      //  in it, and the action bar lands on white rather than on the canvas.
      //
      //  `z-10` clears the table's sticky header (`z-1`) and its corner (`z-2`)
      //  and stays well under the overlays at `z-100`.
      'sticky top-0 z-10 bg-surface-default',
      className,
    )}>
      {/* Rule 2 — a wrapper rather than a prop on the header, so the header does
          not have to know it can be replaced. Nothing about a page header is
          different because an action bar exists. */}
      <div hidden={Boolean(bar)}>{children}</div>

      {bar ? (
        //  Rule 1 — the bar is 48 inside a 64 cell, centred, and inset to the
        //  header's own `space/10`. Absolute rather than a second flex row, so
        //  neither component has to know the other's height and the cell keeps
        //  exactly one block-size.
        <div className={cn(
          //  ── THE PAGE BAR SPANS THE PAGE ────────────────────────────────────
          //  `flex-col`, not `flex items-center`. Both centre the bar
          //  vertically; only one of them leaves it full width.
          //
          //  In a flex ROW the bar is an item sizing to its content, so it
          //  shrank to a pill in the middle of the page AND its `ms-auto` spring
          //  stopped working — an auto margin with no free space to eat does
          //  nothing, so the ✕ came to rest against the last action instead of
          //  at the far end. In a flex COLUMN the cross axis is horizontal and
          //  the default `align-items: stretch` fills the cell, while
          //  `justify-center` does the vertical centring.
          //
          //  THE MINI LIST'S BAR IS DELIBERATELY NOT THIS. It hugs, because a
          //  353px column has no free space worth springing across. The two are
          //  different on purpose — see MiniList — and a fix to one must not be
          //  copied into the other, which is exactly how this regressed.
          'absolute inset-x-10 inset-y-0 flex flex-col justify-center',
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
  );
}
