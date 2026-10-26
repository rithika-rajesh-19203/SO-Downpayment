import type { NavNode, TopBarAction } from '@canon';

/**
 * BOOKS — the application's own data. Nav tree, product mark, bar actions.
 *
 * It lives here and not in the canon because none of it is a design decision:
 * the canon owns how a nav row looks, the application owns which rows there
 * are. Swap this file and the same shell is a different product.
 *
 * The two marks are inlined rather than served from `public/brand/`. A file
 * referenced by URL cannot inherit `currentColor`, so it cannot follow the
 * role it sits on — the rail's mark takes `nav/brand-text` and the bar's takes
 * `chrome/text`, and both invert on an active row or a hover fill. Neither is a
 * roster glyph either: `icons:sync` checks for a 16-unit viewBox and these are
 * 512, so they could not be ingested and should not be.
 */

/* ── Marks ────────────────────────────────────────────────────────────────── */

/** The Books lockup, in the rail's brand band. */
export const BOOKS_MARK = (
  <svg viewBox="0 0 512 512" className="size-12" aria-hidden focusable="false"
    fill="currentColor">
    <path d="M361 502.5H24.5c-8 0-14.4-6.5-14.4-14.4V365.8c0-26.7 17-50.5 42.2-59.2l373-128c29-10 48.6-37.3 48.6-68 0-39.6-32.3-71.9-71.9-71.9H39v238.1c0 8-6.5 14.4-14.4 14.4S10 284.9 10 276.9V24.3c0-8 6.5-14.4 14.4-14.4h377.5c55.6 0 100.8 45.2 100.8 100.8 0 43-27.3 81.3-68.1 95.3l-373 128a33.72 33.72 0 0 0-22.7 31.9v107.8H361c30.1 0 58.5-11.7 79.8-33a112 112 0 0 0 33-79.8c0-21.3-6-42.1-17.4-60.1a113.42 113.42 0 0 0-46.1-41.3 14.41 14.41 0 0 1-6.7-19.3c3.5-7.2 12.1-10.2 19.3-6.7 23.8 11.5 43.8 29.5 58 51.9 14.3 22.6 21.8 48.8 21.8 75.6 0 37.8-14.7 73.4-41.5 100.2A141.24 141.24 0 0 1 361 502.5z" />
    <path d="M172.4 211.9c-31.8 0-57.7-25.9-57.7-57.7s25.9-57.7 57.7-57.7 57.7 25.9 57.7 57.7-25.9 57.7-57.7 57.7zm0-86.6c-15.9 0-28.9 13-28.9 28.9s13 28.9 28.9 28.9 28.9-13 28.9-28.9-13-28.9-28.9-28.9zM317.1 415.7c-31.8 0-57.7-25.9-57.7-57.7s25.9-57.7 57.7-57.7 57.7 25.9 57.7 57.7-25.8 57.7-57.7 57.7zm0-86.6c-15.9 0-28.9 13-28.9 28.9s13 28.9 28.9 28.9 28.9-13 28.9-28.9-12.9-28.9-28.9-28.9z" />
  </svg>
);

/** Recent activity, before the search field. */
export const HISTORY_MARK = (
  <svg viewBox="0 0 512 512" width="16" height="16" aria-hidden focusable="false"
    fill="currentColor">
    <path d="M467 364.5a237.9 237.9 0 0 1-211.3 128.7H252A238 238 0 0 1 90 84.4 238 238 0 0 1 417.6 81V46.8a25 25 0 0 1 50 0V155.4l-.2 1-.2 1-.1.6-.4 1.6-.2.8a25.7 25.7 0 0 1-1.3 3.1l-.5 1-.7 1.2-.6 1-.7 1a30.5 30.5 0 0 1-2.4 2.7 23.8 23.8 0 0 1-2.5 2.2l-.5.4-1.5 1-.7.5-.8.4-1.6.8-.7.2-1.8.7-.5.1-.6.2a22.8 22.8 0 0 1-2.5.5 1.3 1.3 0 0 1-.3 0l-1 .2H440l-1-.2-1-.1-.6-.2c-.6 0-1-.2-1.6-.4l-.8-.2a25.7 25.7 0 0 1-3.1-1.3l-1-.4-1.2-.7-1-.7-1-.7a30.5 30.5 0 0 1-2.7-2.3 23.8 23.8 0 0 1-2.2-2.5l-.4-.6-1-1.4-.2-.3-6.3-10.1a187.9 187.9 0 1 0 7.8 186 25 25 0 0 1 44.4 23z" />
    <path d="m425.8 171.2 1.9 1.5a22.3 22.3 0 0 1-1.9-1.5zm35.3-1.7 1.5-1.9a22.3 22.3 0 0 1-1.5 1.9zM317 331.7a25 25 0 0 1-34.6 7.3L225.9 302a25 25 0 0 1-11.3-21V170.6a25 25 0 0 1 50 0v97.2l45 29.4a25 25 0 0 1 7.3 34.6z" />
  </svg>
);

/* ── The rail ─────────────────────────────────────────────────────────────────
   Every `icon` here is a real `ICON_NAMES` entry — the roster is the contract,
   and a name with no geometry renders a visible dashed placeholder rather than
   nothing. That placeholder IS the tracking mechanism: 31 of the 51 glyphs have
   not been exported yet, and most of this list is among them.

   `action` is the row's `+` — the create trigger that appears on hover. It is
   absent where there is nothing to create: Home, Banking, Reports, Documents
   and the two app links. */

/*  The `+` on a nav leaf. It has to reach the router, and NAV_ITEMS is a module
    const that cannot see React state — so the handler is registered once by the
    screen that owns the routing rather than threaded through the tree.

    A module-level dispatcher and not a factory function, because `Nav` compares
    node identity between renders: rebuilding NAV_ITEMS on every render of Books
    would give the flyouts a new object each time and reset their open state. */
let onCreate: (kind: string) => void = () => {};
export const setOnCreate = (fn: (kind: string) => void) => { onCreate = fn; };

const create = (what: string) => ({
  label: `New ${what}`,
  onSelect: () => onCreate(what),
});

export const NAV_ITEMS: NavNode[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  {
    id: 'items', label: 'Items', icon: 'items', action: create('item'),
    children: [
      { id: 'all-items', label: 'All Items' },
      { id: 'price-lists', label: 'Price Lists' },
      { id: 'inventory-adjustments', label: 'Inventory Adjustments' },
    ],
  },
  {
    id: 'inventory', label: 'Inventory', icon: 'inventory',
    children: [{ id: 'assemblies', label: 'Assemblies' }],
  },
  {
    id: 'sales', label: 'Sales', icon: 'sales',
    children: [
      { id: 'customers', label: 'Customers', action: create('customer') },
      { id: 'quotes', label: 'Quotes', action: create('quote') },
      { id: 'sales-orders', label: 'Sales Orders', action: create('sales order') },
      { id: 'invoices', label: 'Invoices', action: create('invoice') },
      { id: 'sales-agreements', label: 'Sales Agreements', action: create('sales agreement') },
      { id: 'payments-received', label: 'Payments Received' },
      { id: 'credit-notes', label: 'Credit Notes', action: create('credit note') },
    ],
  },
  {
    id: 'purchases', label: 'Purchases', icon: 'purchases',
    children: [
      { id: 'vendors', label: 'Vendors', action: create('vendor') },
      { id: 'expenses', label: 'Expenses', action: create('expense') },
      { id: 'bills', label: 'Bills', action: create('bill') },
      { id: 'payments-made', label: 'Payments Made' },
      { id: 'purchase-orders', label: 'Purchase Orders', action: create('purchase order') },
      { id: 'purchase-agreements', label: 'Purchase Agreements', action: create('purchase agreement') },
    ],
  },
  {
    id: 'time-tracking', label: 'Time Tracking', icon: 'timesheets',
    children: [
      { id: 'projects', label: 'Projects', action: create('project') },
      { id: 'timesheet', label: 'Timesheet' },
    ],
  },
  { id: 'banking', label: 'Banking', icon: 'bank' },
  {
    id: 'filing', label: 'Filing & Compliance', icon: 'tax',
    children: [{ id: 'gst-filing', label: 'GST Filing' }],
  },
  {
    id: 'accountant', label: 'Accountant', icon: 'accountant',
    children: [
      { id: 'manual-journals', label: 'Manual Journals', action: create('journal') },
      { id: 'chart-of-accounts', label: 'Chart of Accounts' },
      { id: 'budgets', label: 'Budgets' },
    ],
  },
  { id: 'reports', label: 'Reports', icon: 'reports' },
  { id: 'documents', label: 'Documents', icon: 'documents' },
  {
    id: 'custom-modules', label: 'Custom Modules', icon: 'custom-modules',
    children: [{ id: 'custom-one', label: 'Deliveries' }],
  },
];

export const NAV_SECTIONS = [
  {
    header: 'Apps',
    items: [
      { id: 'zoho-payroll', label: 'Zoho Payroll', icon: 'payroll' },
      {
        id: 'zoho-payments', label: 'Zoho Payments', icon: 'bank',
        badge: { value: 'Offer', description: 'Limited time offer' },
      },
    ] as NavNode[],
  },
];

/* ── The bar ──────────────────────────────────────────────────────────────── */

/** `filled` marks the one primary action. There is at most one. */
export const BAR_ACTIONS: TopBarAction[] = [
  { id: 'new', label: 'Create new', icon: 'plus', filled: true, onSelect: () => {} },
  { id: 'invite', label: 'Invite users', icon: 'users', onSelect: () => {} },
  { id: 'notifications', label: 'Notifications', icon: 'bell', count: 1, onSelect: () => {} },
  { id: 'settings', label: 'Settings', icon: 'settings', onSelect: () => {} },
];

/** A flat index of every row, so the screen can name the page it is on. */
export const LABELS: Record<string, string> = Object.fromEntries(
  [...NAV_ITEMS, ...NAV_SECTIONS.flatMap((s) => s.items)]
    .flatMap((n) => [[n.id, n.label] as const, ...(n.children ?? []).map((c) => [c.id, c.label] as const)]),
);
