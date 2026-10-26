import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ProductTable } from './ProductTable';
import type { ProductColumn, ProductRow, TotalRow } from './types';
import { Stack, Text } from '../../primitives';

/**
 * The editable line-item grid. **Not `Table`** — that one is read-only, and §1
 * is explicit that one component must not do both jobs: *a data table's row
 * click navigates; a product table's row click puts a cursor in a cell.*
 *
 * Three findings from the md reproduce exactly against our own tokens:
 *
 * · **`surface/raised` cannot raise anything.** In Light it aliases
 *   `base/white`, the same alias as `surface/default`, so a lifted row would be
 *   a no-op; in Dark it aliases `neutral/1900`, the same as `surface/hover`, so
 *   a lifted row would be indistinguishable from a hovered one. The lift is a
 *   1px `primary/default` inset border instead. Open item 47.
 * · **`text/placeholder` is 2.85:1** — exactly the md's figure, and below what
 *   1.4.3 asks of text. It is never the only copy in a cell.
 * · **`surface/hover` is 1.07:1 in Dark.** The row tint is effectively
 *   invisible there, so the lane controls appearing are what actually signal
 *   the hover — reinforcement, not the signal.
 */
const meta = {
  title: 'Components/ProductTable', component: ProductTable,
  parameters: { layout: 'fullscreen' },
  args: { columns: [], rows: [], onRowsChange: () => {} },
} satisfies Meta<typeof ProductTable>;
export default meta;
type Story = StoryObj<typeof meta>;

const PRODUCTS = [
  { value: 'a4', label: 'A4 Copier Paper' },
  { value: 'toner', label: 'Toner Cartridge' },
  { value: 'binder', label: 'Ring Binder' },
];
const CATEGORIES = [
  { value: 'stationery', label: 'Stationery' },
  { value: 'consumables', label: 'Consumables' },
];

const COLUMNS: ProductColumn[] = [
  { id: 'product', label: 'Product', kind: 'select', width: 300, min: 120, options: PRODUCTS, placeholder: 'Select Product' },
  { id: 'description', label: 'Description', kind: 'input', width: 200, min: 120, placeholder: 'Description' },
  //  §4.1 — Qty, Rate and Discount are LEFT-aligned. That is deliberate for an
  //  editable grid: the caret lands where the eye already is, and a
  //  right-aligned input whose value grows leftward is disorienting while
  //  typing. The totals card right-aligns, because those are read, not typed.
  { id: 'qty', label: 'Qty', kind: 'input', width: 200, min: 80, format: 'numeric', placeholder: '0' },
  { id: 'rate', label: 'Rate', kind: 'input', width: 200, min: 80, format: 'decimal', placeholder: '0.00' },
  { id: 'category', label: 'Category', kind: 'select', width: 215, min: 120, options: CATEGORIES, placeholder: 'Select Category' },
  //  Exactly one flexible column, and it still needs a real min — §4.2.
  { id: 'discount', label: 'Discount', kind: 'input', width: 126, min: 80, flex: true, resizable: false, format: 'numeric', placeholder: '0' },
];

const ROWS: ProductRow[] = [
  { id: '1', kind: 'item', values: { product: 'a4', description: 'A4 80gsm, 500 sheets', qty: '20', rate: '240.00', category: 'stationery', discount: '5' } },
  { id: 'g1', kind: 'group', label: 'Item Header' },
  { id: '2', kind: 'item', values: { product: 'toner', description: 'Black, high yield', qty: '4', rate: '3,150.00', category: 'consumables', discount: '0' } },
  { id: '3', kind: 'item', values: { product: '', description: '', qty: '', rate: '', category: '', discount: '' } },
];

const TOTALS: TotalRow[] = [
  { id: 'sub', label: 'Sub Total', kind: 'static', amount: '₹17,400.00' },
  { id: 'disc', label: 'Discount', kind: 'editable', input: '5', amount: '−₹870.00' },
  { id: 'ship', label: 'Shipping Charges', kind: 'editable', input: '0', amount: '₹0.00' },
  { id: 'total', label: 'Total', kind: 'emphasis', amount: '₹16,530.00' },
];

/**
 * **The host body needs `padding-inline: 20px 30px`, not `20px 20px`** — §2.1.
 * The right lane is 30 and a symmetric body clips the delete control by 10. The
 * wrapper below is that host.
 */
function Host({ rows: initial = ROWS, totals = TOTALS as TotalRow[] | undefined }) {
  const [rows, setRows] = useState(initial);
  return (
    <div className="bg-surface-default ps-10 pe-15 py-16">
      <ProductTable
        title="Add Products"
        columns={COLUMNS}
        rows={rows}
        onRowsChange={setRows}
        totals={totals}
        onAddRow={() => setRows((r) => [...r, { id: String(Date.now()), kind: 'item', values: {} }])}
        onAddGroup={() => setRows((r) => [...r, { id: String(Date.now()), kind: 'group', label: 'Item Header' }])}
      />
    </div>
  );
}

export const Default: Story = { render: () => <Host /> };

/**
 * §15 — the head band is already meaningful, so the empty state is one 34px row
 * of copy rather than an illustration. The lanes are present but empty.
 */
export const Empty: Story = { render: () => <Host rows={[]} totals={undefined} /> };

/**
 * §11 — a group row is one full-width cell: no dividers, no index, but the rail
 * `⋯` stays so the group can be renamed or removed. **The index counts across
 * the break** — 1, *Item Header*, 2, 3 — because those are the document's line
 * numbers.
 */
export const GroupRows: Story = { render: () => <Host /> };

/**
 * **Try the keyboard.** Tab to a row's grip: Space lifts it, ↑ ↓ move it, Space
 * drops, Escape cancels, and every move is announced through a polite live
 * region. Tab to a column boundary: it is a `role="separator"` with
 * `aria-valuenow` in px, and ← → resize by 8.
 */
export const Keyboard: Story = { render: () => <Host /> };

export const Dark: Story = {
  render: () => (
    <div data-theme="dark">
      <Stack gap={0}>
        <Text size="overline" tone="secondary" className="ps-10 pt-8 bg-surface-default block">dark</Text>
        <Host />
      </Stack>
    </div>
  ),
};
