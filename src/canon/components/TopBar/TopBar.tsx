import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Icon } from '../../icons';
import type { IconName } from '../../icons';
import { cn } from '../../utils/cn';

/**
 * TOP BAR — design-refs/zf-top-bar.md. A fixed 48px dark chrome strip carrying
 * the product lockup, a scoped search field and a right-hand account cluster.
 *
 * §7 — "If it is about the current page, it does not belong in the top bar. The
 * bar is the one surface that is identical on every screen; anything
 * view-specific in it becomes a lie on some other view." And one `banner` per
 * document: a page header is a `<header>` inside `<main>`, not a second one.
 *
 * ── THE HEADLINE DEFECT, FIXED ───────────────────────────────────────────────
 * §2: every glyph in the bar is `chrome/text` or `chrome/accent` except one. The
 * apps grid is bound to **`icon/default`** — a role whose job is to sit on
 * `surface/default`, used here on near-black chrome:
 *
 *   rest 2.34 · hover 1.89 · pressed **1.22**
 *
 * It fails 1.4.11 at rest and gets WORSE the more you touch it, because the
 * glyph's colour is fixed while the surface climbs the neutral scale toward it.
 * "That is the opposite of what a state ladder is for."
 *
 * The lesson §2 draws is worth keeping: the paint census reads 0 raw, 0
 * primitive, 0 remote — a perfect score — and this survives it, because
 * `icon/default` IS a bound semantic role. It is simply the wrong one. **A
 * bound-paint census cannot tell you a role is bound to the wrong namespace.**
 */
export interface TopBarAction {
  id: string;
  /** The accessible name. These are icon-only, so it is the only name they have. */
  label: string;
  /**
   * A roster glyph by name, or a supplied mark. The ReactNode form is for icons
   * outside the 51-glyph ZF set — `icons:sync` checks for a 16-unit viewBox and
   * rejects anything else. Same widening `NavNode.icon` took, for the same
   * reason. A supplied mark must paint with `fill="currentColor"`.
   */
  icon: IconName | ReactNode;
  /** Figma's `Style=filled` — the primary action. */
  filled?: boolean;
  /**
   * An unread count, drawn as a disc on the glyph's top-right corner. Data, not
   * a variant — the four-test rule in CLAUDE.md turns a `HasBadge` boolean into
   * exactly this, because the count and its presence are the same fact.
   *
   * Absent or 0 draws nothing, and anything over 99 draws `99+` — the disc is a
   * `min-width` so it grows rather than clipping. It is `aria-hidden`, and the
   * number is appended to the button's accessible name instead: a decorative
   * disc beside a name that says only "Notifications" hides the whole point of
   * the badge from a screen reader.
   */
  count?: number;
  onSelect: () => void;
}

export interface TopBarProps {
  /**
   * Actions rendered BEFORE the search field. Figma has none — the bar's whole
   * left side is the brand column there — so this is additive, and it is where
   * anything scoped to the workspace rather than the account belongs.
   */
  leading?: TopBarAction[];
  /**
   * One object, not five props. §9.3: the scope, the value, the submit and the
   * scope-menu opener move together; splitting them invites a bar with a scope
   * caret that does nothing.
   */
  search?: {
    scope: string;
    value: string;
    onValueChange: (next: string) => void;
    onSubmit: (query: string) => void;
    onScopeOpen: () => void;
    scopeOpen?: boolean;
  };
  org?: { name: string; onOpen: () => void; open?: boolean };
  actions?: TopBarAction[];
  account?: { name: string; initials: string; onOpen: () => void; open?: boolean };
  apps?: { onOpen: () => void; open?: boolean };
  className?: string;
}

//  §5.1 — the reference focus treatment, the same one `zf-nav-item` uses: focus
//  does NOT imply hover (the ghost focus variant has no fill), the ring
//  RECOLOURS against the fill beneath it, and it is inset so the control's box
//  is identical focused and unfocused.
//
//  A negative `outline-offset` rather than §9.2's `inset box-shadow`: forced-
//  colors mode forces `box-shadow: none`, which is why §9.2 needs a whole
//  `@media (forced-colors: active)` block to restore a ring it would otherwise
//  lose. An outline is painted there, so the fallback is unnecessary.
const RING = 'focus-visible:outline-2 focus-visible:-outline-offset-2';

export function TopBar({
  leading = [], search, org, actions = [], account, apps, className,
}: TopBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryId = useId();
  //  React state rather than `:focus-within`. §9.2: the scope caret is a
  //  <button> inside the same <form>, so `:focus-within` fires for it too — the
  //  md measured two concentric rings and a field claiming a focus it did not
  //  have. Its answer is `:has(input:focus)`; tracking the input directly needs
  //  no `:has()` support check and no arbitrary variant.
  const [queryFocused, setQueryFocused] = useState(false);

  //  §6 — the placeholder advertises "( / )". Nothing in Figma implements it,
  //  and having advertised a shortcut, not shipping it is worse than silence.
  //
  //  Keyed on a BOOLEAN, not on `search`: that is an object literal rebuilt every
  //  render, so `[search]` re-subscribes on every keystroke — the md measured one
  //  add and one remove per render, because the field is controlled.
  const hasSearch = Boolean(search);
  useEffect(() => {
    if (!hasSearch) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      //  Never steal the keystroke from something the user is typing into.
      if (el && (el.isContentEditable
        || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))) return;
      e.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [hasSearch]);

  const onSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    search?.onSubmit(search.value);
  }, [search]);

  //  §9.2 / §5.3 — the account tile and the apps tile are ONE treatment. In Figma
  //  the apps grid is a `zf-topbar-tile` instance and the avatar is a hand-made
  //  frame with no states at all, so they sit side by side looking identical and
  //  behaving differently (§3.4). Here they cannot diverge.
  //
  //  `rounded-none` is CORRECT and is the one place in the bar where it is: a
  //  tile touching both edges cannot round its corners without showing bar
  //  through the gaps. Nothing in Figma records that it is deliberate.
  const tile = cn(
    'grid flex-none place-items-center size-topbar-tile p-0 border-0 rounded-none',
    'bg-transparent cursor-pointer',
    //  THE §2 FIX — `chrome/text` gives 15.90 / 12.83 / 8.29 where Figma's
    //  `icon/default` gives 2.34 / 1.89 / 1.22.
    'text-chrome-text',
    'hover:bg-chrome-item-hover active:bg-chrome-item-pressed',
    'transition-colors duration-150 motion-reduce:transition-none',
    //  §5.3 — Figma gives the tile three State values, not four, on a tab stop.
    RING, 'focus-visible:outline-focus-ring',
  );

  const ghost = cn(
    'grid flex-none place-items-center size-topbar-action p-0 border-0 rounded-md',
    'bg-transparent text-chrome-text cursor-pointer',
    'hover:bg-chrome-item-hover active:bg-chrome-item-pressed',
    'transition-colors duration-150 motion-reduce:transition-none',
    RING, 'focus-visible:outline-focus-ring',
  );

  const glyph = (icon: TopBarAction['icon']) =>
    (typeof icon === 'string' ? <Icon name={icon as IconName} size="md" tone="inherit" /> : icon);

  return (
    <header
      role="banner"
      className={cn(
        //  §9.1 — explicit on a <header> that is a direct child of <body>, where
        //  it is implicit, so it survives being moved into a wrapper.
        'sticky top-0 z-100 flex items-center w-full box-border overflow-hidden',
        //  1492 is the artboard; the bar fills its column. 48 is the spec, and
        //  the box is 49 because the edge below is additive.
        //
        //  NO BRAND COLUMN. Figma's bar carries the lockup in a 200px column
        //  behind 20px of padding, and §3.1 notes that 20 + 200 = 220 is exactly
        //  the sidebar rail's width — so the brand occupies the rail's column and
        //  the search begins 32px past the rail's edge, at 252.
        //
        //  §11 decision 4 asks for that relationship to be RECORDED, because
        //  "right now it is two numbers in two files that agree by intent and
        //  nothing enforces it". Placing the bar beside the rail instead of over
        //  it enforces it: the rail owns the lockup, the bar starts where the
        //  rail ends, and there is no 220 to keep in sync.
        //
        //  `ps-10` = 20 = `space/10`, which is the bar's OWN padding in Figma —
        //  §3.6 records it as on the scale and simply unbound. The 32 that used
        //  to be here was `brand-gap`, the space between the lockup and the
        //  field; with the lockup gone that gap has nothing left to separate.
        //  48 EXACTLY, and no bottom stroke. §2.1 records that Figma's bar carries
        //  NO stroke and NO effect, and the whole family has zero effects; the
        //  1px `border/control` edge that used to be here was ours, added to give
        //  Dark a boundary the drawing does not have. It cost more than it bought:
        //
        //  - on a white page it draws a visible `neutral/1100` hairline (4.52:1
        //    against the page) that the reference does not have, and
        //  - it made the box 49, so the bar's bottom sat ONE PIXEL below the
        //    rail's 48px brand band beside it. Those two dark regions are meant
        //    to read as one strip, and a 1px step is exactly the kind of seam
        //    §2.21.4's open item 31 warns about.
        //
        //  Dropping it resolves both, and resolves what `--zf-chrome-topbar-box`
        //  existed for: at 48 with no border the 48px avatar and apps tiles are
        //  full-bleed again and every inset lands on a whole pixel.
        //
        //  WHAT IT COSTS, stated: in Dark `chrome/surface` is 1.02:1 against the
        //  page and 1.05 against the rail. That is the drawing's defect, not a
        //  new one, and it is the third component to have it (§2 of the LHS menu
        //  at 1.07, §2.1 of the side panel at 1.21).
        'h-topbar ps-10',
        'bg-chrome-surface text-chrome-text',
        className,
      )}
    >

      {leading.map((a, i) => (
        <button key={a.id} type="button" aria-label={a.label} onClick={a.onSelect}
          className={cn(ghost, i > 0 && 'ms-4')}>
          {glyph(a.icon)}
        </button>
      ))}

      {search ? (
        <form
          role="search"
          onSubmit={onSubmit}
          className={cn(
            //  The bar's own leading padding is the 32px that used to sit between
            //  the brand column and the field, so the field needs none — unless
            //  something precedes it, in which case 16 separates them.
            'flex flex-none items-center w-topbar-search h-topbar-field px-5 box-border',
            leading.length > 0 && 'ms-8',
            'bg-chrome-raised rounded-md',
            //  §4.3 — the field's own fill is only 1.51:1 against the bar, so
            //  this 1px border is doing all the work of saying "this is a
            //  control". Removing it removes the field.
            //
            //  It stays on `neutral/1000` — 5.56:1 against the bar and 3.69:1
            //  against the fill, passing 1.4.11 on both sides. `neutral/1100`
            //  `#71758F` is ~2 ΔE from the `#6C718A` §2.21.3 measured and was
            //  tried: at 1px it reads muted where the reference renders a crisp
            //  ring, and it falls to 2.31:1 against the fill. This is one of the
            //  two places the drawn value is too dim to do its job — the
            //  placeholder is the other.
            'border border-chrome-border',
            //  §4.5 — Figma's hover is `chrome/item-hover`, which is DARKER than
            //  `chrome/raised`: the field RECEDES on hover while every other
            //  control in the bar advances. `chrome/item-pressed` is the one
            //  chrome step lighter than raised, so the direction is consistent.
            //  The role is borrowed, which §11 decision 9 is about.
            'hover:bg-chrome-item-pressed',
            'transition-colors duration-150 motion-reduce:transition-none',
            //  §4.4 — `focus/ring` on `chrome/raised` is 2.44:1 in Light and
            //  FAILS. It is the only mode-varying role the bar touches: in Dark
            //  it resolves to `blue/900` and gives 5.01. `chrome/accent` IS
            //  `blue/900`, so binding it explicitly stops the field's ring
            //  depending on which pane the rest of the product is in.
            queryFocused && 'outline-2 -outline-offset-2 outline-chrome-accent',
          )}
        >
          <Icon name="search" size="md" tone="inherit" className="flex-none text-chrome-text" />

          {/* §8 — a SEPARATE control. It changes the scope of the query, not the
              query. Wrapping the whole field in one control would make the input
              unfocusable; leaving the caret as decoration would make the scope
              unreachable by keyboard. */}
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={Boolean(search.scopeOpen)}
            aria-label={`Search scope: ${search.scope}`}
            onClick={search.onScopeOpen}
            className={cn(
              //  §5.6 — Figma's slot is 16 × 16 on a control its own doc frame
              //  calls a button, and NO 2.5.8 exception rescues it: Equivalent
              //  fails outright, and Spacing excuses proximity, not size. 24 fits
              //  inside the fixed 36px field with room to spare.
              'grid flex-none place-items-center size-12 me-1',
              'p-0 border-0 bg-transparent rounded-sm text-chrome-accent cursor-pointer',
              'hover:bg-chrome-item-pressed',
              RING, 'focus-visible:outline-chrome-accent',
            )}
          >
            <Icon name="chevron-down" size="xs" tone="inherit" />
          </button>

          <span aria-hidden
            className="flex-none w-px h-topbar-rule ms-2 me-3 bg-chrome-border" />

          {/* §9.1 — a real label AND a placeholder. A placeholder disappears on
              the first keystroke, so it cannot be the accessible name. */}
          <label htmlFor={queryId} className="sr-only">Search in {search.scope}</label>
          <input
            ref={inputRef}
            id={queryId}
            name="q"
            type="search"
            autoComplete="off"
            placeholder={`Search in ${search.scope} ( / )`}
            value={search.value}
            onChange={(e) => search.onValueChange(e.target.value)}
            onFocus={() => setQueryFocused(true)}
            onBlur={() => setQueryFocused(false)}
            className={cn('flex-1 min-w-0 border-0 bg-transparent p-0 outline-none',
              //  13/20, not the 16/24 §2.21.2's geometry table measures. The bar
              //  has exactly two pieces of text — this and the org label — and
              //  §3.5 already argued the org down to 13/20 as "the size every
              //  other label in the product uses". At 16 the placeholder was the
              //  single largest text in the chrome, three steps above the nav
              //  labels a few pixels to its left; in the reference the two read
              //  as one size.
              'text-body font-regular text-chrome-text',
              //  4.95:1 — passes by 0.45. Firefox dims placeholders by default,
              //  so the opacity reset is load-bearing.
              'placeholder:text-chrome-text-muted placeholder:opacity-100')}
          />
        </form>
      ) : null}

      {/* §9.2 — the auto margin lives on this WRAPPER, not on the org switcher.
          `org` is optional, and with it absent nothing carried the margin: the md
          measured the whole right cluster collapsing to x=560 with 739px of empty
          bar after it. */}
      <div className="flex items-center ms-auto min-w-0">
        {org ? (
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={Boolean(org.open)}
            onClick={org.onOpen}
            className={cn(
              'flex flex-none items-center gap-2 h-topbar-action px-4 box-border',
              'border-0 bg-transparent rounded-md text-chrome-text cursor-pointer',
              //  §3.5 — Figma is 14/20, and **14 is not in the type scale at
              //  all**. 13/20 is `zf/body/medium`, the size every other label in
              //  the product uses.
              'text-body font-regular',
              'hover:bg-chrome-item-hover active:bg-chrome-item-pressed',
              'transition-colors duration-150 motion-reduce:transition-none',
              //  §5.4 — Figma gives the org three State values, on a control its
              //  own doc frame says was fixed FOR accessibility. Without this the
              //  only indicator is the UA outline, which the md measured at
              //  1.20:1 against the bar.
              RING, 'focus-visible:outline-focus-ring',
            )}
          >
            {/* §5.4 — Figma is HUG with `textTruncation: DISABLED` inside a bar
                that clips, so a 40-character tenant name pushes the whole
                right-hand cluster off the end and is silently cut. */}
            <span className="min-w-0 max-w-org-label truncate">{org.name}</span>
            <Icon name="chevron-down" size="md" tone="inherit"
              className="flex-none text-chrome-accent" />
          </button>
        ) : null}

        {/* §9.3 — renders only if something follows it. A trailing rule against
            an empty cluster is exactly what a hardcoded Figma assembly cannot
            express and a component must. */}
        {actions.length > 0 || account || apps ? (
          <span aria-hidden
            className="flex-none w-px h-topbar-divider ms-4 me-8 bg-chrome-border" />
        ) : null}

        {actions.map((a, i) => (
          <button
            key={a.id}
            type="button"
            aria-label={a.count ? `${a.label} (${a.count})` : a.label}
            onClick={a.onSelect}
            className={cn(
              //  `relative` for the count disc, which hangs off the corner.
              'relative grid flex-none place-items-center size-topbar-action p-0 border-0 rounded-md',
              'cursor-pointer transition-colors duration-150 motion-reduce:transition-none',
              //  16px gap, 48px pitch with the 32px button — except the first,
              //  which the divider's own trailing margin already spaces.
              i > 0 && 'ms-8',
              a.filled
                ? cn('bg-brand-solid text-brand-on-solid',
                  'hover:bg-brand-solid-hover active:bg-brand-solid-pressed',
                  //  §4.4 — `brand/solid` is 2.90:1 against the bar, its hover
                  //  2.69 and its pressed **1.69**: the primary action's EDGE
                  //  gets harder to find at every rung, because the brand ladder
                  //  darkens and the bar is already near-black. The glyph inside
                  //  passes at 5.48; the boundary does not, and only by 3% at
                  //  rest. Both hues fail on hover and pressed; only Blue fails
                  //  at rest, so whether the resting state conforms depends on
                  //  the brand mode.
                  //
                  //  There was a 1px `chrome/text` ring here to carry the edge.
                  //  The reference draws the tile with no ring at all, so it is
                  //  gone — this is the borders-match-the-drawing decision, and
                  //  2.90 against 3.00 is not the kind of miss that stops the
                  //  control working. §11 decision 2 is the real fix: a brand
                  //  ladder that goes LIGHTER on chrome, the way `chrome/accent`
                  //  already does.
                  RING, 'focus-visible:outline-2 focus-visible:outline-brand-on-solid')
                : cn('bg-transparent text-chrome-text',
                  'hover:bg-chrome-item-hover active:bg-chrome-item-pressed',
                  RING, 'focus-visible:outline-focus-ring'),
            )}
          >
            {glyph(a.icon)}
            {a.count ? (
              <span aria-hidden className={cn(
                'absolute -top-1 -end-1 grid place-items-center box-border',
                'min-w-topbar-badge h-topbar-badge px-1 rounded-full',
                //  `chrome/badge`, not `danger/default`: §2.21.4's rule for the
                //  whole namespace is that a role which flips cannot describe a
                //  bar that never flips, and `danger/default` goes to a light
                //  pink in Dark. 4.71:1 for the count, 3.37:1 for the disc.
                'bg-chrome-badge text-chrome-text',
                'text-caption font-semibold')}>
                {a.count > 99 ? '99+' : a.count}
              </span>
            ) : null}
          </button>
        ))}

        {account ? (
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={Boolean(account.open)}
            //  §9.1 — the full name. "JD" announces as two letters.
            aria-label={`Account — ${account.name}`}
            onClick={account.onOpen}
            className={tile}
          >
            <span aria-hidden className={cn(
              'grid place-items-center size-topbar-action rounded-full',
              //  §3.4 / §10 defect 8 — Figma fills this with `chrome/border`, a
              //  BORDER role painting a surface, and hardcodes radius 16, which
              //  draws the right circle at 32px and the wrong one at any other.
              //  The radius moved to `radius/full` so it survives a resize; the
              //  fill now has its own role at the same `neutral/1000` it was
              //  already rendering. The defect was invisible while the two roles
              //  shared a value, and became load-bearing the moment
              //  `chrome/border` moved to the measured `#71758F` — on that the
              //  initials would read 3.51:1. On `chrome/avatar` they stay 5.57:1.
              'bg-chrome-avatar text-chrome-surface',
              //  §3.5 — 12/16 Semi Bold is exactly `zf/body-sm/semibold`, and
              //  Figma leaves it unbound.
              'text-body-sm font-semibold')}>
              {account.initials}
            </span>
          </button>
        ) : null}

        {apps ? (
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={Boolean(apps.open)}
            aria-label="Zoho apps"
            onClick={apps.onOpen}
            className={tile}
          >
            <Icon name="apps" size="lg" tone="inherit" />
          </button>
        ) : null}
      </div>
    </header>
  );
}
