import type { Meta, StoryObj } from '@storybook/react-vite';
import { Banner } from './Banner';
import { Stack, Text } from '../../primitives';

/**
 * One line saying what just happened, at the top of the thing it happened to.
 *
 * **Every tone gets its own shape**, not just its own colour — §2.13.2, and it
 * is 1.4.1: a banner distinguished only by being red is one a colour-blind user
 * cannot tell from the green one. Four silhouettes, readable with the colour
 * removed.
 *
 * **`role="alert"` for danger and warning, `role="status"` otherwise.** The
 * first interrupts; the second waits its turn. A failed submit has to
 * interrupt — the user pressed the button and is already looking elsewhere — and
 * a success note must not, because it would cut across whatever they moved on
 * to.
 *
 * Every `{family}/text` on its own `{family}/subtle` is past 6:1 — measured:
 * danger 6.32, warning 7.03, success 7.47, info 6.12.
 */
const meta = {
  title: 'Components/Banner', component: Banner,
  parameters: { layout: 'padded' },
  args: { children: 'Something happened.' },
} satisfies Meta<typeof Banner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Tones: Story = {
  render: () => (
    <Stack gap={5}>
      <Banner tone="danger">Some required fields are missing. Fill them in to continue.</Banner>
      <Banner tone="warning">This agreement expires in 7 days.</Banner>
      <Banner tone="success">Agreement saved.</Banner>
      <Banner tone="info">Changes are saved as a draft until you send for signature.</Banner>
    </Stack>
  ),
};

export const Dismissible: Story = {
  render: () => (
    <Banner tone="info" onDismiss={() => {}}>
      Changes are saved as a draft until you send for signature.
    </Banner>
  ),
};

export const Dark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div data-theme="dark" className="bg-surface-default p-10">
      <Stack gap={5}>
        <Text size="overline" tone="secondary">dark</Text>
        <Banner tone="danger">Some required fields are missing. Fill them in to continue.</Banner>
        <Banner tone="success">Agreement saved.</Banner>
      </Stack>
    </div>
  ),
};
