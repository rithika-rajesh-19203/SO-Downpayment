import { useState } from 'react';
import {
  Button, CreatePage, FormRow, FormSection, InputField, PageHeader, ProductTable,
  Select, Stack,
} from '@canon';
import type { InputFormat, ProductColumn, ProductRow, TotalRow } from '@canon';

/**
 * PURCHASES → PURCHASE AGREEMENTS → NEW.
 *
 * `ZF-CREATE-PAGE.md`'s grid with five fields in it, a divider, and the
 * line-item table beneath.
 *
 * ── HOW THE FIVE FIELDS ARE SPLIT, AND WHY IT IS NOT THE OBVIOUS SPLIT ──────
 * Read in visual rows the fields would go Name / Vendor, Type / Valid From,
 * Expires On — and the DOM would have to zig-zag across the halves to produce
 * it. §5 forbids that outright: **2.4.3, DOM order is tab order**, left half top
 * to bottom then right, and a two-column form whose focus hops sideways every
 * row tabs in an order nobody expects.
 *
 * So the fill is column-major, three then two:
 *
 * ```
 *   Agreement Name*   |   Valid From
 *   Vendor            |   Expires On
 *   Agreement Type    |
 * ```
 *
 * Which turns out to read better than the row-major version anyway — the two
 * dates end up adjacent instead of split across a half boundary, and the three
 * fields that identify the agreement stay together.
 */
export interface NewPurchaseAgreementProps {
  onCancel: () => void;
  onSave: () => void;
}

const VENDORS = [
  { value: 'kaveri', label: 'Kaveri Logistics' },
  { value: 'meridian', label: 'Meridian Textiles' },
  { value: 'anantha', label: 'Anantha Foods' },
  { value: 'bharat', label: 'Bharat Pharma' },
  { value: 'nilgiri', label: 'Nilgiri Retail' },
];

const TYPES = [
  { value: 'item', label: 'Item Based' },
  { value: 'amount', label: 'Amount Based' },
];

const PRODUCTS = [
  { value: 'a4', label: 'A4 Copier Paper' },
  { value: 'toner', label: 'Toner Cartridge' },
  { value: 'binder', label: 'Ring Binder' },
  { value: 'stapler', label: 'Heavy-duty Stapler' },
];

const CATEGORIES = [
  { value: 'stationery', label: 'Stationery' },
  { value: 'consumables', label: 'Consumables' },
  { value: 'equipment', label: 'Equipment' },
];

/**
 * §4 — the index and the rail are fixed; the six data columns are resizable and
 * these widths are DEFAULTS the component keeps in state, not constants.
 *
 * Exactly one column is `flex`, and it still carries a real `min`: §4.2's trap
 * is that under `table-layout: fixed` a `<col>` with no width gets the leftover
 * **including none**, so the flexible column renders at 0 rather than at its
 * minimum — and 0 from first paint at a narrow viewport.
 *
 * Qty, Rate and Discount are LEFT-aligned (§4.1). That is deliberate for an
 * editable grid: the caret lands where the eye already is, and a right-aligned
 * input whose value grows leftward is disorienting while typing. The totals card
 * right-aligns, because those are read rather than typed.
 */
const PT_COLUMNS: ProductColumn[] = [
  { id: 'product', label: 'Product', kind: 'select', width: 300, min: 120, options: PRODUCTS, placeholder: 'Select Product' },
  { id: 'description', label: 'Description', kind: 'input', width: 200, min: 120, placeholder: 'Description' },
  { id: 'qty', label: 'Qty', kind: 'input', width: 200, min: 80, format: 'numeric', placeholder: '0' },
  { id: 'rate', label: 'Rate', kind: 'input', width: 200, min: 80, format: 'decimal', placeholder: '0.00' },
  { id: 'category', label: 'Category', kind: 'select', width: 215, min: 120, options: CATEGORIES, placeholder: 'Select Category' },
  { id: 'discount', label: 'Discount', kind: 'input', width: 126, min: 80, flex: true, resizable: false, format: 'numeric', placeholder: '0' },
];

const PT_ROWS: ProductRow[] = [
  { id: 'r1', kind: 'item', values: {} },
];

const PT_TOTALS: TotalRow[] = [
  { id: 'sub', label: 'Sub Total', kind: 'static', amount: '₹0.00' },
  { id: 'disc', label: 'Discount', kind: 'editable', input: '0', amount: '₹0.00' },
  { id: 'ship', label: 'Shipping Charges', kind: 'editable', input: '0', amount: '₹0.00' },
  { id: 'total', label: 'Total', kind: 'emphasis', amount: '₹0.00' },
];

export function NewPurchaseAgreement({ onCancel, onSave }: NewPurchaseAgreementProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const set = (k: string) => (v: string) => setValues((p) => ({ ...p, [k]: v }));
  const [ptRows, setPtRows] = useState<ProductRow[]>(PT_ROWS);

  //  One helper each, so no row can quietly differ from its neighbours in how it
  //  wires `id`, `required` and `aria-required` — §5's first two rows.
  const text = (key: string, placeholder: string, format?: InputFormat) =>
    ({ id, required }: { id: string; required: boolean }) => (
      <InputField
        id={id} value={values[key] ?? ''} onChange={(e) => set(key)(e.target.value)}
        placeholder={placeholder} required={required} aria-required={required || undefined}
        format={format}
      />
    );

  const select = (key: string, options: typeof VENDORS, placeholder: string) =>
    ({ id, required }: { id: string; required: boolean }) => (
      <Select
        id={id} options={options} value={values[key] ?? ''} onChange={set(key)}
        placeholder={placeholder} required={required}
      />
    );

  return (
    <>
      <PageHeader type="create" title="New Purchase Agreement" />

      <CreatePage
        //  §2.1 — the delete lane is 30 and hangs outside the card. A body with
        //  symmetric 20s clips it by 10, and 62% of the target becomes
        //  unhittable. Amend the host; never shrink the lane.
        reserveEndLane
        footer={(
          <>
            {/* Save FIRST — §7.1. */}
            <Button onClick={onSave}>Save</Button>
            <Button emphasis="secondary" onClick={onCancel}>Cancel</Button>
          </>
        )}
      >
        {/* THE 40 IS A `Stack` GAP, not a margin on a wrapper. `npm run check`
            rejected the wrapper — rule 4, no styled bare element in a screen —
            and it was right to: `gap-20` is the same 40 with the spacing owned
            by a canon component instead of by this file.

            NO `last` any more, so the section draws its own 1px `border/divider`
            rule beneath itself — which is where the divider comes from. It is
            `FormSection`'s own, not a rule added here: a divider drawn by the
            screen would sit at the screen's idea of the section's bottom, and
            the section's own padding would then be above it or below it
            depending on which file was edited last. */}
        {/* `gap={0}` — the divider's room is `FormSection`'s now, both sides.
            With a gap here as well the space below the rule would be 25 plus
            whatever this said, and the two numbers would drift the first time
            either was touched. */}
        <Stack gap={0}>
        <FormSection
          dividerGap="tight"
          trailing={(
            <>
              <FormRow label="Valid From">{text('validFrom', 'DD/MM/YYYY', 'date')}</FormRow>
              <FormRow label="Expires On">{text('expiresOn', 'DD/MM/YYYY', 'date')}</FormRow>
            </>
          )}
        >
          <FormRow label="Agreement Name" required>
            {text('name', 'Name this agreement')}
          </FormRow>
          <FormRow label="Vendor" required>
            {select('vendor', VENDORS, 'Select a vendor')}
          </FormRow>
          <FormRow label="Agreement Type">
            {select('type', TYPES, 'Select a type')}
          </FormRow>
        </FormSection>

          {/* §2 — the product table "always appears inside a creation page as
              defined by ZF-CREATE-PAGE.md". It is NOT a form row: it takes the
              full width and opts out of the 2/3/1 label/control/slack split
              entirely, which is why it sits here rather than inside a
              `FormRow span="full"`.

              Its own `-ms-10 -me-15` reclaims the body's margins, so the card
              lands exactly on the 12 columns the form above it is measured in. */}
          <ProductTable
            title="Add Products"
            columns={PT_COLUMNS}
            rows={ptRows}
            onRowsChange={setPtRows}
            totals={PT_TOTALS}
            onAddRow={() => setPtRows((r) => [
              ...r, { id: `r${r.length + 1}-${Date.now()}`, kind: 'item', values: {} },
            ])}
            onAddGroup={() => setPtRows((r) => [
              ...r, { id: `g${r.length + 1}-${Date.now()}`, kind: 'group', label: 'Item Header' },
            ])}
          />
        </Stack>
      </CreatePage>
    </>
  );
}
