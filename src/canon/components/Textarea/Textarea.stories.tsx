import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './Textarea';
import { InputField } from '../InputField/InputField';
import { FormRow } from '../FormRow/FormRow';
import { Stack, Text } from '../../primitives';

/**
 * The multi-line `InputField`. Every number comes from `zf-input-field.md`
 * through that component — same border, radius, ring, disabled treatment and
 * `text/tertiary` placeholder. Only what has to differ does.
 *
 * **It has no height, it has rows.** `rows × line-height` plus the input's own
 * block padding, which is `(chrome/control − body line-height) / 2` and shared
 * with `FormRow`'s label offset — so a one-row textarea is exactly an input's
 * height and its first line sits where an input's value does.
 *
 * **`resize: vertical`.** Not `none`, because a user with six lines in a
 * three-line box has a good reason to want to see them. Not `both`, because
 * horizontal resize breaks the grid — the control is 3 of 12 columns less the
 * 30px inset, and a dragged width would put this field's trailing edge
 * somewhere no other field's is, permanently.
 */
const meta = {
  title: 'Components/Textarea', component: Textarea,
  parameters: { layout: 'padded' },
  args: {},
} satisfies Meta<typeof Textarea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Rows: Story = {
  render: () => (
    <Stack gap={8} className="max-w-md">
      <Textarea rows={1} placeholder="rows={1} — exactly an input's height" />
      <Textarea rows={3} placeholder="rows={3} — the default" />
      <Textarea rows={6} placeholder="rows={6}" />
    </Stack>
  ),
};

/** Drag the grip at the bottom-right. Vertical only. */
export const Resizable: Story = {
  render: () => (
    <div className="max-w-md">
      <Textarea placeholder="Drag the corner — this one grows downward and only downward" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap={8} className="max-w-md">
      <Textarea placeholder="Rest" />
      <Textarea error defaultValue="Invalid — border and ring both danger/default, 6.09:1" />
      <Textarea disabled defaultValue="Disabled — and the resize grip goes with it" />
    </Stack>
  ),
};

/**
 * The point of sharing the padding token: on a form row, a one-row textarea and
 * an input are the same box, and their first lines are on the same baseline.
 */
export const InAFormRow: Story = {
  render: () => (
    <div className="max-w-2xl">
      <Stack gap={12}>
        <FormRow label="Reference Number">
          {({ id }) => <InputField id={id} placeholder="Optional" />}
        </FormRow>
        <FormRow label="Description/Purpose">
          {({ id }) => <Textarea id={id} placeholder="What this agreement is for" />}
        </FormRow>
      </Stack>
    </div>
  ),
};

export const Dark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div data-theme="dark" className="bg-surface-default p-10">
      <Stack gap={6} className="max-w-md">
        <Text size="overline" tone="secondary">dark</Text>
        <Textarea placeholder="What this agreement is for" />
      </Stack>
    </div>
  ),
};
