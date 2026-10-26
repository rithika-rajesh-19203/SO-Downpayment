import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ColumnConfig } from './ColumnConfig';
import type { ColumnConfigItem } from './ColumnConfig';
import { Button } from '../Button/Button';
import { Stack, Text } from '../../primitives';

/**
 * **Nothing in `zf-design-cannon.md` measures this.** §2.24.2 measures the
 * trigger — *"a 60px cell holding `icon / table-config`"* — and stops. There is
 * no section for the dialog behind it, and no reorder list anywhere in the
 * system.
 *
 * So the shell is `Modal` (§2.14, measured), the rows borrow `Checkbox` and the
 * menu's 32px rhythm, and **the drag behaviour is invented**. Said out loud
 * rather than buried.
 */
const meta = {
  title: 'Components/ColumnConfig', component: ColumnConfig,
  parameters: { layout: 'centered' },
  args: { open: false, onClose: () => {}, items: [], onSave: () => {} },
} satisfies Meta<typeof ColumnConfig>;
export default meta;
type Story = StoryObj<typeof meta>;

const COLUMNS: ColumnConfigItem[] = [
  { id: 'date', label: 'Date', visible: true },
  { id: 'number', label: 'Purchase Order#', visible: true, locked: true },
  { id: 'reference', label: 'Reference#', visible: true },
  { id: 'vendor', label: 'Vendor Name', visible: true },
  { id: 'status', label: 'Status', visible: true },
  { id: 'billed', label: 'Billed Status', visible: true },
  { id: 'amount', label: 'Amount', visible: true },
  { id: 'expected', label: 'Expected Delivery', visible: false },
  { id: 'branch', label: 'Branch', visible: false },
];

function Demo() {
  const [open, setOpen] = useState(false);
  const [cols, setCols] = useState(COLUMNS);
  return (
    <Stack gap={6} align="center">
      <Button icon="table-config" onClick={() => setOpen(true)}>Configure columns</Button>
      <ColumnConfig
        open={open} onClose={() => setOpen(false)} items={cols}
        onSave={(next) => { setCols(next); setOpen(false); }}
      />
      <Text size="body-sm" tone="secondary">
        {cols.filter((c) => c.visible).map((c) => c.label).join(' · ')}
      </Text>
    </Stack>
  );
}

/**
 * **DRAG IS THE POINTER'S SHORTCUT, NEVER THE MECHANISM.**
 *
 * A list that only reorders by dragging is a **2.1.1 failure** — no keyboard, no
 * touch assistive tech, no switch access. So:
 *
 * **Tab to a handle and press ↑ or ↓.** The row moves. The handle is a real
 * `<button>` in the tab order, and this is the primary path; dragging moves the
 * same state through the same function.
 *
 * **Then drag one.** Pointer events with `setPointerCapture`, not HTML5
 * drag-and-drop — which cannot be made to work on touch at all, needs a drag
 * image nobody wants, and reports the element under the cursor rather than where
 * the pointer is. Capture gives one stream from press to release, on mouse, pen
 * and touch alike.
 *
 * **The handle is a dashed placeholder**, and normally that would be
 * unacceptable on the one affordance a feature depends on. It is survivable here
 * *precisely because* the affordance is not the mechanism — `drag-handle` is a
 * roster line with no export behind it yet.
 */
export const Default: Story = { args: { open: false, items: COLUMNS }, render: () => <Demo /> };

/**
 * **SAVE COMMITS, CLOSE DISCARDS — and the draft makes that true.**
 *
 * Untick two columns, drag a row, then press **Close**: the line under the
 * button is unchanged. Reopen and the list is as it was.
 *
 * Every edit is local until Save. A dialog offering Save and Close that has
 * already applied its changes is lying about one of the two buttons, and the
 * draft is re-seeded on open so a discarded one cannot survive into the next.
 *
 * **`Purchase Order#` is `locked`.** It cannot be hidden or moved, and its
 * handle and checkbox are both out: a list view whose identifying column can be
 * switched off is a list of blank rows.
 */
export const DraftAndLocked: Story = { args: { open: false, items: COLUMNS }, render: () => <Demo /> };
