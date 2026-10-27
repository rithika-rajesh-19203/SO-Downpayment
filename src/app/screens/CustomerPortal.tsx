import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  AppShell, Avatar, Banner, Button, DescriptionList, Divider, Icon, Inline, InputField, Nav,
  Stack, StatusBadge, Surface, Table, Tabs, Text, Textarea, Toggle,
} from '@canon';
import type { NavNode, TableColumn } from '@canon';
import { ORGANISATION, advanceDue, advanceStatus, applyAdvancePayment, received } from '../data/sales-orders';
import type { AdvancePayment, OrderInvoice, SalesOrder } from '../data/sales-orders';
import {
  ADVANCE_TONE, Address, LINE_COLUMNS, OrderPdf, OrderTotals, STATUS_TONE, customerOf, date, lines, money, round,
} from './SalesOrderDocument';
import type { Line } from './SalesOrderDocument';
import { PrototypeBar } from './PrototypeBar';

/**
 * THE CUSTOMER PORTAL — what the customer sees of the same orders, for
 * prototyping the advance from their side.
 *
 * It reads and writes the SAME order list as Books. Paying the advance here
 * calls `applyAdvancePayment`, the function Books' Record Advance Payment uses,
 * so going back to Books shows the payment on the order's SO Advance tab and the
 * What's Next card moved on.
 *
 * Two things the portal's real chrome has that the canon cannot draw yet, and
 * which are left out rather than faked: the signed-in user card above the nav,
 * and the hamburger in the org header. The customer's identity is in the
 * prototype strip across the top instead.
 */
export interface CustomerPortalProps {
  orders: SalesOrder[];
  /** Whose portal this is. Only their orders are listed. */
  customer: string;
  /** Open on this order, or on the list when null. */
  orderId: string | null;
  nextAdvance: string;
  onChange: (order: SalesOrder) => void;
  /** Back to Books — the prototype's way out, not a portal feature. */
  onExit: () => void;
}

const NAV: NavNode[] = [
  { id: 'items', label: 'Items', icon: 'items' },
  { id: 'quotes', label: 'Quotes', icon: 'documents' },
  { id: 'subscriptions', label: 'Subscriptions', icon: 'refresh' },
  { id: 'sales-orders', label: 'Sales Orders', icon: 'sales' },
  { id: 'proforma', label: 'Proforma Invoices', icon: 'documents' },
  { id: 'receipts', label: 'Sales Receipts', icon: 'items' },
  { id: 'invoices', label: 'Invoices', icon: 'documents' },
  { id: 'retainer', label: 'Retainer Invoices', icon: 'documents' },
  { id: 'credit-notes', label: 'Credit Notes', icon: 'create-credit-note' },
  { id: 'payments', label: 'Payments Made', icon: 'bank' },
  { id: 'projects', label: 'Projects', icon: 'build' },
  { id: 'timesheet', label: 'Timesheet', icon: 'timesheets' },
  { id: 'statements', label: 'Statements', icon: 'reports' },
];

/** What a customer reads the order's state as. The advance is a separate badge. */
const PORTAL_STATUS: Record<SalesOrder['status'], string> = {
  Draft: 'Draft',
  Confirmed: 'Confirmed',
  Invoiced: 'Invoiced',
};

export function CustomerPortal({ orders, customer, orderId, nextAdvance, onChange, onExit }: CustomerPortalProps) {
  const [section, setSection] = useState('sales-orders');
  const [openId, setOpenId] = useState<string | null>(orderId);
  const [collapsed, setCollapsed] = useState(false);

  //  A draft has not been sent, so the customer has never seen it.
  const mine = orders.filter((o) => o.customer === customer && o.status !== 'Draft');
  const open = mine.find((o) => o.id === openId) ?? null;

  return (
    <AppShell
      nav={(
        <Nav
          items={NAV}
          currentId={section}
          onNavigate={(id) => { setSection(id); setOpenId(null); }}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          product={{ name: ORGANISATION.name }}
          label="Customer portal"
        />
      )}
      topBar={(
        <PrototypeBar
          trailing={<Button emphasis="secondary" size="sm" icon="chevron-left" onClick={onExit}>Back to Zoho Books</Button>}
        >
          <Avatar name={customer} size="sm" />
          <Text as="span" tone="inherit">
            Customer portal preview · signed in as <Text as="span" weight="semibold" tone="inherit">{customer}</Text>
          </Text>
        </PrototypeBar>
      )}
    >
      {section !== 'sales-orders' ? (
        <Stack gap={4} align="center" justify="center" className="flex-1 p-20">
          <Text size="heading">Not part of this prototype</Text>
          <Text tone="secondary">Only Sales Orders is built in this portal preview.</Text>
        </Stack>
      ) : open ? (
        <PortalOrder
          key={open.id}
          order={open}
          nextAdvance={nextAdvance}
          onChange={onChange}
          onBack={() => setOpenId(null)}
        />
      ) : (
        <PortalOrders orders={mine} onOpen={setOpenId} />
      )}
    </AppShell>
  );
}

/* ── LAYOUT ────────────────────────────────────────────────────────────────── */

/**
 * The portal's page column: centred and capped, because a customer reads one
 * document at a time and a 1,600px-wide line of text is not read, it is
 * scanned and lost. `max-w-5xl` is Tailwind's container scale, which the canon
 * leaves intact — the same scale `max-w-4xl` elsewhere comes from.
 */
function Page({ children }: { children: ReactNode }) {
  return (
    <Stack gap={10} className="w-full max-w-5xl mx-auto px-10 py-12">
      {children}
    </Stack>
  );
}

/* ── THE LIST ──────────────────────────────────────────────────────────────── */

function PortalOrders({ orders, onOpen }: { orders: SalesOrder[]; onOpen: (id: string) => void }) {
  const [tab, setTab] = useState('not-invoiced');
  const rows = tab === 'all' ? orders : orders.filter((o) => !o.invoices.length);
  const awaiting = orders.filter((o) => advanceDue(o) > 0);

  const columns: TableColumn<SalesOrder>[] = [
    {
      id: 'number', header: 'Sales Order #',
      cell: (o) => <Text as="a" href="#" tone="link" weight="medium" onClick={() => onOpen(o.id)}>{o.number}</Text>,
    },
    { id: 'reference', header: 'Reference#', cell: (o) => o.reference || <Text as="span" tone="tertiary">—</Text> },
    { id: 'date', header: 'Date', cell: (o) => date(o.date) },
    { id: 'status', header: 'Status', cell: (o) => <StatusBadge status={STATUS_TONE[o.status]}>{PORTAL_STATUS[o.status]}</StatusBadge> },
    {
      //  The column the advance adds to this list: the one thing on it the
      //  customer has to DO something about.
      id: 'advance', header: 'Advance',
      cell: (o) => {
        if (!o.advance) return <Text as="span" tone="tertiary">—</Text>;
        const due = advanceDue(o);
        return due > 0
          ? <StatusBadge status="pending">{money.format(due)} due</StatusBadge>
          : <StatusBadge status="success">Paid</StatusBadge>;
      },
    },
    { id: 'total', header: 'Total', align: 'end', cell: (o) => <Text as="span" weight="semibold" className="tabular-nums">{money.format(o.total)}</Text> },
  ];

  return (
    <Page>
      <Stack gap={2}>
        <Text as="h1" size="title">Sales Orders</Text>
        <Text tone="secondary">Orders placed with {ORGANISATION.name}.</Text>
      </Stack>

      {/* The one thing on this page that needs the customer — said once, above
          the table, rather than only as a badge in one of its rows. */}
      {awaiting.length ? (
        <Banner tone="warning">
          <Inline gap={6} align="center" justify="between" className="flex-1 min-w-0" wrap>
            <Text as="span" tone="inherit">
              {awaiting.length === 1
                ? `${awaiting[0].number} is waiting for an advance payment of ${money.format(advanceDue(awaiting[0]))}.`
                : `${awaiting.length} sales orders are waiting for an advance payment.`}
            </Text>
            {awaiting.length === 1 ? (
              <Button size="sm" onClick={() => onOpen(awaiting[0].id)}>View & Pay</Button>
            ) : null}
          </Inline>
        </Banner>
      ) : null}

      <Surface pad={0} radius="card" border="default" className="overflow-hidden">
        <Tabs
          items={[
            { id: 'not-invoiced', label: 'Not Invoiced', badge: String(orders.filter((o) => !o.invoices.length).length) },
            { id: 'all', label: 'All Sales Orders', badge: String(orders.length) },
          ]}
          value={tab}
          onChange={setTab}
          label="Sales order views"
        >
          <Table<SalesOrder>
            caption="Your sales orders"
            placement="page"
            columns={columns}
            rows={rows}
            rowKey={(o) => o.id}
            empty={<Stack align="center" className="p-10"><Text tone="secondary">No sales orders here.</Text></Stack>}
          />
        </Tabs>
      </Surface>
    </Page>
  );
}

/* ── ONE ORDER ─────────────────────────────────────────────────────────────── */

const PAYMENT_COLUMNS: TableColumn<AdvancePayment>[] = [
  { id: 'date', header: 'Date', cell: (p) => date(p.date) },
  { id: 'number', header: 'Payment#', cell: (p) => p.number },
  { id: 'mode', header: 'Mode', cell: (p) => p.mode },
  { id: 'amount', header: 'Amount', align: 'end', cell: (p) => money.format(p.amount) },
];

const INVOICE_COLUMNS: TableColumn<OrderInvoice>[] = [
  { id: 'date', header: 'Date', cell: (i) => date(i.date) },
  { id: 'number', header: 'Invoice#', cell: (i) => <Text as="span" tone="link">{i.number}</Text> },
  { id: 'amount', header: 'Amount', align: 'end', cell: (i) => money.format(i.amount) },
  { id: 'advance', header: 'Advance Adjusted', align: 'end', cell: (i) => money.format(i.advanceApplied) },
  { id: 'balance', header: 'Balance Due', align: 'end', cell: (i) => money.format(i.balance) },
];

interface PortalOrderProps {
  order: SalesOrder;
  nextAdvance: string;
  onChange: (order: SalesOrder) => void;
  onBack: () => void;
}

function PortalOrder({ order, nextAdvance, onChange, onBack }: PortalOrderProps) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<string[]>([]);
  const [paying, setPaying] = useState(false);
  const [justPaid, setJustPaid] = useState<AdvancePayment | null>(null);
  const [pdf, setPdf] = useState(false);
  const [tab, setTab] = useState(order.advance ? 'payments' : 'invoices');

  const customer = customerOf(order);
  const due = advanceDue(order);
  const got = received(order);

  const pay = (p: AdvancePayment) => {
    onChange(applyAdvancePayment(order, p));
    setJustPaid(p);
    setPaying(false);
    setTab('payments');
  };

  if (paying) {
    return <PayAdvance order={order} number={nextAdvance} onCancel={() => setPaying(false)} onPay={pay} />;
  }

  return (
    <Page>
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <Stack gap={6}>
        <Inline gap={4} align="center" justify="between">
          <Button emphasis="secondary" size="sm" icon="chevron-left" onClick={onBack}>Sales Orders</Button>
          <Inline gap={4} align="center">
            <Button emphasis="secondary" size="sm" icon="export" onClick={() => setPdf(true)}>Download PDF</Button>
            <Button emphasis="secondary" size="sm" icon="more" label="More actions" onClick={() => {}} />
          </Inline>
        </Inline>
        <Inline gap={8} align="end" justify="between" wrap>
          <Stack gap={2}>
            <Inline gap={5} align="center">
              <Text as="h1" size="title">{order.number}</Text>
              <StatusBadge status={STATUS_TONE[order.status]}>{PORTAL_STATUS[order.status]}</StatusBadge>
              {advanceStatus(order) ? (
                <StatusBadge status={ADVANCE_TONE[advanceStatus(order)!]}>Advance {advanceStatus(order)}</StatusBadge>
              ) : null}
            </Inline>
            <Text tone="secondary">
              Sales Order · {date(order.date)}{order.reference ? ` · Ref ${order.reference}` : ''}
            </Text>
          </Stack>
          <Stack gap={1} align="end">
            <Text size="body-sm" tone="secondary">Order total</Text>
            <Text size="title" className="tabular-nums">{money.format(order.total)}</Text>
          </Stack>
        </Inline>
      </Stack>

      {/* ── COMMENTS ─────────────────────────────────────────────────────── */}
      <Surface pad={10} radius="card" border="default">
        <Stack gap={6}>
          <Text as="h2" size="subheading">Comments</Text>
          {comments.map((c, i) => (
            <Inline key={i} gap={4} align="start">
              <Avatar name={order.customer} size="sm" />
              <Stack gap={0} className="flex-1 min-w-0">
                <Text size="body-sm" weight="medium">{order.customer}</Text>
                <Text>{c}</Text>
              </Stack>
            </Inline>
          ))}
          <Textarea
            aria-label="Your comment"
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={`Write a comment for ${ORGANISATION.name}`}
          />
          <Inline justify="end">
            <Button
              emphasis="secondary"
              size="sm"
              disabled={!comment.trim()}
              onClick={() => { setComments((c) => [...c, comment.trim()]); setComment(''); }}
            >
              Add Comment
            </Button>
          </Inline>
        </Stack>
      </Surface>

      {justPaid ? (
        <Banner tone="success" onDismiss={() => setJustPaid(null)}>
          Payment successful. {money.format(justPaid.amount)} received ({justPaid.number}). Thank you!
        </Banner>
      ) : null}

      {/* ── THE ADVANCE ──────────────────────────────────────────────────── */}
      {order.advance ? (
        <Surface pad={10} radius="card" border="default">
          <Inline gap={10} align="center" justify="between" wrap>
            <Stack gap={4} className="flex-1 min-w-0">
              <Inline gap={3} align="center">
                <Icon name={due > 0 ? 'bank' : 'check-circle'} size="md" tone={due > 0 ? 'primary' : 'success'} />
                <Text as="h2" size="subheading">
                  {due > 0 ? 'Advance payment requested' : 'Advance payment received'}
                </Text>
              </Inline>
              <Text tone="secondary">
                {due <= 0
                  ? `You have paid the ${money.format(got)} advance. It will be adjusted against your final invoice.`
                  : got > 0
                    ? `You have paid ${money.format(got)} of the ${money.format(order.advance.amount)} advance. Pay the remaining amount when you are ready.`
                    : `${ORGANISATION.name} has requested ${order.advance.type === 'percent'
                      ? `${order.advance.value}% of the order total`
                      : 'an advance'} on this order. It will be adjusted against your final invoice.`}
              </Text>
              {got > 0 && due > 0 ? (
                <Text size="body-sm" tone="tertiary" className="tabular-nums">
                  {money.format(got)} paid · {money.format(due)} remaining
                </Text>
              ) : null}
            </Stack>

            {/* The amount and the action, together on the right — the one
                decision this card asks for, and the eye lands on it last. */}
            {due > 0 ? (
              <Stack gap={4} align="end" className="flex-none">
                <Stack gap={0} align="end">
                  <Text size="body-sm" tone="secondary">{got > 0 ? 'Remaining' : 'Advance due'}</Text>
                  <Text size="title" className="tabular-nums">{money.format(due)}</Text>
                </Stack>
                <Button onClick={() => setPaying(true)}>Pay Now</Button>
              </Stack>
            ) : (
              <StatusBadge status="success">Paid {money.format(got)}</StatusBadge>
            )}
          </Inline>
        </Surface>
      ) : null}

      {/* ── RELATED ──────────────────────────────────────────────────────── */}
      <Surface pad={0} radius="card" border="default" className="overflow-hidden">
        <Tabs
          items={[
            ...(order.advance ? [{ id: 'payments', label: 'Advance Payments', badge: String(order.payments.length) }] : []),
            { id: 'invoices', label: 'Invoices', badge: String(order.invoices.length) },
          ]}
          value={tab === 'payments' && !order.advance ? 'invoices' : tab}
          onChange={setTab}
          label="Records for this sales order"
        >
          <Stack gap={0} className="p-10">
            {tab === 'payments' && order.advance ? (
              <Table<AdvancePayment>
                caption={`Advance payments for ${order.number}`}
                placement="card"
                columns={PAYMENT_COLUMNS}
                rows={order.payments}
                rowKey={(p) => p.id}
                empty={<Stack align="center" className="p-8"><Text tone="secondary">No advance paid so far.</Text></Stack>}
              />
            ) : order.invoices.length ? (
              <Table<OrderInvoice>
                caption={`Invoices for ${order.number}`}
                placement="card"
                columns={INVOICE_COLUMNS}
                rows={order.invoices}
                rowKey={(i) => i.id}
              />
            ) : (
              <Stack align="center" className="p-6"><Text tone="secondary">No invoices created so far.</Text></Stack>
            )}
          </Stack>
        </Tabs>
      </Surface>

      {/* ── THE ORDER ────────────────────────────────────────────────────── */}
      <Surface pad={0} radius="card" border="default" className="overflow-hidden">
        <Inline gap={6} align="center" justify="between" className="px-10 py-6">
          <Text as="h2" size="subheading">Order Details</Text>
          <Toggle checked={pdf} onCheckedChange={setPdf} label="Show PDF View" size="sm" />
        </Inline>
        <Divider />
        {pdf ? <OrderPdf order={order} /> : (
          <Stack gap={10} className="p-10">
            <Inline gap={10} align="start">
              <Stack gap={4} className="flex-1 min-w-0">
                <Text size="overline" tone="secondary">Billing Address</Text>
                <Address value={customer.billing} />
              </Stack>
              <Divider orientation="vertical" />
              <Stack gap={4} className="flex-1 min-w-0">
                <Text size="overline" tone="secondary">Shipping Address</Text>
                {customer.shipping.length
                  ? <Address value={customer.shipping} />
                  : <Text tone="tertiary">Same as billing address</Text>}
              </Stack>
              <Divider orientation="vertical" />
              <Stack gap={4} className="flex-1 min-w-0">
                <Text size="overline" tone="secondary">Order Info</Text>
                <DescriptionList gap={4} items={[
                  { label: 'Terms', value: order.paymentTerms },
                  { label: 'Shipment', value: order.shipmentDate ? date(order.shipmentDate) : '—' },
                ]} />
              </Stack>
            </Inline>
            <Table<Line>
              caption={`Items on ${order.number}`}
              placement="card"
              columns={LINE_COLUMNS}
              rows={lines(order)}
              rowKey={(r) => r.id}
            />
            <OrderTotals order={order} />
          </Stack>
        )}
      </Surface>


    </Page>
  );
}

/* ── PAY ───────────────────────────────────────────────────────────────────── */

const MODES: { id: string; label: string; lead: string; body: string }[] = [
  { id: 'credit', label: 'Credit Card', lead: 'Pay swiftly through your credit card.', body: 'You can pay the amount through your Credit Card by entering the details on the pop-up that follows.' },
  { id: 'debit', label: 'Debit Card', lead: 'Pay directly from your bank account with a debit card.', body: 'You can pay the amount through your Debit Card by entering the details on the pop-up that follows.' },
  { id: 'netbanking', label: 'Net Banking', lead: 'Pay through your bank’s internet banking.', body: 'You will be taken to your bank’s login page to authorise the payment.' },
  { id: 'wallet', label: 'Wallet', lead: 'Pay with a mobile wallet.', body: 'Choose your wallet on the pop-up that follows and approve the payment there.' },
  { id: 'upi', label: 'UPI', lead: 'Pay instantly with any UPI app.', body: 'Scan the QR code or enter your UPI ID on the pop-up that follows.' },
];

/**
 * THE PAYMENT PAGE — the portal's own checkout, in its shape: what is being
 * paid and how much at the top, the payment modes below.
 *
 * ── THE AMOUNT IS EDITABLE, BEHIND A PENCIL ────────────────────────────────
 * It opens at the full advance due, because that is what was asked for. The ✎
 * beside it turns the figure into a field so the customer can pay PART of it,
 * capped at what is due — more than the advance is a payment against the order,
 * not an advance, and belongs on the invoice. Editing is a deliberate step
 * rather than an always-open field, so the default case stays one click.
 *
 * The order stays Confirmed throughout; its advance reads Partially Paid
 * until the parts add up, and the order page asks for the remainder.
 *
 * The modes are `Tabs`, not the reference's vertical list with glyphs: the
 * canon has no vertical selectable list yet, and the card-brand glyphs are not
 * on the icon roster. Tabs carry the same model — one mode at a time, its
 * instructions beside it.
 */
function PayAdvance({ order, number, onCancel, onPay }: {
  order: SalesOrder; number: string; onCancel: () => void; onPay: (p: AdvancePayment) => void;
}) {
  const due = advanceDue(order);
  const [amount, setAmount] = useState(due);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [tried, setTried] = useState(false);
  const [mode, setMode] = useState('credit');

  const draftValue = Number.parseFloat(draft) || 0;
  const draftError = !draft.trim() || draftValue <= 0 ? 'Enter the amount you want to pay'
    : draftValue > due ? `You can pay up to ${money.format(due)}`
      : undefined;

  const startEdit = () => { setDraft(amount.toFixed(2)); setTried(false); setEditing(true); };
  const saveEdit = () => {
    setTried(true);
    if (draftError) { document.getElementById('pay-amount')?.focus(); return; }
    setAmount(round(draftValue));
    setEditing(false);
  };

  const current = MODES.find((m) => m.id === mode) ?? MODES[0];

  const proceed = () => onPay({
    id: `adv-${Date.now()}`,
    number,
    date: new Date().toISOString().slice(0, 10),
    mode: `Razorpay · ${current.label}`,
    depositTo: 'Razorpay Clearing',
    reference: `pay_${Math.random().toString(36).slice(2, 12)}`,
    amount: round(amount),
    status: 'Received',
  });

  return (
    <Page>
      <Inline gap={5} align="center">
        <Button emphasis="secondary" size="sm" icon="chevron-left" label={`Back to ${order.number}`} onClick={onCancel} />
        <Text as="h1" size="title">Payment for {order.number}</Text>
      </Inline>

      {/* ── WHAT, AND HOW MUCH ───────────────────────────────────────────── */}
      <Surface pad={0} radius="card" border="default" className="overflow-hidden">
        <Inline gap={0} align="stretch" wrap>
          <Inline gap={8} align="center" className="flex-1 min-w-0 p-10">
            <Surface tone="sunken" pad={5} radius="md" border="divider" className="flex-none">
              <Icon name="documents" size="xl" tone="primary" />
            </Surface>
            <Stack gap={2} className="min-w-0">
              <Text size="heading">Advance for {order.number}</Text>
              <Text tone="secondary">
                {ORGANISATION.name} · {order.advance?.type === 'percent'
                  ? `${order.advance.value}% of ${money.format(order.total)}`
                  : `of ${money.format(order.total)}`}
              </Text>
            </Stack>
          </Inline>

          <Surface tone="sunken" pad={10} radius="none" className="flex-none min-w-pt-totals-min">
            <Stack gap={3}>
              <Text tone="secondary">Amount to Pay</Text>
              {editing ? (
                //  A bare field, not a `FormRow`: "Amount to Pay" above already
                //  labels it, and a second visible label would say it twice. The
                //  accessible name and the error association are wired by hand.
                <Stack gap={2}>
                  <Inline gap={3} align="center">
                    <InputField
                      id="pay-amount"
                      aria-label="Amount to pay"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      format="decimal"
                      error={tried && Boolean(draftError)}
                      aria-describedby={tried && draftError ? 'pay-amount-error' : undefined}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') setEditing(false);
                      }}
                    />
                    <Button size="sm" icon="check" label="Save amount" onClick={saveEdit} />
                    <Button emphasis="secondary" size="sm" icon="close" label="Cancel editing" onClick={() => setEditing(false)} />
                  </Inline>
                  {tried && draftError ? (
                    <Text id="pay-amount-error" size="body-sm" tone="danger">{draftError}</Text>
                  ) : null}
                </Stack>
              ) : (
                <Inline gap={4} align="center">
                  <Text size="title-lg" className="tabular-nums">{money.format(amount)}</Text>
                  <Button emphasis="secondary" size="sm" icon="edit" label="Edit amount" onClick={startEdit} />
                </Inline>
              )}
              {/* What is left — the question a part-payment raises is "and then
                  what?". Live while typing, so the answer comes before Save. */}
              <Text size="body-sm" tone="secondary" className="tabular-nums">
                {(() => {
                  const v = editing ? draftValue : amount;
                  return v > 0 && v < due
                    ? `${money.format(round(due - v))} of the advance will remain.`
                    : `Full advance due: ${money.format(due)}`;
                })()}
              </Text>
            </Stack>
          </Surface>
        </Inline>
      </Surface>

      {/* ── HOW ──────────────────────────────────────────────────────────── */}
      <Surface pad={0} radius="card" border="default" className="overflow-hidden">
        <Tabs
          items={MODES.map((m) => ({ id: m.id, label: m.label }))}
          value={mode}
          onChange={setMode}
          label="Payment modes"
        >
          <Stack gap={8} className="p-15">
            <Stack gap={4}>
              <Text weight="medium">{current.lead}</Text>
              <Text tone="secondary">{current.body}</Text>
            </Stack>
            <Button size="lg" icon="lock" disabled={editing} onClick={proceed} className="w-full">
              Proceed to Payment · {money.format(amount)}
            </Button>
            <Text size="body-sm" tone="tertiary">
              Prototype checkout — no real payment is made. Secured by Razorpay.
            </Text>
          </Stack>
        </Tabs>
      </Surface>
    </Page>
  );
}
