import { useState } from 'react';
import {
  Avatar, Banner, Button, Checkbox, CreatePage, FormRow, FormSection, Icon, Inline, InputField,
  PageHeader, ProductTable, Select, SplitButton, Stack, Surface, Text, Textarea,
} from '@canon';
import type { InputFormat, ProductColumn, ProductRow, TotalRow } from '@canon';
import { lineAmount, received } from '../data/sales-orders';
import type { OrderInvoice, OrderLine, SalesOrder } from '../data/sales-orders';
import type { Invoice } from '../data/invoices';
import { Address, customerOf, money, round } from './SalesOrderDocument';

/**
 * SALES ORDERS → CONVERT TO INVOICE. The New Invoice page, filled from the
 * order: its customer, addresses, place of supply, location, terms and lines,
 * all still editable. Laid out after Books' own New Invoice — customer and
 * addresses, then the invoice's numbers and dates, then who sold it, then the
 * items, then what is printed and how it is paid.
 *
 * ── THE ADVANCE IS APPLIED ON SAVE, AND SHOWN BEFORE IT ───────────────────
 * The advance the customer has paid against the order is read into the totals
 * card under Total — a rule, then `Less: Advance Applied`, then Balance Due —
 * so the user sees the figure they are about to send before they send it.
 * Nothing is applied until Save: Cancel leaves the payments `Received` on the
 * order, exactly as they were.
 *
 * The amount applied is the advance received, capped at the invoice total. If
 * lines are removed until the invoice is smaller than the advance, the rest
 * stays with the order rather than taking the balance below zero.
 *
 * ── TAX DEFAULTS TO NON-GST ───────────────────────────────────────────────
 * The order carries no tax, so every line starts as `Non-GST Supply` and the
 * invoice totals what the order did — the advance was a share of that figure.
 * Pick a GST rate on a line and its CGST and SGST halves appear in the totals:
 * the place of supply is the organisation's own state, so the supply is
 * intra-state.
 */
export interface InvoiceFromOrderProps {
  order: SalesOrder;
  invoiceNumber: string;
  onCancel: () => void;
  /** The order with the invoice raised and its advance applied, plus what to tell the user. */
  onSave: (order: SalesOrder, message: string) => void;
  /**
   * Save as Draft. The draft lands in the Invoices module, so it is handed
   * over as an invoices record too — the details page there opens on it.
   */
  onSaveDraft: (order: SalesOrder, invoice: Invoice) => void;
}

const TERMS = [
  { value: 'Due on Receipt', label: 'Due on Receipt' },
  { value: 'Net 15', label: 'Net 15' },
  { value: 'Net 30', label: 'Net 30' },
];
const TERM_DAYS: Record<string, number> = { 'Due on Receipt': 0, 'Net 15': 15, 'Net 30': 30 };

const SERIES = [{ value: 'default', label: 'Default Transaction Series' }];
const SALESPEOPLE = [
  { value: 'priya', label: 'Priya Raman' },
  { value: 'arun', label: 'Arun Kumar' },
];
const OPERATORS = [
  { value: 'amazon', label: 'Amazon Seller Services' },
  { value: 'flipkart', label: 'Flipkart Internet' },
];
const TAX_MODES = [
  { value: 'exclusive', label: 'Tax Exclusive' },
  { value: 'inclusive', label: 'Tax Inclusive' },
];
const PRICE_LISTS = [
  { value: 'retail', label: 'Retail' },
  { value: 'wholesale', label: 'Wholesale' },
];

/** The rates a line can carry. `none` is Non-GST Supply — no tax row at all. */
const TAXES = [
  { value: 'none', label: 'Non-GST Supply', rate: 0 },
  { value: 'gst0', label: 'GST0 [0%]', rate: 0 },
  { value: 'gst5', label: 'GST5 [5%]', rate: 5 },
  { value: 'gst12', label: 'GST12 [12%]', rate: 12 },
  { value: 'gst18', label: 'GST18 [18%]', rate: 18 },
];
const rateOf = (v: string | undefined) => TAXES.find((t) => t.value === v)?.rate ?? 0;

const num = (v: string | undefined) => {
  const n = Number.parseFloat(v ?? '');
  return Number.isFinite(n) ? n : 0;
};

const toLine = (r: ProductRow): OrderLine => ({
  item: r.values?.item ?? '',
  qty: num(r.values?.qty),
  rate: num(r.values?.rate),
  discount: num(r.values?.discount),
  discountType: r.values?.['discount:unit'] === 'amount' ? 'amount' : 'percent',
});

//  Ordered and Packed are the order's own quantity — the prototype does not
//  track packages, and a converted order is invoiced in one go. Invoiced is 0
//  because an order is converted once (`canConvert` on the details page).
const toRow = (l: OrderLine, i: number): ProductRow => ({
  id: `l${i}`,
  kind: 'item',
  values: {
    item: l.item, ordered: String(l.qty), invoiced: '0', packed: String(l.qty),
    qty: String(l.qty), rate: String(l.rate),
    discount: l.discount ? String(l.discount) : '',
    'discount:unit': l.discountType ?? 'percent',
    tax: 'none',
  },
});

/** ISO ↔ `DD/MM/YYYY`, the field's format. */
const dmy = (isoDate: string) => isoDate.split('-').reverse().join('/');
function iso(v: string | undefined, fallback: string) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((v ?? '').trim());
  return m ? `${m[3]}-${m[2]}-${m[1]}` : fallback;
}
const addDays = (isoDate: string, days: number) =>
  new Date(Date.parse(isoDate) + days * 864e5).toISOString().slice(0, 10);

/** One address column: its heading, then the lines, or the link to add one. */
function AddressBlock({ heading, value, empty }: { heading: string; value: string[]; empty: string }) {
  return (
    <Stack gap={3} className="flex-1 min-w-0">
      <Text size="overline" tone="secondary">{heading}</Text>
      {value.length ? <Address value={value} /> : <Text as="a" href="#" tone="link">{empty}</Text>}
    </Stack>
  );
}

export function InvoiceFromOrder({ order, invoiceNumber, onCancel, onSave, onSaveDraft }: InvoiceFromOrderProps) {
  const today = new Date().toISOString().slice(0, 10);
  const info = customerOf(order);
  const [values, setValues] = useState<Record<string, string>>({
    customer: order.customer,
    pos: info.placeOfSupply,
    location: order.location,
    series: 'default',
    number: invoiceNumber,
    orderNumber: order.number,
    date: dmy(today),
    terms: order.paymentTerms,
    salesperson: '',
    operator: '',
    subject: '',
    taxMode: 'exclusive',
    priceList: '',
    notes: 'Thanks for your business.',
    conditions: '',
  });
  const [items, setItems] = useState<ProductRow[]>(() => order.lines.map(toRow));
  const [shipping, setShipping] = useState(order.shipping ? String(order.shipping) : '');
  const [gateways, setGateways] = useState({ razorpay: true, stripe: false });
  const [partial, setPartial] = useState(false);

  const set = (k: string) => (v: string) => setValues((s) => ({ ...s, [k]: v }));

  const lines = items.filter((r) => r.kind === 'item');
  const subTotal = round(lines.reduce((s, r) => s + lineAmount(toLine(r)), 0));
  //  Tax by rate, so two lines at 12% make ONE pair of CGST6 / SGST6 rows.
  const byRate = new Map<number, number>();
  for (const r of lines) {
    const rate = rateOf(r.values?.tax);
    if (rate > 0) byRate.set(rate, (byRate.get(rate) ?? 0) + (lineAmount(toLine(r)) * rate) / 100);
  }
  const tax = round([...byRate.values()].reduce((s, t) => s + t, 0));
  const exact = round(subTotal + num(shipping) + tax);
  const total = Math.round(exact);
  const roundOff = round(total - exact);
  const quantity = lines.reduce((s, r) => s + num(r.values?.qty), 0);

  const got = round(received(order));
  const applied = round(Math.min(got, total));
  const balance = round(total - applied);
  const advances = order.payments.map((p) => p.number).join(', ');

  const date = iso(values.date, today);
  const due = addDays(date, TERM_DAYS[values.terms] ?? 15);

  //  A draft still carries the advance: the figure the user saw under Total is
  //  the figure the draft keeps, so opening it shows the same Balance Due.
  const save = (draft = false) => {
    const invoice: OrderInvoice = {
      id: `inv-${Date.now()}`,
      number: values.number || invoiceNumber,
      date,
      dueDate: due,
      amount: total,
      advanceApplied: applied,
      balance,
      status: draft ? 'Draft' : balance <= 0 ? 'Paid' : applied > 0 ? 'Partially Paid' : 'Sent',
    };
    const next: SalesOrder = {
      ...order,
      status: 'Invoiced',
      invoices: [...order.invoices, invoice],
      payments: order.payments.map((p) => ({ ...p, status: 'Applied', appliedTo: invoice.number })),
    };
    if (draft) {
      onSaveDraft(next, {
        id: invoice.id, number: invoice.number, date, dueDate: due,
        order: order.number, customer: values.customer || order.customer,
        status: 'Draft', statusLabel: 'Draft',
        amount: total, advanceApplied: applied, balance, location: values.location || order.location,
      });
      return;
    }
    onSave(
      next,
      applied > 0
        ? `${invoice.number} created. The ${money.format(applied)} advance was applied — ${money.format(balance)} is left to collect.`
        : `${invoice.number} created.`,
    );
  };

  type Slot = { id: string; required: boolean; error: boolean; describedBy: string | undefined };
  const text = (key: string, placeholder: string, format?: InputFormat) =>
    ({ id, required, error, describedBy }: Slot) => (
      <InputField
        id={id} value={values[key] ?? ''} onChange={(e) => set(key)(e.target.value)}
        placeholder={placeholder} required={required} aria-required={required || undefined}
        error={error} aria-describedby={describedBy} format={format}
      />
    );
  const pick = (key: string, options: { value: string; label: string }[], placeholder?: string) =>
    ({ id, required }: Slot) => (
      <Select id={id} options={options} value={values[key] ?? ''} onChange={set(key)}
        placeholder={placeholder} required={required} />
    );

  const columns: ProductColumn[] = [
    { id: 'item', label: 'Item Details', kind: 'select', width: 280, min: 180, options: order.lines.map((l) => ({ value: l.item, label: l.item, media: <Avatar name={l.item} size="sm" /> })), placeholder: 'Type or click to select an item' },
    { id: 'ordered', label: 'Ordered', kind: 'read-only', width: 90, min: 70, muted: true },
    { id: 'invoiced', label: 'Invoiced', kind: 'read-only', width: 90, min: 70, muted: true },
    { id: 'packed', label: 'Packed', kind: 'read-only', width: 90, min: 70, muted: true },
    { id: 'qty', label: 'Quantity', kind: 'input', width: 100, min: 80, format: 'numeric', placeholder: '1' },
    { id: 'rate', label: 'Rate', kind: 'input', width: 120, min: 90, format: 'decimal', placeholder: '0.00' },
    {
      id: 'discount', label: 'Discount', kind: 'input', width: 140, min: 120, format: 'decimal', placeholder: '0.00',
      unit: { default: 'percent', options: [{ value: 'percent', label: '%' }, { value: 'amount', label: 'Rs.' }] },
    },
    { id: 'tax', label: 'Tax', kind: 'select', width: 170, min: 140, options: TAXES.map(({ value, label }) => ({ value, label })), placeholder: 'Select a Tax' },
    { id: 'amount', label: 'Amount', kind: 'read-only', width: 130, min: 100, flex: true, resizable: false },
  ];
  const shown = items.map((r) => (r.kind === 'item'
    ? { ...r, values: { ...r.values, amount: money.format(lineAmount(toLine(r))) } }
    : r));

  const taxRows: TotalRow[] = [...byRate.entries()].sort(([a], [b]) => a - b).flatMap(([rate, amount], i) => [
    { id: `cgst${rate}`, label: `CGST${rate / 2} [${rate / 2}%]`, kind: 'static' as const, amount: money.format(round(amount / 2)), divider: i === 0 },
    { id: `sgst${rate}`, label: `SGST${rate / 2} [${rate / 2}%]`, kind: 'static' as const, amount: money.format(round(amount / 2)) },
  ]);

  return (
    <>
      <PageHeader
        type="create"
        title="New Invoice"
        actions={[
          { id: 'prefs', label: 'Invoice preferences', icon: 'settings', onSelect: () => {} },
          { id: 'close', label: 'Discard and close', icon: 'close', onSelect: onCancel },
        ]}
      />

      <CreatePage
        reserveEndLane
        footer={(
          <>
            <SplitButton
              emphasis="primary"
              onSelect={() => save(true)}
              entries={[{ id: 'draft-new', label: 'Save as Draft and New', onSelect: () => save(true) }]}
            >
              Save as Draft
            </SplitButton>
            <SplitButton
              onSelect={() => save()}
              entries={[{ id: 'send-print', label: 'Save and Print', onSelect: () => save() }]}
            >
              Save and Send
            </SplitButton>
            <Button emphasis="secondary" onClick={onCancel}>Cancel</Button>
            <Stack gap={0} align="end" className="ms-auto">
              <Text weight="semibold" className="tabular-nums">Total Amount: {money.format(total)}</Text>
              <Text size="body-sm" tone="secondary" className="tabular-nums">
                {applied > 0 ? `Balance Due after advance: ${money.format(balance)} · ` : ''}Total Quantity: {quantity}
              </Text>
            </Stack>
          </>
        )}
      >
        <Stack gap={16}>
          {applied > 0 ? (
            <Banner tone="info">
              {`${order.number} has ${money.format(got)} of advance received (${advances}). On save, ${money.format(applied)} is applied to this invoice and deducted from its total.`}
            </Banner>
          ) : null}

          {/* ── CUSTOMER ──────────────────────────────────────────────────── */}
          <FormSection
            dividerGap="tight"
            full={(
              <FormRow label="Customer Name" required id="customer" span="full">
                {({ id, required }) => (
                  <Stack gap={8}>
                    <Inline gap={3} align="center">
                      <Select id={id} className="flex-1 min-w-0" options={[{ value: order.customer, label: order.customer }]}
                        value={values.customer} onChange={set('customer')} required={required} />
                      <Button icon="search" label="Search customers" onClick={() => {}} />
                      <Surface pad={3} radius="md" border="default">
                        <Inline gap={2} align="center">
                          <Icon name="check-circle" size="sm" tone="success" />
                          <Text as="span" size="body-sm" weight="medium">INR</Text>
                        </Inline>
                      </Surface>
                    </Inline>
                    <Inline gap={10} align="start">
                      <AddressBlock heading="Dispatch From" value={[]} empty="Select address" />
                      <AddressBlock heading="Billing Address" value={info.billing} empty="New Address" />
                      <AddressBlock heading="Shipping Address" value={info.shipping} empty="New Address" />
                    </Inline>
                    <Inline gap={10} align="start">
                      <Stack gap={3} className="flex-1 min-w-0">
                        <Text size="overline" tone="secondary">Billing Recipient GST Details</Text>
                        <Text as="span" tone="secondary">GST Treatment: <Text as="span">{info.gstin ? 'Registered Business' : 'Consumer'}</Text></Text>
                      </Stack>
                      <Stack gap={3} className="flex-1 min-w-0">
                        <Text size="overline" tone="secondary">Shipping Recipient GST Details</Text>
                        <Text as="span" tone="secondary">GSTIN: <Text as="span">{info.gstin ?? ''}</Text></Text>
                        <Text as="span" tone="secondary">Business Legal Name:</Text>
                      </Stack>
                    </Inline>
                  </Stack>
                )}
              </FormRow>
            )}
          >
            <FormRow label="Place of Supply" required id="pos">
              {pick('pos', [{ value: info.placeOfSupply, label: info.placeOfSupply }])}
            </FormRow>
            <FormRow label="Location" id="location">
              {(slot) => (
                <Stack gap={2}>
                  {pick('location', [{ value: order.location, label: order.location }])(slot)}
                  <Text size="body-sm" tone="secondary">Source of Supply: Tamil Nadu</Text>
                </Stack>
              )}
            </FormRow>
          </FormSection>

          {/* ── THE INVOICE ───────────────────────────────────────────────── */}
          <FormSection
            dividerGap="tight"
            trailing={(
              <>
                <FormRow label="Invoice Number" id="number">{text('number', 'INV-')}</FormRow>
                <FormRow label="Terms" id="terms">{pick('terms', TERMS)}</FormRow>
                <FormRow label="Due Date" id="due">
                  {({ id }) => <InputField id={id} value={dmy(due)} readOnly onChange={() => {}} />}
                </FormRow>
              </>
            )}
          >
            <FormRow label="Invoice#" required id="series">{pick('series', SERIES)}</FormRow>
            <FormRow label="Order Number" id="orderNumber">{text('orderNumber', 'SO-')}</FormRow>
            <FormRow label="Invoice Date" required id="date">{text('date', 'DD/MM/YYYY', 'date')}</FormRow>
          </FormSection>

          <FormSection dividerGap="tight">
            <FormRow label="Salesperson" id="salesperson">{pick('salesperson', SALESPEOPLE, 'Select or Add Salesperson')}</FormRow>
            <FormRow label="E-Commerce Operator" id="operator">{pick('operator', OPERATORS, 'Select an e-commerce operator')}</FormRow>
          </FormSection>

          <FormSection dividerGap="tight">
            <FormRow label="Subject" id="subject">
              {({ id }) => (
                <Textarea id={id} value={values.subject} onChange={(e) => set('subject')(e.target.value)}
                  placeholder="Let your customer know what this Invoice is for" />
              )}
            </FormRow>
          </FormSection>

          {/* ── ITEMS ─────────────────────────────────────────────────────── */}
          <Stack gap={6}>
            <Inline gap={4} align="center">
              <Select ariaLabel="Tax preference" options={TAX_MODES} value={values.taxMode} onChange={set('taxMode')} />
              <Select ariaLabel="Price list" options={PRICE_LISTS} value={values.priceList} onChange={set('priceList')} placeholder="Select Price List" />
            </Inline>
            <ProductTable
              title="Item Table"
              columns={columns}
              rows={shown}
              onRowsChange={setItems}
              totals={[
                { id: 'sub', label: 'Sub Total', kind: 'static', amount: money.format(subTotal) },
                { id: 'shipping', label: 'Shipping Charges', kind: 'editable', input: shipping, amount: money.format(num(shipping)) },
                ...taxRows,
                { id: 'round', label: 'Round Off', kind: 'static', amount: money.format(roundOff), divider: !taxRows.length },
                { id: 'total', label: 'Total ( ₹ )', kind: 'emphasis', amount: money.format(total), divider: true },
                ...(applied > 0
                  ? [
                    {
                      id: 'advance', label: 'Less: Advance Applied', kind: 'static' as const,
                      amount: `(−) ${money.format(applied)}`, divider: true, note: `${advances} · from ${order.number}`,
                    },
                    { id: 'balance', label: 'Balance Due ( ₹ )', kind: 'emphasis' as const, amount: money.format(balance) },
                  ]
                  : []),
              ]}
              onTotalInput={(id, next) => { if (id === 'shipping') setShipping(next); }}
              onAddRow={() => setItems((r) => [...r, { id: `i${Date.now()}`, kind: 'item', values: { tax: 'none' } }])}
              onAddGroup={() => setItems((r) => [...r, { id: `g${Date.now()}`, kind: 'group', label: 'Item Header' }])}
            />
          </Stack>

          {/* ── WHAT IS PRINTED ───────────────────────────────────────────── */}
          <FormSection dividerGap="tight">
            <FormRow label="Customer Notes" id="notes">
              {({ id }) => (
                <Stack gap={2}>
                  <Textarea id={id} value={values.notes} onChange={(e) => set('notes')(e.target.value)}
                    placeholder="Enter any notes to be displayed in your transaction" />
                  <Text size="body-sm" tone="secondary">Will be displayed on the invoice</Text>
                </Stack>
              )}
            </FormRow>
          </FormSection>

          <FormSection
            dividerGap="tight"
            trailing={(
              <FormRow label="Attach File(s)" id="attach">
                {({ id }) => (
                  <Stack gap={2} align="start">
                    <Button id={id} emphasis="secondary" icon="upload" onClick={() => {}}>Upload File</Button>
                    <Text size="body-sm" tone="secondary">You can upload a maximum of 10 files, 10MB each</Text>
                  </Stack>
                )}
              </FormRow>
            )}
          >
            <FormRow label="Terms & Conditions" id="conditions">
              {({ id }) => (
                <Textarea id={id} value={values.conditions} onChange={(e) => set('conditions')(e.target.value)}
                  placeholder="Enter the terms and conditions of your business to be displayed in your transaction" />
              )}
            </FormRow>
          </FormSection>

          {/* ── HOW IT IS PAID ────────────────────────────────────────────── */}
          <FormSection
            last
            full={(
              <Stack gap={6}>
                <Inline gap={4} align="center" wrap>
                  <Text as="span">Select an online payment option to get paid faster</Text>
                  <Text as="a" href="#" tone="link">Payment Gateway</Text>
                </Inline>
                <Inline gap={8} align="center">
                  <Checkbox label="Razorpay" selection={gateways.razorpay ? 'checked' : 'unchecked'}
                    onSelectionChange={(n) => setGateways((g) => ({ ...g, razorpay: n === 'checked' }))} />
                  <Checkbox label="Stripe" selection={gateways.stripe ? 'checked' : 'unchecked'}
                    onSelectionChange={(n) => setGateways((g) => ({ ...g, stripe: n === 'checked' }))} />
                </Inline>
                <Checkbox label="Allow customer to make partial payments for this invoice." selection={partial ? 'checked' : 'unchecked'}
                  onSelectionChange={(n) => setPartial(n === 'checked')} />
                <Text size="body-sm" tone="secondary">
                  Additional Fields: Start adding custom fields for your invoices by going to Settings → Sales → Invoices.
                </Text>
              </Stack>
            )}
          >
            {null}
          </FormSection>
        </Stack>
      </CreatePage>
    </>
  );
}
