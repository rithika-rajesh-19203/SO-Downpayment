import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { DetailsToolbar } from './DetailsToolbar';
import type { DetailsToolbarGroup } from './DetailsToolbar';
import { Stack, Surface, Text } from '../../primitives';

/**
 * §2.29 — the action row under `PageHeader` on a record.
 *
 * **All 16 hexes in §4.1 reproduce** against our primitives, and so does every
 * Light contrast figure. The Dark column is ours: `border/control`-style
 * per-mode pairs where the md prints one number, and every one of ours is
 * better (icon 7.60 vs 6.79, focus ring 7.69 vs 4.32).
 *
 * **§4.2's tint argument reproduces exactly — 1.04:1 — and then inverts in
 * Dark.** `surface/sunken` `#191C29` against `surface/hover` `#222536` is
 * **1.12**, better than the 1.07 we ship on `surface/default`. We still take
 * the untinted band: a bar tinted in one pane and not the other is two
 * components, and 0.05 of hover contrast does not buy that.
 */
const meta = {
  title: 'Components/DetailsToolbar', component: DetailsToolbar,
  parameters: { layout: 'fullscreen' },
  args: { groups: [] },
} satisfies Meta<typeof DetailsToolbar>;
export default meta;
type Story = StoryObj<typeof meta>;

/** §3 — three groups, at most four in one. Edit is always first, no caret. */
const GROUPS: DetailsToolbarGroup[] = [
  {
    id: 'document', label: 'Document',
    items: [
      { id: 'edit', label: 'Edit', icon: 'edit', onSelect: () => {} },
      { id: 'send', label: 'Send', icon: 'mail', menu: true, onSelect: () => {} },
      { id: 'share', label: 'Share', icon: 'share', onSelect: () => {} },
    ],
  },
  {
    id: 'workflow', label: 'Workflow',
    items: [
      { id: 'reminders', label: 'Reminders', icon: 'bell', menu: true, onSelect: () => {} },
      { id: 'pdf', label: 'PDF/Print', icon: 'pdf', menu: true, onSelect: () => {} },
    ],
  },
  {
    id: 'money', label: 'Payment',
    items: [
      { id: 'payment', label: 'Record Payment', icon: 'bank', onSelect: () => {} },
    ],
  },
];

function Bar({ groups = GROUPS, width }: { groups?: DetailsToolbarGroup[]; width?: string }) {
  const [more, setMore] = useState<string[]>([]);
  return (
    <Stack gap={4}>
      <div className={width}>
        <DetailsToolbar groups={groups} overflow={{ onSelect: setMore }} />
      </div>
      {more.length > 0 ? (
        <Text size="body-sm" tone="secondary" className="px-10">
          folded into ⋯ : {more.join(', ')}
        </Text>
      ) : null}
    </Stack>
  );
}

export const Default: Story = { render: () => <Bar /> };

/**
 * §5 — `aria-disabled`, never the `disabled` attribute. Arrow past it: the item
 * is still reachable and still announces. A `disabled` button would leave the
 * tab order entirely, and in a one-tab-stop toolbar a keyboard user would never
 * learn the action exists.
 */
export const Disabled: Story = {
  render: () => (
    <Bar groups={GROUPS.map((g) => ({
      ...g,
      items: g.items.map((i) => (i.id === 'share' || i.id === 'payment' ? { ...i, disabled: true } : i)),
    }))} />
  ),
};

/**
 * **The label hides before the icon does** — §3. Drag the Storybook panel or
 * narrow the window: the bar first drops every label, then folds items into
 * `⋯` from the right, and never below one.
 *
 * The md folds at 1100 / 900 / 700, which are **viewport** widths. This bar
 * lives in the detail column of a `SplitView`, behind a 353px mini list and a
 * 220px rail, so the viewport is up to 573px wider than the bar. Folding is
 * driven by a `ResizeObserver` on the bar's own content box instead.
 */
export const Folding: Story = {
  render: () => (
    <Stack gap={10}>
      {[
        ['full — every label', 'w-full'],
        ['≈640 — labels gone', 'w-3xs sm:w-md'],
        ['≈320 — folding from the right', 'w-3xs'],
      ].map(([note, w]) => (
        <Stack gap={2} key={w}>
          <Text size="overline" tone="secondary" className="px-10">{note}</Text>
          <div className={w as string}>
            <DetailsToolbar groups={GROUPS} overflow={{ onSelect: () => {} }} />
          </div>
        </Stack>
      ))}
    </Stack>
  ),
};

/**
 * What it is actually for: flush under the page header, **one** hairline
 * between them. §2 — the toolbar has no top border, because `PageHeader`
 * already draws a bottom stroke on all three of its variants and two adjacent
 * hairlines read as one 2px line.
 */
export const UnderTheHeader: Story = {
  render: () => (
    <Stack gap={0}>
      <div className="h-page-header flex items-center px-10 bg-surface-default border-b border-border-divider">
        <Text size="heading">INV-4318</Text>
      </div>
      <DetailsToolbar groups={GROUPS} overflow={{ onSelect: () => {} }} />
      <Surface tone="canvas" pad={10} radius="none">
        <Text tone="secondary">The record. The toolbar does not stick to it — §5.</Text>
      </Surface>
    </Stack>
  ),
};

export const PaneAndHue: Story = {
  render: () => (
    <div className="grid grid-cols-2">
      {(['light', 'dark'] as const).map((theme) => (
        <div key={theme} data-theme={theme} className="bg-surface-canvas">
          {(['blue', 'red'] as const).map((brand) => (
            <div key={brand} data-brand={brand}>
              <Text size="overline" tone="secondary" className="px-10 pt-6 block">
                {theme} · {brand}
              </Text>
              <DetailsToolbar groups={GROUPS} overflow={{ onSelect: () => {} }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};
