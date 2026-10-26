import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Nav } from './Nav';
import type { NavNode } from './Nav';
import { Stack, Surface, Text } from '../../primitives';

/**
 * INCOMING. The largest family in the system — 9 Figma components, 54 variants,
 * 413 paints all role-bound — and the md calls it the best built.
 *
 * **The focus treatment here is the reference implementation.** §5.1: it is a
 * real `State` value rather than a modifier, it paints no hover fill, it
 * recolours against the fill beneath it, and it is inset so the row's box never
 * resizes. The checkbox, radio, toggle and input field all use different values
 * for the same signal; this is the one to bring them up to.
 */
const meta = {
  title: 'Components/Nav', component: Nav, parameters: { layout: 'fullscreen' },
  args: { items: [], currentId: '', collapsed: false, onCollapsedChange: () => {},
    product: { name: 'Books' } },
} satisfies Meta<typeof Nav>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The Books product mark, in the rail's brand band. A 512-unit brand asset — not
 * a roster glyph, and it does not need to be: `product.mark` has always taken a
 * ReactNode.
 *
 * `fill="currentColor"`, so it paints `nav/brand-text` from the band — 15.90:1
 * against `nav/brand-surface`. §4.1: those two roles are IDENTICAL in Light and
 * Dark, deliberately, so the lockup is mode-invariant by construction and this
 * mark never has to flip.
 *
 * 15.90 rather than 16.68 because the band moved onto `chrome/surface`'s
 * `blue/2000`, closing open item 31 — see the note in `Nav.tsx`.
 */
const MARK = (
  <svg viewBox="0 0 512 512" aria-hidden focusable="false"
    fill="currentColor" className="size-12">
    <path d="M361 502.5H24.5c-8 0-14.4-6.5-14.4-14.4V365.8c0-26.7 17-50.5 42.2-59.2l373-128c29-10 48.6-37.3 48.6-68 0-39.6-32.3-71.9-71.9-71.9H39v238.1c0 8-6.5 14.4-14.4 14.4S10 284.9 10 276.9V24.3c0-8 6.5-14.4 14.4-14.4h377.5c55.6 0 100.8 45.2 100.8 100.8 0 43-27.3 81.3-68.1 95.3l-373 128a33.72 33.72 0 0 0-22.7 31.9v107.8H361c30.1 0 58.5-11.7 79.8-33a112 112 0 0 0 33-79.8c0-21.3-6-42.1-17.4-60.1a113.42 113.42 0 0 0-46.1-41.3 14.41 14.41 0 0 1-6.7-19.3c3.5-7.2 12.1-10.2 19.3-6.7 23.8 11.5 43.8 29.5 58 51.9 14.3 22.6 21.8 48.8 21.8 75.6 0 37.8-14.7 73.4-41.5 100.2A141.24 141.24 0 0 1 361 502.5z" />
    <path d="M172.4 211.9c-31.8 0-57.7-25.9-57.7-57.7s25.9-57.7 57.7-57.7 57.7 25.9 57.7 57.7-25.9 57.7-57.7 57.7zm0-86.6c-15.9 0-28.9 13-28.9 28.9s13 28.9 28.9 28.9 28.9-13 28.9-28.9-13-28.9-28.9-28.9zM317.1 415.7c-31.8 0-57.7-25.9-57.7-57.7s25.9-57.7 57.7-57.7 57.7 25.9 57.7 57.7-25.8 57.7-57.7 57.7zm0-86.6c-15.9 0-28.9 13-28.9 28.9s13 28.9 28.9 28.9 28.9-13 28.9-28.9-12.9-28.9-28.9-28.9z" />
  </svg>
);
//  Every glyph here is a real ICON_NAMES entry — the roster is the contract, and
//  `icons:sync` skips an SVG whose name it does not know rather than adding one.
//  These happen to be the product's own nav set.
/**
 * The Zoho Inventory product mark. A 1024-unit brand asset, not a roster glyph:
 * `ICON_NAMES` holds the 51 ZF icons and `icons:sync` checks for a 16×16
 * viewBox, so this could not be ingested and should not be.
 *
 * `fill="currentColor"` and no baked hex, so it takes the slot's
 * `nav/text-secondary` exactly like every other menu icon — and inverts to white
 * on an active row, which a hardcoded fill cannot do.
 */
const INVENTORY_MARK = (
  <svg viewBox="0 0 1024 1024" width="16" height="16" aria-hidden focusable="false"
    fill="currentColor">
    <path d="M264 866a30 30 0 0 1-30-25L105 106a36 36 0 0 0-26-28L22 60A30 30 0 1 1 39 2l58 18a96 96 0 0 1 67 76l129 735a30 30 0 0 1-24 34 30 30 0 0 1-5 1Z" />
    <path d="M406 966a30 30 0 0 1-5-60l532-94a36 36 0 1 0-12-72l-457 81a96 96 0 0 1-112-78l-81-457a96 96 0 0 1 78-112l458-81a96 96 0 0 1 111 78l75 424a30 30 0 0 1-59 10l-75-423a36 36 0 0 0-42-30l-457 81a36 36 0 0 0-30 42l81 457a36 36 0 0 0 42 30l457-81a96 96 0 1 1 34 190l-532 94a30 30 0 0 1-6 1Z" />
    <path d="M527 382a30 30 0 0 1-5-60l173-30a30 30 0 0 1 11 59l-174 30a30 30 0 0 1-5 1Z" />
    <path d="M322 1023a120 120 0 1 1 21-2 121 121 0 0 1-21 2Zm1-179a60 60 0 0 0-11 0 59 59 0 1 0 11 0Z" />
  </svg>
);

/**
 * The Zoho Expense product mark. Same category as the Inventory one — a
 * 1024-unit brand asset, not a roster glyph.
 *
 * The supplied file carried `<style>.cls-2{fill:#e42528}</style>`, a baked red.
 * That is dropped for `fill="currentColor"`: a literal would hold the mark at
 * one colour through both panes and both brand hues, and leave it red on the
 * blue of an active row. Bound to the slot it takes `nav/text-secondary` like
 * every other menu icon.
 */
const EXPENSE_MARK = (
  <svg viewBox="0 0 1024 1024" width="16" height="16" aria-hidden focusable="false"
    fill="currentColor">
    <path d="M845.62 1007.29c-78.84 0-155.48-28.12-221.64-81.33a16 16 0 0 0-21.35 1.14l-58 58a75.55 75.55 0 0 1-106.73 0l-56-56a16 16 0 0 0-22.63 0l-56.67 56.58a73.73 73.73 0 0 1-107-2.9A764.8 764.8 0 0 1 89.9 111.91a179.71 179.71 0 0 1 158.78-95.2h556.67c56.35 0 109.46 37.37 149.55 105.22 36.32 61.47 60.71 145.8 68.68 237.44a90.05 90.05 0 0 1-89.66 98H644.81c.69 16.84 2 33.53 3.79 49.9 0 .41.08.82.11 1.23a617.74 617.74 0 0 0 27.93 146.29c14.47 44.8 33.83 86 57.56 122.53 23.34 35.91 50.31 66.35 80.16 90.49s62 41.44 95.5 51.37a42.58 42.58 0 0 1-4.49 82.73 333.48 333.48 0 0 1-59.75 5.38ZM248.68 76.71a119.81 119.81 0 0 0-105.86 63.47 704.42 704.42 0 0 0 97.43 802.53 13.72 13.72 0 0 0 19.93.54l56.58-56.58a76.09 76.09 0 0 1 107.48 0l56.05 56.05a15.48 15.48 0 0 0 21.88 0l58-58a75.87 75.87 0 0 1 101.37-5.47c48.9 39.32 104.23 62.27 161.25 67.11a364.1 364.1 0 0 1-46.19-31.89c-34.76-28.11-66-63.25-92.75-104.45-54.26-83.49-87.1-186.07-95-296.69a781 781 0 0 1-4.7-86c0-106.25 21-206.61 59.18-282.6 13.37-26.62 28.41-49.39 44.77-68ZM644.8 397.33h289.12a30.05 30.05 0 0 0 29.88-32.76c-7.2-82.89-28.71-158.22-60.55-212.12-28.86-48.84-63.63-75.74-97.9-75.74-18.54 0-37.07 7.69-55.08 22.86-19.35 16.3-37.78 41.23-53.27 72.09-30.52 60.76-48.74 139.99-52.2 225.67Z" />
    <path d="M434.18 457.33H211.72a30 30 0 1 1 0-60h222.46a30 30 0 0 1 0 60Z" />
    <path d="M325.5 607.38H218.05a30 30 0 0 1 0-60H325.5a30 30 0 0 1 0 60Z" />
    <path d="M448.18 307.38H238.72a30 30 0 0 1 0-60h209.46a30 30 0 0 1 0 60Z" />
  </svg>
);

const ITEMS: NavNode[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'sales', label: 'Sales', icon: 'sales', children: [
    { id: 'customers', label: 'Customers' },
    { id: 'quotes', label: 'Quotes' },
    { id: 'retainer', label: 'Retainer Invoices' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'payments', label: 'Payments Received' },
  ] },
  { id: 'inventory', label: 'Inventory', icon: 'inventory', children: [
    //  Assemblies carries a + on the strength of the earlier product screenshot,
    //  where it was the hovered row and showed one. Nothing was said about the
    //  other six, so they have none.
    { id: 'assemblies', label: 'Assemblies',
      action: { label: 'New Assembly', onSelect: () => {} } },
    { id: 'inv-adjustments', label: 'Inventory Adjustments' },
    { id: 'packages', label: 'Packages' },
    { id: 'shipments', label: 'Shipments' },
    { id: 'transfer-orders', label: 'Transfer Orders' },
    { id: 'move-orders', label: 'Move Orders' },
    { id: 'putaways', label: 'Putaways' },
  ] },
  { id: 'purchases', label: 'Purchases', icon: 'purchases', children: [
    { id: 'vendors', label: 'Vendors',
      action: { label: 'New Vendors', onSelect: () => {} } },
    { id: 'expenses', label: 'Expenses',
      action: { label: 'New Expenses', onSelect: () => {} } },
    { id: 'rec-expenses', label: 'Recurring Expenses',
      action: { label: 'New Recurring Expenses', onSelect: () => {} } },
    { id: 'po', label: 'Purchase Orders',
      action: { label: 'New Purchase Orders', onSelect: () => {} } },
    { id: 'receives', label: 'Purchase Receives',
      action: { label: 'New Purchase Receives', onSelect: () => {} } },
    { id: 'bills', label: 'Bills',
      action: { label: 'New Bills', onSelect: () => {} } },
    { id: 'rec-bills', label: 'Recurring Bills',
      action: { label: 'New Recurring Bills', onSelect: () => {} } },
    { id: 'payments-made', label: 'Payments Made',
      action: { label: 'New Payments Made', onSelect: () => {} } },
    { id: 'vendor-credits', label: 'Vendor Credits',
      action: { label: 'New Vendor Credits', onSelect: () => {} } },
  ] },
  { id: 'time', label: 'Time Tracking', icon: 'timesheets', children: [
    { id: 'projects', label: 'Projects' },
    { id: 'timesheet', label: 'Timesheet' },
  ] },
  //  Renamed from 'Filing' to match the label in the product screenshots, where
  //  it is the row that wraps to two lines in the collapsed rail.
  { id: 'filing', label: 'Filing & Compliance', icon: 'tax', children: [
    { id: 'gst-filing', label: 'GST Filing' },
  ] },
  { id: 'accountant', label: 'Accountant', icon: 'accountant', children: [
    //  Only Manual Journals is creatable — the rest are views, settings or bulk
    //  operations, and a + on a row that creates nothing is a dead affordance.
    { id: 'manual-journals', label: 'Manual Journals',
      action: { label: 'New Manual Journal', onSelect: () => {} } },
    { id: 'bulk-update', label: 'Bulk Update' },
    { id: 'currency-adj', label: 'Currency Adjustments' },
    { id: 'coa', label: 'Chart of Accounts' },
    { id: 'budgets', label: 'Budgets' },
    { id: 'txn-locking', label: 'Transaction Locking' },
  ] },
  { id: 'documents', label: 'Documents', icon: 'documents',
    badge: { value: '12', description: 'unread' } },
  { id: 'customers2', label: 'Customers', icon: 'users' },
];

const SECTIONS: { header: string; items: NavNode[] }[] = [{ header: 'Apps', items: [
  { id: 'app-1', label: 'Zoho Expense', icon: EXPENSE_MARK },
  { id: 'app-2', label: 'Zoho Inventory', icon: INVENTORY_MARK },
] }];

function Live({ current = 'retainer', start = false }: { current?: string; start?: boolean }) {
  const [collapsed, setCollapsed] = useState(start);
  //  `onNavigate` drives it here because these stories have no router. Only one
  //  row can ever be current, because it is one id rather than a flag per node.
  const [currentId, setCurrentId] = useState(current);
  return (
    <div className="flex h-dvh bg-surface-default">
      <Nav items={ITEMS} sections={SECTIONS} currentId={currentId}
        onNavigate={setCurrentId}
        collapsed={collapsed} onCollapsedChange={setCollapsed}
        product={{ name: 'Books', mark: MARK }} />
      <div className="flex-1 min-w-0 p-10">
        <Stack gap={5}>
          <Text size="title" weight="semibold">Page content</Text>
          <Text size="body" tone="secondary">
            The rail is to the left. Look at where it ends.
          </Text>
        </Stack>
      </div>
    </div>
  );
}

/**
 * THE FULL RAIL. `Sales` is the open parent and `Retainer Invoices` is the
 * current page, which is the exact state Figma draws.
 *
 * **§5.2 — a parent that is active is not the same thing as a leaf that is
 * active, and that distinction is the best idea in the state model.** A leaf
 * that is active is *the page you are on*: `brand/solid`, `aria-current="page"`.
 * A parent that is active *contains* the page you are on: a tint plus **Semi
 * Bold**, and no `aria-current`.
 *
 * The weight is load-bearing. The tint alone is 1.42:1, which cannot carry a
 * state — and §10.1 found the doc frame crediting an "active bar" for the 1.4.1
 * pass that had been **deleted three sections earlier in the same document**.
 * The verdict survives only because Semi Bold is a non-colour cue.
 *
 * **§3.2 — the slot grid.** Measure the label's x on a parent, a leaf and a
 * child: all three are **48**, with no per-row arithmetic. Every row renders
 * both slots — a 14px chevron slot and a 24px icon slot — filled or empty. A
 * child's icon slot is `visibility: hidden`, reserved rather than removed.
 *
 * **Hover `Documents`.** The plus appears. Then hide the mouse and Tab to it —
 * it must appear on focus too, or a keyboard user cannot reach a control that
 * is in the tab order. It is 24×24 here; Figma's is **20×20** and fails 2.5.8
 * with no exception available.
 */
export const Full: Story = { render: () => <Live /> };

/**
 * **COLLAPSED — 72px. Three things Figma leaves to code, and all three are here
 * now.**
 *
 * **1. The submenu marker.** §3.3: a 5.89 × 5.89 vector at the bottom-right
 * corner of a collapsed row — *"the only signal that a collapsed row opens a
 * flyout rather than navigating"*. Look at the bottom-right of **Sales**; no
 * other row has one. Its contrast is fine (7.69 / 7.12); §11 decision 4
 * questions the **size**, since 5.89px is smaller than the 1px borders this
 * system rejects at 1.31:1.
 *
 * **2. The flyout — hover a parent to open it.** §5.6: Figma's `zf-nav-flyout`
 * is a floating rectangle with no anchor, no pointer and no close affordance,
 * so the anchoring, the opening and the closing are all code-only.
 *
 * **Hover Sales.** The menu appears and the row takes a **grey tint** — not the
 * brand solid. Those two states must not collide: the solid means *this is
 * where you are*, an open menu means *this is what you are pointing at*, and if
 * hovering painted a row blue every pass of the mouse would look like a
 * navigation. Only the current page's row is blue.
 *
 * **Slide the pointer across the 8px gap into the menu.** It stays open — there
 * is a 180ms grace period, because crossing that gap fires `pointerleave` on
 * the row before `pointerenter` on the flyout and an immediate close would make
 * the menu unreachable by mouse. Slide from Sales straight onto another parent
 * and the menu switches rather than closing.
 *
 * It is a **menu**, not a popover (§8): one tab stop, arrow keys inside,
 * **Escape or ArrowLeft closes it and returns focus to the row**. Thirteen
 * collapsed parents × five children would otherwise be 78 tab stops. Click
 * still works, for touch and for the keyboard, where Enter and Space both
 * dispatch a click.
 *
 * The flyout's rows use `Indent=flush` with `Show icon=false`, so their labels
 * sit at the same 16px as the header. §3.2's measured "label x = 40" for a
 * flush row includes an icon slot this configuration does not render.
 *
 * **3. The truncated labels.** The label is 10px and truncates at 42px. In
 * Figma's own export **seven of thirteen rows** are ambiguous: *Invent… ·
 * Purch… · Time… · Filing… · Accou… · Docu… · **Custo…***. That last is the
 * worst — the rail also holds a real `Customers` row. Hover any row: `title`
 * and `aria-label` carry the full name.
 *
 * Finally, click the toggle. The glyph flips via `scaleX(-1)`; Figma uses
 * `rotation: 180`, a double flip that works only because that glyph happens to
 * be vertically symmetric.
 */
export const Collapsed: Story = { render: () => <Live start /> };

/**
 * **THE FOCUS LADDER — Tab all the way through, twice.**
 *
 * §9.6's checks, in order:
 * - **Every row shows a ring, and so does the collapse toggle.** Figma has only
 *   three `State` values on the toggle — no focus at all — on the rail's *last
 *   tab stop*. That is a 2.4.7 failure the doc frame grades as PASSES.
 * - **Tab onto a row and measure it: still 30px.** The ring is inset, so the box
 *   is identical focused and unfocused.
 * - **Tab onto the active blue row: the ring is white, not blue.** It recolours
 *   to `brand/on-solid`. Blue-on-blue would be **1.27:1**.
 * - **Tab onto the active *parent* (the tinted `Sales` row).** `focus/ring` on
 *   `nav/item-selected` is **2.82:1 in Light** — the one failing focus pair in
 *   all 54 variants, and it is reachable on the most important row in the rail.
 *
 * Then try it in **forced-colors / Windows High Contrast**. The md's §9.2 draws
 * this ring as an `inset box-shadow` and needs a separate `forced-colors` block,
 * because that mode forces `box-shadow: none` — it measured **zero ring pixels**
 * without one. A negative `outline-offset` gets the same inset ring, follows the
 * border radius, and *is* painted in forced-colors, so no fallback is needed.
 */
export const FocusLadder: Story = { render: () => <Live current="documents" /> };

/**
 * **THE TWO AXES — pane × hue, four renderings from one instance.**
 *
 * §4.2: the pane lives in `ZF Semantic` (Light/Dark) and the hue in `ZF Brand`
 * (Blue/Red), as two independent collections. The md is right that this is the
 * first time the file applies one-axis-one-dimension at the *collection* level.
 *
 * **But separating the axes did not stop a hue swap from changing whether the
 * component passes.** §4.4 / defect 14 — check the active row against the rail:
 *
 * | | Light | Dark |
 * |---|---|---|
 * | `brand/solid` vs `nav/surface`, **Blue** | 5.08 | **2.77** ✗ |
 * | `brand/solid` vs `nav/surface`, Red | 4.33 | 3.25 ✓ |
 * |
 *
 * So in **Dark + Blue** the current page's row does not clear 3:1 against the
 * rail it sits on, and in Dark + Red it does. §11 decision 12 calls this "the
 * most interesting" open question, because it is the one place the pane × hue
 * split turns out to be insufficient: it stopped the duplication, not the
 * conformance drift.
 *
 * Also worth a look while you are here: **the rail's edge.** §2 — Figma draws
 * none, and `nav/surface` against the page is **1.08:1 Light and 1.07:1 Dark**,
 * failing in *both* modes, which is rare. This uses `nav/border`, the role Figma
 * created for exactly this and bound on one node in the whole file — 1.31
 * against the page. `border/control` would be 4.52.
 */
export const PaneAndHue: Story = {
  render: () => (
    <Stack gap={0}>
      <Surface pad={5} border="divider">
        <Text size="body-sm" tone="secondary">
          Use the toolbar's Pane and Brand switches. Dark × Blue is the combination to check.
        </Text>
      </Surface>
      <Live />
    </Stack>
  ),
};

/**
 * **THE PINNED TOGGLE — §3.4, and the reason this needed fixing rather than
 * flagging.**
 *
 * Both Figma rails are `FIXED / HUG` vertically and the body is `FILL / HUG`
 * with `layoutGrow: 0`, so the collapse bar is the last child of a *hugging*
 * column. The only thing putting space between the last row and the bar is the
 * body's bottom padding: **56px full, 52px collapsed** — a hand-made spacer for
 * a sibling, and both numbers are off the spacing scale and unbound.
 *
 * Three consequences: in a tall viewport the toggle floats mid-screen; in a
 * short one it is pushed off; and the two views have different heights (836 and
 * 1000) for no reason.
 *
 * **Resize this frame.** The toggle stays at the bottom, the body scrolls, and
 * the logo band stays put. And there is **no dead space above the toggle** —
 * copying Figma's 56px would leave 56px of empty scroll at the end of the list.
 *
 * The doc frame's §07 already says *"height fills the viewport in use"*. Nothing
 * in the component expressed it.
 */
export const PinnedToggle: Story = {
  render: () => (
    <div className="h-96 overflow-hidden border border-border-default">
      <Live />
    </div>
  ),
};
