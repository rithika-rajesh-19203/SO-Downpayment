import { useMemo, useRef, useState } from 'react';
import {
  ActionBar, Avatar, ColumnConfig, Icon, Inline, Menu, PageChrome, PageHeader, StatusBadge,
  Surface, Table, Text,
} from '@canon';
import type {
  ColumnConfigItem, MenuEntry, StatusBadgeStatus, TableColumn, TableSort,
} from '@canon';
import { PURCHASE_ORDERS } from '../data/purchase-orders';
import type { PurchaseOrder } from '../data/purchase-orders';

/**
 * PURCHASES → PURCHASE ORDERS. The list view.
 *
 * Composition only. The seven columns are data; how a header, a row, a rule and
 * a badge look is the canon's. The two mappings below are the screen's own job:
 * "Closed" is a fact about a purchase order and `success` is a fact about how it
 * is drawn, so the record does not carry the second one.
 */

/**
 * Six record states onto the badge's fourteen. §2.1.8's families are the guide:
 * `pending` is Attention, `approved` and `success` are Positive/terminal-good,
 * `in-progress` is Active/in-flight, `draft` is Neutral/dormant.
 *
 * `Closed` takes `success` and not `approved`: approval happens partway through
 * and closing is the end of the road, and the badge is the only thing carrying
 * that difference.
 */
const STATUS_TONE: Record<PurchaseOrder['status'], StatusBadgeStatus> = {
  Draft: 'draft',
  'Pending Approval': 'pending',
  Approved: 'approved',
  Issued: 'in-progress',
  Closed: 'success',
  Cancelled: 'cancelled',
};

const BILLED_TONE: Record<PurchaseOrder['billed'], StatusBadgeStatus> = {
  Billed: 'success',
  Pending: 'pending',
};

/**
 * The ⋯ menu, from `zf-menu.md`'s own §9.1 markup: Sort by · Import · Export ·
 * Preferences · Manage Custom Fields · Refresh List, in four groups.
 *
 * `Delete this view` is added — the md's §9.1 carries it as the destructive row
 * that demonstrates `Tone=danger`, and a list-view overflow that can create a
 * view and not remove one is half a menu.
 *
 * The five glyphs §3.7 authored — sort, import, export, refresh, check — are
 * roster names with no export yet, so they draw placeholders. `settings`,
 * `table-config` and `close` are real.
 */
const MORE_ACTIONS: MenuEntry[] = [
  {
    id: 'sort', label: 'Sort by', icon: 'sort',
    children: [
      { id: 'sort-date', label: 'Date', checked: true, onSelect: () => {} },
      { id: 'sort-number', label: 'Purchase Order#', checked: false, onSelect: () => {} },
      { id: 'sort-vendor', label: 'Vendor Name', checked: false, onSelect: () => {} },
      { id: 'sort-amount', label: 'Amount', checked: false, onSelect: () => {} },
    ],
  },
  { separator: true },
  {
    id: 'import', label: 'Import', icon: 'import',
    children: [
      { id: 'imp-po', label: 'Import Purchase Orders', onSelect: () => {} },
      { id: 'imp-rec', label: 'Import Purchase Receives', onSelect: () => {} },
    ],
  },
  { separator: true },
  {
    id: 'export', label: 'Export', icon: 'export',
    children: [
      { id: 'exp-po', label: 'Export Purchase Order', onSelect: () => {} },
      { id: 'exp-view', label: 'Export Current View', onSelect: () => {} },
      { id: 'exp-rec', label: 'Export Purchase Receives', onSelect: () => {} },
    ],
  },
  { separator: true },
  { id: 'prefs', label: 'Preferences', icon: 'settings', onSelect: () => {} },
  { id: 'fields', label: 'Manage Custom Fields', icon: 'table-config', onSelect: () => {} },
  { separator: true },
  { id: 'refresh', label: 'Refresh List', icon: 'refresh', onSelect: () => {} },
  { id: 'delete', label: 'Delete this view', icon: 'close', tone: 'danger', onSelect: () => {} },
];

//  Built once, not per render, and not per cell: a 10-row table calls the
//  amount formatter ten times and `Intl.NumberFormat` is the expensive half.
const money = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
});
const day = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric',
});

export function PurchaseOrders() {
  const [sort, setSort] = useState<TableSort>({ columnId: 'date', direction: 'desc' });
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [menuOpen, setMenuOpen] = useState(false);
  const moreRef = useRef<HTMLButtonElement>(null);
  const [configOpen, setConfigOpen] = useState(false);
  //  Which columns, in what order. The screen owns it because it is the screen's
  //  preference, not the table's — a table renders what it is handed.
  const [layout, setLayout] = useState<ColumnConfigItem[]>([
    { id: 'date', label: 'Date', visible: true },
    { id: 'number', label: 'Purchase Order#', visible: true, locked: true },
    { id: 'reference', label: 'Reference#', visible: true },
    { id: 'vendor', label: 'Vendor Name', visible: true },
    { id: 'status', label: 'Status', visible: true },
    { id: 'billed', label: 'Billed Status', visible: true },
    { id: 'amount', label: 'Amount', visible: true },
  ]);
  const [viewId, setViewId] = useState('all');
  const [viewMenuOpen, setViewMenuOpen] = useState(false);

  const views = [
    { id: 'all', label: 'All Purchase Orders' },
    { id: 'pending', label: 'Pending Approval' },
    { id: 'unbilled', label: 'Unbilled Orders' },
  ];
  const view = views.find((v) => v.id === viewId) ?? views[0];

  const rows = useMemo(() => {
    const filtered = viewId === 'pending'
      ? PURCHASE_ORDERS.filter((p) => p.status === 'Pending Approval')
      : viewId === 'unbilled'
        ? PURCHASE_ORDERS.filter((p) => p.billed === 'Pending')
        : PURCHASE_ORDERS;

    //  Sort on the VALUE, not on what the cell renders. Amount sorted as a
    //  string puts ₹9,375 above ₹9,21,340, and a date sorted as "24 Aug 2026"
    //  sorts by day-of-month — both are the same mistake, and both look right
    //  until the tenth row.
    const key = (p: PurchaseOrder): string | number => ({
      date: p.date, number: p.number, reference: p.reference,
      vendor: p.vendor, status: p.status, billed: p.billed, amount: p.amount,
    }[sort.columnId] ?? p.date);

    return [...filtered].sort((a, b) => {
      const [x, y] = [key(a), key(b)];
      const d = typeof x === 'number' && typeof y === 'number'
        ? x - y : String(x).localeCompare(String(y));
      return sort.direction === 'asc' ? d : -d;
    });
  }, [viewId, sort]);

  const allColumns: TableColumn<PurchaseOrder>[] = [
    {
      id: 'date', header: 'Date', sortable: true,
      cell: (p) => <Text as="span">{day.format(new Date(p.date))}</Text>,
    },
    {
      id: 'number', header: 'Purchase Order', sortable: true,
      //  `primary/text` at 5.92:1, which is the role `Text tone="link"` binds.
      //  §2.24.8: the source's link blue was 4.22:1 and failed at 13px.
      cell: (p) => <Text as="a" href="#" tone="link" weight="medium">{p.number}</Text>,
    },
    {
      id: 'reference', header: 'Reference#', sortable: true,
      cell: (p) => <Text as="span" tone="secondary">{p.reference}</Text>,
    },
    {
      id: 'vendor', header: 'Vendor Name', sortable: true,
      //  The avatar's tint is hashed from the vendor's name, so the same vendor
      //  is the same colour on every screen — §2.22.8, and the reason 1.4.1
      //  holds: the colour is identity, never status.
      //
      //  `Inline grow` lets the name truncate instead of pushing the column
      //  wide; the avatar is `flex-none` in the component.
      cell: (p) => (
        <Inline gap={3} align="center" grow>
          <Avatar name={p.vendor} />
          <Text as="span" truncate>{p.vendor}</Text>
        </Inline>
      ),
    },
    {
      id: 'status', header: 'Status', sortable: true,
      cell: (p) => <StatusBadge status={STATUS_TONE[p.status]}>{p.status}</StatusBadge>,
    },
    {
      id: 'billed', header: 'Billed Status', sortable: true,
      cell: (p) => <StatusBadge status={BILLED_TONE[p.billed]}>{p.billed}</StatusBadge>,
    },
    {
      //  §2.24.2 — `align: 'end'` moves the header AND the data to the column's
      //  right edge. Moving only the data is the "alignment edge made of words"
      //  defect: the source right-aligned numbers to the width of the header's
      //  text, so renaming the column moved the figures.
      id: 'amount', header: 'Amount', align: 'end', sortable: true,
      cell: (p) => <Text as="span" weight="medium">{money.format(p.amount)}</Text>,
    },
  ];

  //  `layout` decides order AND presence; `allColumns` decides what a cell
  //  renders. Keyed by id so neither can silently drop the other's column.
  const byId = new Map(allColumns.map((c) => [c.id, c]));
  const columns = layout
    .filter((l) => l.visible)
    .map((l) => byId.get(l.id))
    .filter((c): c is TableColumn<PurchaseOrder> => Boolean(c));

  //  §12 — THE HEADER SWAP IS A SHELL CONTRACT, and three rules come with it.
  //
  //  1. ONE CELL, ONE FIXED BLOCK-SIZE, equal to the taller occupant. The page
  //     header is 64 in all three of its variants and the bar is 48; without the
  //     fixed height the table jumps 16px on the first click and back again on
  //     the last.
  //  2. The header is HIDDEN, never unmounted. It owns state the user put there
  //     — the view switcher, a search string — and unmounting throws it away on
  //     every bulk action.
  //  3. FOCUS NEVER CROSSES THE SWAP. No autofocus on the bar: moving focus on a
  //     value change is a 3.2.2 failure. The user changed a value; they did not
  //     request a context change. This is the most common bug in the pattern and
  //     it fires on every checkbox click.
  const selecting = selected.size > 0;

  return (
    <>
      {/*  §12's cell, and `PageChrome` owns all three of its rules — one fixed
           block-size so nothing below moves, the header hidden rather than
           unmounted so it keeps its state, and no focus movement across the
           swap. A styled wrapper here would also be a rule-4 violation, and
           rightly: "the header is 64 and the bar is 48" is a design decision. */}
      <PageChrome
        bar={selecting ? (
          <ActionBar
            count={selected.size}
            total={rows.length}
            primary={{ id: 'bulk', label: 'Bulk Update', onSelect: () => {} }}
            iconActions={[
              { id: 'mail', label: 'Email selected', icon: 'mail', onSelect: () => {} },
              { id: 'print', label: 'Print selected', icon: 'print', onSelect: () => {} },
              //  `pdf` draws a placeholder: §3.6 uses `icon / documents` here and
              //  the reference shows a PDF page, which is the flagged correction.
              { id: 'pdf', label: 'Export as PDF', icon: 'pdf', onSelect: () => {} },
            ]}
            actions={[
              { id: 'custom', label: 'Custom Button', onSelect: () => {} },
              { id: 'bill', label: 'Convert to bill', onSelect: () => {} },
              { id: 'issued', label: 'Mark as Issued', onSelect: () => {} },
              { id: 'void', label: 'Void', onSelect: () => {} },
              { id: 'delete', label: 'Delete', onSelect: () => {} },
            ]}
            onClear={() => setSelected(new Set())}
          />
        ) : undefined}
      >
      <PageHeader
        type="list"
        title={view.label}
        views={views}
        onViewChange={setViewId}
        viewMenuOpen={viewMenuOpen}
        onViewMenuToggle={() => setViewMenuOpen((o) => !o)}
        cta={{ label: 'New', icon: 'plus', onSelect: () => {} }}
        //  AFTER the CTA, which is what `trailing` is for. These two act on the
        //  VIEW — which records it shows, what else you can do to the list —
        //  where `actions` act on the records. Figma's `zf-header-actions` puts
        //  every icon before the CTA and has no way to say "after".
        //
        //  The funnel is drawn LIGHTER than its neighbours, and it is an
        //  optical correction rather than a whim: its walls measure 42 of 413
        //  units — about 1.6px in a 16px slot — where the house convention is
        //  1.25, so at one colour it lays down ~30% more ink and reads darker.
        //  `icon/muted` is 4.52:1, a step back from `icon/default`'s 6.79 and
        //  still well clear of 1.4.11's 3:1.
        //
        //  Passed as a NODE rather than a name because that is what the
        //  `IconName | ReactNode` union is for — a per-instance tone does not
        //  earn an axis on `HeaderAction`. The cost is that this glyph no longer
        //  follows the button's disabled colour; this one is never disabled.
        trailing={[
          {
            id: 'more',
            label: 'More actions for Purchase Orders',
            icon: 'more',
            ref: moreRef,
            expanded: menuOpen,
            onSelect: () => setMenuOpen((o) => !o),
          },
          {
            id: 'filter',
            label: 'Filter purchase orders',
            icon: <Icon name="filter" size="md" tone="muted" />,
            onSelect: () => {},
          },
        ]}
      />

      </PageChrome>

      {/*  §9.1's own item list, from `zf-menu.md`. The label names what the menu
           belongs to rather than what the button is — "More actions" alone tells
           a screen-reader user nothing about which more. */}
      <Menu
        anchor={moreRef.current}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        label="More actions for Purchase Orders"
        entries={MORE_ACTIONS}
      />

      {/* WHITE, AND FLUSH TO ALL FOUR EDGES.

          The shell's ground is `surface/canvas` — correct as the application's
          default, and wrong for a list view, where the table IS the page. So the
          view claims its own surface: `surface/default`, no padding, no radius.

          `Surface` rather than a wrapper element, because rule 4 fails the build
          on a styled bare element in a screen and it is right to: "the body is
          white here" is a design decision, and design decisions live in canon
          components even when the component is one div.

          `pad={0}` and `placement="page"` are the same instruction said twice —
          once to the region and once to the table. Either alone leaves a margin:
          padding here, or the table's own 1px frame and 6px radius.

          `flex-1 min-h-0`, and the `min-h-0` is what changed when the chrome
          became sticky. It was `flex-1` alone, so a long list pushed the column
          past the viewport and the SHELL scrolled — taking the page header and
          the table header up with it.

          Bounded, this region has a definite height and the TABLE scrolls inside
          it. Nothing is clipped: the rows beyond the fold are reached by
          scrolling the table, which is now the thing holding the scrollbar. */}
      <Surface tone="default" pad={0} radius="none" className="flex-1 min-h-0">
        <Table
          //  1.3.1 — required, and visually hidden. Without it the table
          //  announces as "table, 7 columns, 10 rows" and nothing else.
          caption={`${view.label} — ${rows.length} records`}
          columns={columns}
          rows={rows}
          rowKey={(p) => p.id}
          sort={sort}
          onSortChange={setSort}
          placement="page"
          onConfigure={{
            label: 'Rearrange the columns',
            expanded: configOpen,
            onSelect: () => setConfigOpen(true),
          }}
          //  §2.24.8 wants three things a Figma variant cannot express: the
          //  header checkbox indeterminate when the page is partly selected, a
          //  name on it saying WHAT it selects, and a name on every row's.
          selection={{
            selected,
            onChange: setSelected,
            allLabel: `Select all ${rows.length} purchase orders`,
            rowLabel: (p) => `Select ${p.number}, ${p.vendor}`,
          }}
          empty={<Text tone="secondary">No purchase orders match this view.</Text>}
        />
      </Surface>

      <ColumnConfig
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        items={layout}
        onSave={(next) => { setLayout(next); setConfigOpen(false); }}
      />
    </>
  );
}
