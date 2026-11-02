import { Fragment, useMemo, useRef, useState } from 'react';
import {
  ActionBar, Avatar, Button, DescriptionList, DetailsToolbar, Divider, Icon, Inline, Menu, MiniList,
  PageHeader, Segmented, SplitView, StatusBadge, Stack, Surface, Table, Tabs, Text,
} from '@canon';
import type { DetailsToolbarGroup, MenuEntry } from '@canon';
import type { MiniListItem, StatusBadgeStatus } from '@canon';
import { INVOICES } from '../data/invoices';
import type { Invoice } from '../data/invoices';
import { CUSTOMER_INFO, lineAmount } from '../data/sales-orders';
import { Address, LINE_COLUMNS, date, money as amount } from './SalesOrderDocument';
import type { Line } from './SalesOrderDocument';

/**
 * SALES → INVOICES → one invoice. The split view.
 *
 * `MiniList` on the left, the record on the right, and `SplitView` holding the
 * two so neither scrolls the other — which is the whole reason the pattern
 * exists: `zf-mini-list.md` §5 is that *"selecting a row does not re-render,
 * scroll, or lose its position."*
 *
 * The right column is the same `PageChrome` the list view uses, so §12's three
 * rules hold here too — one fixed cell, the header hidden rather than
 * unmounted, focus never crossing the swap. What changes is which header sits in
 * it: `type="detail"`, so the record gets a back control and a parent link
 * rather than a view switcher.
 *
 * **The bulk selection lives on the LEFT and its action bar appears on the
 * RIGHT.** That is `zf-mini-list.md` §5's own row — *"the action bar replaces
 * the page header, and here the page header is on the right"* — and it is the
 * reason the two selections have to stay separate: reading one invoice while
 * three others are ticked is a normal thing to be doing.
 */

/**
 * ONE map, used by the badge in the card and the badge in the mini list — and
 * the same one `Invoices.tsx` gives the table. A status that is orange in the
 * list and red in the detail is two facts about one record.
 *
 * `Overdue` is the **orange** `overdue` badge — `#FAEEE3` on `#964600`, 5.80:1
 * — not a red one. Red is `cancelled` and `failed`: things that ended badly. An
 * invoice overdue by 30 days is still collectable, and the colour should say
 * "attend to this", not "this is over".
 */
const STATUS_TONE: Record<Invoice['status'], StatusBadgeStatus> = {
  Draft: 'draft',
  Sent: 'pending',
  'Partially Paid': 'in-progress',
  Paid: 'success',
  Overdue: 'overdue',
  Void: 'void',
};


const money = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
});
const day = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric',
});

/**
 * §3's grouping, resolved by the reference: **Edit · Send · Share · PDF/Print**
 * stay on the bar and everything else is behind the `⋯`.
 *
 * One group, not three. The md splits them into record / workflow / money and
 * separates the clusters — but the reference puts a rule between *every* pair,
 * which leaves the clusters with nothing to draw them, so claiming three of them
 * in the markup would be describing a grouping nobody can perceive. The
 * `role="group"` label still names what these four are.
 *
 * The line is what the record's chrome is FOR: acting on this document. Anything
 * that changes what the record *is* — recording a payment, voiding it — is a
 * decision, not a chrome action, and it belongs behind the `⋯` where it costs a
 * deliberate click.
 */
const TOOLBAR: DetailsToolbarGroup[] = [
  {
    id: 'document', label: 'Document actions',
    items: [
      //  Edit is always first and never carries a caret — §3.
      { id: 'edit', label: 'Edit', icon: 'edit', onSelect: () => {} },
      { id: 'send', label: 'Send', icon: 'mail', menu: true, onSelect: () => {} },
      { id: 'share', label: 'Share', icon: 'share', onSelect: () => {} },
      { id: 'pdf', label: 'PDF/Print', icon: 'pdf', menu: true, onSelect: () => {} },
      //  A fifth item, by request — the reference puts it on the bar.
      { id: 'payment', label: 'Record Payment', icon: 'bank', onSelect: () => {} },
    ],
  },
];

/**
 * The customer's other balances, as the reference shows them. Sample figures:
 * the prototype has no credit notes or retainers to total.
 */
const CREDITS: [string, string][] = [
  ['Credits Available', 'Rs.184,922.00'],
  ['Retainer Available', 'Rs.15,601.00'],
  ['Unbilled Bill Items available', '2'],
];

/**
 * Everything the bar does not show — the reference's list, in its order and with
 * its three separators.
 *
 * **Every glyph is the drawn one.** All six started as nearest-fits marked in
 * prose — `documents`, `export`, `print`, `x-circle`, `pin`, `settings` — and
 * each became one line as its export arrived. No stand-ins left in this menu.
 */
const MORE: MenuEntry[] = [
  { id: 'credit-note', label: 'Create Credit Note', icon: 'create-credit-note', onSelect: () => {} },
  { id: 'clone', label: 'Clone', icon: 'clone', onSelect: () => {} },
  { id: 'barcode', label: 'Print Item Barcode', icon: 'autoscan', onSelect: () => {} },
  { separator: true },
  //  `danger`, and in a `strong` menu that now means a SOLID RED row on hover —
  //  `danger/hover` with `danger/on-danger`, 7.04 Light / 8.26 Dark. The one row
  //  here that destroys something should not answer the pointer in the same
  //  colour as "Clone".
  { id: 'delete', label: 'Delete', icon: 'delete', tone: 'danger', onSelect: () => {} },
  { separator: true },
  { id: 'lock', label: 'Lock Invoice', icon: 'lock', onSelect: () => {} },
  { separator: true },
  { id: 'prefs', label: 'Invoice Preferences', icon: 'preference', onSelect: () => {} },
];

export interface InvoiceDetailsProps {
  /** The invoices in the mini list — state in Books, so a converted draft is one of them. */
  invoices?: Invoice[];
  invoiceId: string;
  onSelect: (id: string) => void;
  /** Approve a draft — Send Invoice and Mark As Sent both do. Applies any held advance. */
  onApprove?: (id: string) => void;
  /** Back to the list view. */
  onBack: () => void;
}

export function InvoiceDetails({ invoices = INVOICES, invoiceId, onSelect, onApprove, onBack }: InvoiceDetailsProps) {
  const [bulk, setBulk] = useState<ReadonlySet<string>>(new Set());
  const moreRef = useRef<HTMLButtonElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  //  WHICH tab, and WHICH rendering of it. Two axes: the segmented switches the
  //  view inside whichever tab is open, so they cannot be one piece of state.
  const [tab, setTab] = useState('details');
  const [view, setView] = useState('details');

  const items: MiniListItem[] = useMemo(() => invoices.map((i) => ({
    id: i.id,
    name: i.customer,
    amount: money.format(i.amount),
    //  Three at most. §3: past that it wraps and the row stops being 93.
    meta: [i.number, day.format(new Date(i.date))],
    status: i.statusLabel,
    statusVariant: STATUS_TONE[i.status],
  })), [invoices]);

  const invoice = invoices.find((i) => i.id === invoiceId) ?? invoices[0];
  const selecting = bulk.size > 0;

  return (
    <SplitView
      list={(
        <MiniList
          label="Invoices"
          items={items}
          activeId={invoice.id}
          onActivate={onSelect}
          //  The bulk set, which is NOT the route. Ticking a box leaves the
          //  record on the right exactly where it was.
          selection={{ selected: bulk, onChange: setBulk }}
          //  THE BAR GOES HERE, on the same side as the checkboxes that filled
          //  it. `compact`, because 353px has room for the count and nothing
          //  else — every action lives in the one Actions menu.
          bar={selecting ? (
          <ActionBar
            density="compact"
            count={bulk.size}
            total={items.length}
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
            ]}
            //  The head checkbox. `next` is the state it should move TO, so the
            //  screen owns what "all" means — here, every row in the list.
            onToggleAll={(next) => setBulk(next ? new Set(items.map((i) => i.id)) : new Set())}
            onClear={() => setBulk(new Set())}
          />
          ) : undefined}
          views={[
            { id: 'all', label: 'All Invoices' },
            { id: 'unpaid', label: 'Unpaid Invoices' },
            { id: 'overdue', label: 'Overdue Invoices' },
          ]}
          viewId="all"
          onViewChange={() => {}}
          onCreate={() => {}}
          moreEntries={[
            {
              id: 'sort', label: 'Sort by', icon: 'sort',
              children: [
                { id: 'date', label: 'Date', checked: true, onSelect: () => {} },
                { id: 'amount', label: 'Amount', checked: false, onSelect: () => {} },
                { id: 'due', label: 'Due Date', checked: false, onSelect: () => {} },
              ],
            },
            { separator: true },
            { id: 'export', label: 'Export Invoices', icon: 'export', onSelect: () => {} },
            { id: 'refresh', label: 'Refresh List', icon: 'refresh', onSelect: () => {} },
          ]}
        />
      )}
    >
      {/* §7 — the eyebrow is a LINK to the parent record, never an <h2>: a
          level-2 heading above the level-1 inverts the document outline. And
          the back control names its destination, because a screen-reader user
          who hears "Back" three times in a session has learned nothing. */}
      <PageHeader
        type="detail"
        title={invoice.number}
        parent={{ label: `Location: ${invoice.location}`, href: '#' }}
        onBack={onBack}
      />

      {/* Directly under the header, and the header keeps NO actions of its own:
          every one of them is a toolbar item now. Drawing "Edit" in both places
          is the duplication the toolbar exists to collect. §2 — one hairline
          between the two, because the toolbar has no top border.

          It STAYS UP during a bulk selection, and that reverses an earlier call.
          While the bar lived in this column the two stacked 40px apart and
          "Record Payment" appeared twice with no way to tell which object it
          meant. With the bar over in the mini list's own toolbar, the columns do
          that work: the left one visibly owns the ticked records, the right one
          visibly owns the record being read. Blanking the right side while the
          user reads it would make the split view worse, not safer. */}
      <DetailsToolbar
        groups={TOOLBAR}
        overflow={{ ref: moreRef, expanded: moreOpen, onSelect: () => setMoreOpen((o) => !o) }}
      />
      {/* `align="start"`: the ⋯ is packed after PDF/Print rather than sprung to
          the far end, so the default right-edge alignment would throw the panel
          back across the whole bar. */}
      <Menu
        anchor={moreRef.current}
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        label="More actions for this invoice"
        align="start"
        //  `strong` — accented glyphs and a solid blue row under the pointer.
        //  These rows ARE the ⋯'s whole content; there is nothing visible behind
        //  the panel that they are a footnote to.
        emphasis="strong"
        entries={MORE}
      />

      {/* The record's own scroller. `SplitView` gives this column
          `min-h-0`, so it can be shorter than its content and this can hold the
          scrollbar — the list on the left keeps its own. */}
      <Surface tone="canvas" pad={0} radius="none" className="flex-1 min-h-0 overflow-y-auto">
        <Stack gap={8} className="p-10">
          {/* SECTION 1 — what the customer has to put against this invoice,
              then the one step it is waiting on. `radius="card"` is
              `chrome/card`, 10: a named role, because 10 is a retired radius. */}
          <InvoiceSummary invoice={invoice} onApprove={() => onApprove?.(invoice.id)} />

          {/* SECTION 2 — tabbed. `pad={0}` because the tab strip's rule has to
              reach both edges of the card: a strip inset by the card's own
              padding leaves the rule floating with a gap at each end, which
              reads as an underline on the tabs rather than as the boundary
              between chrome and content.

              `overflow-hidden` so the strip's square top corners are clipped by
              the card's 10 — without it the rule runs straight through them. */}
          <Surface pad={0} radius="card" border="default" className="overflow-hidden">
            <Tabs
              items={[
                { id: 'details', label: 'Invoice Details' },
                { id: 'activity', label: 'Activity', badge: '12' },
                { id: 'journals', label: 'Journals' },
              ]}
              value={tab}
              onChange={setTab}
              label="Invoice views"
              //  ON THE STRIP'S BASELINE, and deliberately not a fourth tab:
              //  "PDF" is not another thing to read about the invoice, it is
              //  another rendering of the thing you are already reading. A tab
              //  would say the two are siblings and the arrow keys would agree.
              trailing={(
                <Segmented
                  label="View"
                  //  24 overall, so it rides the tab labels' baseline rather
                  //  than standing 32 tall beside 20px of text.
                  size="sm"
                  value={view}
                  onChange={setView}
                  options={[
                    { value: 'details', label: 'Details' },
                    { value: 'pdf', label: 'PDF' },
                  ]}
                />
              )}
            >
              {view === 'pdf' ? (
                //  The PDF is of the RECORD, so it is the same document whichever
                //  tab is open — which is exactly why the switch is not a tab.
                <Stack gap={6} align="center" justify="center" className="p-15 min-h-mini-list">
                  <Icon name="pdf" size="xl" tone="muted" />
                  <Text tone="secondary">{invoice.number}.pdf</Text>
                  <Text size="body-sm" tone="tertiary">The rendered document preview.</Text>
                </Stack>
              ) : tab === 'details' ? (
                <InvoiceFields invoice={invoice} />
              ) : tab === 'activity' ? (
                <Stack gap={6} className="p-15">
                  {[
                    ['Invoice created', '01 Jul 2024'],
                    ['Sent to ' + invoice.customer, '02 Jul 2024'],
                    ['Reminder sent', '16 Jul 2024'],
                  ].map(([what, when]) => (
                    <Inline key={what} gap={5} align="center">
                      <Text as="span" className="flex-1 min-w-0">{what}</Text>
                      <Text as="span" size="body-sm" tone="secondary" className="flex-none">{when}</Text>
                    </Inline>
                  ))}
                </Stack>
              ) : (
                <Stack gap={6} className="p-15">
                  <DescriptionList items={[
                    { label: 'Accounts Receivable', value: money.format(invoice.amount) },
                    { label: 'Sales', value: money.format(invoice.amount) },
                  ]} />
                </Stack>
              )}
            </Tabs>
          </Surface>

          <Surface pad={0} radius="card" border="default" className="overflow-hidden">
            <Stack gap={0}>
              <Stack gap={0} className="p-10">
                <Text as="h2" size="heading">Terms and Conditions</Text>
              </Stack>
              <Divider />
              <Stack gap={0} align="center" className="p-15">
                <Text tone={invoice.terms ? 'default' : 'secondary'}>
                  {invoice.terms || 'No Terms and Conditions'}
                </Text>
              </Stack>
            </Stack>
          </Surface>
        </Stack>
      </Surface>
    </SplitView>
  );
}

/* ── SECTION 1: CREDITS AND WHAT'S NEXT ─────────────────────────────────────── */

/**
 * The balances the customer has against them, then the next step.
 *
 * **The sales order's advance is one of those balances** while the invoice is
 * a draft: received, held, and not yet taken off — so it is listed beside the
 * customer's credits rather than in the totals, with a note saying when it
 * moves. Approving the draft applies it, and the line then says so.
 */
function InvoiceSummary({ invoice, onApprove }: { invoice: Invoice; onApprove: () => void }) {
  const pending = invoice.advancePending ?? 0;
  const applied = invoice.advanceApplied ?? 0;
  const draft = invoice.status === 'Draft';
  const done = invoice.status === 'Paid' || invoice.status === 'Void';

  return (
    <Surface pad={10} radius="card" border="default">
      <Stack gap={8}>
        <Stack gap={5}>
          {pending > 0 ? (
            <Stack gap={2}>
              <Credit highlight label={`Sales Order Advance (${invoice.order})`} value={amount.format(pending)} />
              <Inline gap={2} align="center" className="ps-6">
                <Icon name="info" size="sm" tone="primary" />
                <Text size="body-sm" tone="secondary">
                  Received on the sales order. It is applied to this invoice automatically when the invoice is approved.
                </Text>
              </Inline>
            </Stack>
          ) : applied > 0 ? (
            <Credit highlight label={`Sales Order Advance (${invoice.order})`} value={`${amount.format(applied)} applied`} />
          ) : null}
          {CREDITS.map(([label, value]) => <Credit key={label} label={label} value={value} />)}
        </Stack>

        {done ? null : (
          <>
            <Divider />
            <Inline gap={6} align="center" wrap>
              <Inline gap={3} align="center" className="flex-1 min-w-0">
                <Icon name="sparkle" size="md" tone="primary" />
                <Text>
                  <Text as="span" weight="semibold">WHAT'S NEXT?</Text>
                  {' '}
                  {draft
                    ? 'Send this Invoice to your customer or mark it as Sent.'
                    : `Record a payment for the ${amount.format(invoice.balance)} still due.`}
                </Text>
              </Inline>
              <Inline gap={4} align="center" className="flex-none">
                {draft ? (
                  <>
                    <Button onClick={onApprove}>Send Invoice</Button>
                    <Button emphasis="secondary" onClick={onApprove}>Mark As Sent</Button>
                  </>
                ) : (
                  <Button icon="plus">Record Payment</Button>
                )}
              </Inline>
            </Inline>
          </>
        )}
      </Stack>
    </Surface>
  );
}

/**
 * One "• Label : Value ›" line. The chevron says the figure opens somewhere.
 * `highlight` sets the order's advance apart from the customer's own balances —
 * `link`, the blue that passes at 13px, and medium.
 */
function Credit({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <Inline gap={3} align="center">
      <Text tone={highlight ? 'link' : 'secondary'} aria-hidden>•</Text>
      <Text tone={highlight ? 'link' : 'default'} weight={highlight ? 'medium' : 'regular'}>
        {label} : <Text as="span" weight="semibold" className="tabular-nums">{value}</Text>
      </Text>
      <Icon name="chevron-right" size="sm" tone="primary" />
    </Inline>
  );
}

/* ── THE INVOICE'S FIELDS ──────────────────────────────────────────────────── */

/**
 * The record in the reference's shape — the sales order details page's, so an
 * order and the invoice raised from it read the same way.
 *
 * A seeded invoice has no lines of its own, so it shows one line for its whole
 * amount rather than an empty table under a non-zero total.
 */
function InvoiceFields({ invoice }: { invoice: Invoice }) {
  const customer = CUSTOMER_INFO[invoice.customer];
  const rows: Line[] = (invoice.lines ?? [{ item: 'Services', qty: 1, rate: invoice.amount }])
    .map((l, i) => ({ ...l, id: String(i), n: i + 1 }));
  const sub = rows.reduce((s, l) => s + lineAmount(l), 0);
  const applied = invoice.advanceApplied ?? 0;
  const paid = Math.max(0, invoice.amount - applied - invoice.balance);

  const totals: [string, string, boolean?][] = [
    ['Sub Total', amount.format(sub)],
    ...(invoice.shipping ? [['Shipping Charges', amount.format(invoice.shipping)] as [string, string]] : []),
    ['Total', amount.format(invoice.amount), true],
    ...(applied ? [[`Advance Applied (${invoice.order})`, `(−) ${amount.format(applied)}`] as [string, string]] : []),
    ...(paid ? [['Payments Made', `(−) ${amount.format(paid)}`] as [string, string]] : []),
    ['Balance Due', amount.format(invoice.balance), true],
  ];

  return (
    <Stack gap={16} className="p-15">
      <Stack gap={4}>
        <Inline gap={5} align="center" wrap>
          <Text as="h2" size="title">{invoice.number}</Text>
          <StatusBadge status={STATUS_TONE[invoice.status]} emphasis="solid">{invoice.statusLabel}</StatusBadge>
        </Inline>
        <Inline gap={4} align="center" wrap>
          <Text tone="secondary">
            Total : <Text as="span" weight="semibold" className="tabular-nums">{amount.format(invoice.amount)}</Text>
          </Text>
          <Text tone="tertiary" aria-hidden>•</Text>
          <Text tone="secondary">
            Balance Due : <Text as="span" weight="semibold" className="tabular-nums">{amount.format(invoice.balance)}</Text>
          </Text>
        </Inline>
      </Stack>

      <Inline gap={16} align="start" wrap>
        <DescriptionList className="flex-1 min-w-0" items={[
          { label: 'Invoice Number', value: invoice.number },
          { label: 'Invoice Date', value: date(invoice.date) },
          { label: 'Status', value: invoice.statusLabel },
          { label: 'Place of Supply', value: customer?.placeOfSupply ?? '—' },
          { label: 'PDF Template', value: 'Spreadsheet Template' },
        ]} />
        <DescriptionList className="flex-1 min-w-0" items={[
          { label: 'Creation Date', value: date(invoice.date) },
          { label: 'Due Date', value: (
            <Text as="span" tone={invoice.status === 'Overdue' ? 'danger' : 'default'}>{date(invoice.dueDate)}</Text>
          ) },
          { label: 'Sales Order#', value: <Text as="span" tone="link">{invoice.order}</Text> },
          { label: 'Payment Gateways', value: 'Razorpay' },
          { label: 'Payment Terms', value: invoice.paymentTerms ?? 'Due on Receipt' },
        ]} />
      </Inline>

      <Stack gap={8}>
        <Text as="h3" size="heading">Customer Details</Text>
        <Inline gap={16} align="start" wrap>
          <DescriptionList className="flex-1 min-w-0" items={[
            {
              label: 'Name',
              value: (
                <Inline gap={4} align="center">
                  <Avatar name={invoice.customer} size="sm" />
                  <Text as="span" weight="medium">{invoice.customer}</Text>
                </Inline>
              ),
            },
            { label: 'Billing Address', value: <Address value={customer?.billing ?? []} /> },
          ]} />
          <DescriptionList className="flex-1 min-w-0" items={[
            { label: 'Shipping Address', value: <Address value={customer?.shipping ?? []} /> },
          ]} />
        </Inline>
      </Stack>

      <Stack gap={8}>
        <Text as="h3" size="heading">{`Items (${rows.length})`}</Text>
        <Table<Line>
          caption={`Items on ${invoice.number}`}
          placement="card"
          columns={LINE_COLUMNS}
          rows={rows}
          rowKey={(r) => r.id}
        />
        <Stack gap={4} className="ms-auto w-1/3 min-w-pt-totals-min">
          {totals.map(([label, value, bold]) => (
            <Fragment key={label}>
              <Inline gap={8} justify="between">
                <Text tone={bold ? 'default' : 'secondary'} weight={bold ? 'semibold' : 'regular'}>{label}</Text>
                <Text weight={bold ? 'semibold' : 'regular'} className="tabular-nums">{value}</Text>
              </Inline>
              {label === 'Total' ? <Divider /> : null}
            </Fragment>
          ))}
        </Stack>
      </Stack>

      <Stack gap={4}>
        <Text as="h3" size="heading">Notes</Text>
        <Text>{invoice.notes || 'Thank you for the payment. You just made our day.'}</Text>
      </Stack>
    </Stack>
  );
}
