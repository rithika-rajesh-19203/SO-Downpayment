import { useState } from 'react';
import {
  Avatar, Banner, Button, Checkbox, CreatePage, Divider, FormRow, FormSection,
  InputField, PageHeader, ProductTable, Select, Stack, Text, Textarea,
} from '@canon';
import type { InputFormat, ProductColumn, ProductRow } from '@canon';
import { lineAmount } from '../data/sales-orders';
import type { AdvanceTerms, AdvanceType, OrderLine, SalesOrder } from '../data/sales-orders';

/**
 * SALES → SALES ORDERS → NEW.
 *
 * `ProductTable`'s host, so `reserveEndLane` — 20 / 30, not 20 / 20.
 *
 * ── THE ADVANCE SITS UNDER THE CUSTOMER NOTES ─────────────────────────────
 * After the items and totals, so its amount is asked for once the total it is
 * a share of has been read. A rule above it marks it off from the notes.
 *
 * It is a `Checkbox` and not a `Toggle`: the user is choosing to ADD a term to
 * this order, which is a selection, not switching a mode. Unticked, the field
 * under it unmounts — a hidden percentage that still validated would block a
 * save the user cannot see the reason for.
 *
 * ONE field. Percentage or amount is the unit the value is in, so it is the
 * field's own trailing dropdown (`InputField`'s `unit`) rather than a second
 * control beside it.
 */
export interface NewSalesOrderProps {
  nextNumber: string;
  onCancel: () => void;
  onSave: (order: SalesOrder) => void;
}

const CUSTOMERS = [
  { value: 'Mr. Jeh Faran', label: 'Mr. Jeh Faran' },
  { value: 'Mr. John', label: 'Mr. John' },
  { value: 'Branch 1 (The Retail Store Inc)', label: 'Branch 1 (The Retail Store Inc)' },
  { value: 'Meridian Textiles', label: 'Meridian Textiles' },
];

const PAYMENT_TERMS = [
  { value: 'Due on Receipt', label: 'Due on Receipt' },
  { value: 'Net 15', label: 'Net 15' },
  { value: 'Net 30', label: 'Net 30' },
];

const DELIVERY = [
  { value: 'courier', label: 'Courier' },
  { value: 'pickup', label: 'Store Pickup' },
  { value: 'own', label: 'Own Fleet' },
];

/** Stand-in catalogue. Picking an item fills its rate if the rate is empty. */
const RATES: Record<string, number> = {
  'Ergonomic Office Chair': 1996,
  'Standing Desk Frame': 2000,
  'LED Monitor 27"': 2695,
  'Wireless Keyboard': 500,
  'Conference Table': 14097,
};
const ITEMS = Object.keys(RATES).map((name) => ({
  value: name, label: name, media: <Avatar name={name} size="sm" />,
}));

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2,
});

const num = (v: string | undefined) => {
  const n = Number.parseFloat(v ?? '');
  return Number.isFinite(n) ? n : 0;
};

/** A table row as an order line — the one shape `lineAmount` reads. */
const toLine = (r: ProductRow): OrderLine => ({
  item: r.values?.item ?? '',
  qty: num(r.values?.qty),
  rate: num(r.values?.rate),
  discount: num(r.values?.discount),
  discountType: r.values?.['discount:unit'] === 'amount' ? 'amount' : 'percent',
});

/** Two decimals, as money is stored — 25% of 9,983 is 2,495.75, not 2,495.7500001. */
const round = (n: number) => Math.round(n * 100) / 100;

/** `DD/MM/YYYY` → ISO, or `fallback` when the field is empty or not a date. */
function iso(v: string | undefined, fallback = '') {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((v ?? '').trim());
  return m ? `${m[3]}-${m[2]}-${m[1]}` : fallback;
}

export function NewSalesOrder({ nextNumber, onCancel, onSave }: NewSalesOrderProps) {
  const [values, setValues] = useState<Record<string, string>>({
    number: nextNumber, date: '26/10/2026', terms: 'Net 15',
  });
  const [items, setItems] = useState<ProductRow[]>([
    { id: 'i1', kind: 'item', values: { item: 'Ergonomic Office Chair', qty: '4', rate: '1996', discount: '10' } },
    { id: 'i2', kind: 'item', values: { item: 'Standing Desk Frame', qty: '1', rate: '2000' } },
  ]);
  const [shipping, setShipping] = useState('');

  const [advanceOn, setAdvanceOn] = useState(false);
  const [advanceType, setAdvanceType] = useState<AdvanceType>('percent');
  const [advanceValue, setAdvanceValue] = useState('');

  //  Nothing is wrong until the user has tried to save. After that the errors
  //  are DERIVED on every render, so one that has been fixed disappears with the
  //  keystroke that fixed it.
  const [submitted, setSubmitted] = useState(false);

  //  AFTER line discounts: each line's amount has its own discount taken off,
  //  so Sub Total, Total and the advance are all on what is actually charged.
  const subTotal = items.filter((r) => r.kind === 'item').reduce((s, r) => s + lineAmount(toLine(r)), 0);
  const total = round(subTotal + num(shipping));
  const advanceAmount = !advanceOn ? 0
    : advanceType === 'percent' ? round((total * num(advanceValue)) / 100)
      : round(num(advanceValue));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!(values.customer ?? '').trim()) e.customer = 'Customer Name is required';
    const over = items.findIndex((r) => {
      const l = toLine(r);
      return r.kind === 'item' && (l.discountType === 'percent' ? (l.discount ?? 0) > 100 : (l.discount ?? 0) > l.qty * l.rate);
    });
    if (over >= 0) e.discount = `The discount on row ${over + 1} is more than the line itself`;
    if (advanceOn) {
      const v = num(advanceValue);
      if (!advanceValue.trim()) e.advance = 'Enter the advance to collect';
      else if (v <= 0) e.advance = 'The advance must be more than zero';
      else if (total <= 0) e.advance = 'Add items before setting an advance';
      else if (advanceType === 'percent' && v > 100) e.advance = 'A percentage cannot exceed 100';
      else if (advanceType === 'amount' && v > total) e.advance = `The advance cannot exceed the order total of ${money.format(total)}`;
    }
    return e;
  };

  const errors: Record<string, string> = submitted ? validate() : {};

  const set = (k: string) => (v: string) => setValues((s) => ({ ...s, [k]: v }));

  //  Picking an item fills its rate — but only into an EMPTY rate, so a price the
  //  user has already negotiated is never overwritten by the catalogue's.
  const changeRows = (next: ProductRow[]) => setItems(next.map((r) => {
    const name = r.values?.item;
    return name && !r.values?.rate && RATES[name]
      ? { ...r, values: { ...r.values, rate: String(RATES[name]) } }
      : r;
  }));

  const save = (send: boolean) => {
    const found = validate();
    setSubmitted(true);
    const first = Object.keys(found)[0];
    if (first) { document.getElementById(first)?.focus(); return; }

    const advance: AdvanceTerms | undefined = advanceOn
      ? { type: advanceType, value: num(advanceValue), amount: advanceAmount, collectBefore: 'confirmation' }
      : undefined;
    onSave({
      id: `so-${Date.now()}`,
      number: values.number || nextNumber,
      date: iso(values.date, new Date().toISOString().slice(0, 10)),
      shipmentDate: iso(values.shipment),
      customer: values.customer,
      reference: values.reference ?? '',
      paymentTerms: values.terms ?? 'Net 15',
      location: 'Head Office',
      //  An order that asks for money upfront is not confirmed until it arrives —
      //  NetSuite holds the whole order on exactly this condition.
      status: !send ? 'Draft' : advance ? 'Awaiting Advance' : 'Confirmed',
      lines: items
        .filter((r) => r.kind === 'item' && r.values?.item)
        .map(toLine),
      shipping: num(shipping),
      total,
      advance,
      payments: [],
      invoices: [],
    });
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
  const select = (key: string, options: { value: string; label: string }[], placeholder: string) =>
    ({ id, required, error, describedBy }: Slot) => (
      <Select
        id={id} options={options} value={values[key] ?? ''} onChange={set(key)}
        placeholder={placeholder} required={required} error={error} ariaDescribedBy={describedBy}
      />
    );

  const columns: ProductColumn[] = [
    { id: 'item', label: 'Item Details', kind: 'select', width: 320, min: 180, options: ITEMS, placeholder: 'Type or click to select an item' },
    { id: 'qty', label: 'Quantity', kind: 'input', width: 110, min: 80, format: 'numeric', placeholder: '1' },
    { id: 'rate', label: 'Rate', kind: 'input', width: 130, min: 90, format: 'decimal', placeholder: '0.00' },
    {
      id: 'discount', label: 'Discount', kind: 'input', width: 150, min: 120, format: 'decimal', placeholder: '0.00',
      unit: { default: 'percent', options: [{ value: 'percent', label: '%' }, { value: 'amount', label: 'Rs.' }] },
    },
    { id: 'amount', label: 'Amount', kind: 'read-only', width: 140, min: 100, flex: true, resizable: false },
  ];
  //  The amount is derived, never stored — a stored one is a second copy of
  //  qty × rate less discount that can disagree with the first.
  const shown = items.map((r) => (r.kind === 'item'
    ? { ...r, values: { ...r.values, amount: money.format(lineAmount(toLine(r))) } }
    : r));

  const count = Object.keys(errors).length;
  const percentOfTotal = total > 0 ? (advanceAmount / total) * 100 : 0;

  return (
    <>
      <PageHeader type="create" title="New Sales Order" />

      <CreatePage
        reserveEndLane
        footer={(
          <>
            <Button onClick={() => save(true)}>Save and Send</Button>
            <Button emphasis="secondary" onClick={() => save(false)}>Save as Draft</Button>
            <Button emphasis="secondary" onClick={onCancel}>Cancel</Button>
            <Stack gap={0} align="end" className="ms-auto">
              <Text weight="semibold" className="tabular-nums">Total Amount: {money.format(total)}</Text>
              {advanceOn && advanceAmount > 0 ? (
                <Text size="body-sm" tone="secondary" className="tabular-nums">
                  Advance due: {money.format(advanceAmount)}
                </Text>
              ) : null}
            </Stack>
          </>
        )}
      >
        <Stack gap={16}>
          {submitted && count > 0 ? (
            <Banner tone="danger">
              {count === 1
                ? `${Object.values(errors)[0]}. It is marked below.`
                : `${count} fields need attention. They are marked below.`}
            </Banner>
          ) : null}

          <FormSection
            dividerGap="tight"
            trailing={(
              <>
                <FormRow label="Payment Terms" id="terms">{select('terms', PAYMENT_TERMS, 'Select terms')}</FormRow>
                <FormRow label="Delivery Method" id="delivery">{select('delivery', DELIVERY, 'Select a delivery method')}</FormRow>
                <FormRow label="Reference#" id="reference">{text('reference', 'Optional')}</FormRow>
              </>
            )}
          >
            <FormRow label="Customer Name" required id="customer" error={errors.customer}>
              {select('customer', CUSTOMERS, 'Select or add a customer')}
            </FormRow>
            <FormRow label="Sales Order#" required id="number">{text('number', 'SO-')}</FormRow>
            <FormRow label="Sales Order Date" required id="date">{text('date', 'DD/MM/YYYY', 'date')}</FormRow>
            <FormRow label="Expected Shipment Date" id="shipment">{text('shipment', 'DD/MM/YYYY', 'date')}</FormRow>
          </FormSection>

          <ProductTable
            title="Item Table"
            columns={columns}
            rows={shown}
            onRowsChange={changeRows}
            totals={[
              { id: 'sub', label: 'Sub Total', kind: 'static', amount: money.format(subTotal) },
              { id: 'shipping', label: 'Shipping Charges', kind: 'editable', input: shipping, amount: money.format(num(shipping)) },
              { id: 'total', label: 'Total ( ₹ )', kind: 'emphasis', amount: money.format(total) },
              ...(advanceOn && advanceAmount > 0
                ? [{ id: 'advance', label: 'Advance Due', kind: 'static' as const, amount: money.format(advanceAmount) }]
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

          {/* ── ADVANCE PAYMENT ─────────────────────────────────────────────── */}
          <Divider />
          <Stack gap={10}>
            <Checkbox
              label="Collect advance payment"
              description="Ask the customer to pay part of this order upfront. You can record the payment from the sales order once it is saved."
              selection={advanceOn ? 'checked' : 'unchecked'}
              onSelectionChange={(next) => setAdvanceOn(next === 'checked')}
            />

            {advanceOn ? (
              <FormSection last>
                <FormRow label="Advance" required id="advance" error={errors.advance}>
                  {({ id, required, error, describedBy }) => (
                    <Stack gap={2}>
                      <InputField
                        id={id}
                        value={advanceValue}
                        onChange={(e) => setAdvanceValue(e.target.value)}
                        placeholder={advanceType === 'percent' ? 'e.g. 25' : '0.00'}
                        format="decimal"
                        required={required}
                        aria-required={required || undefined}
                        error={error}
                        aria-describedby={describedBy}
                        //  ONE field, and the unit rides at its end. Switching
                        //  clears the value: 25 meant 25%, and as an amount it
                        //  would silently become Rs. 25.
                        unit={{
                          value: advanceType,
                          label: 'Advance unit',
                          options: [{ value: 'percent', label: '%' }, { value: 'amount', label: 'Rs.' }],
                          onChange: (v) => { setAdvanceType(v as AdvanceType); setAdvanceValue(''); },
                        }}
                      />
                      {/* Read back in the OTHER unit — a percentage the user
                          cannot see the value of is a figure they will check
                          with a calculator. */}
                      <Text size="body-sm" tone="secondary" className="tabular-nums">
                        {advanceAmount > 0
                          ? advanceType === 'percent'
                            ? `${money.format(advanceAmount)} due upfront · ${money.format(Math.max(0, total - advanceAmount))} on the invoice`
                            : `${percentOfTotal.toFixed(percentOfTotal % 1 ? 2 : 0)}% of the order · ${money.format(Math.max(0, total - advanceAmount))} on the invoice`
                          : 'A percentage of the order total, or a fixed amount.'}
                      </Text>
                    </Stack>
                  )}
                </FormRow>
              </FormSection>
            ) : null}
          </Stack>
          <Divider />

          {/* Not inside a `FormSection`: one with no half-column rows still
              renders an empty half, and its row gap opens a blank band above
              this. A `full` row carries its own twelve-column tracks. */}
          <FormRow label="Terms & Conditions" span="full" id="tc">
            {({ id }) => (
              <Textarea id={id} value={values.tc ?? ''} onChange={(e) => set('tc')(e.target.value)}
                placeholder="Enter the terms and conditions of your business to be displayed in your transaction" />
            )}
          </FormRow>
        </Stack>
      </CreatePage>
    </>
  );
}
