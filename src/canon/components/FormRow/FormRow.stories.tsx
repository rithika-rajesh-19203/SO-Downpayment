import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormRow } from './FormRow';
import { InputField } from '../InputField/InputField';
import { Stack, Text } from '../../primitives';

/**
 * §3 — `2 + 3 + 1 = 6`, the columns a half owns.
 *
 * **The track is fixed and the label hugs**, which is §4.1's finding and the
 * reason to read the file. Making the label FILL its 2-column track pushed the
 * required asterisk to the far edge of the column, yards from the word it
 * belongs to. Track `2fr` never moves, so every input starts on column 3
 * whatever its label does; the label is `max-content` capped at the track, so
 * the mark lands beside the last word.
 */
const meta = {
  title: 'Components/FormRow', component: FormRow,
  parameters: { layout: 'padded' },
  args: { label: 'Field', children: () => null },
} satisfies Meta<typeof FormRow>;
export default meta;
type Story = StoryObj<typeof meta>;

const input = (ph: string) => ({ id, required }: { id: string; required: boolean }) => (
  <InputField id={id} required={required} aria-required={required || undefined} placeholder={ph} />
);

/**
 * Three labels of very different lengths. **The control starts at the same x in
 * all three** — that is the whole point of separating the track from the label.
 * The third clamps at the track, wraps, and the row grows; its input's top edge
 * does not move, because the control aligns to the label's FIRST line.
 */
export const LabelLengths: Story = {
  render: () => (
    <div className="max-w-2xl">
      <Stack gap={12}>
        <FormRow label="Vendor" required>{input('Select a vendor')}</FormRow>
        <FormRow label="Agreement Name" required>{input('Name this agreement')}</FormRow>
        <FormRow label="Shipping Charges Applicable To This Agreement">
          {input('0.00')}
        </FormRow>
      </Stack>
    </div>
  ),
};

/** `span="full"` keeps the same shape across all twelve: 2 / 9 − 30 / 1. */
export const FullSpan: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-x-0 gap-y-12 max-w-4xl">
      <FormRow label="Vendor" required>{input('Select a vendor')}</FormRow>
      <FormRow label="Reference#">{input('Optional')}</FormRow>
      <FormRow label="Notes" span="full">{input('Anything the two-column rhythm would cramp')}</FormRow>
    </div>
  ),
};

/**
 * §5.1 — **only the mark is red, never the label.** The source colours the whole
 * required label `danger`, which spends the error colour on a resting state (when
 * the field actually fails there is nothing left to change to) and makes
 * "required" a colour difference, which is 1.4.1. `required` +
 * `aria-required` do the work; the asterisk is decoration on top of them.
 */
export const Required: Story = {
  render: () => (
    <div className="max-w-2xl">
      <Stack gap={12}>
        <FormRow label="Agreement Name" required>{input('Required')}</FormRow>
        <FormRow label="Agreement Type">{input('Optional')}</FormRow>
      </Stack>
    </div>
  ),
};

export const PaneAndHue: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="grid grid-cols-2">
      {(['light', 'dark'] as const).map((theme) => (
        <div key={theme} data-theme={theme} className="bg-surface-default p-10">
          <Stack gap={6}>
            <Text size="overline" tone="secondary">{theme}</Text>
            <FormRow label="Agreement Name" required>{input('Name this agreement')}</FormRow>
          </Stack>
        </div>
      ))}
    </div>
  ),
};
