import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field } from './Field';
import { Stack, Text } from '../../primitives';

const meta = {
  title: 'Components/Field', component: Field, parameters: { layout: 'padded' },
  args: { label: 'Invoice number' },
} satisfies Meta<typeof Field>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * THE ONE TO USE. §1: "anything on a form wants the wrapper, because that is
 * what makes the label travel with the input instead of being a sibling someone
 * has to remember to add."
 *
 * §1.1 is the reason it exists at all — `Label` and `Help Text` were two loose
 * instances of a remote library sitting on the page, so "just a label and an
 * input" was an assembly job done from memory, with the gap guessed each time.
 */
export const TheWholeField: Story = {
  render: () => (
    <Stack gap={8} className="max-w-rail">
      <Field label="Invoice number" placeholder="INV-0000" />
      <Field label="Invoice number" required placeholder="INV-0000" />
      <Field
        label="Invoice number"
        placeholder="INV-0000"
        message="Found on the top right of the supplier's document"
        showMessage
      />
      <Field label="Invoice number" placeholder="INV-0000" disabled />
    </Stack>
  ),
};

/**
 * AN ERROR STATE CANNOT HIDE ITS MESSAGE — §2.1, the sharpest decision in this md.
 *
 * A red border with no explanation fails **WCAG 3.3.1 Error Identification**.
 * Figma could only enforce that by deleting the visibility reference from the
 * four error variants, so the node is permanently on. Here `showMessage` is
 * simply ignored when `error` is set.
 *
 * **Both fields below pass `showMessage={false}`.** The second one shows its
 * message anyway, because it cannot not.
 */
export const ErrorMessageIsNotOptional: Story = {
  render: () => (
    <Stack gap={8} className="max-w-rail">
      <Field
        label="Invoice number"
        defaultValue="INV-0042"
        message="Found on the supplier's document"
        showMessage={false}
      />
      <Field
        label="Invoice number"
        defaultValue="INV-0042"
        error
        message="That number is already used"
        showMessage={false}
      />
      <Text size="body-sm" tone="secondary">
        Inspect the second input: `aria-invalid="true"` and `aria-describedby` pointing at
        the message. §6 — "`aria-describedby` is what makes the error message reach a screen
        reader, and `aria-invalid` is what makes the red border mean something. Neither can
        live in Figma."
      </Text>
    </Stack>
  ),
};

/**
 * THE LABEL IS NOT THE VALUE — §2.2. Same size, one weight heavier.
 *
 * "Same size keeps the vertical rhythm; the weight is what stops a label reading
 * as content." The loose `Label` instance this replaces was 13 Regular, identical
 * to value text.
 *
 * Read down the column: label 13 Medium, value 13 Regular, message 12 Regular.
 */
export const Typography: Story = {
  render: () => (
    <Stack gap={8} className="max-w-rail">
      <Field
        label="Invoice number"
        required
        defaultValue="INV-0042"
        message="Found on the top right of the supplier's document"
        showMessage
      />
    </Stack>
  ),
};

/** A form — the shape the wrapper exists to make cheap. */
export const AForm: Story = {
  render: () => (
    <Stack gap={6} className="max-w-rail">
      <Field label="Supplier" required placeholder="Search suppliers" icon="search" />
      <Field label="Invoice number" required defaultValue="INV-0042" error
        message="That number is already used" />
      <Field label="Reference" placeholder="Optional"
        message="Shown on the remittance advice" showMessage />
      <Field label="Approved by" placeholder="—" disabled />
    </Stack>
  ),
};
