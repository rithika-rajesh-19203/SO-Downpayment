import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

/**
 * APP SHELL — the three regions every screen sits in: the rail, the bar, and
 * the body between them.
 *
 * `src/app/App.tsx` carried a note saying there would be no layout shell "until
 * the design defines one (an app shell is a design decision, not a scaffolding
 * decision)". This is that decision, and it is four of them:
 *
 * **1 · The rail is the bar's SIBLING, not its child.** The two dark regions read
 * as one strip, so something has to guarantee they meet. `zf-top-bar.md` §3.1
 * notes that the bar's `20 + 200` brand column is exactly the rail's 220 and
 * §11 decision 4 asks for that relationship to be *recorded*, because "right now
 * it is two numbers in two files that agree by intent and nothing enforces it".
 * Putting the bar beside the rail rather than over it enforces it structurally:
 * the rail owns the lockup, the bar starts where the rail ends, and there is no
 * 220 to keep in sync. `nav/brand-surface` and `chrome/surface` are the same
 * `blue/2000` so the seam does not show, and the bar carries no bottom stroke so
 * both regions end on the same line.
 *
 * **2 · The `<main>` is here, so no screen can forget it.** A bare `<header>`
 * maps to `role="banner"`, and `zf-page-header.md` §9.1 measured three page
 * headers shipped without a scoping ancestor producing **three `banner`
 * landmarks** against a document that already has one — the top bar. Scoped to
 * `<main>` the same markup produces zero. Leaving that to each screen means
 * getting it right every time forever; owning it here means getting it right
 * once.
 *
 * **3 · One scroll container, and it is the body.** The rail scrolls its own
 * list, the bar is sticky inside the content column, and the page scrolls under
 * both. A page header "scrolls with the content" (§7), so it goes in here rather
 * than beside the bar.
 *
 * **4 · A skip link, which nothing in Figma can express.** WCAG 2.4.1 Bypass
 * Blocks: the rail is ~20 rows and it is on every page, so without one a
 * keyboard user tabs the entire navigation before reaching the content, on every
 * navigation. It is the one part of this component that exists for a reason no
 * screenshot shows.
 */
export interface AppShellProps {
  /** The left rail — a `<Nav>`. Owns its own width and its own scrolling. */
  nav: ReactNode;
  /** The top bar — a `<TopBar>`. Sticks to the top of the content column. */
  topBar: ReactNode;
  /**
   * The page. Rendered inside `<main>`, which is what stops a `<PageHeader>`
   * from becoming a second `banner`.
   */
  children: ReactNode;
  /** The skip link's label. */
  skipLabel?: string;
  className?: string;
}

const MAIN_ID = 'zf-main';

export function AppShell({
  nav, topBar, children, skipLabel = 'Skip to content', className,
}: AppShellProps) {
  return (
    <div className={cn('relative flex h-dvh w-full overflow-hidden bg-surface-canvas', className)}>
      {/* 2.4.1 — off-screen until focused, then a real control on the canvas
          rather than a ghost. `border/control` is 4.52 / 5.67, the one border
          role that clears 3:1 in both panes.

          POSITIONED OFF-SCREEN, not `sr-only`. The obvious spelling is
          `sr-only focus:not-sr-only`, and it is a cascade trap: `not-sr-only`
          sets `position: static` and the `focus:absolute` you then need to stop
          the revealed link shoving the layout sets `absolute`. Both are `:focus`
          variants on one element, so the STYLESHEET's order decides which wins,
          not the className's — measured here, `focus:absolute` happened to be
          emitted 135 bytes later and won. It works by luck, and the luck lasts
          until Tailwind reorders.

          One position and one moving property cannot race. The root is
          `relative` so it is this link's containing block, which is what lets
          its `overflow-hidden` do the hiding; the link stays in the DOM and in
          the tab order throughout, which is the whole point. */}
      <a
        href={`#${MAIN_ID}`}
        className={cn(
          'absolute z-200 start-4 -top-20 focus:top-4',
          'px-6 py-3 rounded-md',
          'bg-surface-default text-text-default border border-border-control',
          'text-body font-medium no-underline',
          'focus:outline-2 focus:outline-offset-2 focus:outline-focus-ring',
          //  `transition-all`, not `transition-[top]`: rule 1 rejects the
          //  arbitrary value, and `transition` alone does not cover `top`.
          'transition-all duration-150 motion-reduce:transition-none',
        )}
      >
        {skipLabel}
      </a>

      {nav}

      {/* `min-w-0` is load-bearing: without it a wide table in the body sets the
          column's min-content width and the whole shell scrolls sideways,
          taking the fixed rail off-screen with it. */}
      <div className="flex flex-1 min-w-0 flex-col">
        {topBar}
        {/* A FLEX COLUMN, so a view can fill it. Without this a screen that
            wants its own ground — a list view claiming `surface/default`
            end-to-end — can only reach the height of its own content, and the
            shell's `surface/canvas` shows through underneath it.

            `flex-1` on the child rather than `grow`: `flex: 1 1 0%` with the
            default `min-height: auto` stretches a short view to fill and lets a
            tall one push the column past the viewport so `overflow-auto` here
            scrolls it. Adding `min-h-0` to the child instead pins it to the
            container's height and clips the eleventh row.

            **A fixed-height child must say `flex-none`.** A flex item defaults
            to `flex-shrink: 1`, so once the body overflows, the column has a
            shortfall to distribute and it lands on whichever child can give —
            which is the one with a height rather than the one floored by its own
            content. `PageHeader` collapsed from 64 to ~34 exactly this way, and
            only after a table grew past the viewport. Anything else pinned to a
            band height needs the same. */}
        <main id={MAIN_ID} tabIndex={-1}
          className="flex flex-1 min-h-0 flex-col overflow-auto outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
