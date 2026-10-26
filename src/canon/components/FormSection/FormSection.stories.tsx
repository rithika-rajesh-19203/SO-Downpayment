import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormSection } from './FormSection';
import { FormRow } from '../FormRow/FormRow';
import { InputField } from '../InputField/InputField';
import { Stack, Text } from '../../primitives';

/**
 * §2 — two halves of six columns.
 *
 * **What separates them is not a gap.** It is the left half's slack column plus
 * the right half's label column — 330 of empty and label at the 1360 specimen,
 * which the grid produces for free. A `column-gap` would make a column stop
 * being a pure twelfth of the content box and every number in §2's table would
 * be wrong by its width.
 *
 * Children fill the **left half top-to-bottom, then the right** — 2.4.3. Each
 * half is its own column flow, so DOM order is reading order;
 * `grid-auto-flow: column` would produce exactly the zig-zag that forbids.
 */
const meta = {
  title: 'Components/FormSection', component: FormSection,
  parameters: { layout: 'padded' },
  args: { children: null },
} satisfies Meta<typeof FormSection>;
export default meta;
type Story = StoryObj<typeof meta>;

const input = (ph: string) => ({ id, required }: { id: string; required: boolean }) => (
  <InputField id={id} required={required} aria-required={required || undefined} placeholder={ph} />
);

export const TwoHalves: Story = {
  render: () => (
    <Stack gap={16}>
      <FormSection
        trailing={(
          <>
            <FormRow label="Agreement Type" required>{input('Select a type')}</FormRow>
            <FormRow label="Reference#">{input('Optional')}</FormRow>
          </>
        )}
      >
        <FormRow label="Vendor" required>{input('Select a vendor')}</FormRow>
        <FormRow label="Agreement Name" required>{input('Name this agreement')}</FormRow>
      </FormSection>

      <FormSection
        last
        trailing={<FormRow label="End Date">{input('DD/MM/YYYY')}</FormRow>}
      >
        <FormRow label="Start Date" required>{input('DD/MM/YYYY')}</FormRow>
      </FormSection>
    </Stack>
  ),
};

/** One half. The rows keep `2 + 3 + 1` of the six columns they own. */
export const SingleColumn: Story = {
  render: () => (
    <FormSection last>
      <FormRow label="Vendor" required>{input('Select a vendor')}</FormRow>
      <FormRow label="Notes" span="full">{input('Anything longer')}</FormRow>
    </FormSection>
  ),
};

export const Dark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div data-theme="dark" className="bg-surface-default p-10">
      <Stack gap={6}>
        <Text size="overline" tone="secondary">dark</Text>
        <FormSection last trailing={<FormRow label="Agreement Type">{input('Select')}</FormRow>}>
          <FormRow label="Vendor" required>{input('Select a vendor')}</FormRow>
        </FormSection>
      </Stack>
    </div>
  ),
};
