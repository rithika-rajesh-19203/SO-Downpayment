import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Tabs } from './Tabs';
import { Segmented } from '../Segmented/Segmented';
import { DescriptionList } from '../DescriptionList/DescriptionList';
import { Stack, Surface, Text } from '../../primitives';

/**
 * One record, several views of it. **No md on disk** — measured off the
 * reference and built to the ARIA tabs pattern, which is worth following
 * literally: tabs are the control most often built out of buttons and `hidden`,
 * and that announces as a row of buttons beside some text with no stated
 * relationship between them.
 *
 * The four things that make it a tab: **one tab stop** for the strip (arrows
 * move between, Tab moves past), the panel `aria-labelledby` its tab and the tab
 * `aria-controls` its panel, selection following focus, and a **2px** indicator
 * — at 1 it sits on the strip's own 1px rule and the two read as one slightly
 * darker hairline.
 */
const meta = {
  title: 'Components/Tabs', component: Tabs,
  parameters: { layout: 'padded' },
  args: { items: [], value: '', onChange: () => {}, label: 'Views', children: null },
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

const ITEMS = [
  { id: 'details', label: 'Invoice Details' },
  { id: 'activity', label: 'Activity', badge: '12' },
  { id: 'journals', label: 'Journals' },
];

function Demo({ trailing = false, disabled = false }) {
  const [tab, setTab] = useState('details');
  const [view, setView] = useState('details');
  const items = disabled
    ? ITEMS.map((t) => (t.id === 'journals' ? { ...t, disabled: true } : t))
    : ITEMS;
  return (
    <Surface pad={0} radius="card" border="default" className="overflow-hidden">
      <Tabs
        items={items} value={tab} onChange={setTab} label="Invoice views"
        trailing={trailing ? (
          <Segmented
            label="View" size="sm" value={view} onChange={setView}
            options={[{ value: 'details', label: 'Details' }, { value: 'pdf', label: 'PDF' }]}
          />
        ) : undefined}
      >
        <Stack gap={8} className="p-10">
          <Text size="subheading">{items.find((t) => t.id === tab)?.label}</Text>
          {tab === 'details' ? (
            <DescriptionList items={[
              { label: 'Invoice#', value: 'INV-4318' },
              { label: 'Order#', value: 'SO-1182' },
              { label: 'Invoice date', value: '01 Jul 2024' },
            ]} />
          ) : <Text tone="secondary">The {tab} panel.</Text>}
        </Stack>
      </Tabs>
    </Surface>
  );
}

export const Default: Story = { render: () => <Demo /> };

/**
 * `trailing` — a control on the strip's baseline that acts on whichever tab is
 * open. It is outside the arrow-key model on purpose: it is not a tab, and
 * arrowing onto it would say it was.
 */
export const WithTrailingControl: Story = { render: () => <Demo trailing /> };

/**
 * A disabled tab is **skipped by the arrows**, not focused-and-inert. A disabled
 * menu row in place is discoverable; a tab is a destination, and arrowing onto
 * one you cannot open is a dead end with nothing to explain it.
 */
export const DisabledTab: Story = { render: () => <Demo disabled trailing /> };

export const PaneAndHue: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid grid-cols-2">
      {(['light', 'dark'] as const).map((theme) => (
        <div key={theme} data-theme={theme} className="bg-surface-canvas p-10">
          <Stack gap={6}>
            <Text size="overline" tone="secondary">{theme}</Text>
            <Demo trailing />
          </Stack>
        </div>
      ))}
    </div>
  ),
};
