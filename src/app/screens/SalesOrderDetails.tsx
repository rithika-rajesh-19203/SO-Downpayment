import { useMemo, useRef, useState } from 'react';
import {
  Avatar, Banner, Button, DescriptionList, DetailsToolbar, Divider, FormRow, Icon, Inline,
  InputField, Menu, MiniList, Modal, PageHeader, Select, SplitView, StatusBadge, Stack,
  Surface, Table, Tabs, Text,
} from '@canon';
import type {
  DetailsToolbarGroup, MenuEntry, MiniListItem, StatusBadgeStatus, TableColumn,
} from '@canon';
import {
  COLLECT_BEFORE, DEPOSIT_ACCOUNTS, PAYMENT_MODES, advanceDue, received,
} from '../data/sales-orders';
import type { AdvancePayment, OrderInvoice, OrderLine, SalesOrder } from '../data/sales-orders';

/**
 * SALES → SALES ORDERS → one order. The split view, composed exactly as
 * `InvoiceDetails` is — mini list, detail header, toolbar, then the record's
 * own sections.
 *
 * Three sections, top to bottom:
 *
 * 1. **What's next** — the one step this order is waiting on, with the button
 *    that takes it. It is derived from the order's state on every render rather
 *    than stored, so it cannot say "record the advance" about an order whose
 *    advance has already arrived.
 * 2. **The summary** — who, how much, which state.
 * 3. **Related records**, tabbed: `Invoices` and `SO Advance`. The advance tab
 *    is a sibling of the invoices tab because it is the same kind of thing — a
 *    list of documents raised against this order — and not a view of the order.
 */

const STATUS_TONE: Record<SalesOrder['status'], StatusBadgeStatus> = {
  Draft: 'draft',
  'Awaiting Advance': 'pending',
  Confirmed: 'approved',
  Invoiced: 'success',
};

const PAYMENT_TONE: Record<AdvancePayment['status'], StatusBadgeStatus> = {
  Received: 'success',
  Applied: 'accepted',
};

const INVOICE_TONE: Record<OrderInvoice['status'], StatusBadgeStatus> = {
  Sent: 'pending',
  'Partially Paid': 'in-progress',
  Paid: 'success',
};

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2,
});
const day = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
const date = (iso: string) => day.format(new Date(iso));
const round = (n: number) => Math.round(n * 100) / 100;

const TOOLBAR: DetailsToolbarGroup[] = [
  {
    id: 'document', label: 'Document actions',
    items: [
      { id: 'edit', label: 'Edit', icon: 'edit', onSelect: () => {} },
      { id: 'send', label: 'Send Email', icon: 'mail', onSelect: () => {} },
      { id: 'pdf', label: 'PDF/Print', icon: 'pdf', menu: true, onSelect: () => {} },
    ],
  },
];

/** How the advance was asked for, in words: "25% before confirming the order". */
function termsLabel(o: SalesOrder) {
  if (!o.advance) return 'Not requested';
  const what = o.advance.type === 'percent'
    ? `${o.advance.value}% (${money.format(o.advance.amount)})`
    : money.format(o.advance.amount);
  return `${what} before ${COLLECT_BEFORE[o.advance.collectBefore].toLowerCase()}`;
}

type Step = {
  message: string;
  primary?: { label: string; icon?: 'plus' | 'share' | 'documents' | 'check'; action: Action };
  secondary?: { label: string; icon?: 'plus' | 'share' | 'documents' | 'check'; action: Action };
};
type Action = 'record' | 'invoice' | 'send' | 'link' | 'none';

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
        ? `${money.format(got)} of the ${money.format(o.advance.amount)} advance is received. Record the remaining ${money.format(due)} to confirm this order.`
        : `This order needs an advance of ${money.format(o.advance.amount)} before ${COLLECT_BEFORE[o.advance.collectBefore].toLowerCase()}. Record the payment once the customer pays, or send them a payment link.`,
      primary: { label: 'Record Advance Payment', icon: 'plus', action: 'record' },
      secondary: { label: 'Share Payment Link', icon: 'share', action: 'link' },
    };
  }
  if (o.advance) {
    return {
      message: `The advance of ${money.format(got)} is received. Convert this order to an invoice and the advance is applied to it automatically.`,
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
}

export function SalesOrderDetails({ orders, orderId, onSelect, onChange, onCreate, onBack }: SalesOrderDetailsProps) {
  const items: MiniListItem[] = useMemo(() => orders.map((o) => ({
    id: o.id,
    name: o.customer,
    amount: money.format(o.total),
    meta: [o.number, date(o.date)],
    status: o.status.toUpperCase(),
    statusVariant: STATUS_TONE[o.status],
  })), [orders]);

  const order = orders.find((o) => o.id === orderId) ?? orders[0];
  //  Numbers are document-wide, so they are counted across every order.
  const advanceCount = orders.reduce((n, o) => n + o.payments.length, 0);
  const invoiceCount = orders.reduce((n, o) => n + o.invoices.length, 0);

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
            { id: 'advance', label: 'Awaiting Advance' },
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
        nextInvoice={`INV-${String(138 + invoiceCount).padStart(6, '0')}`}
        onChange={onChange}
        onBack={onBack}
      />
    </SplitView>
  );
}

interface OrderRecordProps {
  order: SalesOrder;
  nextAdvance: string;
  nextInvoice: string;
  onChange: (order: SalesOrder) => void;
  onBack: () => void;
}

function OrderRecord({ order, nextAdvance, nextInvoice, onChange, onBack }: OrderRecordProps) {
  const moreRef = useRef<HTMLButtonElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [tab, setTab] = useState(order.advance || order.payments.length ? 'advance' : 'invoices');
  const [recording, setRecording] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const due = advanceDue(order);
  const got = received(order);
  const step = nextStep(order);

  const convert = () => {
    const applied = round(got);
    const balance = round(order.total - applied);
    const invoice: OrderInvoice = {
      id: `inv-${Date.now()}`, number: nextInvoice,
      date: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 15 * 864e5).toISOString().slice(0, 10),
      amount: order.total, advanceApplied: applied, balance,
      status: balance <= 0 ? 'Paid' : applied > 0 ? 'Partially Paid' : 'Sent',
    };
    onChange({
      ...order,
      status: 'Invoiced',
      invoices: [...order.invoices, invoice],
      payments: order.payments.map((p) => ({ ...p, status: 'Applied', appliedTo: invoice.number })),
    });
    setTab('invoices');
    setNotice(applied > 0
      ? `${invoice.number} created. The ${money.format(applied)} advance was applied to it.`
      : `${invoice.number} created.`);
  };

  const run = (a: Action) => {
    if (a === 'record') setRecording(true);
    else if (a === 'invoice') convert();
    else if (a === 'send') {
      onChange({ ...order, status: order.advance && due > 0 ? 'Awaiting Advance' : 'Confirmed' });
    } else if (a === 'link') setNotice(`Payment link for ${money.format(due)} copied to the clipboard.`);
  };

  const record = (p: AdvancePayment) => {
    const payments = [...order.payments, p];
    const paid = payments.reduce((s, x) => s + x.amount, 0);
    onChange({
      ...order,
      payments,
      //  The advance arriving in full is what confirms an order that was waiting
      //  on it — NetSuite releases the hold on the same condition.
      status: order.status === 'Awaiting Advance' && paid >= (order.advance?.amount ?? 0)
        ? 'Confirmed' : order.status,
    });
    setRecording(false);
    setTab('advance');
    setNotice(`Advance payment ${p.number} of ${money.format(p.amount)} recorded.`);
  };

  const invoiced = order.invoices.length > 0;
  const MORE: MenuEntry[] = [
    { id: 'record', label: 'Record Advance Payment', icon: 'bank', disabled: invoiced, onSelect: () => run('record') },
    { id: 'invoice', label: 'Convert to Invoice', icon: 'documents', disabled: invoiced, onSelect: () => run('invoice') },
    { separator: true },
    { id: 'clone', label: 'Clone', icon: 'clone', onSelect: () => {} },
    { id: 'delete', label: 'Delete', icon: 'delete', tone: 'danger', onSelect: () => {} },
  ];

  return (
    <>
      <PageHeader type="detail" title={order.number} parent={{ label: `Location: ${order.location}`, href: '#' }} onBack={onBack} />
      <DetailsToolbar
        groups={TOOLBAR}
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

          {/* ── SUMMARY ─────────────────────────────────────────────────────── */}
          <Surface pad={10} radius="card" border="default">
            <Inline gap={8} align="center" wrap>
              <Avatar name={order.customer} size="md" />
              <Stack gap={2} className="min-w-0 flex-1">
                <Text size="heading" truncate>{order.customer}</Text>
                <Text size="body-sm" tone="secondary">
                  {order.advance
                    ? `Advance ${money.format(got)} of ${money.format(order.advance.amount)} received`
                    : 'No advance requested'}
                </Text>
              </Stack>
              <Stack gap={2} align="end" className="flex-none">
                <Text size="title" weight="semibold" className="tabular-nums">{money.format(order.total)}</Text>
                <Text size="body-sm" tone="secondary">Order total</Text>
              </Stack>
              <StatusBadge status={STATUS_TONE[order.status]}>{order.status}</StatusBadge>
            </Inline>
          </Surface>

          {/* ── RELATED RECORDS ─────────────────────────────────────────────── */}
          <Surface pad={0} radius="card" border="default" className="overflow-hidden">
            <Tabs
              items={[
                { id: 'invoices', label: 'Invoices', badge: String(order.invoices.length) },
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
                    empty={(
                      <Stack gap={4} align="center" className="p-10">
                        <Text tone="secondary">No invoices yet.</Text>
                        {!invoiced ? (
                          <Button emphasis="secondary" size="sm" icon="documents" onClick={() => run('invoice')}>
                            Convert to Invoice
                          </Button>
                        ) : null}
                      </Stack>
                    )}
                  />
                </Stack>
              ) : (
                <Stack gap={8} className="p-15">
                  {order.advance ? (
                    <Surface tone="sunken" pad={8} radius="md" border="divider">
                      <Inline gap={10} align="start" wrap>
                        <Figure label="Advance requested" value={money.format(order.advance.amount)}
                          note={order.advance.type === 'percent' ? `${order.advance.value}% of the order` : 'Fixed amount'} />
                        <Figure label="Received" value={money.format(got)} tone={got > 0 ? 'success' : 'default'} />
                        <Figure label={invoiced ? 'Applied to invoice' : 'Balance due'}
                          value={money.format(invoiced ? got : due)} tone={!invoiced && due > 0 ? 'warning' : 'default'} />
                      </Inline>
                    </Surface>
                  ) : null}
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
          <Surface pad={10} radius="card" border="default">
            <Stack gap={10}>
              <Text as="h2" size="subheading">Sales Order Details</Text>
              <DescriptionList items={[
                { label: 'Sales Order#', value: order.number },
                { label: 'Reference#', value: order.reference || '—' },
                { label: 'Order Date', value: date(order.date) },
                { label: 'Expected Shipment', value: order.shipmentDate ? date(order.shipmentDate) : '—' },
                { label: 'Payment Terms', value: order.paymentTerms },
                { label: 'Advance Payment', value: termsLabel(order) },
              ]} />
              <Table<OrderLine & { id: string }>
                caption={`Items on ${order.number}`}
                placement="card"
                columns={LINE_COLUMNS}
                rows={order.lines.map((l, i) => ({ ...l, id: String(i) }))}
                rowKey={(r) => r.id}
              />
              <Divider />
              <Inline gap={4} justify="end">
                <Text tone="secondary">Total</Text>
                <Text weight="semibold" className="tabular-nums">{money.format(order.total)}</Text>
              </Inline>
            </Stack>
          </Surface>
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

const LINE_COLUMNS: TableColumn<OrderLine & { id: string }>[] = [
  { id: 'item', header: 'Item', cell: (r) => r.item },
  { id: 'qty', header: 'Qty', align: 'end', cell: (r) => r.qty },
  { id: 'rate', header: 'Rate', align: 'end', cell: (r) => money.format(r.rate) },
  { id: 'amount', header: 'Amount', align: 'end', cell: (r) => money.format(r.qty * r.rate) },
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
