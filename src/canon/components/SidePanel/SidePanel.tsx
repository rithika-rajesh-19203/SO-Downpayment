import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../../icons';
import { Text } from '../../primitives';
import { cn } from '../../utils/cn';

/**
 * SIDE PANEL — design-refs/zf-side-panel.md. A right-hand drawer: a titled
 * header, a scrollable body, an optional action footer.
 *
 * §7 — when NOT to use it: "If the user must answer before continuing, it is a
 * modal, not a panel. A panel that blocks is a modal with the wrong geometry."
 * And "if it never closes, it is not a panel" — a permanent right-hand rail is
 * layout, and needs no scrim, no close button and no dialog semantics.
 *
 * ── THE HEADLINE DEFECT, FIXED ───────────────────────────────────────────────
 * §2: **the Figma component is a modal panel with no scrim.** The
 * `overlay/scrim` role was created for it and *nothing in the entire file uses
 * it* — the only matches for "overlay", "scrim" or "backdrop" anywhere are text
 * nodes inside two documentation frames.
 *
 * That is not a missing rectangle. The scrim is what makes the panel modal, it
 * is the click-outside target, it is what dims the page so the panel reads as
 * *above* rather than *beside*, and it is what `aria-modal` implies visually.
 * "A panel without one is a `<div>` pinned to the right of the page, not a
 * dialog."
 *
 * ── <dialog> DOES THE WORK ───────────────────────────────────────────────────
 * §8. `showModal()` gives, with no script: the top layer (so nothing can
 * z-index above it), `::backdrop` for the scrim, a focus trap, Esc-to-close,
 * `inert` on everything behind, and focus return to the opener. Those are
 * precisely the things §6 lists as code-only — "and they are the four things
 * hand-rolled drawers get wrong".
 */
export interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** §1 — Figma's `Body` INSTANCE_SWAP. */
  children: ReactNode;
  /** Omit for Figma's `Footer=none`. */
  footer?: ReactNode;
  showClose?: boolean;
  /** §4.3 — a 1.12:1 change in Light and 1.05 in Dark. §11 decision 3. */
  tintedHeader?: boolean;
  /**
   * false → `show()` rather than `showModal()`: no focus trap, no inert page,
   * no scrim. §8: the doc frame is right that you must not trap focus when
   * `aria-modal` is false.
   */
  modal?: boolean;
  className?: string;
}

export function SidePanel({
  open, onClose, title, children, footer,
  showClose = true, tintedHeader, modal = true, className,
}: SidePanelProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const downOnBackdrop = useRef(false);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      if (modal) el.showModal(); else el.show();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open, modal]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      //  §9.3 — Esc fires `cancel` before `close`. Routing it through onClose
      //  keeps the parent's state authoritative instead of letting the DOM close
      //  underneath it and leaving `open` out of sync.
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      //  GUARDED, not `onClose={onClose}`. Every dismissal calls onClose, which
      //  flips the parent's `open` false, which makes the effect call el.close(),
      //  which fires this again — the md measured **2 calls per dismissal on all
      //  three paths**. Harmless for a setState; not harmless for analytics, a
      //  router pop, or an unsaved-changes prompt.
      onClose={() => { if (open) onClose(); }}
      //  Click-outside, LATCHED on pointerdown. `e.target === dialog` alone is
      //  not enough: a drag that STARTS inside the panel and is released on the
      //  backdrop produces a click whose target is the nearest common ancestor —
      //  the <dialog> — so selecting text or dragging a slider past the edge
      //  would dismiss the panel and discard the user's work. Measured.
      onPointerDown={(e) => { downOnBackdrop.current = e.target === ref.current; }}
      onClick={(e) => {
        if (modal && e.target === ref.current && downOnBackdrop.current) onClose();
      }}
      className={cn(
        'fixed inset-y-0 p-0 m-0 border-0 box-border overflow-hidden',
        //  §9.2 — `start-auto end-0`, NOT `end-0` alone. Chromium's UA sheet sets
        //  BOTH left:0 and right:0 on <dialog>. With a fixed width and margin:0
        //  the box is over-constrained, and in LTR the used value keeps `left`
        //  and drops `right` — so the drawer renders flush LEFT. The md measured
        //  it. `start-auto` explicitly resets the half the UA sheet is winning.
        'start-auto end-0',
        //  460 is the specification, verbatim. The HEIGHT is not: 769 is the
        //  artboard this was drawn against, and a live drawer is pinned to the
        //  viewport. `dvh` rather than `vh` so mobile browser chrome cannot clip
        //  the footer. Figma keeps its 769 — §3.1 is explicit about that.
        'w-side-panel max-w-full h-dvh max-h-none',
        'flex flex-col',
        'bg-surface-default text-text-default shadow-drawer',
        //  §2.1 — THE DARK-MODE FIX, and the one border added rather than
        //  matched. Figma draws NO panel edge. In Dark the scrim composites to
        //  #0A0C11 while the panel is #1D202E — **1.21:1** — and the shadow makes
        //  it 1.20 rather than better, because #12141F is *lighter* than the
        //  scrim: a shadow meant to lift the panel is lifting the page toward it.
        //
        //  Figma's own `border/default` does not fix this: 1.26 vs the panel and
        //  **1.52 vs the scrim**. Only `border/control` does — 5.67 and 6.85. And
        //  in Light it is 1.40 against the scrim, i.e. invisible, which is
        //  exactly right: Light already passes at 3.23 and does not need it.
        //  "A fix for Dark that is inert in Light."
        'border-s border-border-control',
        //  §9.2 — the scrim. `::backdrop` is free with showModal(): no extra
        //  element, no z-index, and it sits in the top layer so nothing can
        //  paint above it. Our role is a `color-mix`, so the alpha survives —
        //  §9.5 warns that a pipeline flattening it to hex yields an OPAQUE
        //  scrim that hides the page completely.
        'backdrop:bg-overlay-scrim',
        'open:animate-panel-in open:backdrop:animate-scrim-in',
        'motion-reduce:open:animate-none motion-reduce:open:backdrop:animate-none',
        className,
      )}
    >
      <header
        className={cn(
          'flex flex-none items-center gap-6 ps-10 pe-8 h-side-panel-header box-border',
          //  §4.2 — the md binds both rules to `border/control` (4.52). Kept on
          //  Figma's `border/default` (1.31) per the standing decision of
          //  2026-08-24: these ARE hairlines Figma draws, unlike the panel edge
          //  above, which Figma does not draw at all.
          'border-b border-border-default',
          tintedHeader && 'bg-surface-sunken',
        )}
      >
        {/* §9.1 — an <h2>, not a styled div. "A panel is a landmark with a
            heading." And §3.2: Figma has textTruncation DISABLED with
            layoutGrow 1, so a long title overflows the header rather than
            ellipsising. */}
        <Text as="h2" id={titleId} size="subheading" weight="medium" truncate
          className="flex-1 min-w-0 m-0">
          {title}
        </Text>
        {showClose ? (
          <button
            type="button"
            //  §9.1 — Figma's close is a frame containing a glyph, so without a
            //  name it announces as "button". Naming the panel disambiguates
            //  when two can be open in a session.
            aria-label={`Close ${title}`}
            onClick={onClose}
            className={cn(
              //  §3.2 — the TARGET is 28×28; the glyph is 16. 2.5.8 measures the
              //  target, and 28 clears 24. Compare the accordion's 61×20 action,
              //  which does not.
              'grid flex-none place-items-center size-icon-button rounded-md',
              'p-0 border-0 bg-transparent text-icon-default cursor-pointer',
              //  §5 — Figma has NEITHER hover nor focus for this, and it is the
              //  panel's first tab stop. That is a 2.4.7 failure in the source.
              'hover:bg-surface-hover',
              'focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-offset-2',
            )}
          >
            <Icon name="close" size="md" tone="inherit" />
          </button>
        ) : null}
      </header>

      {/*
        §3.4 — THE SCROLL CONTAINER. Figma's body instance is `FILL / FIXED`, so
        a swapped-in Body is pinned to its own height and sits at the top of a
        719px frame: a real body — a form, a list — cannot grow or scroll.
        `min-h-0` is belt-and-braces (overflow-y already zeroes the automatic
        minimum size) but keeps the rule correct if the overflow is ever removed.
      */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">{children}</div>

      {footer ? (
        <footer className={cn(
          'flex flex-none items-center gap-5 px-10 h-side-panel-footer box-border',
          'border-t border-border-default',
          //  §3.3 — Figma left-aligns with Save BEFORE Cancel, leaving 325px of
          //  empty space at the trailing edge. Both are questionable: a drawer's
          //  actions conventionally sit at the trailing edge, where the eye
          //  finishes and the close button already is; and in LTR the confirming
          //  action conventionally comes last. Nothing in the doc frame says
          //  either was decided rather than being the default MIN a new
          //  auto-layout frame gets. §11 decision 2 lets you overrule this.
          'justify-end',
        )}>
          {footer}
        </footer>
      ) : null}
    </dialog>
  );
}

/**
 * §3.4 — the default `Body`: a placeholder message. Figma's frame is 120px tall
 * where its content needs 68 (24 + 20 + 24), so 52px is inert, and its text
 * carries no style despite `zf/body/regular` existing at exactly 13/20.
 */
export function SidePanelBody({ children }: { children: ReactNode }) {
  return (
    <div className="grid place-items-center py-12 px-10 text-center">
      <Text size="body" tone="tertiary">{children}</Text>
    </div>
  );
}
