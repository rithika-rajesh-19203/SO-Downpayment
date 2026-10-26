import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider';
import { Stack, Text } from '../../primitives';

/**
 * A thematic break between two blocks. An `<hr>`, so it carries
 * `role="separator"` for free — and so a screen can draw a rule without a bare
 * element, which rule 4 forbids.
 *
 * `tight` is **the same 25** `FormSection dividerGap="tight"` uses, on purpose:
 * a page whose form dividers breathe at 25 and whose block dividers breathe at
 * something else has two rhythms and no reason for either.
 */
const meta = {
  title: 'Components/Divider', component: Divider,
  parameters: { layout: 'padded' },
  args: {},
} satisfies Meta<typeof Divider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Gaps: Story = {
  render: () => (
    <Stack gap={0}>
      <Text tone="secondary">above</Text>
      <Divider />
      <Text tone="secondary">flush — the caller owns the space</Text>
      <Divider gap="tight" />
      <Text tone="secondary">tight — 25 either side</Text>
    </Stack>
  ),
};

export const Dark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div data-theme="dark" className="bg-surface-default p-10">
      <Stack gap={0}>
        <Text size="overline" tone="secondary">dark</Text>
        <Divider gap="tight" />
        <Text tone="secondary">1.16:1 in Dark — decorative, and never the only thing separating two blocks.</Text>
      </Stack>
    </div>
  ),
};

/**
 * `orientation="vertical"` is `self-stretch`, so it runs the height of the
 * tallest item in the flex row it sits in — put it BETWEEN the columns, it has
 * no width of its own to give.
 *
 * `weight="hairline"` is **0.5px**. At 1px `border/divider` is already the
 * lightest role there is (1.20:1) and the only way further down is thinner, not
 * paler. It is a HINT, not a guarantee: half a device pixel at 1x gets
 * antialiased, at 2x it is one crisp pixel, and engines round it differently.
 * Never carry information on it.
 */
export const Vertical: Story = {
  render: () => (
    <div className="flex items-start gap-10">
      <Stack gap={2} className="flex-1">
        <Text weight="medium">Billing Address</Text>
        <Text size="body-sm" tone="secondary">22 Avinashi Road</Text>
        <Text size="body-sm" tone="secondary">Coimbatore, Tamil Nadu 641018</Text>
      </Stack>
      <Divider orientation="vertical" weight="hairline" />
      <Stack gap={2} className="flex-1">
        <Text weight="medium">Shipping Address</Text>
        <Text size="body-sm" tone="secondary">Unit 7, Tirupur Export Zone</Text>
      </Stack>
      <Divider orientation="vertical" />
      <Stack gap={2} className="flex-1">
        <Text weight="medium">1px, for comparison</Text>
        <Text size="body-sm" tone="secondary">The default weight.</Text>
      </Stack>
    </div>
  ),
};
