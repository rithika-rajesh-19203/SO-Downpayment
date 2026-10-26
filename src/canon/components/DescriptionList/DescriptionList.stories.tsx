import type { Meta, StoryObj } from '@storybook/react-vite';
import { DescriptionList } from './DescriptionList';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import { Stack, Surface, Text } from '../../primitives';

/**
 * The body of a detail view — a record's fields as label/value pairs.
 *
 * **There is no md for this one.** It is the fourteenth component in the canon
 * with no contract on disk, and the only geometry it invents is the label
 * column: `chrome/field-label` at 140px, a text-fitted width, named rather than
 * inlined so two detail views cannot disagree about it.
 *
 * The reason it is a component at all is `<dl>`. Same pixels as two columns of
 * divs, different content: a screen reader announces the **pair**, rather than
 * eleven labels followed by eleven unattached numbers.
 */
const meta = {
  title: 'Components/DescriptionList', component: DescriptionList,
  parameters: { layout: 'padded' },
  args: { items: [] },
} satisfies Meta<typeof DescriptionList>;
export default meta;
type Story = StoryObj<typeof meta>;

const ITEMS = [
  { label: 'Invoice#', value: 'INV-4318' },
  { label: 'Order#', value: 'SO-1182' },
  { label: 'Invoice date', value: '01 Jul 2024' },
  { label: 'Due date', value: <Text as="span" tone="danger">31 Jul 2024</Text> },
  { label: 'Amount', value: <Text as="span" weight="medium" className="tabular-nums">₹3,72,000</Text> },
  { label: 'Status', value: <StatusBadge status="overdue">Overdue by 30 days</StatusBadge> },
  { label: 'Location', value: 'Chennai, Tamil Nadu' },
];

export const Inline: Story = {
  render: () => (
    <Surface pad={10} border="default" className="max-w-lg">
      <DescriptionList items={ITEMS} />
    </Surface>
  ),
};

/** For a column too narrow to give 140px away. */
export const Stacked: Story = {
  render: () => (
    <Surface pad={10} border="default" className="max-w-2xs">
      <DescriptionList items={ITEMS} layout="stacked" />
    </Surface>
  ),
};

/**
 * The point of the fixed label column: **every value starts at the same x**,
 * however ragged the labels are. Stacked has no column to keep, so it does not
 * care — which is exactly when to reach for it.
 */
export const RaggedLabels: Story = {
  render: () => (
    <Surface pad={10} border="default" className="max-w-lg">
      <DescriptionList items={[
        { label: 'PO#', value: 'PO-00219' },
        { label: 'Balance due', value: '₹12,400' },
        { label: 'Vendor', value: 'Kaveri Logistics' },
        { label: 'Expected delivery date', value: '18 Aug 2024' },
      ]} />
    </Surface>
  ),
};

/**
 * A value with no natural break — an email, a URL, a reference string. It wraps
 * inside its column rather than widening the row, because the `<dd>` carries
 * `min-w-0` and `break-words`. Without them, one long token pushes the whole
 * detail column past the split and the mini list slides off the left edge.
 */
export const LongValue: Story = {
  render: () => (
    <Surface pad={10} border="default" className="max-w-sm">
      <DescriptionList items={[
        { label: 'Reference#', value: 'ZBK-2024-TN-CHN-000000418822-REV2' },
        { label: 'Billing email', value: 'accounts.payable.chennai@kaverilogistics.example.com' },
      ]} />
    </Surface>
  ),
};

export const PaneAndHue: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid grid-cols-2">
      {(['light', 'dark'] as const).map((theme) => (
        <div key={theme} data-theme={theme} className="bg-surface-canvas p-10">
          <Stack gap={6}>
            <Text size="overline" tone="secondary">{theme}</Text>
            <Surface pad={10} border="default">
              <DescriptionList items={ITEMS} />
            </Surface>
          </Stack>
        </div>
      ))}
    </div>
  ),
};
