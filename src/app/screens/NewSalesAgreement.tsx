import { useState } from 'react';
import {
  Avatar, Banner, Button, CreatePage, Divider, FormRow, FormSection, Icon,
  Inline, InputField, PageHeader, ProductTable, Select, Stack, StatusBadge,
  Surface, Text, Textarea, Toggle, Wizard,
} from '@canon';
import type { InputFormat, ProductColumn, ProductRow, Step } from '@canon';

/**
 * SALES → SALES AGREEMENTS → NEW. Step 1 of five.
 *
 * `ZF-CREATE-PAGE.md`'s grid, with a vertical `Wizard` above it and the step's
 * own cards below.
 *
 * ── THE CUSTOMER CARD APPEARS; IT IS NOT REVEALED ───────────────────────────
 * It mounts when a customer is chosen and unmounts when the choice is cleared,
 * rather than sitting there hidden. That is the opposite of the rule
 * `PageChrome` follows for the page header, and the difference is what the node
 * is FOR: the header owns state the user put there — a half-typed search, an
 * open menu — and unmounting throws it away. This card owns nothing. It is a
 * read-only summary of a value held somewhere else, so there is nothing to
 * preserve and a hidden node would only be a thing for the accessibility tree to
 * walk past.
 */
export interface NewSalesAgreementProps {
  onCancel: () => void;
  /** The last step's commit. */
  onSend: () => void;
}

const STEPS: Omit<Step, 'state'>[] = [
  { id: 'contact', label: 'Contact Details', description: 'Basic contract details' },
  { id: 'products', label: 'Products & Services', description: 'Add items and pricing' },
  { id: 'payment', label: 'Payments and Delivery', description: 'Terms and schedule' },
  { id: 'terms', label: 'Terms & Conditions', description: 'Legal terms and documents' },
  { id: 'review', label: 'Review & Sign', description: 'Confirm and send for signature' },
];

const UNITS = [
  { value: 'service', label: 'Service' },
  { value: 'box', label: 'Box' },
  { value: 'pcs', label: 'Pcs' },
  { value: 'hour', label: 'Hour' },
];

//  The rates the business actually uses. Not free text: a typo'd 1.5% is a
//  wrong invoice nobody notices until it is paid.
const TAX_RATES = [
  { value: '5', label: '5%' },
  { value: '10', label: '10%' },
  { value: '20', label: '20%' },
  { value: '25', label: '25%' },
];

/** Stand-in catalogue. `media` is the thumbnail the item column shows. */
const ITEMS = [
  { value: 'a4', label: 'A4 Copier Paper' },
  { value: 'toner', label: 'Toner Cartridge' },
  { value: 'binder', label: 'Ring Binder' },
  { value: 'install', label: 'On-site Installation' },
  { value: 'support', label: 'Annual Support Plan' },
].map((i) => ({
  ...i,
  //  `Avatar` with no `src` draws the initials on a tint hashed from the name —
  //  so an item with no photograph still gets a stable, distinct mark rather
  //  than a grey box, and the same item looks the same on every screen.
  media: <Avatar name={i.label} size="sm" />,
}));

const CUSTOMERS = [
  { value: 'kaveri', label: 'Kaveri Logistics' },
  { value: 'meridian', label: 'Meridian Textiles' },
  { value: 'anantha', label: 'Anantha Foods' },
];

const CONTACT_TYPES = [
  { value: 'primary', label: 'Primary' },
  { value: 'billing', label: 'Billing' },
  { value: 'technical', label: 'Technical' },
];

const STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'on-hold', label: 'On Hold' },
];

const CURRENCIES = [
  { value: 'inr', label: 'INR — Indian Rupee' },
  { value: 'usd', label: 'USD — US Dollar' },
  { value: 'eur', label: 'EUR — Euro' },
];

/** Stand-in until a customers API exists. Keyed by the Select's value. */
const CUSTOMER_RECORD: Record<string, {
  name: string; email: string; phone: string;
  billing: string[]; shipping: string[];
  person: { name: string; designation: string; email: string; phone: string };
}> = {
  kaveri: {
    name: 'Kaveri Logistics', email: 'accounts@kaverilogistics.example.com', phone: '+91 44 4123 8800',
    billing: ['Plot 14, Ambattur Industrial Estate', 'Chennai, Tamil Nadu 600058', 'India'],
    shipping: ['Warehouse 3, Sriperumbudur', 'Kancheepuram, Tamil Nadu 602105', 'India'],
    person: { name: 'Anitha Raghavan', designation: 'Accounts Manager', email: 'anitha.r@kaverilogistics.example.com', phone: '+91 98400 21188' },
  },
  meridian: {
    name: 'Meridian Textiles', email: 'finance@meridiantextiles.example.com', phone: '+91 422 267 4500',
    billing: ['22 Avinashi Road', 'Coimbatore, Tamil Nadu 641018', 'India'],
    shipping: ['Unit 7, Tirupur Export Zone', 'Tirupur, Tamil Nadu 641604', 'India'],
    person: { name: 'Devan Krishnamurthy', designation: 'Procurement Lead', email: 'devan.k@meridiantextiles.example.com', phone: '+91 99446 70012' },
  },
  anantha: {
    name: 'Anantha Foods', email: 'ap@ananthafoods.example.com', phone: '+91 80 4567 1200',
    billing: ['5th Cross, Peenya 2nd Stage', 'Bengaluru, Karnataka 560058', 'India'],
    shipping: ['Cold Store 2, Nelamangala', 'Bengaluru Rural, Karnataka 562123', 'India'],
    person: { name: 'Priya Nair', designation: 'Finance Controller', email: 'priya.nair@ananthafoods.example.com', phone: '+91 98860 33471' },
  },
};

/**
 * An email and a phone, each behind its glyph. One helper so the two columns
 * that show them cannot drift apart in gap, icon slot or tone.
 *
 * `tone="subtle"` on the glyph: the icon says which KIND of address this is,
 * on top of a value that already reads as an email or a number. Decorative, and
 * hidden from assistive tech for the same reason — announcing "envelope" before
 * the address adds nothing.
 *
 * The email is a link and the phone is not, which is a real difference and not
 * an inconsistency: `mailto:` opens a mail client on every platform, and `tel:`
 * does nothing on a desktop. A blue number would be inviting a click that will
 * not answer.
 */
function contactLines(email: string, phone: string) {
  return (
    <>
      <Inline gap={4} align="center">
        <Icon name="mail" size="sm" tone="subtle" className="flex-none" />
        {/* A REAL `mailto:` — `tone="link"` on something that is not a link is
            a colour lying about what it does. `primary/text` at 5.92, not
            `primary/default`'s 4.32, which fails 1.4.3 for 12px text.
            `truncate` and not `break-words`: an address is one token the eye
            scans left to right, and wrapping it over three lines to fit a column
            costs more than the tail it saves. `title` so the full address is
            still reachable on hover. */}
        <Text
          as="a"
          href={`mailto:${email}`}
          title={email}
          size="body-sm"
          tone="link"
          truncate
          className="min-w-0"
        >
          {email}
        </Text>
      </Inline>
      <Inline gap={4} align="center">
        {/*  `phone` HAS NO GEOMETRY YET and renders the dashed placeholder. That
             is deliberate: the roster carries the name so the gap is visible and
             tracked, rather than being papered over with a near-enough glyph.
             One SVG into design-refs/icons/ and it fills in.  */}
        <Icon name="phone" size="sm" tone="subtle" className="flex-none" />
        {/* NOT a link, and not blue. A `tel:` does nothing on a desktop and a
            blue number invites a click that will not answer — the address above
            it opens a mail client on every platform, which is the difference. */}
        <Text size="body-sm" tone="secondary" truncate className="min-w-0">{phone}</Text>
      </Inline>
    </>
  );
}

/** Every field the form will not submit without, and the name to say it by. */
const REQUIRED: [key: string, label: string][] = [
  ['contactName', 'Contact Name'],
  ['contactNumber', 'Contact Number'],
  ['contactType', 'Contact Type'],
  ['customer', 'Customer'],
  ['currency', 'Currency'],
  ['startDate', 'Start Date'],
  ['endDate', 'End Date'],
];

/** `DD/MM/YYYY` → a Date, or null. Strict: 31/02 is not a date. */
function parseDate(v: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v.trim());
  if (!m) return null;
  const [, d, mo, y] = m.map(Number) as unknown as [string, number, number, number];
  const date = new Date(y, mo - 1, d);
  //  A real parse, not a lenient one: `new Date(2026, 1, 31)` happily returns
  //  3 March, so the only way to know 31/02 was rejected is to read it back.
  return date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d
    ? date : null;
}

function validate(v: Record<string, string>): Record<string, string> {
  const e: Record<string, string> = {};

  for (const [key, label] of REQUIRED) {
    //  `.trim()` — a field holding three spaces is empty, and the one thing
    //  worse than a required field that blocks you is one that lets you past
    //  with nothing in it.
    if (!(v[key] ?? '').trim()) e[key] = `${label} is required`;
  }

  //  Format before order: telling someone their end date is before their start
  //  date when what they actually typed is "next tuesday" is not help.
  for (const [key, label] of [['startDate', 'Start Date'], ['endDate', 'End Date']] as const) {
    if (!e[key] && !parseDate(v[key] ?? '')) e[key] = `${label} must be DD/MM/YYYY`;
  }

  const from = parseDate(v.startDate ?? '');
  const to = parseDate(v.endDate ?? '');
  if (!e.startDate && !e.endDate && from && to && to <= from) {
    //  On the END date, not the start: it is the one the user just typed and the
    //  one they will change. An error on the field they are happy with sends
    //  them to fix the wrong thing.
    e.endDate = 'End Date must be after the Start Date';
  }

  return e;
}

export function NewSalesAgreement({ onCancel, onSend }: NewSalesAgreementProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  //  Nothing is wrong until the user has said they are finished. Validating as
  //  they type marks a field they have not reached yet, which is 3.3.1's letter
  //  and the opposite of its intent.
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(0);

  //  §2 of the product table: tax-inclusive is a fact about the whole table, so
  //  it lives beside its heading and not in a row.
  const [taxInclusive, setTaxInclusive] = useState(false);
  const [items, setItems] = useState<ProductRow[]>([{ id: 'i1', kind: 'item', values: {} }]);

  const set = (k: string) => (v: string) => {
    const next = { ...values, [k]: v };
    setValues(next);
    //  AFTER a failed submit, revalidate live — the user is now fixing things
    //  and an error that stays up after it has been corrected is worse than one
    //  that never appeared. Only then, though.
    if (submitted) setErrors(validate(next));
  };

  const customer = CUSTOMER_RECORD[values.customer ?? ''];

  const count = Object.keys(errors).length;

  /*  §4 — the columns, and Tax is CONDITIONAL.
      Computed rather than declared with a hidden flag, because a hidden column
      still has to be excluded from the group row's `colSpan` and from the
      `<colgroup>`, and the two go out of step the moment one of them is
      forgotten. A column that is not in the array cannot be half-removed.

      Rate is `decimal` and the rest are `numeric`: a Qty of "3 boxes" makes the
      totals card say NaN, and that is the first place anyone would see it.  */
  const itemColumns: ProductColumn[] = ([
    {
      id: 'item', label: 'Item', kind: 'select', width: 280, min: 160,
      options: ITEMS, placeholder: 'Select an item',
    },
    { id: 'description', label: 'Description', kind: 'input', width: 220, min: 120, placeholder: 'Description' },
    { id: 'qty', label: 'Qty', kind: 'input', width: 90, min: 70, format: 'numeric', placeholder: '0' },
    { id: 'unit', label: 'Unit', kind: 'select', width: 130, min: 100, options: UNITS, placeholder: 'Unit' },
    { id: 'rate', label: 'Rate', kind: 'input', width: 120, min: 80, format: 'decimal', placeholder: '0.00' },
    { id: 'discount', label: 'Discount', kind: 'input', width: 110, min: 80, format: 'numeric', placeholder: '0' },
    ...(taxInclusive
      ? [{
        id: 'tax', label: 'Tax', kind: 'select' as const, width: 110, min: 90,
        options: TAX_RATES, placeholder: 'Tax',
      }]
      : []),
    //  Whichever column is last absorbs the slack, and it still needs a real
    //  min — §4.2: a `<col>` with no width gets the leftover INCLUDING NONE.
  ] as ProductColumn[]).map((c, i, all) => (
    i === all.length - 1 ? { ...c, flex: true, resizable: false } : c
  ));

  const handleNext = () => {
    //  Only step 1 has fields to validate so far. Each step will bring its own
    //  rule; what must not happen is one `validate` that knows about all five.
    if (step === STEPS.length - 1) { onSend(); return; }
    if (step > 0) { setStep((n) => n + 1); return; }
    const found = validate(values);
    setErrors(found);
    setSubmitted(true);
    const first = Object.keys(found)[0];
    if (!first) { setStep(1); return; }
    //  3.3.1 — MOVE FOCUS to the first field that failed. Without it a keyboard
    //  or screen-reader user is told the form did not submit and left standing
    //  on the button with no way to find out which of ten fields was the
    //  problem. The ids are supplied rather than generated for exactly this.
    document.getElementById(first)?.focus();
  };

  //  One helper each, so no row can quietly differ from its neighbours in how it
  //  wires `id`, `required` and `aria-required` — §5's first two rows.
  type Slot = { id: string; required: boolean; error: boolean; describedBy: string | undefined };

  const text = (key: string, placeholder: string, format?: InputFormat) =>
    ({ id, required, error, describedBy }: Slot) => (
      <InputField
        id={id} value={values[key] ?? ''} onChange={(e) => set(key)(e.target.value)}
        placeholder={placeholder} required={required} aria-required={required || undefined}
        error={error} aria-describedby={describedBy} format={format}
      />
    );

  const select = (key: string, options: typeof CUSTOMERS, placeholder: string) =>
    ({ id, required, error, describedBy }: Slot) => (
      <Select
        id={id} options={options} value={values[key] ?? ''} onChange={set(key)}
        placeholder={placeholder} required={required}
        error={error} ariaDescribedBy={describedBy}
      />
    );

  return (
    <>
      <PageHeader type="create" title="New Sales Agreement" />

      <CreatePage
        footer={(
          <>
            {/* Next FIRST, like Save — §7.1. Reading order carries more weight
                than the platform convention it contradicts. */}
            <Button onClick={handleNext}>
              {step === STEPS.length - 1 ? 'Send for Signature' : 'Next'}
            </Button>
            {step > 0 ? (
              <Button emphasis="secondary" onClick={() => setStep((n) => n - 1)}>Back</Button>
            ) : null}
            <Button emphasis="secondary" onClick={onCancel}>Cancel</Button>
          </>
        )}
      >
        {/* No divider between the wizard and the cards — the step strip already
            reads as its own band, and a rule under it would be a second
            boundary saying the same thing. `gap-16` is the space that was the
            divider's. */}
        <Stack gap={16}>
          {/* Horizontal, with each step carrying the line that says what it is
              for. That needed two alignment fixes inside `Wizard` — the label
              centres against the marker in its own 24-tall line box, and the
              connector is pinned to the marker's centre rather than the step's,
              which a two-line step would otherwise drag down with it. */}
          <Wizard
            steps={STEPS.map((st, i) => ({
              ...st,
              state: i < step ? 'completed' : i === step ? 'current' : 'upcoming',
              //  Only backwards. A step you have not reached cannot be jumped
              //  to, because the one before it has not been validated — and a
              //  wizard that lets you skip validation is a wizard that collects
              //  a half-filled record.
              clickable: i < step,
            }))}
            orientation="horizontal"
            label="Agreement steps"
            onStepClick={(id) => setStep(STEPS.findIndex((st) => st.id === id))}
          />

          {step === 0 ? (
          <Stack gap={12}>
            {/* ── CARD 1 · the form ─────────────────────────────────────────── */}
            <Surface pad={10} radius="card" border="default">
              <Stack gap={10}>
                <Text size="subheading">Contact Details</Text>

                {/* ONE LINE AT THE TOP, and it says what to DO. Each field
                    carries only a glyph in its gutter, so this is the only place
                    a sighted keyboard user is told anything beyond "something
                    here is wrong" — a banner reading "Validation failed" would
                    leave them nowhere to go.

                    Inside the card rather than above it: it is about this card's
                    fields, and a page-level banner would be claiming the whole
                    step had failed. */}
                {submitted && count > 0 ? (
                  <Banner tone="danger">
                    {count === 1
                      ? '1 field needs attention. It is marked below.'
                      : `${count} fields need attention. They are marked below.`}
                  </Banner>
                ) : null}

                <FormSection
                  last
                  trailing={(
                    <>
                      <FormRow label="Status" id="status" error={errors.status}>{select('status', STATUSES, 'Select a status')}</FormRow>
                      <FormRow label="Start Date" required id="startDate" error={errors.startDate}>{text('startDate', 'DD/MM/YYYY', 'date')}</FormRow>
                      <FormRow label="End Date" required id="endDate" error={errors.endDate}>{text('endDate', 'DD/MM/YYYY', 'date')}</FormRow>
                      <FormRow label="Reference Number" id="reference" error={errors.reference}>{text('reference', 'Optional')}</FormRow>
                      {/* IN THE RIGHT HALF, not `full`. Five rows a side balances
                          the card, where full-width left the right column short
                          and the description hanging under both.

                          It keeps the ordinary 2-column label track, so its
                          control starts on the same x as every control above it
                          — and the long label simply wraps to two lines inside
                          that track. §4.1: the row grows and the control stays
                          level with the label's FIRST line, which is what stops
                          a two-line label pushing its input out of the rhythm
                          its neighbours are in. */}
                      <FormRow label="Description/Purpose" id="purpose">
                        {({ id }) => (
                          <Textarea
                            id={id}
                            value={values.purpose ?? ''}
                            onChange={(e) => set('purpose')(e.target.value)}
                            placeholder="What this agreement is for"
                          />
                        )}
                      </FormRow>
                    </>
                  )}
                >
                  {/* §5, 2.4.3 — DOM order is tab order: the whole left half top
                      to bottom, then the whole right. Never column-interleaved. */}
                  <FormRow label="Contact Name" required id="contactName" error={errors.contactName}>{text('contactName', 'Full name')}</FormRow>
                  <FormRow label="Contact Number" required id="contactNumber" error={errors.contactNumber}>{text('contactNumber', '+91', 'tel')}</FormRow>
                  <FormRow label="Contact Type" required id="contactType" error={errors.contactType}>{select('contactType', CONTACT_TYPES, 'Select a type')}</FormRow>
                  <FormRow label="Customer" required id="customer" error={errors.customer}>{select('customer', CUSTOMERS, 'Select a customer')}</FormRow>
                  <FormRow label="Currency" required id="currency" error={errors.currency}>{select('currency', CURRENCIES, 'Select a currency')}</FormRow>
                </FormSection>
              </Stack>
            </Surface>

            {/* ── CARD 2 · appears once a customer is chosen ─────────────────── */}
            {customer ? (
              <Surface pad={10} radius="card" border="default">
                <Stack gap={10}>
                  <Inline gap={4} align="center" wrap>
                    <Text size="subheading" truncate className="min-w-0">Customer Details</Text>
                    {/* THE STATUS BELONGS TO THE CARD, not to the name inside
                        it. Beside the customer's name it read as one of four
                        columns' worth of detail; beside the heading it says what
                        this whole record is, which is what a status is for. */}
                    <StatusBadge status="success">Active</StatusBadge>
                    {/* `ms-auto` rather than `flex-1` on the title: with the
                        spring on the title, the badge would be pushed to the far
                        end with the button and stop reading as part of the
                        heading. */}
                    <Button
                      emphasis="secondary"
                      size="sm"
                      icon="edit"
                      onClick={() => {}}
                      className="flex-none ms-auto"
                    >
                      Edit Customer
                    </Button>
                  </Inline>

                  {/* Four columns. `Inline` of four `Stack`s rather than a grid,
                      so each column is `flex-1 min-w-0` and a long address wraps
                      inside its column instead of widening the card. */}
                  {/* `Divider vertical hairline` BETWEEN the columns — 0.5px of
                      `border/divider`, which is a step below the 1px this role
                      already draws everywhere else. It `self-stretch`es, so it
                      runs the height of the tallest column whichever that turns
                      out to be, rather than a height this file would have to
                      guess and re-guess. */}
                  <Inline gap={10} align="start">
                    {/* ── 1 · the customer ─────────────────────────────────── */}
                    <Stack gap={8} className="flex-1 min-w-0">
                      <Inline gap={5} align="center">
                        {/* The tint is hashed from the name, so one customer is
                            one colour on every screen — which is the only reason
                            the colour can mean identity rather than status, and
                            therefore the only reason 1.4.1 holds. */}
                        <Avatar name={customer.name} size="md" />
                        {/* The name alone — the status moved up to the card's
                            heading, where it describes the record rather than
                            one column of it. */}
                        <Text size="body-lg" weight="semibold" truncate className="min-w-0 flex-1">
                          {customer.name}
                        </Text>
                      </Inline>
                      <Stack gap={3}>{contactLines(customer.email, customer.phone)}</Stack>
                    </Stack>

                    <Divider orientation="vertical" weight="hairline" />

                    {/* ── 2 · billing ──────────────────────────────────────── */}
                    <Stack gap={4} className="flex-1 min-w-0">
                      <Text size="label" tone="default">Billing Address</Text>
                      <Stack gap={1}>
                        {customer.billing.map((l) => (
                          <Text key={l} size="body-sm" className="break-words">{l}</Text>
                        ))}
                      </Stack>
                    </Stack>

                    <Divider orientation="vertical" weight="hairline" />

                    {/* ── 3 · shipping ─────────────────────────────────────── */}
                    <Stack gap={4} className="flex-1 min-w-0">
                      <Text size="label" tone="default">Shipping Address</Text>
                      <Stack gap={1}>
                        {customer.shipping.map((l) => (
                          <Text key={l} size="body-sm" className="break-words">{l}</Text>
                        ))}
                      </Stack>
                    </Stack>

                    <Divider orientation="vertical" weight="hairline" />

                    {/* ── 4 · the contact person ───────────────────────────── */}
                    {/* The heading is back, and in `text/default` like the other
                        two — four columns with three headings read as one
                        column having been forgotten.

                        SMALLER than column 1 on purpose. The customer is what
                        this card is about; the contact person is someone at that
                        customer. `sm` avatar against `md`, `body` medium against
                        `body-lg` semibold — the same two facts drawn at two
                        weights, which is what says which one is subordinate.
                        Two identical blocks would have made them peers. */}
                    <Stack gap={4} className="flex-1 min-w-0">
                      <Text size="label" tone="default">Contact Person</Text>
                      <Stack gap={8}>
                        <Inline gap={4} align="center">
                          <Avatar name={customer.person.name} size="sm" />
                          <Stack gap={0} className="min-w-0 flex-1">
                            <Text weight="medium" truncate>{customer.person.name}</Text>
                            {/* Under the name and inside the same block, so the
                                pair aligns on the avatar's edge rather than the
                                designation starting back at the column's. */}
                            <Text size="body-sm" tone="secondary" truncate>
                              {customer.person.designation}
                            </Text>
                          </Stack>
                        </Inline>
                        <Stack gap={3}>
                          {contactLines(customer.person.email, customer.person.phone)}
                        </Stack>
                      </Stack>
                    </Stack>
                  </Inline>
                </Stack>
              </Surface>
            ) : null}
          </Stack>
          ) : step === 1 ? (
            /* ── STEP 2 · PRODUCTS & SERVICES ────────────────────────────────
               No card around it. The product table already draws its own
               bordered card and reclaims the body's margins to sit on the 12
               columns; wrapping it in a `Surface` would put a second frame
               around the first and push the whole block 20 off the grid the
               form above it is measured in. */
            <ProductTable
              title="Products / Services"
              /* ON THE HEADING'S LINE, because it is a fact about every row.
                 A `Toggle` and not a `Checkbox`: this is a mode the table is
                 in, not a thing being selected, and the switch shows both
                 states at once where a tick only shows one. */
              titleTrailing={(
                <Toggle
                  checked={taxInclusive}
                  onCheckedChange={setTaxInclusive}
                  label="Tax inclusive"
                  size="sm"
                />
              )}
              columns={itemColumns}
              rows={items}
              onRowsChange={setItems}
              totals={[
                { id: 'sub', label: 'Sub Total', kind: 'static', amount: '₹0.00' },
                ...(taxInclusive
                  ? [{ id: 'tax', label: 'Tax', kind: 'static' as const, amount: '₹0.00' }]
                  : []),
                { id: 'disc', label: 'Discount', kind: 'editable', input: '0', amount: '₹0.00' },
                { id: 'total', label: 'Total', kind: 'emphasis', amount: '₹0.00' },
              ]}
              onAddRow={() => setItems((r) => [
                ...r, { id: `i${r.length + 1}-${Date.now()}`, kind: 'item', values: {} },
              ])}
              onAddGroup={() => setItems((r) => [
                ...r, { id: `g${r.length + 1}-${Date.now()}`, kind: 'group', label: 'Item Header' },
              ])}
            />
          ) : (
            /* Steps 3 to 5 are not designed yet. Named rather than blank, so the
               wizard can be walked end to end and it is obvious which half of
               the flow exists. */
            <Surface pad={10} radius="card" border="default">
              <Stack gap={4}>
                <Text size="subheading">{STEPS[step].label}</Text>
                <Text tone="secondary">{STEPS[step].description}</Text>
              </Stack>
            </Surface>
          )}
        </Stack>
      </CreatePage>
    </>
  );
}
