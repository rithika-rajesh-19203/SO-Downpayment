import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { SplitView } from './SplitView';
import { MiniList } from '../MiniList/MiniList';
import type { MiniListItem } from '../MiniList/MiniList';
import { PageChrome } from '../PageChrome/PageChrome';
import { PageHeader } from '../PageHeader/PageHeader';
import { DescriptionList } from '../DescriptionList/DescriptionList';
import { Stack, Surface, Text } from '../../primitives';

/**
 * The two-column detail view: a `MiniList` on the left, the record it points at
 * on the right.
 *
 * **The whole component is three declarations**, and each one is a bug that has
 * already been paid for elsewhere:
 *
 * - `min-h-0` on the row, so a column can be shorter than its content and hold
 *   its own scrollbar. Without it both columns grow and the *page* scrolls, so
 *   the mini list's toolbar leaves the screen.
 * - `min-w-0` on the detail column, so a wide table inside the record cannot set
 *   the column's min-content width and shove the fixed 353px list off the left
 *   edge — where there is no way to scroll back to it.
 * - Nothing about the list's width or its edge. `MiniList` owns both.
 */
const meta = {
  title: 'Components/SplitView', component: SplitView,
  parameters: { layout: 'fullscreen' },
  args: { list: null, children: null },
} satisfies Meta<typeof SplitView>;
export default meta;
type Story = StoryObj<typeof meta>;

const ITEMS: MiniListItem[] = [
  { id: '1', name: 'Kaniyan Amudhan', amount: '₹372.00', meta: ['INV-4318', '01 Jul 2024'], status: 'Overdue by 30 days', statusVariant: 'overdue' },
  { id: '2', name: 'Meridian Textiles', amount: '₹3,12,750', meta: ['INV-4317', '28 Jun 2024'], status: 'Sent', statusVariant: 'pending' },
  { id: '3', name: 'Anantha Foods', amount: '₹4,820', meta: ['INV-4316', '24 Jun 2024'], status: 'Paid', statusVariant: 'success' },
  { id: '4', name: 'Nilgiri Retail', amount: '₹58,120', meta: ['INV-4315', '18 Jun 2024'], status: 'Draft', statusVariant: 'draft' },
  { id: '5', name: 'Bharat Pharma', amount: '₹9,21,340', meta: ['INV-4314', '15 Jun 2024'], status: 'Sent', statusVariant: 'pending' },
];

function Demo() {
  const [active, setActive] = useState('1');
  const record = ITEMS.find((i) => i.id === active)!;

  return (
    //  `h-dvh` is the STORY's job, not the component's. A split view fills the
    //  shell's body cell; here there is no shell, so the story supplies a height
    //  for it to fill. Giving the component its own would break it inside one.
    <div className="flex h-dvh">
      <SplitView
        list={(
          <MiniList
            label="Invoices" items={ITEMS} activeId={active} onActivate={setActive}
            views={[{ id: 'all', label: 'All Invoices' }]} viewId="all"
            onViewChange={() => {}} onCreate={() => {}}
          />
        )}
      >
        <PageChrome>
          <PageHeader
            type="detail"
            title={record.meta?.[0] ?? record.name}
            parent={{ label: 'Invoices', href: '#' }}
            onBack={() => {}}
            cta={{ label: 'Record Payment', onSelect: () => {} }}
          />
        </PageChrome>
        <Surface tone="canvas" pad={0} radius="none" className="flex-1 min-h-0 overflow-y-auto">
          <Stack gap={8} className="p-10">
            <Surface pad={10} border="default">
              <Stack gap={8}>
                <Text size="subheading">{record.name}</Text>
                <DescriptionList items={[
                  { label: 'Invoice#', value: record.meta?.[0] ?? '—' },
                  { label: 'Invoice date', value: record.meta?.[1] ?? '—' },
                  { label: 'Amount', value: record.amount ?? '—' },
                  { label: 'Status', value: record.status ?? '—' },
                ]} />
              </Stack>
            </Surface>
            {/* Enough content to prove the two scrollers are independent:
                scroll this side and the list does not move. */}
            <Surface pad={10} border="default">
              <Stack gap={6}>
                <Text size="subheading">Activity</Text>
                {Array.from({ length: 14 }, (_, n) => (
                  <Text key={n} tone="secondary">Entry {n + 1} — the detail column scrolls on its own.</Text>
                ))}
              </Stack>
            </Surface>
          </Stack>
        </Surface>
      </SplitView>
    </div>
  );
}

export const Default: Story = { render: () => <Demo /> };

export const Dark: Story = {
  render: () => <div data-theme="dark"><Demo /></div>,
};
