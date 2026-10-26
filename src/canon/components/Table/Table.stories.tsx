import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Table } from './Table';
import type { TableColumn, TableSort } from './Table';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import { Stack, Text } from '../../primitives';

/**
 * §2.24 Type 1 — the module list view. The source is the least-bound family in
 * the whole file: **164 nodes, 148 paints, 5 of them bound.**
 *
 * Every contrast figure §2.24 states was recomputed against our own primitives
 * and **all eight reproduce**: header label 6.04 / 8.15, body 15.15 / 15.00,
 * link 5.92 / 7.69, sort caret 4.32 / 5.86, band 1.12, band-on-hover 1.04, row
 * rule 1.20.
 */
const meta = {
  title: 'Components/Table', component: Table,
  parameters: { layout: 'padded' },
  args: { caption: '', columns: [], rows: [], rowKey: () => '' },
} satisfies Meta<typeof Table>;
export default meta;
type Story = StoryObj<typeof meta>;

interface Row {
  id: string; date: string; number: string; vendor: string;
  status: 'Issued' | 'Closed' | 'Draft'; qty: number;
}

const ROWS: Row[] = [
  { id: '1', date: '24 Aug 2026', number: 'PO-00042', vendor: 'Sundar Metalworks', status: 'Issued', qty: 383 },
  { id: '2', date: '21 Aug 2026', number: 'PO-00041', vendor: 'Kavery Packaging', status: 'Closed', qty: 12 },
  { id: '3', date: '19 Aug 2026', number: 'PO-00040', vendor: 'Nilgiri Components Pvt Ltd', status: 'Draft', qty: 4096 },
];

const TONE = { Issued: 'in-progress', Closed: 'success', Draft: 'draft' } as const;

const COLUMNS: TableColumn<Row>[] = [
  { id: 'date', header: 'Date', sortable: true, cell: (r) => r.date },
  {
    id: 'number', header: 'Purchase Order', sortable: true,
    cell: (r) => <Text as="a" href="#" tone="link" weight="medium">{r.number}</Text>,
  },
  { id: 'vendor', header: 'Vendor Name', sortable: true, cell: (r) => <Text as="span" truncate>{r.vendor}</Text> },
  {
    id: 'status', header: 'Status',
    cell: (r) => <StatusBadge status={TONE[r.status]}>{r.status}</StatusBadge>,
  },
  { id: 'qty', header: 'Total Qty', align: 'end', sortable: true, cell: (r) => r.qty },
];

/**
 * **THE LIST TABLE, and four defects it does not have.**
 *
 * **Look at the left edge of the first column.** There is 12px of inset.
 * §2.24.3 measured the source's text beginning **1.25px** after the column
 * boundary — no inset at all — so every column here moves 12–13px. Twelve is
 * the smallest value that stops a left-aligned value touching the cell edge once
 * a border or a selected fill sits behind it.
 *
 * **Now look at `Total Qty`, and imagine renaming it to `Qty`.** Nothing moves.
 * In the source it would: the numbers right-aligned to the width of the
 * *header's words* — `Total QTY` at x=884 with its data at 951, which is the
 * right edge of the text, not of the column. `align: 'end'` moves the header and
 * the data to the same edge, which is why one figure in the rebuild sits
 * **65.6px** from where it was drawn. The single largest deviation in §2.24, and
 * it is the bug being removed.
 *
 * **Look at the header band.** `#FAFAFD` against a white row is **1.02:1** —
 * present in the file, absent on screen; what reads in a screenshot is the rule
 * beneath it. `table/head` is **1.12** against a row and **1.04** against a
 * hovered one, so the band stays distinguishable from both. It is a role of its
 * own rather than `surface/sunken`, which shares its Light value but goes
 * *darker* than the surface in Dark, where a header needs to go lighter.
 *
 * **Then hover a row and look at the band again.** Both are visible, and neither
 * is the other. §2.24.9: in the source `#FAFAFF` was Type 2's header *and* Type
 * 1's hovered row — one colour meaning two things, so one of them loses.
 */
export const Default: Story = {
  render: function Sorted() {
    const [sort, setSort] = useState<TableSort>({ columnId: 'date', direction: 'desc' });
    return (
      <Table caption="Purchase orders" columns={COLUMNS} rows={ROWS}
        rowKey={(r) => r.id} sort={sort} onSortChange={setSort} />
    );
  },
};

/**
 * **SORTING — click any header.**
 *
 * The caret appears on the sorted column only; a caret on every header says
 * nothing. It is `primary/default` at **4.32:1**, where the source's `#408DFB`
 * was 3.27 and is the unowned bright blue that open item 25 has now met **eight
 * times** across the file.
 *
 * The whole 36px band is the target, not the 11px label — 36 ≥ 24, so 2.5.8
 * passes. `aria-sort` lands on the `<th>` and the button is the `th`'s content,
 * which §2.24.8 grades REVIEW because no Figma variant can express it.
 *
 * **`sort` is controlled, and deliberately.** The component knows which column
 * is sorted and in which direction; it does not know how to compare two rows.
 * A date sorted as "24 Aug 2026" sorts by day-of-month and an amount sorted as
 * a string puts ₹9,375 above ₹9,21,340 — both look right until the tenth row,
 * and both are the caller's data problem, not the table's.
 */
export const Sorting: Story = {
  render: function SortStory() {
    const [sort, setSort] = useState<TableSort>({ columnId: 'qty', direction: 'asc' });
    const rows = [...ROWS].sort((a, b) => {
      const k = sort.columnId as keyof Row;
      const [x, y] = [a[k], b[k]];
      const d = typeof x === 'number' && typeof y === 'number'
        ? x - y : String(x).localeCompare(String(y));
      return sort.direction === 'asc' ? d : -d;
    });
    return (
      <Stack gap={6}>
        <Text tone="secondary">Sorted by {sort.columnId}, {sort.direction}.</Text>
        <Table caption="Purchase orders, sortable" columns={COLUMNS} rows={rows}
          rowKey={(r) => r.id} sort={sort} onSortChange={setSort} />
      </Stack>
    );
  },
};

/**
 * **NOT SORTABLE.** Omit `onSortChange` and no column renders a control, even
 * the ones marked `sortable`. One prop, not two states to keep in step.
 */
export const Static: Story = {
  render: () => (
    <Table caption="Purchase orders, read only" columns={COLUMNS} rows={ROWS} rowKey={(r) => r.id} />
  ),
};

/**
 * **EMPTY.** An empty table still has its header, so the columns are still
 * readable and the sort controls still work — the view is empty, the table is
 * not broken. `empty` fills the body.
 */
export const Empty: Story = {
  render: () => (
    <Table caption="Purchase orders, none" columns={COLUMNS} rows={[]} rowKey={(r) => r.id}
      empty={<Text tone="secondary">No purchase orders match this view.</Text>} />
  ),
};

/**
 * **NARROW — the answer to open item 16.**
 *
 * §2.24.11: *"Column widths are fixed in the component and every product will
 * want different ones… a 7-column component is a sample, not a contract."*
 *
 * The widths are content-driven, which invents nothing — they come from the
 * data. What keeps that honest on a narrow viewport is the horizontal scroll:
 * the alternative is squeezing seven columns until every one is illegible.
 * **Drag this story's frame narrower and the table scrolls inside its own
 * border** rather than the page scrolling sideways.
 */
export const Narrow: Story = {
  render: () => (
    <Stack gap={6} className="max-w-md">
      <Text tone="secondary">A 480px column, seven columns of data.</Text>
      <Table caption="Purchase orders, narrow" columns={COLUMNS} rows={ROWS} rowKey={(r) => r.id} />
    </Stack>
  ),
};

/**
 * **PANE AND HUE.** The band, the rule and the link all move with the pane; the
 * badge fills come from the component token layer. Nothing here is hue-dependent
 * — `primary/*` stays blue in a red product, which is the whole reason
 * `primary` and `brand` are separate families.
 */
export const PaneAndHue: Story = {
  render: () => (
    <Stack gap={0}>
      {(['light', 'dark'] as const).map((theme) => (
        <div key={theme} data-theme={theme} className="bg-surface-canvas p-10">
          <Table caption={`Purchase orders, ${theme}`} columns={COLUMNS} rows={ROWS}
            rowKey={(r) => r.id} />
        </div>
      ))}
    </Stack>
  ),
};
