import { useState } from 'react';
import {
  Avatar, Banner, Button, CreatePage, FormRow, FormSection, InputField, PageHeader,
  ProductTable, Select, Stack, Text, Textarea,
} from '@canon';
import type { InputFormat, ProductColumn, ProductRow } from '@canon';
import { lineAmount, received } from '../data/sales-orders';
import type { OrderInvoice, OrderLine, SalesOrder } from '../data/sales-orders';
import type { Invoice } from '../data/invoices';
import { Address, customerOf, money, round } from './SalesOrderDocument';

/**
 * SALES ORDERS → CONVERT TO INVOICE. The New Invoice page, filled from the
 * order: its customer, terms and lines, all still editable.
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

const toRow = (l: OrderLine, i: number): ProductRow => ({
  id: `l${i}`,
  kind: 'item',
  values: {
    item: l.item, qty: String(l.qty), rate: String(l.rate),
    discount: l.discount ? String(l.discount) : '',
    'discount:unit': l.discountType ?? 'percent',
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

export function InvoiceFromOrder({ order, invoiceNumber, onCancel, onSave, onSaveDraft }: InvoiceFromOrderProps) {
  const today = new Date().toISOString().slice(0, 10);
  const info = customerOf(order);
  const [values, setValues] = useState<Record<string, string>>({
    customer: order.customer,
    number: invoiceNumber,
    orderNumber: order.number,
    date: dmy(today),
    terms: order.paymentTerms,
    notes: 'Thanks for your business.',
  });
  const [items, setItems] = useState<ProductRow[]>(() => order.lines.map(toRow));
  const [shipping, setShipping] = useState(order.shipping ? String(order.shipping) : '');

  const set = (k: string) => (v: string) => setValues((s) => ({ ...s, [k]: v }));

  const subTotal = items.filter((r) => r.kind === 'item').reduce((s, r) => s + lineAmount(toLine(r)), 0);
  const total = round(subTotal + num(shipping));
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
        amount: total, advanceApplied: applied, balance, location: order.location,
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

  const columns: ProductColumn[] = [
    { id: 'item', label: 'Item Details', kind: 'select', width: 320, min: 180, options: order.lines.map((l) => ({ value: l.item, label: l.item, media: <Avatar name={l.item} size="sm" /> })), placeholder: 'Type or click to select an item' },
    { id: 'qty', label: 'Quantity', kind: 'input', width: 110, min: 80, format: 'numeric', placeholder: '1' },
    { id: 'rate', label: 'Rate', kind: 'input', width: 130, min: 90, format: 'decimal', placeholder: '0.00' },
    {
      id: 'discount', label: 'Discount', kind: 'input', width: 150, min: 120, format: 'decimal', placeholder: '0.00',
      unit: { default: 'percent', options: [{ value: 'percent', label: '%' }, { value: 'amount', label: 'Rs.' }] },
    },
    { id: 'amount', label: 'Amount', kind: 'read-only', width: 140, min: 100, flex: true, resizable: false },
  ];
  const shown = items.map((r) => (r.kind === 'item'
    ? { ...r, values: { ...r.values, amount: money.format(lineAmount(toLine(r))) } }
    : r));

  return (
    <>
      <PageHeader type="create" title="New Invoice" />

      <CreatePage
        reserveEndLane
        footer={(
          <>
            <Button onClick={() => save()}>Save and Send</Button>
            <Button emphasis="secondary" onClick={() => save(true)}>Save as Draft</Button>
            <Button emphasis="secondary" onClick={onCancel}>Cancel</Button>
            <Stack gap={0} align="end" className="ms-auto">
              <Text weight="semibold" className="tabular-nums">Total Amount: {money.format(total)}</Text>
              {applied > 0 ? (
                <Text size="body-sm" tone="secondary" className="tabular-nums">
                  Balance Due after advance: {money.format(balance)}
                </Text>
              ) : null}
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

          <FormSection
            dividerGap="tight"
            trailing={(
              <>
                <FormRow label="Billing Address" id="billing">{() => <Address value={info.billing} />}</FormRow>
                <FormRow label="Shipping Address" id="shipping-address">{() => <Address value={info.shipping} />}</FormRow>
                {info.gstin ? <FormRow label="GSTIN" id="gstin">{() => <Text as="span">{info.gstin}</Text>}</FormRow> : null}
              </>
            )}
          >
            <FormRow label="Customer Name" required id="customer">
              {({ id, required }) => (
                <Select id={id} options={[{ value: order.customer, label: order.customer }]} value={values.customer}
                  onChange={set('customer')} required={required} />
              )}
            </FormRow>
            <FormRow label="Place of Supply" required id="pos">{() => <Text as="span">{info.placeOfSupply}</Text>}</FormRow>
            <FormRow label="Invoice#" required id="number">{text('number', 'INV-')}</FormRow>
            <FormRow label="Order Number" id="orderNumber">{text('orderNumber', 'SO-')}</FormRow>
            <FormRow label="Invoice Date" required id="date">{text('date', 'DD/MM/YYYY', 'date')}</FormRow>
            <FormRow label="Terms" id="terms">
              {({ id }) => <Select id={id} options={TERMS} value={values.terms} onChange={set('terms')} />}
            </FormRow>
            <FormRow label="Due Date" id="due">{() => <Text as="span">{dmy(due)}</Text>}</FormRow>
          </FormSection>

          <ProductTable
            title="Item Table"
            columns={columns}
            rows={shown}
            onRowsChange={setItems}
            totals={[
              { id: 'sub', label: 'Sub Total', kind: 'static', amount: money.format(subTotal) },
              { id: 'shipping', label: 'Shipping Charges', kind: 'editable', input: shipping, amount: money.format(num(shipping)) },
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
            onAddRow={() => setItems((r) => [...r, { id: `i${Date.now()}`, kind: 'item', values: {} }])}
            onAddGroup={() => setItems((r) => [...r, { id: `g${Date.now()}`, kind: 'group', label: 'Item Header' }])}
          />

          <FormSection last>
            <FormRow label="Customer Notes" id="notes">
              {({ id }) => (
                <Textarea id={id} value={values.notes ?? ''} onChange={(e) => set('notes')(e.target.value)}
                  placeholder="Enter any notes to be displayed in your transaction" />
              )}
            </FormRow>
          </FormSection>
        </Stack>
      </CreatePage>
    </>
  );
}
