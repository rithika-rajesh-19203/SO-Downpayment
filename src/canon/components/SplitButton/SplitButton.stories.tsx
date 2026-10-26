import type { Meta, StoryObj } from '@storybook/react-vite';
import { SplitButton } from './SplitButton';
import { Stack, Text } from '../../primitives';

/**
 * One default action, and a menu of its variants. Queued in CLAUDE.md since the
 * button family was built; the product table's `Add New Row` is what needed it.
 *
 * **It is two buttons.** The halves do different things — the leading one
 * commits, the trailing one opens — so they are two controls, two tab stops and
 * two accessible names. A single button carrying both would have to guess from
 * the pointer's x which the user meant.
 *
 * The trailing half is named **"More <label> actions"**, built from the label:
 * "Add New Row" is already spoken by the half beside it, and two adjacent
 * controls with the same accessible name is a 4.1.2 defect.
 */
const meta = {
  title: 'Components/SplitButton', component: SplitButton,
  parameters: { layout: 'padded' },
  args: { children: 'Add New Row', onSelect: () => {}, entries: [] },
} satisfies Meta<typeof SplitButton>;
export default meta;
type Story = StoryObj<typeof meta>;

const ENTRIES = [
  { id: 'header', label: 'Add Header', onSelect: () => {} },
  { id: 'multi', label: 'Add Multiple Rows…', onSelect: () => {} },
];

export const Default: Story = {
  render: () => (
    <SplitButton icon="plus-circle" entries={ENTRIES} onSelect={() => {}}>
      Add New Row
    </SplitButton>
  ),
};

/**
 * Secondary is the default and that is deliberate — a split **primary** button
 * puts two competing commitments in one control. Available, not the default.
 */
export const Emphases: Story = {
  render: () => (
    <Stack gap={8} align="start">
      <SplitButton icon="plus-circle" entries={ENTRIES} onSelect={() => {}}>Add New Row</SplitButton>
      <SplitButton emphasis="primary" entries={ENTRIES} onSelect={() => {}}>Save</SplitButton>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap={8} align="start">
      {(['lg', 'md', 'sm'] as const).map((s) => (
        <SplitButton key={s} size={s} entries={ENTRIES} onSelect={() => {}}>Add New Row</SplitButton>
      ))}
    </Stack>
  ),
};

export const Dark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div data-theme="dark" className="bg-surface-default p-10">
      <Stack gap={6} align="start">
        <Text size="overline" tone="secondary">dark</Text>
        <SplitButton icon="plus-circle" entries={ENTRIES} onSelect={() => {}}>Add New Row</SplitButton>
      </Stack>
    </div>
  ),
};
