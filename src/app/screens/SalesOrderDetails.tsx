import { useMemo, useRef, useState } from 'react';
import {
  Avatar, Banner, Button, DescriptionList, DetailsToolbar, FormRow, Icon, Inline,
  InputField, Menu, MiniList, Modal, PageHeader, Select, SplitView, StatusBadge, Stack,
  Segmented, Surface, Table, Tabs, Text,
} from '@canon';
import type {
  DetailsToolbarGroup, MenuEntry, MiniListItem, StatusBadgeStatus, TableColumn,
} from '@canon';
import {
  DEPOSIT_ACCOUNTS, PAYMENT_MODES, advanceDue, advanceStatus, applyAdvancePayment, received,
} from '../data/sales-orders';
import type { AdvancePayment, OrderInvoice, SalesOrder } from '../data/sales-orders';
import {
  ADVANCE_TONE, Address, LINE_COLUMNS, OrderPdf, OrderTotals, STATUS_TONE, customerOf, date, day, lines, money, round, termsLabel,
} from './SalesOrderDocument';
import type { Line } from './SalesOrderDocument';

/**
 * SALES → SALES ORDERS → one order. The split view, composed exactly as
 * `InvoiceDetails` is — mini list, detail header, toolbar, then the record's
 * own sections.
 *
 * Top to bottom:
 *
 * 1. **What's next** — the one step this order is waiting on, with the button
 *    that takes it. It is derived from the order's state on every render rather
 *    than stored, so it cannot say "record the advance" about an order whose
 *    advance has already arrived.
 * 2. **Related records**, tabbed: `SO Advance`, and `Invoices` once one has
 *    been raised — an empty tab is a destination with nothing at it. They are
 *    siblings because they are the same kind of thing: documents raised against
 *    this order, not views of it.
 * 3. **The order itself** — its fields and lines.
 */

const PAYMENT_TONE: Record<AdvancePayment['status'], StatusBadgeStatus> = {
  Received: 'success',
  Applied: 'accepted',
};

const INVOICE_TONE: Record<OrderInvoice['status'], StatusBadgeStatus> = {
  Draft: 'draft',
  Sent: 'pending',
  'Partially Paid': 'in-progress',
  Paid: 'success',
};

/**
 * The bar. **Customer Portal** is a prototyping affordance — it opens the
 * portal as this order's customer, so the advance can be paid from their side
 * and the result read back here.
 *
 * **Convert to Invoice** sits beside it, on the bar rather than behind the `⋯`:
 * it is the order's way forward, not a rare action. A fifth item, past the
 * usual four, by request. It stays visible but `aria-disabled` while it cannot
 * run — see `canConvert` — so the action does not appear to vanish.
 */
const toolbar = (onPortal: () => void, onConvert: () => void, blocked: boolean): DetailsToolbarGroup[] => [
  {
    id: 'document', label: 'Document actions',
    items: [
      { id: 'edit', label: 'Edit', icon: 'edit', onSelect: () => {} },
      { id: 'send', label: 'Send Email', icon: 'mail', onSelect: () => {} },
      { id: 'pdf', label: 'PDF/Print', icon: 'pdf', menu: true, onSelect: () => {} },
      { id: 'portal', label: 'Customer Portal', icon: 'share', onSelect: onPortal },
      { id: 'invoice', label: 'Convert to Invoice', icon: 'documents', disabled: blocked, onSelect: onConvert },
    ],
  },
];

/**
 * An order can be invoiced once, and — if it asked for an advance — only once
 * the WHOLE advance is in. A part-paid advance would otherwise be applied to an
 * invoice that still expects the rest of it upfront.
 */
const canConvert = (o: SalesOrder) => !o.invoices.length && (!o.advance || advanceDue(o) <= 0);

type Step = {
  message: string;
  primary?: { label: string; icon?: 'plus' | 'share' | 'documents' | 'check'; action: Action };
  secondary?: { label: string; icon?: 'plus' | 'share' | 'documents' | 'check'; action: Action };
};
type Action = 'record' | 'invoice' | 'send' | 'none';

/**
 * THE ORDER'S NEXT STEP. One function, so every state an order can be in has
 * exactly one answer and the card can never show two primaries.
 */
function nextStep(o: SalesOrder): Step {
  const due = advanceDue(o);
  const got = received(o);
  const inv = o.invoices[o.invoices.length - 1];

  if (o.status === 'Draft') {
    return {
      message: o.advance
        ? `Send this sales order to ${o.customer} so they can pay the ${money.format(o.advance.amount)} advance.`
        : `Send this sales order to ${o.customer} to confirm it.`,
      primary: { label: 'Mark as Confirmed', icon: 'check', action: 'send' },
    };
  }
  if (inv) {
    return inv.balance > 0
      ? {
        message: `${inv.number} has ${money.format(inv.balance)} left to collect after the ${money.format(inv.advanceApplied)} advance was applied. Record the payment to close this order.`,
        primary: { label: 'Record Payment', icon: 'plus', action: 'none' },
      }
      : { message: `This order is invoiced and fully paid. Create a shipment to deliver it.`, primary: { label: 'Create Shipment', action: 'none' } };
  }
  if (o.advance && due > 0) {
    return {
      message: got > 0
        ? `${money.format(got)} of the ${money.format(o.advance.amount)} advance is received. Record the remaining ${money.format(due)} when the customer pays it.`
        : `An advance of ${money.format(o.advance.amount)} is due on this order. Record the payment once the customer pays.`,
      primary: { label: 'Record Advance Payment', icon: 'plus', action: 'record' },
    };
  }
  if (o.advance) {
    return {
      message: `The advance of ${money.format(got)} is received. Convert this order to an invoice and the advance is applied to it when you save the invoice.`,
      primary: { label: 'Convert to Invoice', icon: 'documents', action: 'invoice' },
    };
  }
  return {
    message: 'Convert this order to an invoice, or record an advance payment if the customer is paying part of it upfront.',
    primary: { label: 'Convert to Invoice', icon: 'documents', action: 'invoice' },
    secondary: { label: 'Record Advance Payment', icon: 'plus', action: 'record' },
  };
}

export interface SalesOrderDetailsProps {
  orders: SalesOrder[];
  orderId: string;
  onSelect: (id: string) => void;
  onChange: (order: SalesOrder) => void;
  onCreate: () => void;
  onBack: () => void;
  /** Open the customer portal on this order — the prototype's bridge. */
  onOpenPortal: (orderId: string) => void;
  /** Open the New Invoice page filled from this order. */
  onConvert: (orderId: string) => void;
  /** What to say when the details open — set on the way back from a conversion. */
  notice?: { orderId: string; message: string } | null;
}

export function SalesOrderDetails({
  orders, orderId, onSelect, onChange, onCreate, onBack, onOpenPortal, onConvert, notice,
}: SalesOrderDetailsProps) {
  const items: MiniListItem[] = useMemo(() => orders.map((o) => ({
    id: o.id,
    name: o.customer,
    amount: money.format(o.total),
    //  The advance rides as a third fact, beside the order's own status — the
    //  order is Confirmed, its advance may still be due.
    meta: [o.number, date(o.date), ...(advanceStatus(o) && advanceStatus(o) !== 'Paid' ? [`Advance ${advanceStatus(o)?.toLowerCase()}`] : [])],
    status: o.status.toUpperCase(),
    statusVariant: STATUS_TONE[o.status],
  })), [orders]);

  const order = orders.find((o) => o.id === orderId) ?? orders[0];
  //  Numbers are document-wide, so they are counted across every order.
  const advanceCount = orders.reduce((n, o) => n + o.payments.length, 0);

  return (
    <SplitView
      list={(
        <MiniList
          label="Sales Orders"
          items={items}
          activeId={order.id}
          onActivate={onSelect}
          views={[
            { id: 'all', label: 'All Sales Orders' },
            { id: 'advance', label: 'Advance Due' },
          ]}
          viewId="all"
          onViewChange={() => {}}
          onCreate={onCreate}
        />
      )}
    >
      {/* Keyed by the order, so the open tab, the modal and the banner belong to
          ONE order and do not follow the user to the next one they click. */}
      <OrderRecord
        key={order.id}
        order={order}
        nextAdvance={`ADV-${String(15 + advanceCount).padStart(5, '0')}`}
        notice={order.id === notice?.orderId ? notice.message : null}
        onConvert={() => onConvert(order.id)}
        onChange={onChange}
        onBack={onBack}
        onOpenPortal={() => onOpenPortal(order.id)}
      />
    </SplitView>
  );
}

interface OrderRecordProps {
  order: SalesOrder;
  nextAdvance: string;
  /** A message to open with — the invoice just raised from this order. */
  notice?: string | null;
  /** Opens the New Invoice page filled from this order. */
  onConvert: () => void;
  onChange: (order: SalesOrder) => void;
  onBack: () => void;
  onOpenPortal: () => void;
}

function OrderRecord({ order, nextAdvance, notice: flash, onChange, onBack, onOpenPortal, onConvert }: OrderRecordProps) {
  const moreRef = useRef<HTMLButtonElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  //  Back from Convert to Invoice, the invoice just raised is what to read.
  const [picked, setPicked] = useState(flash || (order.invoices.length && !order.advance) ? 'invoices' : 'advance');
  //  The Invoices tab exists only once there is an invoice, so a remembered
  //  'invoices' falls back to the one tab that is always there.
  const tab = picked === 'invoices' && !order.invoices.length ? 'advance' : picked;
  const setTab = setPicked;
  const [recording, setRecording] = useState(false);
  const [notice, setNotice] = useState<string | null>(flash ?? null);

  const step = nextStep(order);

  const run = (a: Action) => {
    if (a === 'record') setRecording(true);
    else if (a === 'invoice') onConvert();
    else if (a === 'send') {
      onChange({ ...order, status: 'Confirmed' });
    }
  };

  const record = (p: AdvancePayment) => {
    onChange(applyAdvancePayment(order, p));
    setRecording(false);
    setTab('advance');
    setNotice(`Advance payment ${p.number} of ${money.format(p.amount)} recorded.`);
  };

  const invoiced = order.invoices.length > 0;
  const MORE: MenuEntry[] = [
    { id: 'record', label: 'Record Advance Payment', icon: 'bank', disabled: invoiced, onSelect: () => run('record') },
    { separator: true },
    { id: 'clone', label: 'Clone', icon: 'clone', onSelect: () => {} },
    { id: 'delete', label: 'Delete', icon: 'delete', tone: 'danger', onSelect: () => {} },
  ];

  return (
    <>
      <PageHeader type="detail" title={order.number} parent={{ label: `Location: ${order.location}`, href: '#' }} onBack={onBack} />
      <DetailsToolbar
        groups={toolbar(onOpenPortal, () => run('invoice'), !canConvert(order))}
        overflow={{ ref: moreRef, expanded: moreOpen, onSelect: () => setMoreOpen((o) => !o) }}
      />
      <Menu
        anchor={moreRef.current}
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        label="More actions for this sales order"
        align="start"
        emphasis="strong"
        entries={MORE}
      />

      <Surface tone="canvas" pad={0} radius="none" className="flex-1 min-h-0 overflow-y-auto">
        <Stack gap={8} className="p-10">
          {notice ? <Banner tone="success" onDismiss={() => setNotice(null)}>{notice}</Banner> : null}

          {/* ── WHAT'S NEXT ─────────────────────────────────────────────────── */}
          <Surface pad={10} radius="card" border="default">
            <Stack gap={5}>
              <Inline gap={3} align="center">
                <Icon name="sparkle" size="md" tone="primary" />
                <Text as="h2" size="overline">What's next?</Text>
              </Inline>
              <Inline gap={10} align="center" wrap>
                <Text className="flex-1 min-w-0">{step.message}</Text>
                <Inline gap={4} align="center" className="flex-none">
                  {step.secondary ? (
                    <Button emphasis="secondary" icon={step.secondary.icon} onClick={() => run(step.secondary!.action)}>
                      {step.secondary.label}
                    </Button>
                  ) : null}
                  {step.primary ? (
                    <Button icon={step.primary.icon} onClick={() => run(step.primary!.action)}>
                      {step.primary.label}
                    </Button>
                  ) : null}
                </Inline>
              </Inline>
            </Stack>
          </Surface>

          {/* ── RELATED RECORDS ─────────────────────────────────────────────── */}
          <Surface pad={0} radius="card" border="default" className="overflow-hidden">
            <Tabs
              items={[
                ...(order.invoices.length
                  ? [{ id: 'invoices', label: 'Invoices', badge: String(order.invoices.length) }]
                  : []),
                { id: 'advance', label: 'SO Advance', badge: String(order.payments.length) },
              ]}
              value={tab}
              onChange={setTab}
              label="Records raised against this sales order"
            >
              {tab === 'invoices' ? (
                <Stack gap={8} className="p-15">
                  <Table<OrderInvoice>
                    caption={`Invoices for ${order.number}`}
                    placement="card"
                    columns={INVOICE_COLUMNS}
                    rows={order.invoices}
                    rowKey={(r) => r.id}
                  />
                </Stack>
              ) : (
                <Stack gap={8} className="p-15">
                  <Table<AdvancePayment>
                    caption={`Advance payments for ${order.number}`}
                    placement="card"
                    columns={ADVANCE_COLUMNS}
                    rows={order.payments}
                    rowKey={(r) => r.id}
                    empty={(
                      <Stack gap={4} align="center" className="p-10">
                        <Text tone="secondary">
                          {order.advance
                            ? 'No advance has been received for this order yet.'
                            : 'No advance was requested on this order.'}
                        </Text>
                        {!invoiced ? (
                          <Button emphasis="secondary" size="sm" icon="plus" onClick={() => setRecording(true)}>
                            Record Advance Payment
                          </Button>
                        ) : null}
                      </Stack>
                    )}
                  />
                </Stack>
              )}
            </Tabs>
          </Surface>

          {/* ── THE ORDER ───────────────────────────────────────────────────── */}
          <OrderDocument order={order} />
        </Stack>
      </Surface>

      {recording ? (
        <RecordAdvance
          order={order}
          number={nextAdvance}
          onCancel={() => setRecording(false)}
          onRecord={record}
        />
      ) : null}
    </>
  );
}

function Figure({ label, value, note, tone = 'default' }: {
  label: string; value: string; note?: string; tone?: 'default' | 'success' | 'warning';
}) {
  return (
    <Stack gap={1} className="flex-1 min-w-0">
      <Text size="body-sm" tone="secondary">{label}</Text>
      <Text size="heading" tone={tone} className="tabular-nums">{value}</Text>
      {note ? <Text size="caption" tone="tertiary">{note}</Text> : null}
    </Stack>
  );
}

const INVOICE_COLUMNS: TableColumn<OrderInvoice>[] = [
  { id: 'date', header: 'Date', cell: (r) => date(r.date) },
  { id: 'number', header: 'Invoice#', cell: (r) => <Text as="span" tone="link">{r.number}</Text> },
  { id: 'status', header: 'Status', cell: (r) => <StatusBadge status={INVOICE_TONE[r.status]}>{r.status}</StatusBadge> },
  { id: 'due', header: 'Due Date', cell: (r) => date(r.dueDate) },
  { id: 'amount', header: 'Amount', align: 'end', cell: (r) => money.format(r.amount) },
  { id: 'advance', header: 'Advance Applied', align: 'end', cell: (r) => money.format(r.advanceApplied) },
  { id: 'balance', header: 'Balance Due', align: 'end', cell: (r) => money.format(r.balance) },
];

const ADVANCE_COLUMNS: TableColumn<AdvancePayment>[] = [
  { id: 'date', header: 'Date', cell: (r) => date(r.date) },
  { id: 'number', header: 'Payment#', cell: (r) => <Text as="span" tone="link">{r.number}</Text> },
  { id: 'mode', header: 'Mode', cell: (r) => r.mode },
  { id: 'reference', header: 'Reference#', cell: (r) => r.reference || '—' },
  { id: 'deposit', header: 'Deposited To', cell: (r) => r.depositTo },
  {
    id: 'status', header: 'Status',
    cell: (r) => (
      <StatusBadge status={PAYMENT_TONE[r.status]}>
        {r.status === 'Applied' && r.appliedTo ? `Applied to ${r.appliedTo}` : r.status}
      </StatusBadge>
    ),
  },
  { id: 'amount', header: 'Amount', align: 'end', cell: (r) => money.format(r.amount) },
];

/* ── RECORD ADVANCE PAYMENT ────────────────────────────────────────────────── */

interface RecordAdvanceProps {
  order: SalesOrder;
  number: string;
  onCancel: () => void;
  onRecord: (p: AdvancePayment) => void;
}

/**
 * Prefilled with what is still due, because that is what the customer was
 * asked for and the usual case is that they paid it. More than the due amount is
 * accepted — NetSuite keeps the excess as a further deposit — and the line under
 * the field says so rather than refusing it.
 */
function RecordAdvance({ order, number, onCancel, onRecord }: RecordAdvanceProps) {
  const due = advanceDue(order);
  const today = day.format(new Date());
  const [v, setV] = useState<Record<string, string>>({
    amount: due > 0 ? due.toFixed(2) : '', date: today, mode: 'Bank Transfer', depositTo: 'HDFC Current A/c', reference: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const amount = Number.parseFloat(v.amount) || 0;
  const error = submitted && amount <= 0 ? 'Enter the amount received' : undefined;
  const set = (k: string) => (next: string) => setV((s) => ({ ...s, [k]: next }));

  const submit = () => {
    setSubmitted(true);
    if (amount <= 0) { document.getElementById('adv-amount')?.focus(); return; }
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v.date.trim());
    onRecord({
      id: `adv-${Date.now()}`, number,
      date: m ? `${m[3]}-${m[2]}-${m[1]}` : new Date().toISOString().slice(0, 10),
      mode: v.mode, depositTo: v.depositTo, reference: v.reference,
      amount: round(amount), status: 'Received',
    });
  };

  return (
    <Modal
      open
      title="Record Advance Payment"
      width="md"
      onRequestClose={onCancel}
      primaryAction={{ label: 'Record Payment', onSelect: submit }}
      secondaryAction={{ label: 'Cancel', onSelect: onCancel }}
    >
      <Stack gap={10}>
        <Surface tone="sunken" pad={8} radius="md" border="divider">
          <Inline gap={10} align="start" wrap>
            <Figure label="Sales order" value={order.number} note={order.customer} />
            <Figure label="Advance requested" value={money.format(order.advance?.amount ?? 0)} />
            <Figure label="Due now" value={money.format(due)} tone={due > 0 ? 'warning' : 'default'} />
          </Inline>
        </Surface>

        <FormRow label="Amount Received" required id="adv-amount" error={error}>
          {({ id, required, error: invalid, describedBy }) => (
            <InputField id={id} value={v.amount} onChange={(e) => set('amount')(e.target.value)}
              format="decimal" placeholder="0.00" required={required} aria-required={required || undefined}
              error={invalid} aria-describedby={describedBy} />
          )}
        </FormRow>
        {order.advance && amount > due && due > 0 ? (
          <Text size="body-sm" tone="secondary">
            {money.format(round(amount - due))} more than the advance due. The excess is kept as an advance and applied to the invoice.
          </Text>
        ) : null}
        <FormRow label="Payment Date" required id="adv-date">
          {({ id }) => <InputField id={id} value={v.date} onChange={(e) => set('date')(e.target.value)} format="date" placeholder="DD/MM/YYYY" />}
        </FormRow>
        <FormRow label="Payment Mode" id="adv-mode">
          {({ id }) => <Select id={id} options={PAYMENT_MODES} value={v.mode} onChange={set('mode')} />}
        </FormRow>
        <FormRow label="Deposit To" id="adv-deposit">
          {({ id }) => <Select id={id} options={DEPOSIT_ACCOUNTS} value={v.depositTo} onChange={set('depositTo')} />}
        </FormRow>
        <FormRow label="Reference#" id="adv-ref">
          {({ id }) => <InputField id={id} value={v.reference} onChange={(e) => set('reference')(e.target.value)} placeholder="Transaction or cheque number" />}
        </FormRow>
      </Stack>
    </Modal>
  );
}

/* ── THE ORDER: DETAILS AND PDF ────────────────────────────────────────────── */

/**
 * The record itself, in the invoice details page's shape: tabs for WHAT to read
 * (the order's details, its activity) and a `Segmented` in the strip's trailing
 * slot for HOW to read it. Details and PDF are two renderings of one document,
 * which is why the switch is not a third tab — see `InvoiceDetails`.
 */
function OrderDocument({ order }: { order: SalesOrder }) {
  const [tab, setTab] = useState('details');
  const [view, setView] = useState('details');

  return (
    <Surface pad={0} radius="card" border="default" className="overflow-hidden">
      <Tabs
        items={[
          { id: 'details', label: 'Sales Order Details' },
          { id: 'activity', label: 'Activity' },
        ]}
        value={tab}
        onChange={setTab}
        label="Sales order views"
        trailing={(
          <Segmented
            label="View"
            size="sm"
            value={view}
            onChange={setView}
            options={[{ value: 'details', label: 'Details' }, { value: 'pdf', label: 'PDF' }]}
          />
        )}
      >
        {view === 'pdf' ? <OrderPdf order={order} />
          : tab === 'details' ? <OrderFields order={order} />
            : <OrderActivity order={order} />}
      </Tabs>
    </Surface>
  );
}

function OrderFields({ order }: { order: SalesOrder }) {
  const customer = customerOf(order);
  const due = advanceDue(order);

  return (
    <Stack gap={16} className="p-15">
      {/* The number and its state on one line, then the two figures that
          matter, in the reference's "Total : … • Balance Due : …" form. */}
      <Stack gap={4}>
        <Inline gap={5} align="center" wrap>
          <Text as="h2" size="title">{order.number}</Text>
          <StatusBadge status={STATUS_TONE[order.status]} emphasis="solid">{order.status}</StatusBadge>
          {advanceStatus(order) ? (
            <StatusBadge status={ADVANCE_TONE[advanceStatus(order)!]}>Advance {advanceStatus(order)}</StatusBadge>
          ) : null}
        </Inline>
        <Inline gap={4} align="center" wrap>
          <Text tone="secondary">
            Total : <Text as="span" weight="semibold" className="tabular-nums">{money.format(order.total)}</Text>
          </Text>
          {order.advance ? (
            <>
              <Text tone="tertiary" aria-hidden>•</Text>
              <Text tone="secondary">
                Advance Due : <Text as="span" weight="semibold" className="tabular-nums">{money.format(due)}</Text>
              </Text>
            </>
          ) : null}
        </Inline>
      </Stack>

      {/* Two columns of label/value pairs — two lists side by side rather than
          one list wrapped, so each column reads top to bottom. */}
      <Inline gap={16} align="start" wrap>
        <DescriptionList className="flex-1 min-w-0" items={[
          { label: 'Sales Order#', value: order.number },
          { label: 'Order Date', value: date(order.date) },
          { label: 'Status', value: order.status },
          { label: 'Place of Supply', value: customer.placeOfSupply },
        ]} />
        <DescriptionList className="flex-1 min-w-0" items={[
          { label: 'Reference#', value: order.reference || '—' },
          { label: 'Expected Shipment', value: order.shipmentDate ? date(order.shipmentDate) : '—' },
          { label: 'Payment Terms', value: order.paymentTerms },
          { label: 'Advance Payment', value: termsLabel(order) },
          ...(advanceStatus(order) ? [{
            label: 'Advance Status',
            value: <StatusBadge status={ADVANCE_TONE[advanceStatus(order)!]}>{advanceStatus(order)}</StatusBadge>,
          }] : []),
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
                  <Avatar name={order.customer} size="sm" />
                  <Text as="span" weight="medium">{order.customer}</Text>
                </Inline>
              ),
            },
            { label: 'Billing Address', value: <Address value={customer.billing} /> },
          ]} />
          <DescriptionList className="flex-1 min-w-0" items={[
            { label: 'GSTIN', value: customer.gstin ?? '—' },
            { label: 'Shipping Address', value: <Address value={customer.shipping} /> },
          ]} />
        </Inline>
      </Stack>

      <Stack gap={8}>
        <Text as="h3" size="heading">Items</Text>
        <Table<Line>
          caption={`Items on ${order.number}`}
          placement="card"
          columns={LINE_COLUMNS}
          rows={lines(order)}
          rowKey={(r) => r.id}
        />
        <OrderTotals order={order} />
      </Stack>
    </Stack>
  );
}

function OrderActivity({ order }: { order: SalesOrder }) {
  const events: [string, string][] = [
    [`Sales order ${order.number} created`, order.date],
    ...order.payments.map((p) => [`Advance ${p.number} of ${money.format(p.amount)} received via ${p.mode}`, p.date] as [string, string]),
    ...order.invoices.map((i) => [`Converted to invoice ${i.number}`, i.date] as [string, string]),
  ];
  return (
    <Stack gap={6} className="p-15">
      {events.map(([what, when]) => (
        <Inline key={what} gap={5} align="center">
          <Text as="span" className="flex-1 min-w-0">{what}</Text>
          <Text as="span" size="body-sm" tone="secondary" className="flex-none">{date(when)}</Text>
        </Inline>
      ))}
    </Stack>
  );
}
