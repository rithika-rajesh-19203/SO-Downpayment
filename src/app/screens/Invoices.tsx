import { useMemo, useRef, useState } from 'react';
import {
  ActionBar, Avatar, ColumnConfig, Icon, Inline, Menu, PageChrome, PageHeader, StatusBadge,
  Surface, Table, Text,
} from '@canon';
import type {
  ColumnConfigItem, MenuEntry, StatusBadgeStatus, TableColumn, TableSort,
} from '@canon';
import { INVOICES } from '../data/invoices';
import type { Invoice } from '../data/invoices';

/**
 * SALES → INVOICES. The second list view, and deliberately the same list view.
 *
 * CLAUDE.md's "Every list view is the same list view" is the whole brief here:
 * `PageChrome` around a `PageHeader type="list"`, the ⋯ opening a `Menu`, a
 * bounded `Surface` so the `Table` scrolls rather than the shell, `placement=
 * "page"`, `ColumnConfig` behind the config square, and an `ActionBar` in the
 * chrome's `bar` slot. **Nine columns and none of them needed a new component.**
 *
 * The two things that differ from Purchase Orders are both data, not design:
 * a status that carries a number, and a second money column.
 */

/**
 * Six record states onto the badge's fourteen, by §2.1.8's families:
 * `pending` and `overdue` are Attention, `in-progress` is Active/in-flight,
 * `success` is Positive/terminal-good, `draft` and `void` are Neutral/dormant.
 *
 * `Sent` takes `pending` rather than `submitted`: from the seller's side an
 * invoice that has gone out is waiting on someone else, which is what Attention
 * means. `submitted` would say the work is done.
 */
const STATUS_TONE: Record<Invoice['status'], StatusBadgeStatus> = {
  Draft: 'draft',
  Sent: 'pending',
  'Partially Paid': 'in-progress',
  Paid: 'success',
  Overdue: 'overdue',
  Void: 'void',
};

/** The ⋯, same shape as the purchase-order list's. */
const MORE_ACTIONS: MenuEntry[] = [
  {
    id: 'sort', label: 'Sort by', icon: 'sort',
    children: [
      { id: 'sort-date', label: 'Date', checked: true, onSelect: () => {} },
      { id: 'sort-due', label: 'Due Date', checked: false, onSelect: () => {} },
      { id: 'sort-balance', label: 'Balance Due', checked: false, onSelect: () => {} },
    ],
  },
  { separator: true },
  {
    id: 'import', label: 'Import', icon: 'import',
    children: [
      { id: 'imp-inv', label: 'Import Invoices', onSelect: () => {} },
      { id: 'imp-pay', label: 'Import Payments', onSelect: () => {} },
    ],
  },
  {
    id: 'export', label: 'Export', icon: 'export',
    children: [
      { id: 'exp-inv', label: 'Export Invoices', onSelect: () => {} },
      { id: 'exp-view', label: 'Export Current View', onSelect: () => {} },
    ],
  },
  { separator: true },
  { id: 'prefs', label: 'Preferences', icon: 'settings', onSelect: () => {} },
  { id: 'fields', label: 'Manage Custom Fields', icon: 'table-config', onSelect: () => {} },
  { separator: true },
  { id: 'refresh', label: 'Refresh List', icon: 'refresh', onSelect: () => {} },
  { id: 'delete', label: 'Delete this view', icon: 'close', tone: 'danger', onSelect: () => {} },
];

//  Built once, not per cell: thirty rows call the money formatter sixty times
//  across two columns, and `Intl.NumberFormat` is the expensive half.
const money = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
});
const day = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric',
});

const VIEWS = [
  { id: 'all', label: 'All Invoices' },
  { id: 'unpaid', label: 'Unpaid Invoices' },
  { id: 'overdue', label: 'Overdue Invoices' },
  { id: 'draft', label: 'Draft Invoices' },
];

export interface InvoicesProps {
  /** The invoices to list — state in Books, so a draft raised from a sales order appears here. */
  invoices?: Invoice[];
  /** Open one invoice's detail view. The identifying column is the way in. */
  onOpen?: (id: string) => void;
  /** The header's New. The nav leaf's `+` reaches the same screen. */
  onCreate?: () => void;
}

export function Invoices({ invoices = INVOICES, onOpen, onCreate }: InvoicesProps = {}) {
  const [sort, setSort] = useState<TableSort>({ columnId: 'date', direction: 'desc' });
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [menuOpen, setMenuOpen] = useState(false);
  const moreRef = useRef<HTMLButtonElement>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [viewId, setViewId] = useState('all');
  const [viewMenuOpen, setViewMenuOpen] = useState(false);

  const [layout, setLayout] = useState<ColumnConfigItem[]>([
    { id: 'number', label: 'Invoice#', visible: true, locked: true },
    { id: 'date', label: 'Date', visible: true },
    { id: 'order', label: 'Order#', visible: true },
    { id: 'customer', label: 'Customer Name', visible: true },
    { id: 'status', label: 'Status', visible: true },
    { id: 'dueDate', label: 'Due Date', visible: true },
    { id: 'amount', label: 'Amount', visible: true },
    { id: 'balance', label: 'Balance Due', visible: true },
    { id: 'location', label: 'Location', visible: true },
  ]);

  const view = VIEWS.find((v) => v.id === viewId) ?? VIEWS[0];

  const rows = useMemo(() => {
    const filtered = viewId === 'unpaid' ? invoices.filter((i) => i.balance > 0)
      : viewId === 'overdue' ? invoices.filter((i) => i.status === 'Overdue')
        : viewId === 'draft' ? invoices.filter((i) => i.status === 'Draft')
          : invoices;

    //  Sort on the VALUE, never on what the cell renders. Two traps here rather
    //  than one: a date sorted as "24 Aug 2026" sorts by day-of-month, and
    //  `statusLabel` sorted alphabetically puts "Overdue by 7 days" after
    //  "Overdue by 30 days" because it compares the 7 against the 3.
    const key = (i: Invoice): string | number => ({
      date: i.date, number: i.number, order: i.order, customer: i.customer,
      status: i.status, dueDate: i.dueDate, amount: i.amount,
      balance: i.balance, location: i.location,
    }[sort.columnId] ?? i.date);

    return [...filtered].sort((a, b) => {
      const [x, y] = [key(a), key(b)];
      const d = typeof x === 'number' && typeof y === 'number'
        ? x - y : String(x).localeCompare(String(y));
      return sort.direction === 'asc' ? d : -d;
    });
  }, [invoices, viewId, sort]);

  const allColumns: TableColumn<Invoice>[] = [
    {
      id: 'date', header: 'Date', sortable: true,
      cell: (i) => <Text as="span">{day.format(new Date(i.date))}</Text>,
    },
    {
      //  The identifying column, so it is the link — `primary/text` at 5.92:1,
      //  which is the role `tone="link"` binds. `primary/default` is 4.32 and
      //  fails 1.4.3 at 13px.
      id: 'number', header: 'Invoice#', sortable: true,
      //  An `<a>`, not a button: this is navigation, so it has to be reachable
      //  the way navigation is — Tab, Enter, and a middle-click that a future
      //  router turns into a real URL. `href="#"` is the placeholder until
      //  there is one, and it is the reason the second route lives in Books
      //  rather than here.
      cell: (i) => (
        <Text as="a" href="#" tone="link" weight="medium" onClick={() => onOpen?.(i.id)}>
          {i.number}
        </Text>
      ),
    },
    {
      id: 'order', header: 'Order#', sortable: true,
      cell: (i) => <Text as="span" tone="secondary">{i.order}</Text>,
    },
    {
      id: 'customer', header: 'Customer Name', sortable: true,
      //  The tint is hashed from the name, so one customer is one colour on
      //  every screen — which is the only reason the colour can mean identity
      //  rather than status, and therefore the only reason 1.4.1 holds.
      cell: (i) => (
        <Inline gap={3} align="center" grow>
          <Avatar name={i.customer} />
          <Text as="span" truncate>{i.customer}</Text>
        </Inline>
      ),
    },
    {
      id: 'status', header: 'Status', sortable: true,
      //  `statusLabel`, not `status`: one state carries a measurement of itself.
      //  The badge shows the whole sentence; the tone keys off the six-value
      //  vocabulary underneath it.
      cell: (i) => <StatusBadge status={STATUS_TONE[i.status]}>{i.statusLabel}</StatusBadge>,
    },
    {
      id: 'dueDate', header: 'Due Date', sortable: true,
      //  An overdue date is the one piece of plain text on the row that carries
      //  a warning, and colour alone would be a 1.4.1 failure — so it never
      //  travels alone: the badge two columns left says "Overdue by N days" in
      //  words. This is emphasis on a fact already stated, not the statement.
      cell: (i) => (
        <Text as="span" tone={i.status === 'Overdue' ? 'danger' : 'default'}>
          {day.format(new Date(i.dueDate))}
        </Text>
      ),
    },
    {
      id: 'amount', header: 'Amount', align: 'end', sortable: true,
      cell: (i) => <Text as="span" weight="medium">{money.format(i.amount)}</Text>,
    },
    {
      id: 'balance', header: 'Balance Due', align: 'end', sortable: true,
      //  A settled invoice reads `text/tertiary` rather than showing a bold
      //  zero: nothing is owed, so nothing should compete with the rows that do
      //  owe something.
      cell: (i) => (
        <Text as="span" weight={i.balance > 0 ? 'medium' : 'regular'}
          tone={i.balance > 0 ? 'default' : 'tertiary'}>
          {money.format(i.balance)}
        </Text>
      ),
    },
    {
      id: 'location', header: 'Location', sortable: true,
      cell: (i) => <Text as="span" tone="secondary" truncate>{i.location}</Text>,
    },
  ];

  const byId = new Map(allColumns.map((c) => [c.id, c]));
  const columns = layout
    .filter((l) => l.visible)
    .map((l) => byId.get(l.id))
    .filter((c): c is TableColumn<Invoice> => Boolean(c));

  const selecting = selected.size > 0;

  return (
    <>
      <PageChrome
        bar={selecting ? (
          <ActionBar
            count={selected.size}
            total={rows.length}
            primary={{ id: 'reminder', label: 'Send Reminder', onSelect: () => {} }}
            iconActions={[
              { id: 'mail', label: 'Email selected', icon: 'mail', onSelect: () => {} },
              { id: 'print', label: 'Print selected', icon: 'print', onSelect: () => {} },
              { id: 'pdf', label: 'Export as PDF', icon: 'pdf', onSelect: () => {} },
            ]}
            actions={[
              { id: 'payment', label: 'Record Payment', onSelect: () => {} },
              { id: 'sent', label: 'Mark as Sent', onSelect: () => {} },
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
          views={VIEWS}
          onViewChange={setViewId}
          viewMenuOpen={viewMenuOpen}
          onViewMenuToggle={() => setViewMenuOpen((o) => !o)}
          cta={{ label: 'New', icon: 'plus', onSelect: () => onCreate?.() }}
          trailing={[
            {
              id: 'more',
              label: 'More actions for Invoices',
              icon: 'more',
              ref: moreRef,
              expanded: menuOpen,
              onSelect: () => setMenuOpen((o) => !o),
            },
            {
              id: 'filter',
              label: 'Filter invoices',
              icon: <Icon name="filter" size="md" tone="muted" />,
              onSelect: () => {},
            },
          ]}
        />
      </PageChrome>

      <Menu
        anchor={moreRef.current}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        label="More actions for Invoices"
        entries={MORE_ACTIONS}
      />

      {/*  Bounded, so the TABLE holds the scrollbar and the sticky chrome and
           table header stay where they are. `flex-1` alone lets the shell scroll
           and takes both of them up with it. */}
      <Surface tone="default" pad={0} radius="none" className="flex-1 min-h-0">
        <Table
          caption={`${view.label} — ${rows.length} records`}
          columns={columns}
          rows={rows}
          rowKey={(i) => i.id}
          sort={sort}
          onSortChange={setSort}
          placement="page"
          selection={{
            selected,
            onChange: setSelected,
            allLabel: `Select all ${rows.length} invoices`,
            rowLabel: (i) => `Select ${i.number}, ${i.customer}`,
          }}
          onConfigure={{
            label: 'Rearrange the columns',
            expanded: configOpen,
            onSelect: () => setConfigOpen(true),
          }}
          empty={<Text tone="secondary">No invoices match this view.</Text>}
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
