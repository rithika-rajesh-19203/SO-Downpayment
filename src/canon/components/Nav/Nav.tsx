import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../../icons';
import { Text } from '../../primitives';
import type { IconName } from '../../icons';
import { cn } from '../../utils/cn';

/**
 * LHS MENU — design-refs/zf-lhs-menu.md. The left-hand navigation rail: a
 * persistent, non-dismissible landmark holding a tree, in two widths.
 *
 * Nine Figma components, 54 variants, 413 paints all role-bound. The largest
 * family in the system and the best built.
 *
 * §7 — three rules that govern how this is used:
 *   ONE LANDMARK. If this is nav[aria-label="Main"], nothing else on the page
 *   may be an unlabelled <nav>, or a screen-reader user gets a list of
 *   identical "navigation" entries.
 *   COLLAPSING CHANGES THE WIDTH, NOT THE SEQUENCE.
 *   A PARENT IS NOT A LINK. It discloses. That is why the parent is a <button>
 *   and the leaf an <a>, and it is the right split.
 *
 * ── WHAT THIS FILE FIXES, AND WHAT IT LEAVES ALONE ───────────────────────────
 * Per the standing decision of 2026-08-24, colour matches Figma and every
 * measured failure is flagged rather than silently corrected. Three things are
 * fixed anyway, because they are not colour choices — they are a control that
 * does not work:
 *   §3.4  the collapse toggle is not pinned (Figma's rails are HUG height)
 *   §5.4  the toggle has NO focus state — 2.4.7, and it is the last tab stop
 *   §3.2  the `action` plus is 20×20 — 2.5.8, with no exception available
 */
export interface NavNode {
  id: string;
  label: string;
  /** Present → a leaf that navigates. Absent with children → a parent that discloses. */
  href?: string;
  /**
   * A roster glyph by name, or a supplied mark.
   *
   * The ReactNode form is for the APPS section, where the rows are third-party
   * PRODUCT MARKS rather than ZF icons: they are not in `ICON_NAMES`, they are
   * not authored on the 16-unit grid, and `icons:sync` rejects them on the
   * viewBox check. `product.mark` already takes a node for the same reason —
   * the Books lockup is not a roster glyph either.
   *
   * Whatever is passed inherits the slot's colour, so a mark must paint with
   * `fill="currentColor"` and carry no baked hex.
   */
  icon?: IconName | ReactNode;
  /** §9.1 — "12" announces as "12". `description` is what makes it "12 unread". */
  badge?: { value: string; description: string };
  /** The hover-only plus. A SIBLING of the row — a <button> cannot nest in an <a>. */
  action?: { label: string; onSelect: () => void };
  children?: NavNode[];
}

export interface NavProps {
  items: NavNode[];
  sections?: { header: string; items: NavNode[] }[];
  /** The ONE id carrying `aria-current="page"`. Ancestors are derived from it. */
  currentId: string;
  collapsed: boolean;
  onCollapsedChange: (next: boolean) => void;
  product: { name: string; mark?: ReactNode };
  /**
   * Fired when a leaf is activated. Call it from a router — or, with no router,
   * to drive `currentId` yourself. Providing it cancels the browser navigation,
   * so the rail is a controlled component either way.
   */
  onNavigate?: (id: string) => void;
  /** The landmark's accessible name. */
  label?: string;
  className?: string;
}

/**
 * §9.3 — the current node's ancestors, outermost first. Returns null when `id`
 * is not in this subtree, which is what lets the recursion PROPAGATE a deep
 * trail instead of rebuilding a shallow one.
 *
 * The md records the bug it found here by rendering it: `if (hit.length) return
 * [...trail, n.id]` discards the recursive result and rebuilds from the current
 * frame, so on a three-level tree everything below the outermost ancestor is
 * lost, the current page's group never opens, and no row carries aria-current.
 */
function ancestorsOf(items: NavNode[], id: string, trail: string[] = []): string[] | null {
  for (const n of items) {
    if (n.id === id) return trail;
    const hit = n.children ? ancestorsOf(n.children, id, [...trail, n.id]) : null;
    if (hit) return hit;
  }
  return null;
}

interface RowCtx {
  currentId: string;
  onNavigate?: (id: string) => void;
  //  `within` is deliberately NOT here. It seeds the initial open branch in
  //  `Nav` and nothing else: a row's appearance now depends on whether it is
  //  open, not on whether it contains the current page.
  open: Set<string>;
  onToggle: (id: string) => void;
  collapsed: boolean;
  /** §5.6 — a COLLAPSED parent does not disclose inline; it opens a flyout. */
  flyoutId: string | null;
  /** Click / Enter / Space — toggles. */
  onFlyout: (node: NavNode, anchor: HTMLElement) => void;
  /** Pointer enter — always opens, and switches straight between parents. */
  onFlyoutHover: (node: NavNode, anchor: HTMLElement) => void;
  /** Pointer leave — closes after a grace period, so the 8px gap is crossable. */
  onFlyoutLeave: () => void;
}

//  §5.1 — the focus treatment, which the md calls "the best in the system and
//  the reference other components should be brought up to". Four things it does
//  that nothing else here does: focus is a real State value rather than a
//  modifier; it does NOT paint a hover fill, so a keyboard user sees a ring and
//  not a phantom hover; it RECOLOURS against the fill beneath it; and it is
//  inset, so the row's box is identical focused and unfocused.
//
//  §9.2 draws it as an `inset box-shadow` and then needs a
//  `@media (forced-colors: active)` block, because forced-colors forces
//  `box-shadow: none` and the md measured zero ring pixels there. A negative
//  `outline-offset` gets all four properties AND is painted in forced-colors,
//  so the fallback is unnecessary. Outlines never affect layout and follow
//  border-radius in every current browser.
const RING = 'focus-visible:outline-2 focus-visible:-outline-offset-2';

/**
 * THE DROPDOWN CHEVRON — supplied as an asset (`design-refs/icons/menu arrow.svg`)
 * rather than taken from the roster, and it cannot go through the roster:
 * `icons:sync` checks for a 16 × 16 viewBox and this is **5 × 7**, while the
 * four roster chevrons are derived geometry at the system's 1.25 stroke.
 *
 * Rendered at its NATURAL size, so the declared 1.5 paints exactly 1.5. Scaling
 * a stroked glyph changes its weight — `SCALE` scales geometry and not stroke —
 * which is the trap zf-icons.md records and the reason §5.2 measures Figma's nav
 * chevron at nearly twice the library's proportional weight. §11 decision 7 asks
 * whether the nav chevron should be heavier than every other chevron; this asset
 * is that decision, taken.
 *
 * `currentColor`, not the asset's hardcoded `#6A6E85`. That hex IS
 * `nav/text-tertiary`'s Light value, so Light is unchanged — but bound to the
 * role it also follows Dark and inverts to white on an active row, which a
 * literal cannot do.
 */
function DropdownChevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 5 7" width="5" height="7" aria-hidden focusable="false"
      className={cn('transition-transform duration-150 motion-reduce:transition-none',
        //  A chevron is rotationally safe — unlike §5.4's collapse glyph, where a
        //  180° turn is a double flip that only works by symmetry.
        open && 'rotate-90')}
    >
      <path
        d="M0.75 0.75L3.40165 3.40165L0.75 6.0533"
        fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

export function Nav({
  items, sections = [], currentId, collapsed, onCollapsedChange, product,
  onNavigate, label = 'Main', className,
}: NavProps) {
  const within = new Set(ancestorsOf(items, currentId) ?? []);
  const [open, setOpen] = useState<Set<string>>(() => new Set(within));
  //  ONE BRANCH OPEN AT A TIME. Opening a parent closes whatever else was open.
  //
  //  It keeps the toggled row's own ANCESTORS open rather than clearing to a
  //  single id: on a three-level tree, `new Set([id])` would close the parent of
  //  the row you just opened and take the row itself off screen with it.
  //  `ancestorsOf` already computes that trail, so one branch stays open to
  //  whatever depth it runs.
  const onToggle = useCallback((id: string) => {
    setOpen((prev) => (prev.has(id)
      ? new Set<string>()
      : new Set([...(ancestorsOf(items, id) ?? []), id])));
  }, [items]);
  //  §5.6 — the collapsed rail's submenu. Figma draws `zf-nav-flyout` as a
  //  floating rectangle with no anchor, no pointer and no close affordance, so
  //  every part of this is code-only.
  const [flyout, setFlyout] = useState<{ node: NavNode; top: number; left: number;
    anchor: HTMLElement } | null>(null);

  //  A grace period, because the flyout is 8px clear of the rail: crossing that
  //  gap fires pointerleave on the row before pointerenter on the flyout, and
  //  closing immediately would make the menu unreachable by mouse.
  const closeTimer = useRef<number | null>(null);
  const cancelClose = useCallback(() => {
    if (closeTimer.current !== null) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  }, []);
  const onFlyoutLeave = useCallback(() => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setFlyout(null), 180);
  }, [cancelClose]);

  const place = (node: NavNode, anchor: HTMLElement) => {
    const r = anchor.getBoundingClientRect();
    const rail = anchor.closest('nav')?.getBoundingClientRect();
    return { node, top: r.top, left: (rail?.right ?? r.right) + 8, anchor };
  };

  //  Hover ALWAYS opens, and switches straight from one parent to the next —
  //  a toggle here would close the menu when you slide onto a sibling.
  const onFlyoutHover = useCallback((node: NavNode, anchor: HTMLElement) => {
    cancelClose();
    setFlyout((cur) => (cur?.node.id === node.id ? cur : place(node, anchor)));
  }, [cancelClose]);

  const onFlyout = useCallback((node: NavNode, anchor: HTMLElement) => {
    cancelClose();
    setFlyout((cur) => {
      if (cur?.node.id === node.id) return null;      // clicking the same row closes it
      //  Horizontally the flyout is anchored to the RAIL's trailing edge, not the
      //  row's: the row is 56px inside a 73px rail, so the row's own right edge
      //  lands the flyout 5px INSIDE the rail. Vertically it tracks the row,
      //  which is what makes it read as that row's submenu. 8 = space/4.
      return place(node, anchor);
    });
  }, [cancelClose]);

  //  Collapsing or navigating must not leave a flyout hanging.
  useEffect(() => { setFlyout(null); }, [collapsed, currentId]);

  //  Click-outside. Escape and ArrowLeft are handled inside NavFlyout, which
  //  also returns focus to the anchor.
  useEffect(() => {
    if (!flyout) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!flyout.anchor.contains(t) && !document.getElementById('zf-nav-flyout')?.contains(t)) {
        setFlyout(null);
      }
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [flyout]);

  useEffect(() => cancelClose, [cancelClose]);

  const ctx: RowCtx = { currentId, onNavigate, open, onToggle, collapsed,
    flyoutId: flyout?.node.id ?? null, onFlyout, onFlyoutHover, onFlyoutLeave };

  return (
    <>
    <nav
      id="zf-nav"
      aria-label={label}
      className={cn(
        'sticky top-0 flex flex-col box-border overflow-hidden',
        //  §3.4 — Figma's rails are FIXED/HUG at 836 and 1000, and the collapse
        //  bar is the last child of a hugging column cleared by 56px/52px of
        //  body padding. In a real viewport the toggle floats mid-screen on a
        //  tall window and is pushed off a short one. The doc frame's §07 says
        //  "height fills the viewport in use" and nothing expresses it.
        'h-dvh',
        collapsed ? 'w-nav-collapsed' : 'w-nav',
        'bg-nav-surface text-nav-text',
        //  THE EDGE IS NOT HERE, and that is the point — see the two children
        //  below. On the root it ran the rail's full height, which means it also
        //  ran up through the logo band, where `nav/border` `#DFE0EB` against a
        //  near-black band is a 14:1 white line splitting the one dark strip the
        //  bar and the band are meant to read as. The reference draws no such
        //  line. It divides the LIGHT column from the page, so it belongs to the
        //  light column.
        'transition-all duration-180 motion-reduce:transition-none',
        className,
      )}
    >
      {/* §4.1 — nav/brand-surface and nav/brand-text are IDENTICAL in both
          modes, so this band deliberately does not flip. One of two good
          decisions in the nav namespace that no description records.

          `nav/brand-surface` is now the same `blue/2000` as `chrome/surface`,
          which closes open item 31: §2.21.4 predicted that the band and the bar
          being one step apart would show as a seam "if the bar and the logo band
          ever sit adjacent". In the shell they always do. They were drawn a step
          apart because they were drawn in separate frames; assembled they are
          one strip. */}
      <div className={cn(
        'flex flex-none items-center gap-4 h-nav-logo box-border',
        'bg-nav-brand-surface text-nav-brand-text',
        collapsed ? 'justify-center px-0' : 'px-8',
      )}>
        <span aria-hidden className="flex-none size-12">{product.mark}</span>
        {collapsed ? null : (
          <span className="flex-1 min-w-0 truncate text-heading font-medium">{product.name}</span>
        )}
      </div>

      {/* §3.4's other half — THE SCROLL CONTAINER. Figma's body is FILL/HUG with
          layoutGrow 0 and an off-scale 56/52 bottom padding standing in for the
          bar. Both numbers disappear here: the bar is a flex sibling that needs
          no clearing, so copying them would leave 56px of dead scroll. §3.5. */}
      <div className={cn(
        'flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col gap-8 box-border py-6',
        //  §2 — Figma draws NO rail edge: `nav/surface` against the page is
        //  1.08:1 Light and 1.07:1 Dark, so a 220px landmark has no boundary in
        //  EITHER mode, which is rare. `nav/border` is the role created for
        //  exactly this and is bound on ONE node in the whole file (the flyout).
        //  It is used here — Figma's own role at Figma's own value — giving 1.31
        //  against the page. `border/control` would give 4.52.
        //
        //  The md is careful that this is NOT a 1.4.11 failure: a landmark is not
        //  a "user interface component" under the normative definition, so no AA
        //  criterion reaches it. It is a wayfinding defect, and citing a
        //  criterion that does not reach it would make it easier to dismiss.
        //
        //  It is on this child and on the collapse bar rather than on the rail,
        //  so it starts where the dark band ends. Both children stretch to the
        //  rail's full width and are `box-border`, so the column below the band
        //  is 220 of content and the band itself is the full 221 — the band's
        //  last pixel sits directly above the line rather than beside it.
        'border-e border-nav-border',
        collapsed ? 'px-4' : 'px-5',
      )}>
        <ul className={cn('flex flex-col m-0 p-0 list-none', collapsed ? 'gap-4' : 'gap-1')}>
          {items.map((n) => <Row key={n.id} node={n} depth={0} {...ctx} />)}
        </ul>
        {sections.map((s) => <Section key={s.header} {...s} {...ctx} />)}
      </div>

      <div className={cn('flex flex-none items-center h-nav-bar box-border',
        'border-e border-nav-border',
        collapsed ? 'justify-center' : 'justify-end')}>
        <button
          type="button"
          aria-expanded={!collapsed}
          aria-controls="zf-nav"
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          onClick={() => onCollapsedChange(!collapsed)}
          className={cn(
            //  `flex-none`: 40 and 72 are specifications, not suggestions —
            //  without it the toggle shrinks to fit the bar.
            'grid flex-none place-items-center h-nav-toggle p-0 border-0 cursor-pointer',
            collapsed ? 'w-nav-collapsed rounded-none' : 'w-nav-toggle rounded-ss-md',
            'transition-colors duration-150 motion-reduce:transition-none',
            //  §5.4 — Figma's ladder is SHIFTED A RUNG: rest is `nav/item-hover`
            //  and hover is `nav/item-selected`. Visually the ramp is fine, so it
            //  is kept; semantically a selection role is painting a hover state,
            //  and any future change to either role silently moves the toggle's
            //  resting colour. Defect 5.
            'bg-nav-item-hover hover:bg-nav-item-selected active:bg-nav-item-pressed',
            'text-nav-text',
            //  §5.4 problem 2 — Figma has NO focus state here. Three State
            //  values where every other interactive component in the family has
            //  four, on the rail's LAST TAB STOP. That is a 2.4.7 failure, and
            //  the doc frame grades focus as PASSES. Supplied.
            RING, 'focus-visible:outline-focus-ring',
          )}
        >
          {/* §5.4 problem 3 — Figma expresses direction as `rotation: 180` on a
              nested icon instance, which is a horizontal AND vertical flip and
              renders correctly only because this glyph happens to be vertically
              symmetric. It is invisible in the properties panel, and it
              contradicts the real-glyph-swap convention §5.2 establishes.
              scaleX(-1) is what the design actually means. */}
          {/*
            §5.4 — the arrow points at what the button DOES, so it flips with the
            view: LEFT while the rail is full (this will collapse it), RIGHT once
            collapsed (this will expand it).

            Our `sidebar-collapse` glyph points RIGHT at rest — its arrowhead
            runs out to x=15.75 in the 16-unit viewBox — so it is the FULL view
            that needs the flip, not the collapsed one. Figma agrees from the
            other side: §5.4 measured `rotation: 180` on `View=full` and 0 on
            `View=collapsed`.

            `scaleX(-1)`, not `rotate(180deg)`: a 180° rotation is a horizontal
            AND vertical flip, and renders correctly only because this glyph
            happens to be symmetric about its horizontal axis. A mirror is what
            the design actually means.
          */}
          <Icon name="sidebar-collapse" size="md" tone="inherit"
            className={cn(!collapsed && '-scale-x-100')} />
        </button>
      </div>
    </nav>
    {flyout ? (
      <NavFlyout
        id="zf-nav-flyout"
        header={flyout.node.label}
        items={flyout.node.children ?? []}
        anchor={flyout.anchor}
        onClose={() => setFlyout(null)}
        onPointerEnter={cancelClose}
        onPointerLeave={onFlyoutLeave}
        style={{ top: flyout.top, left: flyout.left }}
      />
    ) : null}
    </>
  );
}

function Section({ header, items, ...ctx }: { header: string; items: NavNode[] } & RowCtx) {
  const id = useId();
  return (
    //  §9.1 — a <div>, not an <li>. It sits BESIDE the <ul>, not inside it, and
    //  a listitem with no owning list is exposed as exactly that in the
    //  accessibility tree. The md verified this against the CDP AX tree.
    <div>
      {/* §3.6 — `zf/overline` EXISTS (11/17.6 Semi Bold UPPER) and neither this
          header nor the flyout's is bound to it; both are unstyled at 11/16 with
          0.8% tracking. Three-way disagreement, defect 7. Bound here.
          §3.6 also records the two headers using DIFFERENT colour roles for an
          identical treatment — this one `nav/text-tertiary` at 4.66 (passing 4.5
          by 0.16), the flyout's `nav/text-secondary` at 7.69. Defect 8. */}
      {/*
        Through `Text`, NOT a raw `text-overline` class. The token carries size,
        line-height and tracking only — `uppercase` and the semibold default live
        in `Text`'s sizeMap and defaultWeight. A raw utility renders "Apps" in
        regular weight where the design says "APPS" semibold.
      */}
      {/*
        Collapsed, the heading is `sr-only` rather than removed. §10 defect 10
        records Figma dropping the Apps section from the 72px rail entirely; the
        visible header has no room there and reads as noise above the icons. But
        the <ul> below is `aria-labelledby` this node, so deleting it would
        unname the group — a screen-reader user would get an unlabelled list of
        app links. Hidden visually, kept in the tree.
      */}
      <Text as="h3" id={id} size="overline" tone="inherit"
        className={cn(ctx.collapsed ? 'sr-only' : 'm-0 pt-3 pb-1 ps-5 text-nav-text-tertiary')}>
        {header}
      </Text>
      <ul aria-labelledby={id}
        className={cn('flex flex-col m-0 p-0 list-none', ctx.collapsed ? 'gap-4' : 'gap-1')}>
        {items.map((n) => <Row key={n.id} node={n} depth={0} {...ctx} />)}
      </ul>
    </div>
  );
}

function Row({ node, depth, ...ctx }: { node: NavNode; depth: number } & RowCtx) {
  const { currentId, onNavigate, open, onToggle, collapsed, flyoutId,
    onFlyout, onFlyoutHover, onFlyoutLeave } = ctx;
  const groupId = useId();
  const isParent = !node.href && Boolean(node.children?.length);
  const isOpen = open.has(node.id);
  const isCurrent = node.id === currentId;

  //  §5.2 draws the distinction for the FULL rail: a leaf that is active is the
  //  page you are on (`brand/solid`); a parent that is active merely CONTAINS it
  //  (a tint plus Semi Bold). That works because the children are visible right
  //  underneath, carrying the solid.
  //
  //  Collapsed, a parent is painted exactly like every other parent: transparent
  //  at rest, tinted on hover, flyout on hover. It does NOT take the solid for
  //  containing the current page.
  //
  //  That rule was here and is gone deliberately. It made one row in the rail
  //  behave unlike its neighbours — Sales sat permanently blue while Purchases
  //  and Time Tracking reacted to the pointer — and a parent is not the page you
  //  are on. `brand/solid` now means one thing only: this row IS the current
  //  page. An open menu means "what you are pointing at", and the two must not
  //  collide, or every hover reads as a navigation.
  //
  //  THE COST, stated rather than hidden: with the rail collapsed and the
  //  current page a CHILD, no row is blue — the child is not rendered and its
  //  parent no longer stands in for it. The corner marker still says the row has
  //  a submenu; nothing says which submenu you are inside. Restoring it is
  //  `|| (collapsed && isWithin)` here.
  const readsActive = isCurrent;
  //  The trigger keeps the hover tint while its menu is open — otherwise the
  //  tint vanishes the moment the pointer crosses into the flyout.
  const holdsFlyout = collapsed && flyoutId === node.id && !readsActive;

  //  EXACTLY ONE background class, resolved here rather than layered.
  //
  //  `cn` is a plain joiner, so when two `bg-*` utilities land on one element it
  //  is the STYLESHEET's order that decides, not the order they were written in.
  //  Tailwind emits `bg-transparent` after every theme colour — measured at
  //  21514 against `bg-nav-item-selected` at 20158 and `bg-brand-solid` at
  //  18670 — so a base `bg-transparent` silently beat every conditional fill.
  //  The rail rendered with no tint on the containing parent and no solid on the
  //  current page, while `font-semibold` (emitted after `font-medium`) still
  //  applied: bold text on a blank row, which is exactly what it looked like.
  //
  //  Resolving to one branch makes the conflict unrepresentable.
  const fill = readsActive
    //  §5.1 — an active LEAF is the page you are on, and the focus ring
    //  RECOLOURS against it: 5.48, where `focus/ring` on `brand/solid` is 1.27.
    ? cn('bg-brand-solid text-brand-on-solid',
      'group-hover/navrow:bg-brand-solid-hover active:bg-brand-solid-pressed',
      'focus-visible:outline-brand-on-solid')
    : isOpen && !collapsed
      //  The tint means ONE thing: this dropdown is open. Not "contains the
      //  current page" — that was here and read as a bug, because
      //  one-branch-at-a-time lets the two come apart: open Time Tracking while
      //  you are on a page under Sales and Sales stayed tinted with its chevron
      //  pointing right. A shut row that looks active is worse than no marker.
      //
      //  THE COST: with the containing section shut, nothing says which one you
      //  are in — the current row is blue, but it is not rendered. Restoring it
      //  is `(isOpen || isWithin)` here.
      //
      //  Not `aria-current` either way: a parent is not the page you are on.
      //
      //  `nav/item-hover`, not `nav/item-selected` — chosen deliberately.
      //  §5.4 warns against a hover role painting a persistent state, and that
      //  warning is noted and overruled: the drawn tint is one ramp step off the
      //  rail, and `item-selected` at four steps reads as a heavy grey band. The
      //  consequence to accept is that hovering a CLOSED parent now looks the
      //  same as an open one; the chevron direction is what separates them.
      //
      //  NO Semi Bold. §5.2 gives `Active=true` a tint PLUS the weight, calling
      //  the weight the load-bearing 1.4.1 cue because 1.42:1 of tint cannot
      //  carry a state alone. That argument was made for a parent whose group
      //  might be shut; here an open parent always has its children beneath it,
      //  and the current one among them is `brand/solid`. The blue child is the
      //  non-colour cue, so the weight is redundant — and it read as arbitrary
      //  emphasis next to its unbolded siblings.
      ? cn('bg-nav-item-hover active:bg-nav-item-pressed',
        'text-nav-text', 'focus-visible:outline-focus-ring')
      : holdsFlyout
        //  The trigger holds the hover tint while its menu is open, or the tint
        //  drops the moment the pointer crosses into the flyout.
        ? cn('bg-nav-item-hover', 'text-nav-text', 'focus-visible:outline-focus-ring')
        //  `group-hover/navrow:`, NOT `hover:`. The + is a SIBLING of the row —
        //  a <button> cannot live inside an <a> — so moving the pointer onto it
        //  un-hovers the row and the tint drops out from under the very control
        //  you are reaching for. Keying the fill to the wrapper means the row
        //  stays lit for the whole gesture. `active:` stays on the row itself:
        //  pressing the + must not paint the row as pressed.
        : cn('bg-transparent group-hover/navrow:bg-nav-item-hover active:bg-nav-item-pressed',
          'text-nav-text', 'focus-visible:outline-focus-ring');

  const row = cn(
    'flex items-center w-full box-border border-0 text-start no-underline cursor-pointer',
    //  NO `text-nav-text` here. The colour is resolved with the fill below, for
    //  the same reason the background is: `cn` only joins, so two `text-*`
    //  utilities on one element are settled by the STYLESHEET's order, and
    //  Tailwind emits `text-nav-text` (28102) after `text-brand-on-solid`
    //  (27437). The base colour therefore beat the active row's white, and the
    //  current page rendered as dark text on a blue block.
    'rounded-md text-body font-medium',
    'transition-colors duration-150 motion-reduce:transition-none',
    collapsed
      ? 'relative flex-col justify-center w-nav-row-collapsed-w h-nav-row-collapsed-h gap-2 py-5 px-nav-pad-collapsed'
      //  The action's width is reserved only while the action is THERE. Held
      //  permanently it truncates the label against empty space — "Recurring
      //  Expens…" with 30px of nothing beside it — because the trigger is
      //  hover-only. Reserved on the same signal that reveals it, the label runs
      //  to its natural width at rest and gives way only when it has to.
      //
      //  `focus-within` as well as `hover`: the trigger also appears on keyboard
      //  focus, and without the reserve it would paint its own background over
      //  the end of the label.
      : cn('h-nav-row ps-5',
        node.action && !collapsed
          //  The reserve tracks the trigger. Permanent on the active row, because
          //  the trigger is permanent there — without it the + would paint over
          //  the end of the label rather than the label giving way to it.
          ? (readsActive
            ? 'pe-nav-row'
            : 'pe-4 group-hover/navrow:pe-nav-row group-focus-within/navrow:pe-nav-row')
          : 'pe-4'),
    //  §5.1 — the real four-value State axis. Note focus paints NO fill.
    RING,
    fill,
  );

  const inner = (
    <>
      {/* §3.2 — THE SLOT GRID. Both slots are rendered on every row type, filled
          or EMPTY, which is what lands the label at 10 + 14 + 24 = 48 without
          per-row arithmetic. Do not collapse the empty ones — that is the whole
          idea, and the md verified label x = 48 on all 24 rail variants. */}
      {collapsed ? null : (
        <span aria-hidden className={cn('flex flex-none items-center w-nav-chev-slot h-8',
          //  The SLOT carries the colour and the glyph inherits it. CLAUDE.md:
          //  tone="inherit" is the default and usually right, and md §2.7.6 found
          //  108 orphan paints from icons carrying their own. Here the icon
          //  deliberately differs from the label, so the slot is where that lives.
          !readsActive && 'text-nav-text-tertiary')}>
          {isParent ? (
            //  Colour comes from the slot as `nav/text-tertiary` — Figma's value
            //  in all 16 variants, which is 2.93:1 on a pressed row and 2.57 in
            //  Dark, so the disclosure affordance is least visible exactly where
            //  it is being used. Defect 6, flagged not changed.
            <DropdownChevron open={isOpen} />
          ) : null}
        </span>
      )}
      <span aria-hidden className={cn('flex flex-none items-center',
        collapsed ? 'justify-center w-nav-iconbox h-12' : 'w-nav-icon-slot h-8',
        !readsActive && 'text-nav-text-secondary',
        //  A child's icon slot is RESERVED, not removed — visibility, not display.
        !collapsed && depth > 0 && 'invisible')}>
        {typeof node.icon === 'string'
          ? <Icon name={node.icon as IconName} size="md" tone="inherit" />
          : node.icon}
      </span>
      <span className={cn('min-w-0 truncate',
        collapsed
          //  §3.3 — 10/12 Regular, and it truncates at 42px: seven of thirteen
          //  rows in the export are ambiguous, the worst being "Custo…" beside a
          //  real "Customers" row. §11 decision 3 asks whether it is worth
          //  showing at all. The aria-label and title below carry the full name.
          ? 'flex-none w-nav-iconbox text-caption text-center'
          : 'flex-1')}>
        {node.label}
      </span>
      {/*
        §3.3 — THE SUBMENU MARKER. A 5.89 x 5.89 VECTOR absolutely placed at the
        collapsed row's bottom-right corner, and "the only signal that a
        collapsed row opens a flyout rather than navigating".
        `nav/text-secondary` is 7.69 / 7.12 on the rail — the CONTRAST is fine;
        §11 decision 4 questions the SIZE, since 5.89px is smaller than the 1px
        borders this system rejects at 1.31:1.
      */}
      {collapsed && isParent ? (
        <svg
          viewBox="0 0 6 6" width="6" height="6" aria-hidden focusable="false"
          className={cn('absolute bottom-0 end-0',
            //  The marker's colour depends on what it is drawn against, and the
            //  two cases are not the same kind of mark.
            //
            //  INACTIVE the row has no fill, so the triangle is a mark ON the
            //  rail — `nav/text-secondary`, 7.69 / 7.12.
            //
            //  ACTIVE it is not a mark on the block, it IS the block: the same
            //  `brand/solid`, sitting over the 6px bottom-right radius so that
            //  one corner reads as pointed rather than rounded. Painting it
            //  `brand/on-solid` puts a white wedge inside the blue, which is a
            //  different shape from the one drawn.
            readsActive ? 'text-brand-solid' : 'text-nav-text-secondary')}
        >
          <path d="M6 0v6H0Z" fill="currentColor" />
        </svg>
      ) : null}
      {node.badge && !collapsed ? (
        <span className={cn('flex-none py-px px-3 rounded-lg text-label font-medium',
          readsActive
            ? 'bg-brand-on-solid text-brand-solid'
            //  §4.3 — `nav/text-secondary` on `nav/item-selected` is 3.90:1 at
            //  11px in Dark and fails 1.4.3. Figma's value; `nav/text` would be
            //  6.93. Defect 13, flagged not changed.
            : 'bg-nav-item-selected text-nav-text-secondary')}>
          {node.badge.value}
          <span className="sr-only"> {node.badge.description}</span>
        </span>
      ) : null}
    </>
  );

  return (
    //  `relative` so the action can be positioned INSIDE the row. §9.2 measured
    //  the naive version: as a block-flow sibling the <li> became 48px tall with
    //  the plus sitting 27px BELOW the row in an 18px band.
    <li>
      {/*
        The hover scope is THIS ROW, not the <li>. An <li> for a parent also
        contains that parent's whole open group, and `group-hover/…` matches any
        ancestor carrying the name — so with the group on the <li>, hovering the
        Purchases row (or any single child) revealed EVERY child's + at once.
        Wrapping just the control and its action scopes the hover exactly.
        `relative` here is also what lets the action sit inside the row rather
        than in a band beneath it.
      */}
      <div className="group/navrow relative">
      {isParent ? (
        <button
          type="button"
          className={cn(row, 'zf-nav-parent')}
          //  §9.3 — a COLLAPSED parent does not disclose an inline group, it
          //  opens a menu. Announcing aria-expanded on a control whose
          //  aria-controls target does not exist is worse than saying nothing.
          //  §9.3 — a collapsed parent opens a MENU rather than disclosing an
          //  inline group, so it carries `aria-haspopup`. `aria-expanded` now
          //  tracks the flyout: the md's reason for omitting it was that the
          //  aria-controls target did not exist, and with a real flyout it does.
          aria-expanded={collapsed ? flyoutId === node.id : isOpen}
          aria-haspopup={collapsed ? true : undefined}
          aria-controls={collapsed
            ? (flyoutId === node.id ? 'zf-nav-flyout' : undefined)
            : (isOpen ? groupId : undefined)}
          aria-label={collapsed ? node.label : undefined}
          //  NO `title` on a collapsed PARENT. The row's visible label is a
          //  truncated stub, so a leaf needs the native tooltip to say what it
          //  is — but a parent opens a flyout on the same hover, and the
          //  flyout's header already carries the full name in full size. Both
          //  at once puts an OS tooltip over the menu it duplicates.
          //  `aria-label` stays, so the name is still correct for a screen
          //  reader.
          onClick={(e) => {
            if (collapsed) onFlyout(node, e.currentTarget);
            else onToggle(node.id);
          }}
          //  §5.6 — collapsed, the menu opens on HOVER. Click is kept for touch
          //  and for the keyboard, where Enter and Space both dispatch a click.
          onPointerEnter={collapsed ? (e) => onFlyoutHover(node, e.currentTarget) : undefined}
          onPointerLeave={collapsed ? onFlyoutLeave : undefined}
        >
          {inner}
        </button>
      ) : (
        <a
          className={row}
          href={node.href}
          //  Only one row can be current, because `currentId` is one id — there
          //  is no per-node `active` flag to get out of step. `preventDefault`
          //  only when a handler is supplied, so without one the <a> still
          //  navigates for real.
          onClick={onNavigate ? (e) => { e.preventDefault(); onNavigate(node.id); } : undefined}
          //  §8 — `aria-current="page"` belongs ONLY on a leaf, and there can be
          //  one. A parent containing it gets the tint and no aria-current.
          aria-current={isCurrent ? 'page' : undefined}
          aria-label={collapsed ? node.label : undefined}
          title={collapsed ? node.label : undefined}
        >
          {inner}
        </a>
      )}

      {node.action && !collapsed ? (
        <button
          type="button"
          aria-label={node.action.label}
          onClick={node.action.onSelect}
          className={cn(
            //  §10 defect 3 — Figma's plus is 20×20 and fails 2.5.8 with NO
            //  exception available: Spacing fails because a 24px circle centred
            //  on it overlaps the row link's own target box, and Equivalent
            //  fails because no other control does the same job.
            //
            //  It is a full-height square at the row's trailing end, carrying its
            //  own fill one step darker than the row's — a distinct creation
            //  trigger rather than a glyph floating on the row. 30 × 30 clears
            //  24 comfortably, and matching the row's height lets it inherit the
            //  row's radius on that side.
            'absolute inset-y-0 end-0 w-nav-row grid place-items-center',
            'p-0 border-0 rounded-e-md cursor-pointer',
            'transition-colors duration-150 motion-reduce:transition-none',
            //  Hovering the trigger takes it to the BRAND blue with a white
            //  glyph — the same `brand/solid` an active row uses, so "the thing
            //  I am about to act on" and "the page I am on" speak one colour.
            //  `brand/on-solid` on `brand/solid` is 5.48 Blue / 4.67 Red.
            //
            //  On a row that is ALREADY blue the resting block cannot be grey —
            //  it would sit as a foreign chip on the solid — so it drops to
            //  `brand/solid-pressed` (9.41 / 6.32 against white) and reads as a
            //  darker end of the same block.
            readsActive
              ? 'bg-brand-solid-pressed text-brand-on-solid hover:bg-brand-solid-hover'
              : 'bg-nav-item-selected text-nav-text hover:bg-brand-solid hover:text-brand-on-solid',
            //  On the ACTIVE row the trigger is permanent. Everywhere else it is
            //  hover-revealed — which is right for eleven quiet rows, but the row
            //  you are on is the one you are most likely to create from, and
            //  hiding its only shortcut behind a hover is the wrong default.
            //
            //  Focus reveals it too, or a keyboard user reaches a control they
            //  cannot see.
            readsActive
              ? 'opacity-100'
              : 'opacity-0 group-hover/navrow:opacity-100 focus-visible:opacity-100',
            RING, 'focus-visible:outline-focus-ring',
          )}
        >
          <Icon name="plus" size="sm" tone="inherit" />
        </button>
      ) : null}
      </div>

      {/*
        `mt-2` = 4px. The parent row and its first child are otherwise only the
        group's own 2px gap apart, so an open dropdown and the rows it reveals
        read as one undifferentiated block.
      */}
      {isParent && !collapsed && isOpen ? (
        //  The grid wrapper is what makes the height animatable: a row cannot be
        //  transitioned to `auto`, but 0fr -> 1fr works and a single 1fr row in
        //  an auto-height grid settles on the same max-content the natural
        //  layout gives. The <ul> needs `overflow-hidden` or its rows spill out
        //  while the track is still collapsed.
        //
        //  Opening animates; CLOSING does not, because the group unmounts. An
        //  exit would mean holding it mounted through the animation, which is
        //  real machinery for the half of the gesture nobody watches.
        <div className="grid mt-2 animate-nav-group-in motion-reduce:animate-none">
          <ul id={groupId} className="flex flex-col gap-1 m-0 p-0 list-none overflow-hidden">
            {node.children!.map((c) => <Row key={c.id} node={c} depth={depth + 1} {...ctx} />)}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

/**
 * §8 — the collapsed rail's submenu is a MENU, not a popover. A popover is a
 * region you tab into; a menu is one tab stop whose items you traverse with
 * arrow keys, and Escape returns you to the control that opened it.
 *
 * Thirteen collapsed parents × five children would otherwise be 78 tab stops.
 * role="menu" keeps it at 13.
 */
export interface NavFlyoutProps {
  header: string;
  items: NavNode[];
  anchor: HTMLElement | null;
  onClose: () => void;
  id?: string;
  /** Keeps the menu open while the pointer is inside it. */
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  /**
   * The measured anchor position. This is the one inline style in the canon and
   * it is deliberate: a runtime rect is not a design value, so there is nothing
   * for the token layer to hold. Everything that IS a design value — width,
   * padding, radius, colour, shadow — is a utility below.
   */
  style?: { top: number; left: number };
}

export function NavFlyout({
  header, items, anchor, onClose, id, style, onPointerEnter, onPointerLeave,
}: NavFlyoutProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const headerId = useId();

  useEffect(() => {
    ref.current?.querySelectorAll<HTMLElement>('[role="menuitem"]')[active]?.focus();
  }, [active]);

  return (
    <div
      ref={ref}
      id={id}
      style={style}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onKeyDown={(e) => {
        //  The queried count, NOT `items.length` — a row with a secondary action
        //  contributes two menuitems, so the array length would wrap early and
        //  strand the last control.
        const n = ref.current?.querySelectorAll('[role="menuitem"]').length ?? items.length;
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % n); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => (i - 1 + n) % n); }
        else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
        else if (e.key === 'End') { e.preventDefault(); setActive(n - 1); }
        else if (e.key === 'Escape' || e.key === 'ArrowLeft') {
          e.preventDefault(); onClose(); anchor?.focus();
        }
      }}
      className={cn(
        //  `fixed`, not `absolute` — the rail is `overflow-hidden` and would
        //  clip an absolutely-positioned child away entirely.
        'fixed z-50 flex flex-col gap-5 w-nav-flyout py-8 px-5 box-border',
        'animate-nav-flyout-in motion-reduce:animate-none',
        'bg-nav-surface border border-nav-border shadow-popover',
        //  §9.5 / §11 decision 10 — Figma draws radius 10. It cannot be used:
        //  zf-scales.md RETIRED 10 and `npm run check` rule 9 rejects it. xl (12)
        //  is the same substitution the accordion's container made.
        'rounded-xl',
      )}
    >
      {/*
        `Text` is what makes it UPPERCASE and semibold — §3.6 records Figma
        leaving both headers unstyled at 11/16 with 0.8% tracking while
        `zf/overline` exists at 11/17.6 and 0.6%.

        `ps-5` (10) against the rows' `ps-8` (16), so the header sits **6px
        left** of the labels beneath it rather than flush with them. Flush was
        wrong in the other direction from where I started: the rows originally
        carried an icon slot and ran 24px right of the header, and removing it
        overshot to dead-level. The drawn relationship is a small outdent — the
        header reads as a heading rather than as a first list row.
      */}
      <Text as="h3" id={headerId} size="overline" tone="inherit"
        className="m-0 ps-5 text-nav-text-secondary">{header}</Text>
      <ul role="menu" aria-labelledby={headerId} className="flex flex-col gap-2 m-0 p-0 list-none">
        {items.map((n, i) => (
          <li key={n.id} role="none" className="group/row relative">
            {/* §3.2 — `Indent=flush` is a DIFFERENT grid: it drops the chevron
                slot AND changes padding-left from 10 to 16, so its label lands
                at 40, not 48. The doc frame's headline claim is "label x = 48,
                no exceptions" across 32 variants; 8 of them are 40. */}
            <a
              role="menuitem" href={n.href} tabIndex={i === active ? 0 : -1}
              className={cn('flex items-center w-full h-nav-row ps-8 pe-4 box-border',
                'rounded-md text-body font-medium text-nav-text no-underline',
                'hover:bg-nav-item-hover active:bg-nav-item-pressed',
                'transition-colors duration-150 motion-reduce:transition-none',
                RING, 'focus-visible:outline-focus-ring')}
            >
              {/*
                NO icon slot. §5.6: the flyout's five rows are `Indent=flush`
                with **`Show icon=false`**. Rendering the slot pushed every label
                24px right of the header, so the two disagreed by exactly the
                slot width. Without it the label sits at the row's own 16px
                padding — the same 16 the header uses — and they line up.
              */}
              <span className="flex-1 min-w-0 truncate">{n.label}</span>
            </a>
            {n.action ? (
              <button
                type="button"
                //  A SECOND `menuitem`, not a button nested in the link — that is
                //  the trap the accordion work established, where the inner
                //  control becomes the activation target and the outer one stops
                //  working. It is also why the roving index above counts queried
                //  nodes: arrow keys visit "Vendors", then "Add a vendor", then
                //  the next row. More presses, but every control is reachable,
                //  and a menu is a single tab stop either way.
                role="menuitem"
                tabIndex={-1}
                aria-label={n.action.label}
                onClick={n.action.onSelect}
                className={cn(
                  'absolute top-1 end-4 grid size-12 place-items-center',
                  'p-0 border-0 bg-transparent rounded-sm text-nav-text cursor-pointer',
                  //  Focus must reveal it as well as hover, or a keyboard user
                  //  arrows onto a control they cannot see.
                  'opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100',
                  RING, 'focus-visible:outline-focus-ring',
                )}
              >
                <Icon name="plus" size="sm" tone="inherit" />
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
