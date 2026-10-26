import type { Meta, StoryObj } from '@storybook/react-vite';
import { Surface } from './Surface';
import { Inline, Stack, Text } from './index';

const meta = {
  title: 'Primitives/Surface',
  component: Surface,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Surface>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every surface role, in depth order. */
export const Tones: Story = {
  args: { children: 'Surface' },
  render: () => (
    <Inline gap={6} wrap align="start">
      {(['default', 'sunken', 'hover', 'pressed', 'disabled'] as const).map((tone) => (
        <Surface key={tone} tone={tone} pad={8} radius="lg" border="divider" className="w-rail">
          <Stack gap={1}>
            <Text size="body" weight="medium">{tone}</Text>
            <Text size="caption" tone="tertiary">surface/{tone}</Text>
          </Stack>
        </Surface>
      ))}
      <Surface tone="inverse" pad={8} radius="lg" className="w-rail">
        <Stack gap={1}>
          <Text size="body" weight="medium" tone="inverse">inverse</Text>
          <Text size="caption" tone="inverse">surface/inverse</Text>
        </Stack>
      </Surface>
    </Inline>
  ),
};

/**
 * Borders. `default` is 1.31:1 against white and FAILS WCAG 1.4.11's 3:1 for a
 * control boundary — nine components inherit that failure, and the neutral ramp
 * jumps from 2.85:1 to 4.52:1 with nothing near 3:1 in between.
 *
 * This is a system-level gap, not a per-component one. Open items 12 and 35.
 * Do not reach for `strong` to work around it: at 1.71:1 it is worse.
 */
export const Borders: Story = {
  args: { children: 'Border' },
  render: () => (
    <Inline gap={6} wrap align="start">
      {([
        ['default', '1.31:1 — fails 1.4.11'],
        ['strong', '1.71:1'],
        ['hover', '2.85:1'],
        ['divider', 'decorative, exempt'],
      ] as const).map(([border, note]) => (
        <Surface key={border} border={border} pad={8} radius="lg" className="w-rail">
          <Stack gap={1}>
            <Text size="body" weight="medium">{border}</Text>
            <Text size="caption" tone="tertiary">{note}</Text>
          </Stack>
        </Surface>
      ))}
    </Inline>
  ),
};

/** Radius. `md` is the default — 371 uses in the source. */
export const Radius: Story = {
  args: { children: '' },
  render: () => (
    <Inline gap={6} wrap align="start">
      {(['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'] as const).map((r) => (
        <Stack key={r} gap={2} align="center">
          <Surface tone="sunken" radius={r} border="default" pad={0} className="h-16 w-16" />
          <Text size="caption" tone="tertiary">{r}</Text>
        </Stack>
      ))}
    </Inline>
  ),
};

/** Padding, as steps on the 2px scale — the same vocabulary as Stack's `gap`. */
export const Padding: Story = {
  args: { children: '' },
  render: () => (
    <Inline gap={6} wrap align="start">
      {([[2, '4px'], [4, '8px'], [6, '12px'], [8, '16px'], [10, '20px'], [12, '24px']] as const)
        .map(([pad, px]) => (
          <Stack key={pad} gap={2} align="center">
            <Surface tone="sunken" pad={pad} radius="md" border="default">
              <Surface tone="inverse" pad={0} radius="xs" className="h-8 w-8" />
            </Surface>
            <Text size="caption" tone="tertiary">{pad} · {px}</Text>
          </Stack>
        ))}
    </Inline>
  ),
};

/**
 * Elevation. §1 of the md defines no scale (open item 13), so these four are
 * the values actually drawn in the file. Promoting them to roles is what stops
 * a fifth being invented — md §2.7.8 found Hover carrying four stacked drop
 * shadows sourced from nothing.
 */
export const Elevation: Story = {
  args: { children: '' },
  render: () => (
    <Inline gap={12} wrap align="start">
      {([
        ['raised', 'selected segment'],
        ['popover', 'popover, side panel'],
        ['modal', 'modal, date picker'],
        ['drawer', 'right-hand drawer'],
      ] as const).map(([e, use]) => (
        <Stack key={e} gap={3} align="center">
          <Surface elevation={e} radius="lg" pad={10} className="h-16 w-20" />
          <Stack gap={0} align="center">
            <Text size="caption">{e}</Text>
            <Text size="caption" tone="tertiary">{use}</Text>
          </Stack>
        </Stack>
      ))}
    </Inline>
  ),
};

/**
 * NESTING — the failure this component exists to prevent. md §2.14.3 found one
 * modal built as three stacked cards at radius 16, 11 and 10, with two borders
 * and two shadows. The visible result was a line across the middle of one
 * variant that nobody designed, and which did not appear in the other three.
 *
 * One card: one radius, one border, one shadow.
 */
export const Nesting: Story = {
  args: { children: '' },
  render: () => (
    <Stack gap={8}>
      <Stack gap={2}>
        <Text size="caption" tone="tertiary">Correct — one card, sunken regions inside it</Text>
        <Surface pad={10} radius="xl" border="divider" elevation="popover">
          <Stack gap={4}>
            <Text size="subheading">Shortage summary</Text>
            <Surface tone="sunken" pad={6} radius="md">
              <Text size="body" tone="secondary">A region, not a second card.</Text>
            </Surface>
            <Surface tone="sunken" pad={6} radius="md">
              <Text size="body" tone="secondary">No border, no shadow, no second radius.</Text>
            </Surface>
          </Stack>
        </Surface>
      </Stack>
    </Stack>
  ),
};

/** `grow` fills a flex parent and allows the region to scroll internally. */
export const Grow: Story = {
  args: { children: '' },
  render: () => (
    <Stack gap={4} className="h-page-header">
      <Surface tone="sunken" pad={6} radius="md" border="divider" grow>
        <Text size="body" tone="secondary">grow — takes the remaining height</Text>
      </Surface>
      <Surface pad={6} radius="md" border="divider">
        <Text size="body" tone="secondary">fixed — hugs its content</Text>
      </Surface>
    </Stack>
  ),
};
