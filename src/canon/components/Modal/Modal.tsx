import { useCallback, useEffect, useId, useRef } from 'react';
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { Icon } from '../../icons';
import { Text } from '../../primitives';
import { cn } from '../../utils/cn';
import { Button } from '../Button/Button';

/**
 * MODAL — `design-refs/zf-modal.md`, §2.27. The dialog you *do* something in.
 *
 * **All five of the md's rebuild contrast figures reproduce exactly** against
 * our primitives, and so do both of §4.4's composited hexes — the scrimmed page
 * resolves to `#8E8F93` in Light and `#0A0C11` in Dark, to the byte.
 *
 * ── IT IS NOT `zf-popup-modal`, AND §2 DRAWS THE LINE ────────────────────────
 * §2.14's modal is for **telling** — an alert, a confirmation, an announcement:
 * one padded block, 640 fixed, centred, actions centred under the content. This
 * one is for **doing** — a form, a table, a wizard step: three regions, four
 * widths, flush to the top edge, actions on the body's own margin, and the body
 * is the only thing that scrolls.
 *
 * They share `surface/default`, a 1px `border/default`, `radius/2xl` and the
 * `0 16 48 @16%` elevation, because *"two modals in one product share a corner
 * and an elevation, or the product looks assembled from parts."*
 *
 * §2.14's is not built. Nothing in this product tells rather than does yet, and
 * a component with no consumer is a component nobody has checked.
 *
 * ── WHAT THE SOURCE WAS ──────────────────────────────────────────────────────
 * 17 raw nodes, no auto-layout, **not one bound paint**, all three text nodes
 * unstyled, one state of one width.
 *
 * **The close target is 8 × 8** — 64px² against the 576 a 24×24 target implies,
 * missing 89% of its area, on the only exit a pointer user has.
 *
 * **The body runs 74px underneath its own footer.** It is 324 tall from y 134
 * and the footer starts at 384. It rendered correctly only because the footer
 * painted over it — and any attempt to make the body scroll exposes that.
 *
 * **Three separate drop shadows**, on the card, the footer and the Cancel
 * button. An inner element cannot cast the container's elevation.
 *
 * **`#EBEAF2` draws all three borders** at 1.19:1 — the same hex `zf-menu.md`
 * §4.2 caught doing three other jobs.
 *
 * ── ONE FINDING WE CANNOT FIX HERE ───────────────────────────────────────────
 * §4.4: in Light the dialog is **3.23:1** against the scrimmed page and carries
 * itself. In Dark it is **1.21:1** — dimming an already-dark page moves it
 * *towards* the dialog, not away. Nothing available reaches 3:1: the border is
 * 1.52, `surface/raised` 1.29, and `border/strong` **2.88** — which is our
 * number and better than the md's 2.36, and still short.
 *
 * The fix is a token, not a component: the Dark ramp needs an overlay-tier
 * surface around `#2A2E42`. §8 decision 1.
 */
export type ModalWidth = 'sm' | 'md' | 'lg' | 'xl';

const widthMap = {
  sm: 'w-modal-sm', // 500
  md: 'w-modal-md', // 600
  lg: 'w-modal-lg', // 700
  xl: 'w-modal-xl', // 900
} as const;

export interface ModalAction {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
}

export interface ModalProps {
  open: boolean;
  /**
   * REQUIRED, and it is the accessible name — `aria-labelledby` points at the
   * visible `<h2>`, so there is only ever one string.
   */
  title: string;
  width?: ModalWidth;
  children: ReactNode;
  /**
   * Asked to close — by Escape, the ✕, or a click outside. **Return `false` to
   * veto.**
   *
   * §5: the name is the contract. *"`onClose` says it happened,
   * `onRequestClose` says it was asked for"* — and a dialog that cannot refuse
   * to close cannot protect a half-filled form.
   */
  onRequestClose: () => boolean | void;
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
  /**
   * §3.4 — hiding it obliges you to provide a labelled dismiss in the footer.
   * A dialog that traps focus with no reachable exit is a **2.1.2** keyboard
   * trap, and Escape alone does not discharge it for a pointer user.
   */
  showClose?: boolean;
  /** Inset from the top edge, which rounds all four corners — §3.2. */
  inset?: boolean;
  className?: string;
}

export function Modal({
  open, title, width = 'md', children, onRequestClose,
  primaryAction, secondaryAction, showClose = true, inset = false, className,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const down = useRef<EventTarget | null>(null);

  const requestClose = useCallback(() => {
    if (onRequestClose() === false) return;
    ref.current?.close();
  }, [onRequestClose]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  /*  §10.4 — ESCAPE, AND WHY THE VETO IS NOT UNCONDITIONAL.
      Chromium's close watcher grants a dialog a small number of *cancelable*
      close requests. Spend them — press Escape three times against a veto — and
      the next `cancel` arrives with `cancelable === false`, `preventDefault()`
      is a silent no-op, and the browser closes anyway. User activation between
      presses does not replenish it.

      A component that only ever calls `onRequestClose()` and returns early on a
      veto then desyncs permanently: the parent never sets `open` false, so
      `open` stays true while `el.open` is false, and the sync effect above —
      whose only dep is `open` — never fires again. The dialog can never be
      reopened.

      So: honour `cancelable`, and treat the DOM as the source of truth by also
      listening for `close`.  */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onCancel = (e: Event) => {
      if (!e.cancelable) { onRequestClose(); return; }
      e.preventDefault();
      requestClose();
    };
    const onClose = () => { if (open) onRequestClose(); };
    el.addEventListener('cancel', onCancel);
    el.addEventListener('close', onClose);
    return () => {
      el.removeEventListener('cancel', onCancel);
      el.removeEventListener('close', onClose);
    };
  }, [requestClose, onRequestClose, open]);

  /*  §5 / §10.4 — INITIAL FOCUS: the first control IN THE BODY. Never the close,
      which makes dismissal the first available action, and never the primary,
      which makes committing it. The first field is what they opened it for.

      `querySelector` alone is not enough. `input[type=hidden]` and any
      `display: none` control satisfy the selector, `.focus()` on them is a
      no-op, and `first ?? body` never falls through because `first` is
      non-null — so focus silently stays where `showModal()` put it, on the ✕. A
      hidden CSRF or id field as a form's first child is the common case.  */
  useEffect(() => {
    if (!open) return;
    const body = bodyRef.current;
    if (!body) return;
    const cands = body.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),'
      + 'select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
    );
    const first = Array.from(cands).find((el) => el.getClientRects().length > 0);
    (first ?? body).focus();
  }, [open]);

  /*  §10.4 — CLICK OUTSIDE, as a pointerdown/click PAIR.
      A click on `::backdrop` is dispatched to the `<dialog>` itself, so the
      target test finds the backdrop — but a press that STARTS on the backdrop
      and releases inside the dialog targets it too. Testing the click alone
      dismisses the dialog when a user starts a text selection inside it and
      releases outside, which is data loss caused by a drag.

      Note the strict `<` on the far edges: `right` and `bottom` are the first
      pixel OUTSIDE the painted box, so `<=` left a 1px dead strip along the
      bottom and right where a backdrop click did nothing.  */
  const onPointerDown = (e: ReactMouseEvent) => { down.current = e.target; };
  const onClick = (e: ReactMouseEvent<HTMLDialogElement>) => {
    if (e.target !== ref.current || down.current !== ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX < r.right
      && e.clientY >= r.top && e.clientY < r.bottom;
    if (!inside) requestClose();
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onPointerDown={onPointerDown}
      onClick={onClick}
      className={cn(
        //  `hidden open:flex`. The UA hides a closed dialog with
        //  `dialog:not([open]) { display: none }`, and a bare `flex` overrides
        //  it at equal specificity and later order — the card then renders
        //  whether or not it is open, `showModal()` has nothing to do, there is
        //  no `::backdrop`, and `.close()` leaves it on screen.
        'hidden open:flex flex-col box-border p-0',
        widthMap[width],
        //  REQUIRED, and not for the obvious reason. Chromium's UA sheet has
        //  `dialog:modal { max-width: calc(100% - 38px) }`. `width` is a
        //  DIFFERENT property, so it does not displace it — without this the
        //  900 renders 747 at an 800px window and the 600 renders 492 at 545.
        //  The block axis has no such problem: an author `max-height` does
        //  displace the UA's.
        'max-w-full max-h-dvh',
        //  §3.2 — FLUSH TO THE TOP. The UA sets `inset: 0; margin: auto` on a
        //  modal dialog, which centres it. Keep the inline auto, kill the block
        //  auto: this is "margin top to 0".
        inset ? 'my-12 mx-auto' : 'mt-0 mb-auto mx-auto',
        //  Square where it meets the viewport edge, rounded where it does not —
        //  a consequence of the placement, not a style choice. `rounded-none` is
        //  `radius/none`, added for exactly this: a scale that runs xs 2 … full
        //  999 cannot say "deliberately square".
        inset ? 'rounded-2xl' : 'rounded-t-none rounded-b-2xl',
        'bg-surface-default text-text-default',
        //  The border is invisible in Light and it stays. Forced-colors drops
        //  BOTH things that separate the dialog from the page — the scrim's
        //  translucent fill and the shadow — and this is what survives.
        'border border-border-default shadow-modal',
        //  Clip the body to the rounded bottom.
        'overflow-hidden',
        'backdrop:bg-overlay-scrim',
        //  §10.2 — OPACITY ONLY, no transform. `getBoundingClientRect()` returns
        //  the TRANSFORMED box and the click-outside test above reads it: with a
        //  `translateY(-8px)` entry, a click 4px above the painted bottom edge
        //  dismissed the dialog for the first 140ms.
        'animate-modal-in motion-reduce:animate-none',
        className,
      )}
    >
      {/* 56 = `space/6` + the 32px close + `space/6`. Sized by the CLOSE, not by
          the title, because the close is the taller child. OPAQUE, and that is
          load-bearing: the body scrolls under it, and a transparent band shows
          the content sliding through the title. */}
      <header className={cn(
        'flex flex-none items-center gap-5 h-modal-header px-10 box-border',
        'bg-surface-sunken',
      )}>
        {/* One line, always. A wrapping title changes the header height, and
            therefore the body height, while the dialog is open. */}
        <Text as="h2" id={titleId} size="subheading" weight="semibold" truncate
          className="m-0 flex-1 min-w-0">
          {title}
        </Text>

        {showClose ? (
          <button
            type="button"
            aria-label={`Close ${title}`}
            onClick={requestClose}
            className={cn(
              //  32 × 32, where the source drew 8 × 8.
              'grid flex-none place-items-center size-16 p-0 border-0 rounded-md',
              //  `icon/default` at 6.04:1, NOT the source's `#F7525A` — a
              //  destructive red on a control that destroys nothing, and the
              //  second red the canon has had to repaint this week.
              'bg-transparent text-icon-default cursor-pointer',
              'hover:bg-surface-hover active:bg-surface-pressed',
              'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring',
              'transition-colors duration-150 motion-reduce:transition-none',
            )}
          >
            <Icon name="close" size="md" tone="inherit" />
          </button>
        ) : null}
      </header>

      {/* THE ONLY SCROLLER, and the rules belong to it rather than to the bands.
          §3.3: an `INSIDE` stroke on the header and footer made their content
          boxes 55 and 71, landing the title on y 15.5 and the buttons on 20.5 —
          half a pixel is a blurry title at 1×. In CSS it is also what a scroll
          container wants: a border on the scrolling element stays pinned while
          its content moves underneath.

          `tabIndex={-1}` because a scroll container with nothing focusable in it
          cannot be scrolled by keyboard in Chromium unless it is focusable — a
          long read-only table in a dialog is exactly that case. */}
      <div
        ref={bodyRef}
        tabIndex={-1}
        className={cn(
          'flex-1 min-h-0 p-10 box-border bg-surface-default outline-none',
          'border-y border-border-divider',
          //  NOT `overflow-y-auto overflow-x-clip`: CSS Overflow 3 coerces
          //  `clip` to `hidden` whenever the other axis is neither clip nor
          //  visible, so the computed value reads back as `hidden` anyway.
          'overflow-x-hidden overflow-y-auto overscroll-contain',
        )}
      >
        {children}
      </div>

      {primaryAction || secondaryAction ? (
        //  72 = `space/10` + a 32px button + `space/10`. LEFT-aligned, on the
        //  body's own margin — §2: an alert's actions ARE the content so they
        //  centre under it; a form's actions FOLLOW the content so they start
        //  where it starts. Written down so it stays a distinction rather than
        //  becoming an accident. §8 decision 3 asks whether to unify anyway.
        <footer className={cn(
          'flex flex-none items-center gap-5 h-modal-footer px-10 box-border',
          'bg-surface-default',
        )}>
          {primaryAction ? (
            <Button disabled={primaryAction.disabled} onClick={primaryAction.onSelect}>
              {primaryAction.label}
            </Button>
          ) : null}
          {secondaryAction ? (
            <Button emphasis="secondary" disabled={secondaryAction.disabled}
              onClick={secondaryAction.onSelect}>
              {secondaryAction.label}
            </Button>
          ) : null}
        </footer>
      ) : null}
    </dialog>
  );
}
